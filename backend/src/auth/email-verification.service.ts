import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import type { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { calculateExpiryDate } from '../common/utils/time.util';

@Injectable()
export class EmailVerificationService {
  private readonly logger = new Logger(EmailVerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async sendEmailVerification(user: User): Promise<void> {
    if (!user.email) {
      throw new BadRequestException('User is missing an email address.');
    }

    const { tokenId, token, expiresAt } = await this.createToken(user.id);
    const verificationUrl = this.buildVerificationUrl(tokenId, token);

    await this.mailService.sendEmailVerification({
      email: user.email,
      displayName: user.displayName ?? user.handle,
      verificationUrl,
    });

    this.logger.debug(
      `Email verification token issued for user ${user.id} expiring at ${expiresAt.toISOString()}`,
    );
  }

  async verifyEmail(tokenId: string, token: string): Promise<User> {
    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenId },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid or expired verification token.');
    }

    if (record.consumedAt) {
      throw new UnauthorizedException('Verification token has already been used.');
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Verification token has expired.');
    }

    const tokenMatches = await bcrypt.compare(token, record.tokenHash);
    if (!tokenMatches) {
      throw new UnauthorizedException('Invalid verification token.');
    }

    const user = await this.prisma.user.update({
      where: { id: record.userId },
      data: {
        emailVerifiedAt: new Date(),
      },
    });

    await this.prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: {
        consumedAt: new Date(),
      },
    });

    await this.prisma.emailVerificationToken.deleteMany({
      where: {
        userId: record.userId,
        consumedAt: null,
        NOT: { id: record.id },
      },
    });

    return user;
  }

  private async createToken(userId: string): Promise<{
    tokenId: string;
    token: string;
    expiresAt: Date;
  }> {
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId, consumedAt: null },
    });

    const tokenId = randomUUID();
    const token = randomBytes(32).toString('hex');
    const tokenHash = await this.hashToken(token);
    const ttl = this.getTokenTtl();
    const expiresAt = calculateExpiryDate(ttl);

    await this.prisma.emailVerificationToken.create({
      data: {
        tokenId,
        tokenHash,
        userId,
        expiresAt,
      },
    });

    return { tokenId, token, expiresAt };
  }

  private buildVerificationUrl(tokenId: string, token: string): string {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    const domain = this.configService.get<string>('DOMAIN');
    const base =
      frontendUrl && frontendUrl.trim().length > 0
        ? frontendUrl.trim()
        : domain
        ? `https://${domain}`
        : '';

    if (!base) {
      throw new BadRequestException(
        'DOMAIN or FRONTEND_URL must be configured for email verification.',
      );
    }

    const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
    const searchParams = new URLSearchParams({
      tokenId,
      token,
    });

    return `${normalizedBase}/auth/verify-email?${searchParams.toString()}`;
  }

  private async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, this.getSaltRounds());
  }

  private getSaltRounds(): number {
    const configured = this.configService.get<string>('BCRYPT_SALT_ROUNDS');
    const parsed = configured ? Number.parseInt(configured, 10) : undefined;
    return Number.isFinite(parsed) && parsed && parsed >= 10 ? parsed : 12;
  }

  private getTokenTtl(): string {
    return (
      this.configService.get<string>('EMAIL_VERIFICATION_TOKEN_TTL') ?? '24h'
    );
  }
}

