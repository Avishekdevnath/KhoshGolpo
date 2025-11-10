
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ThreadsModule } from './threads/threads.module';
import { QueueModule } from './queue/queue.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { MetricsModule } from './metrics/metrics.module';
import { HealthModule } from './health/health.module';
import { configValidationSchema } from './config/config.validation';
import { RealtimeModule } from './realtime/realtime.module';
import { CacheModule } from './cache/cache.module';
import { AdminModule } from './admin/admin.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [
    // Global configuration management from .env and environment
    ConfigModule.forRoot({
      isGlobal: true, // Available across all modules
      cache: true, // Cache config values for performance
      expandVariables: true, // Support $ENV_VAR in config
      validationSchema: configValidationSchema, // Validate env vars on startup
    }),
    // Structured logging with Pino logger
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProd = configService.get<string>('NODE_ENV') === 'production';
        return {
          pinoHttp: isProd
            ? undefined // JSON logs in production for log aggregation
            : {
                transport: {
                  target: 'pino-pretty', // Pretty print in development
                  options: {
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                  },
                },
              },
        };
      },
    }),
    // Rate limiting to prevent abuse (configurable via env vars)
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl:
            (configService.get<number>('RATE_LIMIT_WINDOW_MS') ??
              60_000) / 1000, // Convert ms to seconds
          limit: configService.get<number>('RATE_LIMIT_MAX_REQUESTS') ?? 120,
        },
      ],
    }),
    // Core infrastructure modules
    PrismaModule, // Database ORM
    // Feature modules
    UsersModule, // User management
    AuthModule, // Authentication & authorization
    ThreadsModule, // Discussion threads
    QueueModule, // Background job processing
    NotificationsModule, // Real-time notifications
    MetricsModule, // Prometheus metrics
    HealthModule, // Health checks for monitoring
    RealtimeModule, // WebSocket connections
    CacheModule, // Redis caching
    AdminModule, // Admin operations & auditing
    SecurityModule, // Security events & DDoS protection
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard, // Apply rate limiting globally
    },
  ],
})
export class AppModule {}
