import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { Thread, ThreadStatus } from '@prisma/client/index';

const THREAD_STATUS_VALUES: ThreadStatus[] = ['open', 'locked', 'archived'];

export class ThreadSchema {
  @ApiProperty({ example: '65f1c0c2d4f1b4f1c0c2d4f1' })
  @IsString()
  id!: string;

  @ApiProperty({ example: 'How to integrate BullMQ with NestJS?' })
  @IsString()
  title!: string;

  @ApiProperty({ example: 'integrate-bullmq-with-nestjs' })
  @IsString()
  slug!: string;

  @ApiProperty({ example: '65efe051b1a338de7f458ad4' })
  @IsString()
  authorId!: string;

  @ApiProperty({ type: [String], example: ['nestjs', 'queues'] })
  @IsArray()
  @IsString({ each: true })
  tags!: string[];

  @ApiProperty({ enum: THREAD_STATUS_VALUES, example: 'open' })
  @IsIn(THREAD_STATUS_VALUES)
  status!: ThreadStatus;

  @ApiProperty({ example: '2025-01-04T12:34:56.000Z' })
  @Type(() => Date)
  @IsDate()
  lastActivityAt!: Date;

  @ApiProperty({ example: 12 })
  @IsNumber()
  postsCount!: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  participantsCount!: number;

  @ApiProperty({ type: [String], example: ['65efe051b1a338de7f458ad4'] })
  @IsArray()
  @IsString({ each: true })
  participantIds!: string[];

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'This thread explains how to use BullMQ in NestJS.',
  })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({
    required: false,
    nullable: true,
    example: '2025-01-05T08:00:00.000Z',
    type: String,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  summaryGeneratedAt?: Date | null;

  @ApiProperty({ example: '2025-01-01T08:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  createdAt!: Date;

  @ApiProperty({ example: '2025-01-03T14:20:00.000Z' })
  @Type(() => Date)
  @IsDate()
  updatedAt!: Date;

  static fromModel(thread: Thread): ThreadSchema {
    const schema = new ThreadSchema();
    schema.id = thread.id;
    schema.title = thread.title;
    schema.slug = thread.slug;
    schema.authorId = thread.authorId;
    schema.tags = thread.tags ?? [];
    schema.status = thread.status;
    schema.lastActivityAt = thread.lastActivityAt;
    schema.postsCount = thread.postsCount ?? 0;
    schema.participantsCount = thread.participantsCount ?? 0;
    schema.participantIds = thread.participantIds ?? [];
    schema.summary = thread.summary ?? undefined;
    schema.summaryGeneratedAt = thread.summaryGeneratedAt ?? undefined;
    schema.createdAt = thread.createdAt;
    schema.updatedAt = thread.updatedAt;
    return schema;
  }
}
