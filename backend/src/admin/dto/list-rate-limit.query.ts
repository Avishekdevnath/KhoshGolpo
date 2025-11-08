import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, Min } from 'class-validator';

export class ListRateLimitQueryDto {
  @Transform(({ value }) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return 60;
    }
    return Math.min(parsed, 1440);
  })
  @IsNumber()
  @Min(1)
  windowMinutes = 60;

  @Transform(({ value }) => (value ? String(value).trim().toLowerCase() : 'endpoint'))
  @IsIn(['endpoint', 'ip', 'user'])
  groupBy: 'endpoint' | 'ip' | 'user' = 'endpoint';

  @Transform(({ value }) => (value ? String(value).trim() : undefined))
  @IsOptional()
  filter?: string;
}

