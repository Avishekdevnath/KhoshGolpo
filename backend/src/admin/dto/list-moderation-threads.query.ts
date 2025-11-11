import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsPositive, IsString } from 'class-validator';

const THREAD_STATUSES = ['open', 'locked', 'archived'] as const;
type ThreadStatusValue = (typeof THREAD_STATUSES)[number];

export class ListModerationThreadsQueryDto {
  @Transform(({ value }) => {
    const numeric = Number.parseInt(String(value ?? ''), 10);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
  })
  @IsPositive()
  page = 1;

  @Transform(({ value }) => {
    const numeric = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return 25;
    }
    return Math.min(numeric, 100);
  })
  @IsPositive()
  limit = 25;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return String(value).toLowerCase();
  })
  @IsIn(THREAD_STATUSES, {
    message: `Status must be one of: ${THREAD_STATUSES.join(', ')}`,
  })
  @IsOptional()
  status?: ThreadStatusValue;

  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  @IsString()
  @IsOptional()
  search?: string;
}
