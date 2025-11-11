import { Transform } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, Min } from 'class-validator';

export class ListRateLimitQueryDto {
  @Transform(({ value }) => {
    const numeric = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return 60;
    }
    return Math.min(numeric, 1440);
  })
  @IsNumber()
  @Min(1)
  windowMinutes = 60;

  @Transform(({ value }) => {
    const normalized = String(value ?? 'endpoint')
      .trim()
      .toLowerCase();
    return normalized.length > 0 ? normalized : 'endpoint';
  })
  @IsIn(['endpoint', 'ip', 'user'])
  groupBy: 'endpoint' | 'ip' | 'user' = 'endpoint';

  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  @IsOptional()
  filter?: string;
}
