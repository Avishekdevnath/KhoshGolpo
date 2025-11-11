import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UserSearchQueryDto {
  @ApiPropertyOptional({
    description: 'Text to match against user handle or display name.',
    example: 'jan',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  query!: string;

  @ApiPropertyOptional({
    description: 'Limit number of returned suggestions (max 20).',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(20)
  limit?: number;
}
