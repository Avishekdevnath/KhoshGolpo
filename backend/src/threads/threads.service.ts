import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  ModerationState,
  Prisma,
  Thread,
  ThreadStatus,
  Post,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { ActiveUser } from '../common/decorators/current-user.decorator';
import { CreateThreadDto } from './dto/create-thread.dto';
import { ListThreadsQueryDto } from './dto/list-threads.query';
import { CreatePostDto } from './dto/create-post.dto';
import { UsersService } from '../users/users.service';
import { RealtimeService } from '../realtime/realtime.service';
import { CacheService } from '../cache/cache.service';

interface PaginatedThreads {
  data: Thread[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ThreadsService {
  private readonly logger = new Logger(ThreadsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly notifications: NotificationsService,
    private readonly usersService: UsersService,
    private readonly realtime: RealtimeService,
    private readonly cache: CacheService,
  ) {}

  async listThreads(query: ListThreadsQueryDto): Promise<PaginatedThreads> {
    const cacheKey = this.buildThreadListCacheKey(query);
    const cached = await this.cache.get<PaginatedThreads>(cacheKey);
    if (cached) {
      return cached;
    }

    const { page, limit, status } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ThreadWhereInput = {};
    if (status) {
      where.status = status as ThreadStatus;
    }

    const [threads, total] = await this.prisma.$transaction([
      this.prisma.thread.findMany({
        where,
        orderBy: { lastActivityAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.thread.count({ where }),
    ]);

    const result = {
      data: threads,
      total,
      page,
      limit,
    };

    await this.cache.set(cacheKey, result, 60);

    return result;
  }

  async getThread(threadId: string) {
    const thread = await this.prisma.thread.findUnique({
      where: { id: threadId },
    });
    if (!thread) {
      throw new NotFoundException('Thread not found.');
    }
    return thread;
  }

  async getThreadPosts(threadId: string, page = 1, limit = 20) {
    const thread = await this.prisma.thread.findUnique({
      where: { id: threadId },
    });
    if (!thread) {
      throw new NotFoundException('Thread not found.');
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where: { threadId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where: { threadId } }),
    ]);

    return {
      posts,
      total,
    };
  }

  async createThread(
    author: ActiveUser,
    dto: CreateThreadDto,
  ): Promise<{ thread: Thread; firstPost: Post }> {
    const authorId = author.userId;
    const now = new Date();

    const slug = await this.generateUniqueSlug(dto.title);

    const result = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
      const thread = await tx.thread.create({
        data: {
          title: dto.title.trim(),
          slug,
          authorId,
          tags: dto.tags ?? [],
          status: ThreadStatus.open,
          lastActivityAt: now,
          postsCount: 1,
          participantsCount: 1,
          participantIds: [authorId],
        },
      });

      const post = await tx.post.create({
        data: {
          threadId: thread.id,
          authorId,
          body: dto.body,
          moderationState: 'approved',
        },
      });

      await tx.user.update({
        where: { id: authorId },
        data: {
          threadsCount: { increment: 1 },
          postsCount: { increment: 1 },
          lastActiveAt: now,
        },
      });

      return { thread, firstPost: post };
      },
    );

    const mentionRecipients = await this.resolveMentionRecipientIds(
      dto.body,
      [authorId],
    );

    await this.safeQueue('ai-moderation', () =>
      this.ai.queuePostModeration({
        postId: result.firstPost.id,
        threadId: result.thread.id,
        authorId,
        content: dto.body,
      }),
    );

    await this.safeQueue('ai-summary', () =>
      this.ai.queueThreadSummary({
        threadId: result.thread.id,
        requesterId: authorId,
        prompt: this.buildThreadSummaryPrompt(dto.title, dto.body),
      }),
    );

    this.realtime.emitThreadCreated(result.thread, result.firstPost);

    await this.invalidateThreadCaches(result.thread.id);
    await this.cache.delByPattern(this.threadListPattern());

    await this.safeQueue('notification', () =>
      this.notifications.enqueue(
        'thread.created',
        {
          threadId: result.thread.id,
          authorId,
          title: dto.title,
          createdAt: result.thread.createdAt,
        },
        mentionRecipients,
      ),
    );

    return result;
  }

  async createPost(
    author: ActiveUser,
    threadId: string,
    dto: CreatePostDto,
  ): Promise<Post> {
    const authorId = author.userId;
    const now = new Date();

    const result = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
      const thread = await tx.thread.findUnique({ where: { id: threadId } });
      if (!thread) {
        throw new NotFoundException('Thread not found.');
      }

      if (thread.status !== ThreadStatus.open) {
        throw new ForbiddenException('Thread is not accepting new posts.');
      }

      const post = await tx.post.create({
        data: {
          threadId,
          authorId,
          body: dto.body,
          moderationState: 'approved',
          parentPostId: dto.parentPostId ?? undefined,
        },
      });

      const participantIds = new Set(thread.participantIds ?? []);
      if (!participantIds.has(authorId)) {
        participantIds.add(authorId);
      }

      await tx.thread.update({
        where: { id: threadId },
        data: {
          postsCount: { increment: 1 },
          lastActivityAt: now,
          participantsCount: participantIds.size,
          participantIds: Array.from(participantIds),
        },
      });

      await tx.user.update({
        where: { id: authorId },
        data: {
          postsCount: { increment: 1 },
          lastActiveAt: now,
        },
      });

      return { post, thread };
      },
    );

    const { post, thread } = result;
    const recipients = await this.buildPostNotificationRecipients(
      thread,
      authorId,
      dto.body,
    );

    await this.safeQueue('ai-moderation', () =>
      this.ai.queuePostModeration({
        postId: post.id,
        threadId,
        authorId,
        content: dto.body,
      }),
    );

    await this.safeQueue('notification', () =>
      this.notifications.enqueue(
        'post.created',
        {
          postId: post.id,
          threadId,
          authorId,
          createdAt: post.createdAt,
        },
        recipients,
      ),
    );

    this.realtime.emitPostCreated(threadId, post);

    await this.invalidateThreadCaches(threadId);
    await this.cache.delByPattern(this.threadListPattern());

    return post;
  }

  async getThreadWithPosts(threadId: string, page = 1, limit = 20) {
    const cacheKey = this.buildThreadDetailCacheKey(threadId, page, limit);
    const cached = await this.cache.get<{
      thread: Thread;
      posts: Post[];
      postsTotal: number;
      page: number;
      limit: number;
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    const [thread, postsData] = await Promise.all([
      this.getThread(threadId),
      this.getThreadPosts(threadId, page, limit),
    ]);

    const result = {
      thread,
      posts: postsData.posts,
      postsTotal: postsData.total,
      page,
      limit,
    };

    await this.cache.set(cacheKey, result, 45);

    return result;
  }

  async updateThreadStatus(
    threadId: string,
    status: ThreadStatus,
  ): Promise<Thread> {
    const thread = await this.prisma.thread.update({
      where: { id: threadId },
      data: { status },
    });

    await this.invalidateThreadCaches(threadId);
    await this.cache.delByPattern(this.threadListPattern());

    return thread;
  }

  async moderatePost(
    postId: string,
    moderationState: ModerationState,
    moderationFeedback?: string | null,
    lockThread?: boolean,
  ): Promise<Post> {
    const post = await this.prisma.post.update({
      where: { id: postId },
      data: {
        moderationState,
        moderationFeedback: moderationFeedback ?? null,
      },
    });

    if (lockThread && moderationState !== 'approved') {
      await this.prisma.thread.update({
        where: { id: post.threadId },
        data: {
          status: ThreadStatus.locked,
          lastActivityAt: new Date(),
        },
      });
    }

    await this.invalidateThreadCaches(post.threadId);
    await this.cache.delByPattern(this.threadListPattern());

    return post;
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const base = this.slugify(title);
    let candidate = base;
    let suffix = 1;

    while (
      await this.prisma.thread.findUnique({ where: { slug: candidate } })
    ) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    return candidate;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  private buildThreadSummaryPrompt(title: string, body: string): string {
    const normalizedTitle = title.trim();
    const normalizedBody = body.trim();
    return `Summarize the following discussion thread into key bullet points.\nTitle: ${normalizedTitle}\nInitial post: ${normalizedBody}`;
  }

  private async resolveMentionRecipientIds(
    body: string,
    excludeUserIds: string[] = [],
  ): Promise<string[]> {
    const handles = this.extractMentionHandles(body);
    if (handles.length === 0) {
      return [];
    }
    const mentionedUsers = await this.usersService.findByHandles(handles);
    const exclusionSet = new Set(excludeUserIds);
    return mentionedUsers
      .map((user) => user.id)
      .filter((id, index, array) => array.indexOf(id) === index)
      .filter((id) => !exclusionSet.has(id));
  }

  private extractMentionHandles(text: string): string[] {
    const regex = /@([a-z0-9_.-]{3,20})/gi;
    const handles = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      handles.add(match[1].toLowerCase());
    }
    return Array.from(handles);
  }

  private async buildPostNotificationRecipients(
    thread: Thread,
    authorId: string,
    body: string,
  ): Promise<string[]> {
    const recipients = new Set<string>();
    if (thread.authorId !== authorId) {
      recipients.add(thread.authorId);
    }
    const mentionRecipients = await this.resolveMentionRecipientIds(body, [
      authorId,
      thread.authorId,
    ]);
    mentionRecipients.forEach((id) => recipients.add(id));
    return Array.from(recipients);
  }

  private buildThreadListCacheKey(query: ListThreadsQueryDto): string {
    const statusKey = query.status ?? 'all';
    return `threads:list:${statusKey}:${query.page}:${query.limit}`;
  }

  private buildThreadDetailCacheKey(
    threadId: string,
    page: number,
    limit: number,
  ): string {
    return `threads:detail:${threadId}:${page}:${limit}`;
  }

  private threadListPattern(): string {
    return 'threads:list:*';
  }

  private threadDetailPattern(threadId: string): string {
    return `threads:detail:${threadId}:*`;
  }

  private async invalidateThreadCaches(threadId: string): Promise<void> {
    await this.cache.delByPattern(this.threadDetailPattern(threadId));
  }

  private async safeQueue(
    label: string,
    enqueue: () => Promise<void>,
  ): Promise<void> {
    try {
      await enqueue();
    } catch (error) {
      this.logger.warn(
        `Failed to enqueue ${label} job: ${(error as Error).message}`,
      );
    }
  }
}
