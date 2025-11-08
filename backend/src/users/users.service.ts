import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, User, RefreshToken } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface CreateUserParams {
  email: string;
  passwordHash: string;
  handle: string;
  displayName: string;
  roles?: string[];
}

interface RefreshTokenPayload {
  tokenId: string;
  tokenHash: string;
  expiresAt: Date;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(params: CreateUserParams): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: params.email.toLowerCase(),
        passwordHash: params.passwordHash,
        handle: params.handle.toLowerCase(),
        displayName: params.displayName,
        roles: params.roles ?? ['member'],
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findByHandle(handle: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { handle: handle.toLowerCase() },
    });
  }

  async findById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return Boolean(user);
  }

  async isHandleTaken(handle: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { handle: handle.toLowerCase() },
    });
    return Boolean(user);
  }

  async addRefreshToken(
    userId: string,
    token: RefreshTokenPayload,
  ): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        tokenId: token.tokenId,
        tokenHash: token.tokenHash,
        issuedAt: new Date(),
        expiresAt: token.expiresAt,
        userId,
      },
    });
  }

  async replaceRefreshToken(
    userId: string,
    token: RefreshTokenPayload,
    tokenIdToRemove: string,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.refreshToken.deleteMany({
        where: { tokenId: tokenIdToRemove, userId },
      }),
      this.prisma.refreshToken.create({
        data: {
          tokenId: token.tokenId,
          tokenHash: token.tokenHash,
          issuedAt: new Date(),
          expiresAt: token.expiresAt,
          userId,
        },
      }),
    ]);
  }

  async removeRefreshToken(userId: string, tokenId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { tokenId, userId } });
  }

  async findRefreshToken(
    userId: string,
    tokenId: string,
  ): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findFirst({ where: { tokenId, userId } });
  }

  async clearAllRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
  }

  async updateLastActive(userId: string, lastActiveAt: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt },
    });
  }

  async incrementThreadCount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { threadsCount: { increment: 1 } },
    });
  }

  async incrementPostCount(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { postsCount: { increment: 1 } },
    });
  }

  async updateProfile(
    userId: string,
    payload: Partial<Pick<User, 'displayName' | 'handle'>>,
  ): Promise<User | null> {
    const data: Prisma.UserUpdateInput = {};
    if (payload.displayName !== undefined) {
      data.displayName = payload.displayName.trim();
    }
    if (payload.handle !== undefined) {
      const normalizedHandle = payload.handle.toLowerCase();
      const existing = await this.prisma.user.findUnique({
        where: { handle: normalizedHandle },
      });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Handle is already taken.');
      }
      data.handle = normalizedHandle;
    }
    if (Object.keys(data).length === 0) {
      return this.findById(userId);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  async findByHandles(handles: string[]): Promise<User[]> {
    if (!handles.length) {
      return [];
    }
    const normalized = handles.map((handle) => handle.toLowerCase());
    return this.prisma.user.findMany({
      where: {
        handle: { in: normalized },
      },
    });
  }

  async removeInactiveRefreshTokens(
    userId: string,
    expiresBefore: Date,
  ): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        expiresAt: { lte: expiresBefore },
      },
    });
  }

  async findOne(where: Prisma.UserWhereInput): Promise<User | null> {
    return this.prisma.user.findFirst({ where });
  }
}
