import { Injectable, Logger } from '@nestjs/common';
import type { Server, Socket } from 'socket.io';
import { ThreadSchema } from '../threads/schemas/thread.schema';
import { PostSchema } from '../posts/schemas/post.schema';
import type { Thread, Post, Prisma } from '@prisma/client';
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

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);
  private server?: Server;

  setServer(server: Server): void {
    this.server = server;
  }

  registerUserSocket(client: Socket, userId: string): void {
    client.data.userId = userId;
    client.join(this.buildUserRoom(userId));
    this.logger.debug(`Socket ${client.id} registered for user ${userId}`);
  }

  unregisterSocket(client: Socket): void {
    const userId = client.data.userId as string | undefined;
    if (userId) {
      this.logger.debug(`Socket ${client.id} disconnected for user ${userId}`);
    }
  }

  joinThreadRoom(client: Socket, threadId: string): void {
    client.join(this.buildThreadRoom(threadId));
  }

  leaveThreadRoom(client: Socket, threadId: string): void {
    client.leave(this.buildThreadRoom(threadId));
  }

  emitThreadCreated(thread: Thread, firstPost: Post): void {
    if (!this.server) {
      return;
    }
    this.server.emit('thread.created', {
      thread: ThreadSchema.fromModel(thread),
      firstPost: PostSchema.fromModel(firstPost),
    });
  }

  emitPostCreated(threadId: string, post: Post): void {
    if (!this.server) {
      return;
    }
    this.server
      .to(this.buildThreadRoom(threadId))
      .emit('post.created', { post: PostSchema.fromModel(post) });
    this.server.emit('post.created.global', {
      threadId,
      post: PostSchema.fromModel(post),
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

  private buildUserRoom(userId: string): string {
    return `user:${userId}`;
  }

  private buildThreadRoom(threadId: string): string {
    return `thread:${threadId}`;
  }
}

