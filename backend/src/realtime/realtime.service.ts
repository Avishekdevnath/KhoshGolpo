import { Injectable, Logger } from '@nestjs/common';
import type { Server, Socket, DefaultEventsMap } from 'socket.io';
import { ThreadSchema } from '../threads/schemas/thread.schema';
import { PostSchema } from '../posts/schemas/post.schema';
import type { Thread, Prisma } from '@prisma/client/index';
import { NotificationSchema } from '../notifications/schemas/notification.schema';

export interface NotificationRecord {
  id: string;
  userId: string;
  event: string;
  payload: Prisma.JsonValue | null;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

type ReactionType = 'upvote' | 'downvote';

export interface SocketData {
  userId?: string;
}

export type AppServer = Server<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;

export type AppSocket = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  SocketData
>;

interface PostPayload {
  id: string;
  threadId: string;
  authorId: string;
  body: string;
  mentions?: string[] | null;
  parentPostId?: string | null;
  moderationState: string;
  moderationFeedback?: string | null;
  upvotesCount?: number | null;
  downvotesCount?: number | null;
  repliesCount?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostReactionBroadcast {
  threadId: string;
  postId: string;
  upvotesCount: number;
  downvotesCount: number;
  userId: string;
  reaction: ReactionType | null;
}

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private server?: AppServer;

  setServer(server: AppServer): void {
    this.server = server;
  }

  registerUserSocket(client: AppSocket, userId: string): void {
    client.data.userId = userId;
    void client.join(this.buildUserRoom(userId));
    this.logger.debug(`Socket ${client.id} registered for user ${userId}`);
  }

  unregisterSocket(client: AppSocket): void {
    const userId = client.data.userId;
    if (userId) {
      this.logger.debug(`Socket ${client.id} disconnected for user ${userId}`);
    }
  }

  joinThreadRoom(client: AppSocket, threadId: string): void {
    void client.join(this.buildThreadRoom(threadId));
  }

  leaveThreadRoom(client: AppSocket, threadId: string): void {
    void client.leave(this.buildThreadRoom(threadId));
  }

  emitThreadCreated(thread: Thread, firstPost: PostPayload): void {
    if (!this.server) {
      return;
    }
    this.server.emit('thread.created', {
      thread: ThreadSchema.fromModel(thread),
      firstPost: PostSchema.fromModel({ ...firstPost }),
    });
  }

  emitPostCreated(threadId: string, post: PostPayload): void {
    if (!this.server) {
      return;
    }
    this.server
      .to(this.buildThreadRoom(threadId))
      .emit('post.created', { post: PostSchema.fromModel({ ...post }) });
    this.server.emit('post.created.global', {
      threadId,
      post: PostSchema.fromModel({ ...post }),
    });
  }

  emitPostUpdated(threadId: string, post: PostPayload): void {
    if (!this.server) {
      return;
    }
    this.server
      .to(this.buildThreadRoom(threadId))
      .emit('post.updated', { post: PostSchema.fromModel({ ...post }) });
  }

  emitPostDeleted(threadId: string, postId: string): void {
    if (!this.server) {
      return;
    }
    const payload = { threadId, postId };
    this.server
      .to(this.buildThreadRoom(threadId))
      .emit('post.deleted', payload);
  }

  emitPostReaction(payload: PostReactionBroadcast): void {
    if (!this.server) {
      return;
    }
    this.server
      .to(this.buildThreadRoom(payload.threadId))
      .emit('post.reaction', payload);
    this.server
      .to(this.buildUserRoom(payload.userId))
      .emit('post.reaction.personal', payload);
  }

  emitPostMention(
    threadId: string,
    post: PostPayload,
    userIds: string[],
  ): void {
    if (!this.server || userIds.length === 0) {
      return;
    }
    const payload = {
      threadId,
      post: PostSchema.fromModel({ ...post }),
    };
    userIds.forEach((userId) => {
      this.server
        ?.to(this.buildUserRoom(userId))
        .emit('post.mentioned', payload);
    });
  }

  emitNotifications(notifications: NotificationRecord[]): void {
    const server = this.server;
    if (!server || notifications.length === 0) {
      return;
    }
    notifications.forEach((notification) => {
      server
        .to(this.buildUserRoom(notification.userId))
        .emit(
          'notification.created',
          NotificationSchema.fromModel(notification),
        );
    });
  }

  emitThreadDeleted(threadId: string): void {
    if (!this.server) {
      return;
    }
    this.server.emit('thread.deleted', { threadId });
  }

  private buildUserRoom(userId: string): string {
    return `user:${userId}`;
  }

  private buildThreadRoom(threadId: string): string {
    return `thread:${threadId}`;
  }
}
