import { Type } from 'class-transformer';
import { IsArray, IsDate, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { ModerationState } from '@prisma/client/index';

type PostRecord = {
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
};

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
    example:
      'You can use BullMQ with NestJS by registering queues in a module.',
  })
  @IsString()
  body!: string;

  @ApiProperty({ example: 5 })
  upvotesCount!: number;

  @ApiProperty({ example: 1 })
  downvotesCount!: number;

  @ApiProperty({ example: 2 })
  repliesCount!: number;

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

  static fromModel(post: Record<string, unknown>): PostSchema {
    const record = post as PostRecord;
    const schema = new PostSchema();
    schema.id = record.id;
    schema.threadId = record.threadId;
    schema.authorId = record.authorId;
    schema.body = record.body;
    schema.upvotesCount = record.upvotesCount ?? 0;
    schema.downvotesCount = record.downvotesCount ?? 0;
    schema.repliesCount = record.repliesCount ?? 0;
    schema.mentions = record.mentions ?? [];
    schema.parentPostId = record.parentPostId ?? undefined;
    schema.moderationState = record.moderationState;
    schema.moderationFeedback = record.moderationFeedback ?? undefined;
    schema.createdAt = record.createdAt;
    schema.updatedAt = record.updatedAt;
    return schema;
  }
}
