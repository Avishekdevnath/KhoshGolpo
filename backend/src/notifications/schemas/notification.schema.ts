import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';
import type { Prisma } from '@prisma/client';

type NotificationLike = {
  id: string;
  event: string;
  payload: Prisma.JsonValue | null;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class NotificationSchema {
  @ApiProperty({ example: '65f1c0c2d4f1b4f1c0c2d500' })
  @IsString()
  id!: string;

  @ApiProperty({ example: 'post.created' })
  @IsString()
  event!: string;

  @ApiProperty({
    example: {
      postId: '65f1c0c2d4f1b4f1c0c2d4f9',
      threadId: '65f1c0c2d4f1b4f1c0c2d4f1',
    },
  })
  payload!: Record<string, unknown>;

  @ApiProperty({ example: false })
  @IsBoolean()
  read!: boolean;

  @ApiProperty({
    required: false,
    nullable: true,
    type: String,
    example: '2025-01-05T08:35:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readAt?: Date | null;

  @ApiProperty({ example: '2025-01-05T08:30:00.000Z' })
  @Type(() => Date)
  @IsDate()
  createdAt!: Date;

  @ApiProperty({ example: '2025-01-05T08:30:00.000Z' })
  @Type(() => Date)
  @IsDate()
  updatedAt!: Date;

  static fromModel(notification: NotificationLike): NotificationSchema {
    const schema = new NotificationSchema();
    schema.id = notification.id;
    schema.event = notification.event;
    const payload =
      notification.payload && typeof notification.payload === 'object'
        ? (notification.payload as Record<string, unknown>)
        : {};
    schema.payload = payload;
    schema.read = notification.read;
    schema.readAt = notification.readAt ?? undefined;
    schema.createdAt = notification.createdAt;
    schema.updatedAt = notification.updatedAt;
    return schema;
  }
}

