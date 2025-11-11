import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import type { User } from '@prisma/client/index';
import { calculateExpiryDate } from '../common/utils/time.util';
import type {
  JwtPayload,
  RefreshTokenPayload,
} from './interfaces/jwt-payload.interface';
import { ProfileDto } from './dto/profile.dto';
import type { RegisterDto } from './dto/register.dto';
import type { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { EmailVerificationService } from './email-verification.service';

const REFRESH_TOKEN_COOKIE = 'kg_refresh_token';

interface TokenIssueResult {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
  refreshTokenExpiresAt: Date;
}

interface AuthResult {
  user: User;
  tokens: TokenIssueResult;
}

interface RegistrationResult {
  user: User;
  emailVerificationRequired: boolean;
  verificationTokenId: string;
  verificationExpiresAt: Date;
}

type UserWithEmailVerification = User & {
  emailVerifiedAt?: Date | null;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  async register(payload: RegisterDto): Promise<RegistrationResult> {
    const email = payload.email.toLowerCase();
    const handle = payload.handle.toLowerCase();

    const [emailTaken, handleTaken] = await Promise.all([
      this.usersService.isEmailTaken(email),
      this.usersService.isHandleTaken(handle),
    ]);

    if (emailTaken) {
      throw new ConflictException('Email is already in use.');
    }

    if (handleTaken) {
      throw new ConflictException('Handle is already taken.');
    }

    const passwordHash = await this.hashPassword(payload.password);

    const user = await this.usersService.createUser({
      email,
      handle,
      passwordHash,
      displayName: payload.displayName?.trim() || handle,
    });

    const { tokenId, expiresAt } =
      await this.emailVerificationService.sendEmailVerification(user);

    return {
      user,
      emailVerificationRequired: true,
      verificationTokenId: tokenId,
      verificationExpiresAt: expiresAt,
    };
  }

  async login(payload: LoginDto): Promise<AuthResult> {
    const email = payload.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    this.ensureAccountIsActive(user);
    this.ensureEmailIsVerified(user);

    const passwordMatches = await bcrypt.compare(
      payload.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const userId = user.id;

    await this.usersService.removeInactiveRefreshTokens(userId, new Date());

    const tokens = await this.issueTokens(user);
    await this.persistRefreshToken(userId, tokens);

    await this.usersService.updateLastActive(userId, new Date());

    return { user, tokens };
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const payload = await this.tryDecodeRefreshToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Account is no longer available.');
    }

    this.ensureAccountIsActive(user);
    this.ensureEmailIsVerified(user);

    const userId = user.id;

    const storedToken = await this.usersService.findRefreshToken(
      userId,
      payload.tokenId,
    );
    if (!storedToken || typeof storedToken.tokenHash !== 'string') {
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    const matches = await bcrypt.compare(refreshToken, storedToken.tokenHash);
    if (!matches) {
      await this.usersService.removeRefreshToken(userId, payload.tokenId);
      throw new UnauthorizedException('Refresh token is invalid or expired.');
    }

    const tokens = await this.issueTokens(user);

    await this.persistRefreshToken(userId, tokens, payload.tokenId);

    await this.usersService.updateLastActive(userId, new Date());

    return { user, tokens };
  }

  async logout(userId: string, refreshTokenId?: string): Promise<void> {
    if (refreshTokenId) {
      await this.usersService.removeRefreshToken(userId, refreshTokenId);
    }
  }

  async getProfile(userId: string): Promise<ProfileDto> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    this.ensureAccountIsActive(user);
    this.ensureEmailIsVerified(user);
    return ProfileDto.fromUser(user);
  }

  async verifyEmail(tokenId: string, otp: string): Promise<AuthResult> {
    const user = await this.emailVerificationService.verifyEmail(tokenId, otp);
    const tokens = await this.issueTokens(user);
    await this.persistRefreshToken(user.id, tokens);
    await this.usersService.updateLastActive(user.id, new Date());
    return { user, tokens };
  }

  attachRefreshTokenCookie(
    response: Response,
    token: string,
    expiresAt: Date,
  ): void {
    const secure = this.configService.get<string>('NODE_ENV') === 'production';
    response.cookie(REFRESH_TOKEN_COOKIE, token, {
      httpOnly: true,
      secure,
      sameSite: secure ? 'none' : 'lax',
      expires: expiresAt,
      path: '/',
    });
  }

  private ensureAccountIsActive(user: User): void {
    const status = (user as User & { status?: string }).status ?? 'active';
    if (status === 'banned') {
      throw new UnauthorizedException(
        'Account has been banned. Please contact support.',
      );
    }
    if (status === 'suspended') {
      throw new UnauthorizedException(
        'Account is suspended. Please contact support.',
      );
    }
  }

  private hasEmailVerificationMetadata(
    user: User,
  ): user is UserWithEmailVerification {
    return 'emailVerifiedAt' in user;
  }

  private ensureEmailIsVerified(user: User): void {
    if (!this.hasEmailVerificationMetadata(user)) {
      throw new UnauthorizedException(
        'Email address is not verified. Please verify your email to continue.',
      );
    }

    if (!user.emailVerifiedAt) {
      throw new UnauthorizedException(
        'Email address is not verified. Please verify your email to continue.',
      );
    }
  }

  clearRefreshTokenCookie(response: Response): void {
    const secure = this.configService.get<string>('NODE_ENV') === 'production';
    response.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure,
      sameSite: secure ? 'none' : 'lax',
      path: '/',
    });
  }

  private async issueTokens(user: User): Promise<TokenIssueResult> {
    const userId = user.id;
    const payload: JwtPayload = {
      sub: userId,
      email: user.email,
      handle: user.handle,
      roles: user.roles,
    };

    const accessTokenDuration = this.getAccessTokenDuration();
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: accessTokenDuration as JwtSignOptions['expiresIn'],
    });

    const tokenId = randomUUID();
    const refreshExpires = this.getRefreshTokenDuration();
    const refreshTokenPayload: RefreshTokenPayload = {
      sub: payload.sub,
      email: payload.email,
      tokenId,
    };

    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: refreshExpires as JwtSignOptions['expiresIn'],
    });

    return {
      accessToken,
      refreshToken,
      refreshTokenId: tokenId,
      refreshTokenExpiresAt: calculateExpiryDate(refreshExpires),
    };
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.getSaltRounds());
  }

  private async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, this.getSaltRounds());
  }

  private getSaltRounds(): number {
    const configured = this.configService.get<string>('BCRYPT_SALT_ROUNDS');
    const parsed = configured ? Number.parseInt(configured, 10) : undefined;
    return Number.isFinite(parsed) && parsed && parsed >= 10 ? parsed : 12;
  }

  async tryDecodeRefreshToken(
    token: string,
  ): Promise<RefreshTokenPayload | null> {
    try {
      return await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      });
    } catch {
      return null;
    }
  }

  private getAccessTokenDuration(): string {
    return this.getDurationValue('JWT_EXPIRES_IN', '15m');
  }

  private getRefreshTokenDuration(): string {
    return this.getDurationValue('REFRESH_TOKEN_EXPIRES_IN', '7d');
  }

  private getDurationValue(configKey: string, fallback: string): string {
    const value = this.configService.get<string>(configKey);
    const trimmed = value?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : fallback;
  }

  private async persistRefreshToken(
    userId: string,
    tokens: TokenIssueResult,
    replaceTokenId?: string,
  ): Promise<void> {
    const payload = {
      tokenId: tokens.refreshTokenId,
      tokenHash: await this.hashToken(tokens.refreshToken),
      expiresAt: tokens.refreshTokenExpiresAt,
    };

    if (replaceTokenId) {
      await this.usersService.replaceRefreshToken(
        userId,
        payload,
        replaceTokenId,
      );
      return;
    }

    await this.usersService.addRefreshToken(userId, payload);
  }
}

export { REFRESH_TOKEN_COOKIE };
