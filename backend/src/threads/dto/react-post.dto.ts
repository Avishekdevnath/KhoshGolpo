import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

const REACTION_TYPES = ['upvote', 'downvote'] as const;
type ReactionType = (typeof REACTION_TYPES)[number];

export class ReactPostDto {
  @ApiProperty({ enum: REACTION_TYPES, example: 'upvote' })
  @IsIn(REACTION_TYPES)
  type!: ReactionType;
}
