import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
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

  @ApiPropertyOptional({
    description: 'Filter by user status (active, suspended, banned).',
    example: 'active',
  })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'suspended', 'banned'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by role (e.g., member, admin).',
    example: 'member',
  })
  @IsOptional()
  @IsString()
  role?: string;
}
