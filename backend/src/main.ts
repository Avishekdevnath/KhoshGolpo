/**
 * KhoshGolpo Backend - Main Entry Point
 * 
 * This file initializes the NestJS application with:
 * - Validation pipes for request validation
 * - CORS configuration for frontend access
 * - Error tracking via Sentry
 * - Swagger API documentation
 * - Cookie parsing for JWT refresh tokens
 */

import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import * as Sentry from '@sentry/nestjs';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ProfileDto } from './auth/dto/profile.dto';
import { AuthResponseDto } from './auth/dto/auth-response.dto';
import { LogoutResponseDto } from './auth/dto/logout-response.dto';
import { UserSchema } from './users/schemas/user.schema';
import { ThreadSchema } from './threads/schemas/thread.schema';
import { PostSchema } from './posts/schemas/post.schema';
import {
  CreatePostResponseDto,
  CreateThreadResponseDto,
  PaginationMetaDto,
  ThreadDetailResponseDto,
  ThreadListResponseDto,
} from './threads/dto/thread-responses.dto';
import { NotificationSchema } from './notifications/schemas/notification.schema';
import { NotificationListResponseDto } from './notifications/dto/notification-responses.dto';

/** Bootstrap the NestJS application */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: false,
  });
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  
  /** Initialize Sentry for error tracking (optional, if SENTRY_DSN is set) */
  const sentryDsn = configService.get<string>('SENTRY_DSN');
  if (sentryDsn) {
    await Sentry.init({
      dsn: sentryDsn,
      environment: configService.get<string>('NODE_ENV') ?? 'development',
      tracesSampleRate: 0.1,
      integrations: [Sentry.nestIntegration()],
    });
  }

  /** Parse cookies from incoming requests (used for JWT refresh tokens) */
  app.use(cookieParser());

  /** Apply global validation pipe for all incoming requests */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove properties not in DTO
      transform: true, // Transform payloads to DTO instances
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  /** Configure CORS to allow requests from whitelisted frontend URLs */
  const corsOriginConfig =
    configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
  const allowedOrigins: string[] = corsOriginConfig
    .split(',')
    .map((origin: string) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests from whitelisted origins or without origin header
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin not allowed by CORS: ${origin}`), false);
    },
    credentials: true, // Allow credentials (cookies, auth headers)
  });

  /** Setup Swagger API documentation */
  const swaggerTitle = configService.get<string>('SWAGGER_TITLE') ?? 'KhoshGolpo API';
  const swaggerDescription =
    configService.get<string>('SWAGGER_DESCRIPTION') ??
    'REST API documentation for the KhoshGolpo backend services.';
  const swaggerVersion = configService.get<string>('SWAGGER_VERSION') ?? '1.0.0';
  const swaggerPath = configService.get<string>('SWAGGER_PATH') ?? 'docs';

  const swaggerConfig = new DocumentBuilder()
    .setTitle(swaggerTitle)
    .setDescription(swaggerDescription)
    .setVersion(swaggerVersion)
    // Add JWT bearer auth security scheme for protected endpoints
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token for authenticated endpoints',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    // Add refresh token cookie auth scheme
    .addCookieAuth('refresh_token', {
      type: 'apiKey',
      in: 'cookie',
      description: 'Refresh token cookie used for auth refresh/logout',
    })
    .build();

  // Generate Swagger document with all response models
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [
      AuthResponseDto,
      LogoutResponseDto,
      ProfileDto,
      UserSchema,
      ThreadSchema,
      PostSchema,
      PaginationMetaDto,
      ThreadListResponseDto,
      ThreadDetailResponseDto,
      CreateThreadResponseDto,
      CreatePostResponseDto,
      NotificationSchema,
      NotificationListResponseDto,
    ],
  });

  // Setup Swagger UI at /docs endpoint
  SwaggerModule.setup(swaggerPath, app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true, // Keep auth token in browser after refresh
    },
    jsonDocumentUrl: `/${swaggerPath}.json`,
  });

  /** Start the server on configured port */
  const port = Number(configService.get<string>('PORT') ?? 4000);
  await app.listen(port);
  app
    .get(Logger)
    .log(`🚀 Backend server is running on: http://localhost:${port}`);
}

/** Handle bootstrap errors */
bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Nest application failed to start', error);
  process.exit(1);
});
