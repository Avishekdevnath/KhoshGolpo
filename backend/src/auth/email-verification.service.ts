import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt, randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import type { User } from '@prisma/client/index';
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

  async sendEmailVerification(user: User): Promise<{
    tokenId: string;
    expiresAt: Date;
  }> {
    if (!user.email) {
      throw new BadRequestException('User is missing an email address.');
    }

    const { tokenId, otp, expiresAt } = await this.createToken(user.id);
    const expiresInMinutes = Math.max(
      1,
      Math.ceil((expiresAt.getTime() - Date.now()) / 60_000),
    );

    await this.mailService.sendEmailVerificationOtp({
      email: user.email,
      displayName: user.displayName ?? user.handle,
      otp,
      expiresInMinutes,
    });

    this.logger.debug(
      `Email verification token issued for user ${user.id} expiring at ${expiresAt.toISOString()}`,
    );

    return { tokenId, expiresAt };
  }

  async verifyEmail(tokenId: string, otp: string): Promise<User> {
    const record = await this.prisma.emailVerificationToken.findUnique({
      where: { tokenId },
    });

    if (!record) {
      throw new UnauthorizedException('Invalid or expired verification token.');
    }

    if (record.consumedAt) {
      throw new UnauthorizedException(
        'Verification token has already been used.',
      );
    }

    if (record.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedException('Verification token has expired.');
    }

    const otpMatches = await bcrypt.compare(otp, record.otpHash);
    if (!otpMatches) {
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
    otp: string;
    expiresAt: Date;
  }> {
    await this.prisma.emailVerificationToken.deleteMany({
      where: { userId, consumedAt: null },
    });

    const tokenId = randomUUID();
    const otp = this.generateOtp();
    const otpHash = await this.hashValue(otp);
    const ttl = this.getTokenTtl();
    const expiresAt = calculateExpiryDate(ttl);

    await this.prisma.emailVerificationToken.create({
      data: {
        tokenId,
        otpHash,
        userId,
        expiresAt,
      },
    });

    return { tokenId, otp, expiresAt };
  }

  private generateOtp(): string {
    const length =
      Number.parseInt(
        this.configService.get<string>('EMAIL_VERIFICATION_OTP_LENGTH') ?? '6',
        10,
      ) || 6;
    const min = 10 ** (Math.max(length, 4) - 1);
    const max = 10 ** Math.max(length, 4) - 1;
    return randomInt(min, max + 1).toString();
  }

  private async hashValue(value: string): Promise<string> {
    return bcrypt.hash(value, this.getSaltRounds());
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
