import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import type { ModerationState } from '@prisma/client';

const MODERATION_STATES: ModerationState[] = [
  'pending',
  'approved',
  'flagged',
  'rejected',
];

export class ModeratePostDto {
  @ApiProperty({
    enum: MODERATION_STATES,
    example: 'approved',
    description: 'Target moderation state for the post.',
  })
  @IsEnum(MODERATION_STATES, {
    message: `Moderation state must be one of: ${MODERATION_STATES.join(', ')}`,
  })
  moderationState!: ModerationState;

  @ApiPropertyOptional({
    description: 'Optional moderation feedback or reason message.',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  moderationFeedback?: string | null;

  @ApiPropertyOptional({
    description:
      'If true and moderation state is not approved, the parent thread will be locked.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  lockThread?: boolean;
}

