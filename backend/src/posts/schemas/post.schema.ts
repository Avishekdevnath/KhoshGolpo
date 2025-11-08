import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsIn,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { Post, ModerationState } from '@prisma/client';

const MODERATION_STATES: ModerationState[] = [
  'pending',
  'approved',
  'flagged',
  'rejected',
];

export class PostSchema {
  @ApiProperty({ example: '65f1c0c2d4f1b4f1c0c2d4f9' })
  @IsString()
  id!: string;

  @ApiProperty({ example: '65f1c0c2d4f1b4f1c0c2d4f1' })
  @IsString()
  threadId!: string;

  @ApiProperty({ example: '65efe051b1a338de7f458ad4' })
  @IsString()
  authorId!: string;

  @ApiProperty({
    example: 'You can use BullMQ with NestJS by registering queues in a module.',
  })
  @IsString()
  body!: string;

  @ApiProperty({ type: [String], example: ['65efe051b1a338de7f458ad4'] })
  @IsArray()
  @IsString({ each: true })
  mentions!: string[];

  @ApiProperty({
    required: false,
    nullable: true,
    example: '65efe051b1a338de7f458ad5',
  })
  @IsOptional()
  @IsString()
  parentPostId?: string | null;

  @ApiProperty({ enum: MODERATION_STATES, example: 'approved' })
  @IsIn(MODERATION_STATES)
  moderationState!: ModerationState;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'Flagged due to abusive language.',
  })
  @IsOptional()
  @IsString()
  moderationFeedback?: string | null;

  @ApiProperty({ example: '2025-01-04T12:35:00.000Z' })
  @Type(() => Date)
  @IsDate()
  createdAt!: Date;

  @ApiProperty({ example: '2025-01-04T12:35:00.000Z' })
  @Type(() => Date)
  @IsDate()
  updatedAt!: Date;

  static fromModel(post: Post): PostSchema {
    const schema = new PostSchema();
    schema.id = post.id;
    schema.threadId = post.threadId;
    schema.authorId = post.authorId;
    schema.body = post.body;
    schema.mentions = post.mentions ?? [];
    schema.parentPostId = post.parentPostId ?? undefined;
    schema.moderationState = post.moderationState;
    schema.moderationFeedback = post.moderationFeedback ?? undefined;
    schema.createdAt = post.createdAt;
    schema.updatedAt = post.updatedAt;
    return schema;
  }
}