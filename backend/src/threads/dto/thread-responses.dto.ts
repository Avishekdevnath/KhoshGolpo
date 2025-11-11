import { ApiProperty } from '@nestjs/swagger';
import { ThreadSchema } from '../schemas/thread.schema';
import { PostSchema } from '../../posts/schemas/post.schema';

type ReactionType = 'upvote' | 'downvote';

export class PaginationMetaDto {
  @ApiProperty({ example: 1, minimum: 1 })
  page!: number;

  @ApiProperty({ example: 20, minimum: 1 })
  limit!: number;

  @ApiProperty({ example: 42, minimum: 0 })
  total!: number;
}

export class ThreadListResponseDto {
  @ApiProperty({ type: () => [ThreadSchema] })
  data!: ThreadSchema[];

  @ApiProperty({ type: () => PaginationMetaDto })
  pagination!: PaginationMetaDto;
}

export class ThreadDetailResponseDto {
  @ApiProperty({ type: () => ThreadSchema })
  thread!: ThreadSchema;

  @ApiProperty({ type: () => [PostSchema] })
  posts!: PostSchema[];

  @ApiProperty({ type: () => PaginationMetaDto })
  pagination!: PaginationMetaDto;
}

export class CreateThreadResponseDto {
  @ApiProperty({ type: () => ThreadSchema })
  thread!: ThreadSchema;

  @ApiProperty({ type: () => PostSchema })
  firstPost!: PostSchema;
}

export class CreatePostResponseDto {
  @ApiProperty({ type: () => PostSchema })
  post!: PostSchema;
}

export class UpdatePostResponseDto {
  @ApiProperty({ type: () => PostSchema })
  post!: PostSchema;
}

export class ReactPostResponseDto {
  @ApiProperty({ type: () => PostSchema })
  post!: PostSchema;

  @ApiProperty({ enum: ['upvote', 'downvote'], nullable: true })
  reaction!: ReactionType | null;
}
