import { Injectable } from '@nestjs/common';
import { Prisma, ModerationState, ThreadStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import type { ListModerationPostsQueryDto } from '../dto/list-moderation-posts.query';
import type { ListModerationThreadsQueryDto } from '../dto/list-moderation-threads.query';

@Injectable()
export class AdminModerationService {
  constructor(private readonly prisma: PrismaService) {}

  async listPosts(query: ListModerationPostsQueryDto) {
    const { page, limit } = query;
    const states =
      query.state && query.state.length > 0
        ? query.state.map((state) => state as ModerationState)
        : (['pending', 'flagged'] as ModerationState[]);

    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {
      moderationState: { in: states },
    };

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
        include: {
          thread: true,
          author: true,
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      total,
      page,
      limit,
    };
  }

  async listThreads(query: ListModerationThreadsQueryDto) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ThreadWhereInput = {};
    if (query.status) {
      where.status = query.status as ThreadStatus;
    }
    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [threads, total] = await this.prisma.$transaction([
      this.prisma.thread.findMany({
        where,
        orderBy: { lastActivityAt: 'desc' },
        skip,
        take: limit,
        include: {
          author: true,
        },
      }),
      this.prisma.thread.count({ where }),
    ]);

    return {
      data: threads,
      total,
      page,
      limit,
    };
  }
}

