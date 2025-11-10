import { ConflictException, UnauthorizedException } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import type { User } from '@prisma/client';
import { AuthService, REFRESH_TOKEN_COOKIE } from './auth.service';
import type { UsersService } from '../users/users.service';
import type { EmailVerificationService } from './email-verification.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (value: string) => `hashed-${value}`),
  compare: jest.fn(async (raw: string, hashed: string) => hashed === `hashed-${raw}`),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let emailVerificationService: jest.Mocked<EmailVerificationService>;

  const baseUser: User & { emailVerifiedAt: Date } = {
    id: 'user-1',
    email: 'amina@example.com',
    handle: 'amina',
    passwordHash: 'hashed-password',
    displayName: 'Amina',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    roles: ['user'],
    emailVerifiedAt: new Date('2024-01-02'),
    refreshTokens: [],
    profile: null,
  };

  beforeEach(() => {
    usersService = {
      isEmailTaken: jest.fn(),
      isHandleTaken: jest.fn(),
      createUser: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      removeInactiveRefreshTokens: jest.fn(),
      addRefreshToken: jest.fn(),
      replaceRefreshToken: jest.fn(),
      removeRefreshToken: jest.fn(),
      updateLastActive: jest.fn(),
      findRefreshToken: jest.fn(),
      updateProfile: jest.fn(),
      forceLogout: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;

    configService = {
      get: jest.fn((key: string) => {
        if (key === 'NODE_ENV') {
          return 'test';
        }
        if (key === 'BCRYPT_SALT_ROUNDS') {
          return '10';
        }
        if (key === 'JWT_EXPIRES_IN') {
          return '15m';
        }
        if (key === 'REFRESH_TOKEN_EXPIRES_IN') {
          return '7d';
        }
        return undefined;
      }),
      getOrThrow: jest.fn((key: string) => {
        if (key === 'JWT_SECRET') {
          return 'jwt-secret';
        }
        if (key === 'REFRESH_TOKEN_SECRET') {
          return 'refresh-secret';
        }
        throw new Error(`Unexpected config key: ${key}`);
      }),
    } as unknown as jest.Mocked<ConfigService>;

    emailVerificationService = {
      sendEmailVerification: jest.fn(),
      verifyEmail: jest.fn(),
    } as unknown as jest.Mocked<EmailVerificationService>;

    authService = new AuthService(
      usersService,
      jwtService,
      configService,
      emailVerificationService,
    );
  });

  describe('register', () => {
    it('creates a user and triggers verification email', async () => {
      usersService.isEmailTaken.mockResolvedValue(false);
      usersService.isHandleTaken.mockResolvedValue(false);
      usersService.createUser.mockResolvedValue(baseUser);

      const result = await authService.register({
        email: baseUser.email,
        handle: baseUser.handle,
        password: 'password',
        displayName: 'Amina Rahman',
      });

      expect(usersService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: baseUser.email,
          handle: baseUser.handle,
          displayName: 'Amina Rahman',
        }),
      );
      expect(emailVerificationService.sendEmailVerification).toHaveBeenCalledWith(baseUser);
      expect(result).toEqual({
        user: baseUser,
        emailVerificationRequired: true,
      });
    });

    it('throws when email already exists', async () => {
      usersService.isEmailTaken.mockResolvedValue(true);
      usersService.isHandleTaken.mockResolvedValue(false);

      await expect(
        authService.register({
          email: baseUser.email,
          handle: baseUser.handle,
          password: 'password',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue({
        ...baseUser,
        passwordHash: 'hashed-password',
      });
      jwtService.signAsync.mockResolvedValueOnce('access-token');
      jwtService.signAsync.mockResolvedValueOnce('refresh-token');

      const result = await authService.login({
        email: baseUser.email,
        password: 'password',
      });

      expect(usersService.removeInactiveRefreshTokens).toHaveBeenCalledWith(
        baseUser.id,
        expect.any(Date),
      );
      expect(usersService.addRefreshToken).toHaveBeenCalledWith(
        baseUser.id,
        expect.objectContaining({
          tokenHash: 'hashed-refresh-token',
        }),
      );
      expect(usersService.updateLastActive).toHaveBeenCalledWith(baseUser.id, expect.any(Date));
      expect(result.user).toMatchObject({ id: baseUser.id, email: baseUser.email });
      expect(result.tokens.accessToken).toBe('access-token');
      expect(result.tokens.refreshToken).toBe('refresh-token');
    });

    it('throws when credentials are invalid', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: baseUser.email,
          password: 'password',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('reissues tokens when refresh token valid', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: baseUser.id,
        email: baseUser.email,
        tokenId: 'token-1',
      });
      usersService.findById.mockResolvedValue(baseUser);
      usersService.findRefreshToken.mockResolvedValue({
        tokenHash: 'hashed-refresh-token',
      });
      jwtService.signAsync.mockResolvedValueOnce('new-access-token');
      jwtService.signAsync.mockResolvedValueOnce('new-refresh-token');

      const result = await authService.refresh('refresh-token');

      expect(usersService.replaceRefreshToken).toHaveBeenCalledWith(
        baseUser.id,
        expect.objectContaining({
          tokenHash: 'hashed-new-refresh-token',
        }),
        'token-1',
      );
      expect(usersService.updateLastActive).toHaveBeenCalled();
      expect(result.tokens.accessToken).toBe('new-access-token');
      expect(result.tokens.refreshToken).toBe('new-refresh-token');
    });

    it('throws when token cannot be decoded', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

      await expect(authService.refresh('bad-token')).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('attachRefreshTokenCookie', () => {
    it('writes secure cookie options based on environment', () => {
      const cookie = jest.fn();
      const response = { cookie } as unknown as Response;

      authService.attachRefreshTokenCookie(response, 'refresh', new Date('2025-01-01'));

      expect(cookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_COOKIE,
        'refresh',
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
        }),
      );
    });
  });
});


