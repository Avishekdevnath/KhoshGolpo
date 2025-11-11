import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const USER_STATUS_FILTERS = ['active', 'suspended', 'banned'] as const;

export class PublicUserListQueryDto {
  @ApiPropertyOptional({
    description: 'Search keyword matched against handle or display name.',
    example: 'jane',
    minLength: 1,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  query?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination (1-indexed).',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page (max 50).',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(50)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter by user role.',
    example: 'member',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  role?: string;

  @ApiPropertyOptional({
    description: 'Filter by user status.',
    example: 'active',
    enum: USER_STATUS_FILTERS,
  })
  @IsOptional()
  @IsString()
  @IsIn(USER_STATUS_FILTERS)
  status?: string;
}
