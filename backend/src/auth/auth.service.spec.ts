import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { User } from '@prisma/client';
import type { Response } from 'express';
import { AuthService, REFRESH_TOKEN_COOKIE } from './auth.service';
import { UsersService } from '../users/users.service';
import { EmailVerificationService } from './email-verification.service';

type MockedMethod<Fn extends (...args: any[]) => any> = jest.Mock<
  ReturnType<OmitThisParameter<Fn>>,
  Parameters<OmitThisParameter<Fn>>
>;

type UsersServiceMock = {
  isEmailTaken: MockedMethod<UsersService['isEmailTaken']>;
  isHandleTaken: MockedMethod<UsersService['isHandleTaken']>;
  createUser: MockedMethod<UsersService['createUser']>;
  findByEmail: MockedMethod<UsersService['findByEmail']>;
  findById: MockedMethod<UsersService['findById']>;
  removeInactiveRefreshTokens: MockedMethod<
    UsersService['removeInactiveRefreshTokens']
  >;
  addRefreshToken: MockedMethod<UsersService['addRefreshToken']>;
  replaceRefreshToken: MockedMethod<UsersService['replaceRefreshToken']>;
  removeRefreshToken: MockedMethod<UsersService['removeRefreshToken']>;
  updateLastActive: MockedMethod<UsersService['updateLastActive']>;
  findRefreshToken: MockedMethod<UsersService['findRefreshToken']>;
  clearAllRefreshTokens: MockedMethod<UsersService['clearAllRefreshTokens']>;
};

type JwtServiceMock = {
  signAsync: MockedMethod<JwtService['signAsync']>;
  verifyAsync: MockedMethod<JwtService['verifyAsync']>;
};

type ConfigServiceMock = {
  get: MockedMethod<ConfigService['get']>;
  getOrThrow: MockedMethod<ConfigService['getOrThrow']>;
};

type EmailVerificationServiceMock = {
  sendEmailVerification: MockedMethod<
    EmailVerificationService['sendEmailVerification']
  >;
  verifyEmail: MockedMethod<EmailVerificationService['verifyEmail']>;
};

const createMockFn = <Fn extends (...args: any[]) => any>() =>
  jest.fn<
    ReturnType<OmitThisParameter<Fn>>,
    Parameters<OmitThisParameter<Fn>>
  >();

jest.mock('bcrypt', () => ({
  hash: jest.fn((value: string) => Promise.resolve(`hashed-${value}`)),
  compare: jest.fn((raw: string, hashed: string) =>
    Promise.resolve(hashed === `hashed-${raw}`),
  ),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersServiceMock;
  let jwtService: JwtServiceMock;
  let configService: ConfigServiceMock;
  let emailVerificationService: EmailVerificationServiceMock;

  const baseUser = {
    id: 'user-1',
    email: 'amina@example.com',
    handle: 'amina',
    displayName: 'Amina',
    passwordHash: 'hashed-valid-password',
    roles: ['member'],
    emailVerifiedAt: new Date('2024-01-02T00:00:00Z'),
    status: 'active' as const,
    bannedAt: null,
    bannedReason: null,
    bannedBy: null,
    lastActiveAt: new Date('2024-01-01T00:00:00Z'),
    threadsCount: 0,
    postsCount: 0,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  } satisfies User & { emailVerifiedAt: Date | null; status: 'active' };

  beforeEach(async () => {
    usersService = {
      isEmailTaken: createMockFn<UsersService['isEmailTaken']>(),
      isHandleTaken: createMockFn<UsersService['isHandleTaken']>(),
      createUser: createMockFn<UsersService['createUser']>(),
      findByEmail: createMockFn<UsersService['findByEmail']>(),
      findById: createMockFn<UsersService['findById']>(),
      removeInactiveRefreshTokens:
        createMockFn<UsersService['removeInactiveRefreshTokens']>(),
      addRefreshToken: createMockFn<UsersService['addRefreshToken']>(),
      replaceRefreshToken: createMockFn<UsersService['replaceRefreshToken']>(),
      removeRefreshToken: createMockFn<UsersService['removeRefreshToken']>(),
      updateLastActive: createMockFn<UsersService['updateLastActive']>(),
      findRefreshToken: createMockFn<UsersService['findRefreshToken']>(),
      clearAllRefreshTokens:
        createMockFn<UsersService['clearAllRefreshTokens']>(),
    };

    jwtService = {
      signAsync: createMockFn<JwtService['signAsync']>(),
      verifyAsync: createMockFn<JwtService['verifyAsync']>(),
    };

    configService = {
      get: createMockFn<ConfigService['get']>(),
      getOrThrow: createMockFn<ConfigService['getOrThrow']>(),
    };

    configService.get.mockImplementation((key: string) => {
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
    });

    configService.getOrThrow.mockImplementation((key: string) => {
      if (key === 'JWT_SECRET') {
        return 'jwt-secret';
      }
      if (key === 'REFRESH_TOKEN_SECRET') {
        return 'refresh-secret';
      }
      throw new Error(`Unexpected config key: ${key}`);
    });

    emailVerificationService = {
      sendEmailVerification:
        createMockFn<EmailVerificationService['sendEmailVerification']>(),
      verifyEmail: createMockFn<EmailVerificationService['verifyEmail']>(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersService as unknown as UsersService,
        },
        {
          provide: JwtService,
          useValue: jwtService as unknown as JwtService,
        },
        {
          provide: ConfigService,
          useValue: configService as unknown as ConfigService,
        },
        {
          provide: EmailVerificationService,
          useValue:
            emailVerificationService as unknown as EmailVerificationService,
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('creates a user and triggers verification email', async () => {
      usersService.isEmailTaken.mockResolvedValue(false);
      usersService.isHandleTaken.mockResolvedValue(false);
      usersService.createUser.mockResolvedValue(baseUser);

      const result = await service.register({
        email: 'Amina@example.com',
        handle: 'Amina',
        password: 'valid-password',
        displayName: 'Amina Rahman',
      });

      expect(usersService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'amina@example.com',
          handle: 'amina',
          passwordHash: 'hashed-valid-password',
        }),
      );
      expect(
        emailVerificationService.sendEmailVerification,
      ).toHaveBeenCalledWith(baseUser);
      expect(result).toEqual({
        user: baseUser,
        emailVerificationRequired: true,
      });
    });

    it('throws when email already exists', async () => {
      usersService.isEmailTaken.mockResolvedValue(true);
      usersService.isHandleTaken.mockResolvedValue(false);

      await expect(
        service.register({
          email: 'amina@example.com',
          handle: 'amina',
          password: 'valid-password',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('returns tokens for valid credentials', async () => {
      usersService.findByEmail.mockResolvedValue(baseUser);
      usersService.removeInactiveRefreshTokens.mockResolvedValue(undefined);
      usersService.addRefreshToken.mockResolvedValue(undefined);
      usersService.updateLastActive.mockResolvedValue(undefined);
      jwtService.signAsync.mockResolvedValueOnce('access-token');
      jwtService.signAsync.mockResolvedValueOnce('refresh-token');

      const result = await service.login({
        email: 'amina@example.com',
        password: 'valid-password',
      });

      expect(usersService.removeInactiveRefreshTokens).toHaveBeenCalledWith(
        baseUser.id,
        expect.any(Date),
      );
      expect(usersService.addRefreshToken).toHaveBeenCalled();
      expect(result.tokens).toEqual(
        expect.objectContaining({
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        }),
      );
      expect(result.user).toEqual(baseUser);
    });

    it('throws when credentials are invalid', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'amina@example.com', password: 'invalid' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('reissues tokens when refresh token is valid', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: baseUser.id,
        email: baseUser.email,
        tokenId: 'token-1',
      });
      usersService.findById.mockResolvedValue(baseUser);
      usersService.findRefreshToken.mockResolvedValue({
        id: 'rt-1',
        tokenId: 'token-1',
        tokenHash: 'hashed-refresh-token',
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 1000),
        userId: baseUser.id,
      });
      jwtService.signAsync.mockResolvedValueOnce('new-access-token');
      jwtService.signAsync.mockResolvedValueOnce('new-refresh-token');

      const result = await service.refresh('refresh-token');

      expect(usersService.replaceRefreshToken).toHaveBeenCalledWith(
        baseUser.id,
        expect.objectContaining({ tokenHash: 'hashed-new-refresh-token' }),
        'token-1',
      );
      expect(result.tokens).toEqual(
        expect.objectContaining({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        }),
      );
    });

    it('throws when token cannot be decoded', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('bad token'));

      await expect(service.refresh('invalid')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('attachRefreshTokenCookie', () => {
    it('writes cookie with expected options', () => {
      const cookie = jest.fn();
      const response = { cookie } as unknown as Response;

      service.attachRefreshTokenCookie(
        response,
        'refresh-token',
        new Date('2025-01-01T00:00:00Z'),
      );

      expect(cookie).toHaveBeenCalledWith(
        REFRESH_TOKEN_COOKIE,
        'refresh-token',
        expect.objectContaining({
          httpOnly: true,
          secure: false,
          sameSite: 'lax',
        }),
      );
    });
  });
});
