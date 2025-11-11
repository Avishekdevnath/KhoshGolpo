import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsPositive } from 'class-validator';

const DEFAULT_STATES = ['pending', 'flagged'] as const;
type ModerationStateValue =
  | (typeof DEFAULT_STATES)[number]
  | 'approved'
  | 'rejected';

const allowedModerationStates = new Set<ModerationStateValue>([
  ...DEFAULT_STATES,
  'approved',
  'rejected',
]);

const coerceString = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'bigint') {
    return value.toString();
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return '';
};

const normalizeListValues = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((item) => coerceString(item).trim())
      .filter((item): item is string => item.length > 0);
  }

  const coerced = coerceString(value).trim();
  if (!coerced) {
    return [];
  }

  return coerced
    .split(',')
    .map((item) => item.trim())
    .filter((item): item is string => item.length > 0);
};

export class ListModerationPostsQueryDto {
  @Transform(({ value }) => {
    const numeric = Number.parseInt(coerceString(value), 10);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
  })
  @IsPositive()
  page = 1;

  @Transform(({ value }) => {
    const numeric = Number.parseInt(coerceString(value), 10);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return 25;
    }
    return Math.min(numeric, 100);
  })
  @IsPositive()
  limit = 25;

  @Transform(({ value }) => {
    const rawValues = normalizeListValues(value);
    if (rawValues.length === 0) {
      return [...DEFAULT_STATES];
    }

    const normalized = rawValues
      .map((item) => item.toLowerCase() as ModerationStateValue)
      .filter((item) => allowedModerationStates.has(item));

    return normalized.length ? normalized : [...DEFAULT_STATES];
  })
  @IsArray()
  @IsIn(['pending', 'flagged', 'approved', 'rejected'], { each: true })
  @IsOptional()
  state: ModerationStateValue[] = [...DEFAULT_STATES];
}
