import { Transform } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

const ROLE_OPTIONS = ['member', 'moderator', 'admin'] as const;
const STATUS_OPTIONS = ['active', 'suspended', 'banned'] as const;

type RoleValue = (typeof ROLE_OPTIONS)[number];
type StatusValue = (typeof STATUS_OPTIONS)[number];

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
      .map((item) => coerceString(item).trim().toLowerCase())
      .filter((item): item is string => item.length > 0);
  }

  const coerced = coerceString(value).trim().toLowerCase();
  if (!coerced) {
    return [];
  }

  return coerced
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter((item): item is string => item.length > 0);
};

const normalizeSearchQuery = (value: unknown): string | undefined => {
  const trimmed = coerceString(value).trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : undefined;
};

export class ListUsersQueryDto {
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

  @Transform(({ value }) => normalizeSearchQuery(value))
  @IsString()
  @IsOptional()
  query?: string;

  @Transform(({ value }) => {
    const rawValues = normalizeListValues(value);
    if (!rawValues.length) {
      return [];
    }
    const allowed = new Set<string>(ROLE_OPTIONS);
    return rawValues.filter(
      (item): item is RoleValue => Boolean(item) && allowed.has(item),
    );
  })
  @IsArray()
  @IsIn(ROLE_OPTIONS, { each: true })
  @IsOptional()
  roles: RoleValue[] = [];

  @Transform(({ value }) => {
    const rawValues = normalizeListValues(value);
    if (!rawValues.length) {
      return [];
    }
    const allowed = new Set<string>(STATUS_OPTIONS);
    return rawValues.filter(
      (item): item is StatusValue => Boolean(item) && allowed.has(item),
    );
  })
  @IsArray()
  @IsIn(STATUS_OPTIONS, { each: true })
  @IsOptional()
  status: StatusValue[] = [];

  @Transform(({ value }) => {
    const normalized = coerceString(
      value === undefined || value === null ? 'latest' : value,
    )
      .trim()
      .toLowerCase();
    return normalized.length > 0 ? normalized : 'latest';
  })
  @IsIn(['latest', 'activity', 'threads', 'posts'])
  sortBy: 'latest' | 'activity' | 'threads' | 'posts' = 'latest';
}
