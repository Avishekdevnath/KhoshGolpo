import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, type JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailVerificationService } from './email-verification.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { parseDuration } from '../common/utils/time.util';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    MailModule,
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const expiresIn = resolveJwtExpiresIn(
          configService,
          'JWT_EXPIRES_IN',
          '15m',
        );

        return {
          secret: configService.getOrThrow<string>('JWT_SECRET'),
          signOptions: {
            expiresIn,
          } satisfies JwtSignOptions,
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailVerificationService],
  exports: [AuthService],
})
export class AuthModule {}

function resolveJwtExpiresIn(
  configService: ConfigService,
  key: string,
  fallback: string,
): JwtSignOptions['expiresIn'] {
  const raw = configService.get<string>(key) ?? fallback;

  try {
    const milliseconds = parseDuration(raw);
    const seconds = Math.max(1, Math.floor(milliseconds / 1000));
    return seconds;
  } catch {
    const numeric = Number.parseInt(raw, 10);
    if (Number.isFinite(numeric) && numeric > 0) {
      return numeric;
    }

    const milliseconds = parseDuration(fallback);
    return Math.max(1, Math.floor(milliseconds / 1000));
  }
}
