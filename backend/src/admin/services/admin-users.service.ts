import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../../users/users.service';
import type { ListUsersQueryDto } from '../dto/list-users.query';
import type { UpdateUserRolesDto } from '../dto/update-user-roles.dto';
import type { UpdateUserStatusDto } from '../dto/update-user-status.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async listUsers(query: ListUsersQueryDto) {
    const { page, limit, sortBy } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (query.query) {
      const search = query.query.trim();
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { handle: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (query.roles && query.roles.length > 0) {
      where.roles = { hasSome: query.roles };
    }
    if (query.status && query.status.length > 0) {
      // Prisma typing for enums on Mongo can be slow to regenerate; cast for now.
      where.status = { in: query.status } as any;
    }

    const orderBy: Prisma.UserOrderByWithRelationInput[] = [];
    switch (sortBy) {
      case 'activity':
        orderBy.push({ lastActiveAt: 'desc' });
        break;
      case 'threads':
        orderBy.push({ threadsCount: 'desc' });
        break;
      case 'posts':
        orderBy.push({ postsCount: 'desc' });
        break;
      case 'latest':
      default:
        orderBy.push({ createdAt: 'desc' });
        break;
    }

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          auditLogs: {
            orderBy: { createdAt: 'desc' },
            take: 3,
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      total,
      page,
      limit,
    };
  }

  async updateRoles(userId: string, dto: UpdateUserRolesDto, actorId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (userId === actorId && !dto.roles.includes('admin')) {
      throw new ConflictException('Cannot remove admin role from yourself.');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { roles: dto.roles },
    });

    await this.recordAudit(actorId, 'user.roles.update', userId, {
      oldRoles: user.roles,
      newRoles: dto.roles,
    });

    return updated;
  }

  async updateStatus(userId: string, dto: UpdateUserStatusDto, actorId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (userId === actorId && dto.status !== 'active') {
      throw new ConflictException('Administrators cannot suspend or ban themselves.');
    }

    const updates: Prisma.UserUpdateInput = {
      status: dto.status,
      bannedReason: dto.reason ?? null,
      bannedAt: ['banned', 'suspended'].includes(dto.status) ? new Date() : null,
      bannedBy: ['banned', 'suspended'].includes(dto.status) ? actorId : null,
    };

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updates,
    });

    if (dto.status !== 'active') {
      await this.usersService.clearAllRefreshTokens(userId);
    }

    await this.recordAudit(actorId, 'user.status.update', userId, {
      oldStatus: user.status ?? 'active',
      newStatus: dto.status,
      reason: dto.reason ?? null,
    });

    return updated;
  }

  async forceLogout(userId: string, actorId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found.');
    }
    await this.usersService.clearAllRefreshTokens(userId);
    await this.recordAudit(actorId, 'user.forceLogout', userId, {
      message: 'All refresh tokens revoked',
    });
    return { success: true };
  }

  private async recordAudit(
    actorId: string,
    action: string,
    resourceId: string,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.adminAudit.create({
      data: {
        actorId,
        action,
        resource: 'user',
        resourceId,
        metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }
}

