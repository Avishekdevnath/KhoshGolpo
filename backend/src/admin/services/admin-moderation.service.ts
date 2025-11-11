import { Injectable } from '@nestjs/common';
import type {
  Prisma,
  ModerationState,
  ThreadStatus,
  Post,
  Thread,
  User,
} from '@prisma/client/index';
import { PrismaService } from '../../prisma/prisma.service';
import type { ListModerationPostsQueryDto } from '../dto/list-moderation-posts.query';
import type { ListModerationThreadsQueryDto } from '../dto/list-moderation-threads.query';

type PostWithRelations = Prisma.PostGetPayload<{
  include: { thread: true; author: true };
}>;

type ThreadWithAuthor = Prisma.ThreadGetPayload<{
  include: { author: true };
}>;

@Injectable()
export class AdminModerationService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultPostStates: ModerationState[] = [
    'pending',
    'flagged',
  ];

  async listPosts(query: ListModerationPostsQueryDto): Promise<{
    data: { post: Post; thread: Thread; author: User }[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page, limit } = query;
    const states =
      query.state && query.state.length > 0
        ? query.state.map((state) => state as ModerationState)
        : this.defaultPostStates;

    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {
      moderationState: { in: states },
    };

    const [posts, total] = (await this.prisma.$transaction([
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
    ])) as [PostWithRelations[], number];

    const normalized: { post: Post; thread: Thread; author: User }[] =
      posts.map(({ thread, author, ...postEntity }: PostWithRelations) => ({
        post: postEntity,
        thread,
        author,
      }));

    return {
      data: normalized,
      total,
      page,
      limit,
    };
  }

  async listThreads(query: ListModerationThreadsQueryDto): Promise<{
    data: { thread: Thread; author: User }[];
    total: number;
    page: number;
    limit: number;
  }> {
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

    const [threads, total] = (await this.prisma.$transaction([
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
    ])) as [ThreadWithAuthor[], number];

    const normalized: { thread: Thread; author: User }[] = threads.map(
      ({ author, ...threadEntity }: ThreadWithAuthor) => ({
        thread: threadEntity,
        author,
      }),
    );

    return {
      data: normalized,
      total,
      page,
      limit,
    };
  }
}
