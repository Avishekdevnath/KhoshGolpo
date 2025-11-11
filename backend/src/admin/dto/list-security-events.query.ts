import { Transform } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

const SEVERITY_OPTIONS = ['info', 'warning', 'critical'] as const;
const STATUS_OPTIONS = ['open', 'escalated', 'resolved'] as const;

export class ListSecurityEventsQueryDto {
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
    if (value === undefined || value === null) {
      return undefined;
    }
    const normalized = String(value).trim().toLowerCase();
    return normalized.length > 0 ? normalized : undefined;
  })
  @IsString()
  @IsOptional()
  type?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const normalized = String(value).trim().toLowerCase();
    return SEVERITY_OPTIONS.includes(
      normalized as (typeof SEVERITY_OPTIONS)[number],
    )
      ? (normalized as (typeof SEVERITY_OPTIONS)[number])
      : undefined;
  })
  @IsIn(SEVERITY_OPTIONS, {
    message: `Severity must be one of: ${SEVERITY_OPTIONS.join(', ')}`,
  })
  @IsOptional()
  severity?: (typeof SEVERITY_OPTIONS)[number];

  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const normalized = String(value).trim().toLowerCase();
    return STATUS_OPTIONS.includes(
      normalized as (typeof STATUS_OPTIONS)[number],
    )
      ? (normalized as (typeof STATUS_OPTIONS)[number])
      : undefined;
  })
  @IsIn(STATUS_OPTIONS, {
    message: `Status must be one of: ${STATUS_OPTIONS.join(', ')}`,
  })
  @IsOptional()
  status?: (typeof STATUS_OPTIONS)[number];

  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  @IsString()
  @IsOptional()
  ip?: string;

  @Transform(({ value }) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const trimmed = String(value).trim();
    return trimmed.length > 0 ? trimmed : undefined;
  })
  @IsString()
  @IsOptional()
  endpoint?: string;

  @Transform(({ value }) => {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  })
  @IsDate()
  @IsOptional()
  start?: Date;

  @Transform(({ value }) => {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }
    return undefined;
  })
  @IsDate()
  @IsOptional()
  end?: Date;
}
