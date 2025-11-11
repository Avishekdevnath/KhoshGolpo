import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, RefreshToken, User, UserStatus } from '@prisma/client/index';
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

export type PublicUserProfile = Pick<
  User,
  | 'id'
  | 'handle'
  | 'displayName'
  | 'avatarUrl'
  | 'roles'
  | 'status'
  | 'threadsCount'
  | 'postsCount'
  | 'createdAt'
  | 'lastActiveAt'
>;

export interface PublicUserListResult {
  data: PublicUserProfile[];
  total: number;
  page: number;
  limit: number;
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
    payload: Partial<Pick<User, 'displayName' | 'handle' | 'avatarUrl'>>,
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
    if (payload.avatarUrl !== undefined) {
      if (typeof payload.avatarUrl === 'string') {
        const trimmedAvatar = payload.avatarUrl.trim();
        data.avatarUrl = trimmedAvatar.length > 0 ? trimmedAvatar : null;
      } else {
        data.avatarUrl = null;
      }
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

  async searchUsers(
    query: string,
    limit = 10,
    filters?: {
      status?: UserStatus;
      role?: string;
    },
  ): Promise<
    Array<
      Pick<
        User,
        | 'id'
        | 'handle'
        | 'displayName'
        | 'avatarUrl'
        | 'roles'
        | 'status'
        | 'threadsCount'
        | 'postsCount'
        | 'createdAt'
        | 'lastActiveAt'
      >
    >
  > {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return [];
    }

    const sanitizedLimit = Math.min(Math.max(limit, 1), 20);

    const users = await this.prisma.user.findMany({
      where: {
        ...(filters?.status ? { status: filters.status } : {}),
        ...(filters?.role ? { roles: { has: filters.role } } : {}),
        OR: [
          { handle: { startsWith: normalizedQuery } },
          { displayName: { startsWith: normalizedQuery, mode: 'insensitive' } },
        ],
      },
      orderBy: [{ handle: 'asc' }, { displayName: 'asc' }],
      take: sanitizedLimit,
      select: {
        id: true,
        handle: true,
        displayName: true,
        avatarUrl: true,
        status: true,
        roles: true,
        threadsCount: true,
        postsCount: true,
        createdAt: true,
        lastActiveAt: true,
      },
    });

    return users;
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

  async listPublicUsers({
    query,
    page = 1,
    limit = 20,
    role,
    status,
  }: {
    query?: string;
    page?: number;
    limit?: number;
    role?: string;
    status?: UserStatus;
  }): Promise<PublicUserListResult> {
    const sanitizedPage = page > 0 ? page : 1;
    const sanitizedLimit = Math.min(Math.max(limit, 1), 50);
    const skip = (sanitizedPage - 1) * sanitizedLimit;

    const where: Prisma.UserWhereInput = {};
    if (query?.trim()) {
      const keyword = query.trim();
      where.OR = [
        { handle: { contains: keyword, mode: 'insensitive' } },
        { displayName: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.roles = { has: role };
    }

    where.status = status ?? UserStatus.active;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: sanitizedLimit,
        orderBy: [{ lastActiveAt: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          handle: true,
          displayName: true,
          avatarUrl: true,
          roles: true,
          status: true,
          threadsCount: true,
          postsCount: true,
          createdAt: true,
          lastActiveAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page: sanitizedPage,
      limit: sanitizedLimit,
    };
  }

  async findPublicProfileByHandle(
    handle: string,
  ): Promise<PublicUserProfile | null> {
    if (!handle?.trim()) {
      return null;
    }

    return this.prisma.user.findUnique({
      where: { handle: handle.toLowerCase() },
      select: {
        id: true,
        handle: true,
        displayName: true,
        avatarUrl: true,
        roles: true,
        status: true,
        threadsCount: true,
        postsCount: true,
        createdAt: true,
        lastActiveAt: true,
      },
    });
  }
}
