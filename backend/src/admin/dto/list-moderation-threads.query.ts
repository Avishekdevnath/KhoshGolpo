import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsPositive, IsString } from 'class-validator';

const THREAD_STATUSES = ['open', 'locked', 'archived'] as const;
type ThreadStatusValue = (typeof THREAD_STATUSES)[number];

export class ListModerationThreadsQueryDto {
  @Transform(({ value }) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  })
  @IsPositive()
  page = 1;

  @Transform(({ value }) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return 25;
    return Math.min(parsed, 100);
  })
  @IsPositive()
  limit = 25;

  @Transform(({ value }) => (value ? String(value).toLowerCase() : undefined))
  @IsIn(THREAD_STATUSES, { message: `Status must be one of: ${THREAD_STATUSES.join(', ')}` })
  @IsOptional()
  status?: ThreadStatusValue;

  @Transform(({ value }) => (value ? String(value).trim() : undefined))
  @IsString()
  @IsOptional()
  search?: string;
}

