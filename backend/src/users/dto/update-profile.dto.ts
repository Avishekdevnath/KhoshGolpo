import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const HANDLE_REGEX = /^[a-z0-9_.-]{3,20}$/i;

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Display name shown publicly.',
    maxLength: 80,
    example: 'Jane Developer',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  displayName?: string;

  @ApiPropertyOptional({
    description:
      'Unique handle used for mentions (3-20 chars, letters/numbers/_/./-).',
    minLength: 3,
    maxLength: 20,
    example: 'jane.dev',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @Matches(HANDLE_REGEX, {
    message:
      'Handle must be 3-20 characters using letters, numbers, underscores, dots or dashes',
  })
  handle?: string;
}

