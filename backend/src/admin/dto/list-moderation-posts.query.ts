import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsPositive } from 'class-validator';

const DEFAULT_STATES = ['pending', 'flagged'] as const;
type ModerationStateValue = (typeof DEFAULT_STATES)[number] | 'approved' | 'rejected';

export class ListModerationPostsQueryDto {
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

  @Transform(({ value }) => {
    if (!value) {
      return DEFAULT_STATES;
    }
    const values = Array.isArray(value) ? value : String(value).split(',');
    return values
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length > 0);
  })
  @IsArray()
  @IsIn(['pending', 'flagged', 'approved', 'rejected'], { each: true })
  @IsOptional()
  state: ModerationStateValue[] = [...DEFAULT_STATES];
}

