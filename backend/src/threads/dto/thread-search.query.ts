import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MaxLength,
} from 'class-validator';

export class ThreadSearchQueryDto {
  @ApiPropertyOptional({
    description: 'Keyword to match in thread title or first post body.',
    example: 'nestjs redis',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({
    description: 'Filter threads containing a specific tag.',
    example: 'redis',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tag?: string;

  @ApiPropertyOptional({
    description: 'Filter by thread status.',
    enum: ['open', 'locked', 'archived'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['open', 'locked', 'archived'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Page number (default 1).',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => {
    const numeric = Number.parseInt(String(value ?? ''), 10);
    return Number.isFinite(numeric) && numeric >= 1 ? numeric : 1;
  })
  page = 1;

  @ApiPropertyOptional({
    description: 'Results per page (default 20, max 50).',
    minimum: 1,
    maximum: 50,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => {
    const numeric = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isFinite(numeric) || numeric < 1) {
      return 20;
    }
    return Math.min(numeric, 50);
  })
  limit = 20;
}
