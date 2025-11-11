import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ThreadStatus } from '@prisma/client/index';
import type { Prisma, ModerationState, Thread } from '@prisma/client/index';
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

type ReactionType = 'upvote' | 'downvote';

interface PostRecord {
  id: string;
  threadId: string;
  authorId: string;
  body: string;
  mentions?: string[] | null;
  parentPostId?: string | null;
  moderationState: ModerationState;
  moderationFeedback?: string | null;
  upvotesCount?: number | null;
  downvotesCount?: number | null;
  repliesCount?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

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

  async getThreadPosts(
    threadId: string,
    page = 1,
    limit = 20,
  ): Promise<{ posts: PostRecord[]; total: number }> {
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
      posts: posts as PostRecord[],
      total,
    };
  }

  async createThread(
    author: ActiveUser,
    dto: CreateThreadDto,
  ): Promise<{ thread: Thread; firstPost: PostRecord }> {
    const authorId = author.userId;
    const now = new Date();

    const slug = await this.generateUniqueSlug(dto.title);
    const mentionHandles = this.extractMentionHandles(dto.body);
    const mentionRecipients = await this.resolveMentionRecipientIds(dto.body, [
      authorId,
    ]);

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

        const post = (await tx.post.create({
          data: {
            threadId: thread.id,
            authorId,
            body: dto.body,
            mentions: mentionHandles,
            moderationState: 'approved',
          },
        })) as PostRecord;

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
    await this.replacePostMentions(result.firstPost.id, mentionRecipients);

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
        [],
      ),
    );

    if (mentionRecipients.length) {
      await this.handleMentionNotifications(
        result.thread.id,
        result.firstPost,
        mentionRecipients,
      );
    }

    return result;
  }

  async createPost(
    author: ActiveUser,
    threadId: string,
    dto: CreatePostDto,
  ): Promise<PostRecord> {
    const authorId = author.userId;
    const now = new Date();
    const mentionHandles = this.extractMentionHandles(dto.body);
    const mentionRecipients = await this.resolveMentionRecipientIds(dto.body, [
      authorId,
    ]);

    const result = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const thread = await tx.thread.findUnique({ where: { id: threadId } });
        if (!thread) {
          throw new NotFoundException('Thread not found.');
        }

        if (thread.status !== ThreadStatus.open) {
          throw new ForbiddenException('Thread is not accepting new posts.');
        }

        const post = (await tx.post.create({
          data: {
            threadId,
            authorId,
            body: dto.body,
            mentions: mentionHandles,
            moderationState: 'approved',
            parentPostId: dto.parentPostId ?? undefined,
          },
        })) as PostRecord;

        if (dto.parentPostId) {
          const parent = await tx.post.findUnique({
            where: { id: dto.parentPostId },
          });
          if (!parent || parent.threadId !== threadId) {
            throw new NotFoundException(
              'Parent post not found in this thread.',
            );
          }
          await tx.post.update({
            where: { id: dto.parentPostId },
            data: {
              repliesCount: { increment: 1 },
            } as Prisma.PostUncheckedUpdateInput,
          });
        }

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
    await this.replacePostMentions(post.id, mentionRecipients);
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

    if (recipients.participants.length) {
      await this.safeQueue('notification', () =>
        this.notifications.enqueue(
          'post.created',
          {
            postId: post.id,
            threadId,
            authorId,
            createdAt: post.createdAt,
          },
          recipients.participants,
        ),
      );
    }

    if (recipients.mentions.length) {
      await this.handleMentionNotifications(
        threadId,
        post,
        recipients.mentions,
      );
    }

    this.realtime.emitPostCreated(threadId, post);

    await this.invalidateThreadCaches(threadId);
    await this.cache.delByPattern(this.threadListPattern());

    return post;
  }

  async updatePost(
    author: ActiveUser,
    threadId: string,
    postId: string,
    body?: string,
  ): Promise<PostRecord> {
    const trimmedBody = body?.trim();
    if (!trimmedBody) {
      throw new ForbiddenException('Post body must not be empty.');
    }

    const mentionHandles = this.extractMentionHandles(trimmedBody);
    const mentionRecipients = await this.resolveMentionRecipientIds(
      trimmedBody,
      [author.userId],
    );

    const { post: updatedPost, changed } = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const existing = await tx.post.findUnique({ where: { id: postId } });
        if (!existing || existing.threadId !== threadId) {
          throw new NotFoundException('Post not found.');
        }
        if (existing.authorId !== author.userId) {
          throw new ForbiddenException('You can only edit your own posts.');
        }

        if (existing.body === trimmedBody) {
          return { post: existing as PostRecord, changed: false };
        }

        const post = (await tx.post.update({
          where: { id: postId },
          data: {
            body: trimmedBody,
            mentions: mentionHandles,
            updatedAt: new Date(),
          },
        })) as PostRecord;

        await tx.thread.update({
          where: { id: threadId },
          data: { lastActivityAt: new Date() },
        });

        return { post, changed: true };
      },
    );

    if (!changed) {
      return updatedPost;
    }

    await this.replacePostMentions(updatedPost.id, mentionRecipients);
    if (mentionRecipients.length) {
      await this.handleMentionNotifications(
        threadId,
        updatedPost,
        mentionRecipients,
      );
    }

    this.realtime.emitPostUpdated(threadId, updatedPost);
    await this.invalidateThreadCaches(threadId);
    await this.cache.delByPattern(this.threadListPattern());

    return updatedPost;
  }

  async reactToPost(
    user: ActiveUser,
    threadId: string,
    postId: string,
    type: ReactionType,
  ): Promise<{ post: PostRecord; userReaction: ReactionType | null }> {
    const userId = user.userId;

    const result = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const post = await tx.post.findUnique({ where: { id: postId } });
        if (!post || post.threadId !== threadId) {
          throw new NotFoundException('Post not found.');
        }

        const postReaction = tx.postReaction;
        const existing = await postReaction.findUnique({
          where: { postId_userId: { postId, userId } },
        });

        let upvoteDelta = 0;
        let downvoteDelta = 0;
        let newReaction: ReactionType | null = type;

        if (existing) {
          const existingType = existing.type as ReactionType;
          if (existingType === type) {
            await postReaction.delete({
              where: { postId_userId: { postId, userId } },
            });
            newReaction = null;
            if (type === 'upvote') {
              upvoteDelta -= 1;
            } else {
              downvoteDelta -= 1;
            }
          } else {
            await postReaction.update({
              where: { postId_userId: { postId, userId } },
              data: { type },
            });
            if (existingType === 'upvote') {
              upvoteDelta -= 1;
            } else {
              downvoteDelta -= 1;
            }
            if (type === 'upvote') {
              upvoteDelta += 1;
            } else {
              downvoteDelta += 1;
            }
          }
        } else {
          await postReaction.create({
            data: {
              postId,
              userId,
              type,
            },
          });
          if (type === 'upvote') {
            upvoteDelta += 1;
          } else {
            downvoteDelta += 1;
          }
        }

        let postAfterReaction = post as PostRecord;
        if (upvoteDelta !== 0 || downvoteDelta !== 0) {
          const data: Record<string, unknown> = { updatedAt: new Date() };
          if (upvoteDelta !== 0) {
            data.upvotesCount = { increment: upvoteDelta };
          }
          if (downvoteDelta !== 0) {
            data.downvotesCount = { increment: downvoteDelta };
          }
          postAfterReaction = (await tx.post.update({
            where: { id: postId },
            data: data as Prisma.PostUncheckedUpdateInput,
          })) as PostRecord;
        }

        return { postAfterReaction, newReaction };
      },
    );

    const { postAfterReaction, newReaction } = result;

    this.realtime.emitPostReaction({
      threadId,
      postId,
      upvotesCount: postAfterReaction.upvotesCount ?? 0,
      downvotesCount: postAfterReaction.downvotesCount ?? 0,
      userId,
      reaction: newReaction,
    });

    if (newReaction && postAfterReaction.authorId !== userId) {
      await this.safeQueue('notification', () =>
        this.notifications.enqueue(
          'post.reacted',
          {
            postId,
            threadId,
            reaction: newReaction,
            actorId: userId,
            createdAt: new Date(),
          },
          [postAfterReaction.authorId],
        ),
      );
    }

    await this.invalidateThreadCaches(threadId);
    await this.cache.delByPattern(this.threadListPattern());

    return { post: postAfterReaction, userReaction: newReaction };
  }

  async removePostReaction(
    user: ActiveUser,
    threadId: string,
    postId: string,
  ): Promise<PostRecord> {
    const userId = user.userId;

    const updatedPost = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const post = await tx.post.findUnique({ where: { id: postId } });
        if (!post || post.threadId !== threadId) {
          throw new NotFoundException('Post not found.');
        }

        const postReaction = tx.postReaction;
        const existing = await postReaction.findUnique({
          where: { postId_userId: { postId, userId } },
        });
        if (!existing) {
          return post as PostRecord;
        }

        await postReaction.delete({
          where: { postId_userId: { postId, userId } },
        });

        const data: Record<string, unknown> = { updatedAt: new Date() };
        if ((existing.type as ReactionType) === 'upvote') {
          data.upvotesCount = { increment: -1 };
        } else {
          data.downvotesCount = { increment: -1 };
        }

        return (await tx.post.update({
          where: { id: postId },
          data: data as Prisma.PostUncheckedUpdateInput,
        })) as PostRecord;
      },
    );

    this.realtime.emitPostReaction({
      threadId,
      postId,
      upvotesCount: updatedPost.upvotesCount ?? 0,
      downvotesCount: updatedPost.downvotesCount ?? 0,
      userId,
      reaction: null,
    });

    await this.invalidateThreadCaches(threadId);
    await this.cache.delByPattern(this.threadListPattern());

    return updatedPost;
  }

  async getThreadWithPosts(threadId: string, page = 1, limit = 20) {
    const cacheKey = this.buildThreadDetailCacheKey(threadId, page, limit);
    const cached = await this.cache.get<{
      thread: Thread;
      posts: PostRecord[];
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
  ): Promise<PostRecord> {
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
  ): Promise<{ participants: string[]; mentions: string[] }> {
    const participants = new Set<string>();
    if (thread.authorId && thread.authorId !== authorId) {
      participants.add(thread.authorId);
    }
    (thread.participantIds ?? []).forEach((participantId: string) => {
      if (participantId !== authorId) {
        participants.add(participantId);
      }
    });

    const mentionRecipients = await this.resolveMentionRecipientIds(body, [
      authorId,
    ]);
    const mentionSet = new Set(mentionRecipients);
    mentionSet.forEach((id) => participants.delete(id));

    return {
      participants: Array.from(participants),
      mentions: Array.from(mentionSet),
    };
  }

  private async replacePostMentions(
    postId: string,
    mentionedUserIds: string[],
  ): Promise<void> {
    await this.prisma.postMention.deleteMany({ where: { postId } });
    if (!mentionedUserIds.length) {
      return;
    }
    await this.prisma.postMention.createMany({
      data: mentionedUserIds.map((userId) => ({
        postId,
        mentionedUserId: userId,
      })),
    });
  }

  private async markMentionsNotified(
    postId: string,
    recipientIds: string[],
  ): Promise<void> {
    if (!recipientIds.length) {
      return;
    }
    await this.prisma.postMention.updateMany({
      where: {
        postId,
        mentionedUserId: { in: recipientIds },
      },
      data: {
        notified: true,
        notifiedAt: new Date(),
      },
    });
  }

  private async handleMentionNotifications(
    threadId: string,
    post: PostRecord,
    recipientIds: string[],
  ): Promise<void> {
    if (!recipientIds.length) {
      return;
    }
    await this.safeQueue('notification', () =>
      this.notifications.enqueue(
        'post.mentioned',
        {
          postId: post.id,
          threadId,
          authorId: post.authorId,
          createdAt: post.createdAt,
        },
        recipientIds,
      ),
    );
    await this.markMentionsNotified(post.id, recipientIds);
    this.realtime.emitPostMention(threadId, post, recipientIds);
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
    } catch (error: unknown) {
      this.logger.warn(
        `Failed to enqueue ${label} job: ${(error as Error).message}`,
      );
    }
  }
}
