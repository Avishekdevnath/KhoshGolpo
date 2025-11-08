import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import {
  NOTIFICATION_CONFIG_KEYS,
  NOTIFICATION_DEFAULTS,
} from './notifications.constants';
import {
  NotificationRecord,
  RealtimeService,
} from '../realtime/realtime.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly queueService: QueueService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  async enqueue(
    event: string,
    payload: Record<string, unknown>,
    recipientIds: string[] = [],
  ): Promise<void> {
    let createdNotifications: NotificationRecord[] = [];
    if (recipientIds.length > 0) {
      createdNotifications = await this.recordInAppNotifications(
        recipientIds,
        event,
        payload,
      );
      this.realtime.emitNotifications(createdNotifications);
    }

    const webhookUrl = this.getWebhookUrl();
    if (!webhookUrl) {
      this.logger.warn(
        `Notification for event "${event}" skipped because NOTIFICATION_WEBHOOK_URL is not set.`,
      );
      return;
    }

    const retryLimit = this.getRetryLimit();

    await this.queueService.enqueueNotificationJob(
      {
        event,
        payload,
        webhookUrl,
        retryLimit,
        recipientIds,
      },
      {
        attempts: retryLimit,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      },
    );
  }

  async recordInAppNotifications(
    recipientIds: string[],
    event: string,
    payload: Record<string, unknown>,
  ): Promise<NotificationRecord[]> {
    if (!recipientIds.length) {
      return [];
    }

    const notifications = await Promise.all(
      recipientIds.map((userId) =>
        (this.prisma as any).notification.create({
          data: {
            userId,
            event,
            payload: payload as Prisma.InputJsonValue,
          },
        }),
      ),
    );

    return notifications as NotificationRecord[];
  }

  async listUserNotifications(
    userId: string,
    params: { page: number; limit: number; unreadOnly?: boolean },
  ): Promise<{
    data: NotificationRecord[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (params.page - 1) * params.limit;
    const where: { userId: string; read?: boolean } = {
      userId,
    };
    if (params.unreadOnly) {
      where.read = false;
    }

    const prismaNotification = (this.prisma as any).notification;
    const items: NotificationRecord[] = await prismaNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: params.limit,
    });
    const total: number = await prismaNotification.count({ where });

    return {
      data: items,
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<NotificationRecord> {
    const prismaNotification = (this.prisma as any).notification;
    const notification: NotificationRecord | null =
      await prismaNotification.findUnique({
      where: { id: notificationId },
    });
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found.');
    }
    return prismaNotification.update({
      where: { id: notificationId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string): Promise<number> {
    const prismaNotification = (this.prisma as any).notification;
    const result = await prismaNotification.updateMany({
      where: { userId, read: false },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
    return result.count;
  }

  private getWebhookUrl(): string | undefined {
    const url = this.configService.get<string>(NOTIFICATION_CONFIG_KEYS.webhookUrl);
    const trimmed = url?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : undefined;
  }

  private getRetryLimit(): number {
    const value = this.configService.get<string | number>(
      NOTIFICATION_CONFIG_KEYS.retryLimit,
    );
    const parsed =
      typeof value === 'number' ? value : value ? Number.parseInt(value, 10) : undefined;
    return Number.isFinite(parsed) && parsed && parsed > 0
      ? Number(parsed)
      : NOTIFICATION_DEFAULTS.retryLimit;
  }
}

