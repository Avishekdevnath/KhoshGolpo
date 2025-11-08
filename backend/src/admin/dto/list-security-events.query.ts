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

  @Transform(({ value }) => (value ? String(value).trim().toLowerCase() : undefined))
  @IsString()
  @IsOptional()
  type?: string;

  @IsIn(SEVERITY_OPTIONS, { message: `Severity must be one of: ${SEVERITY_OPTIONS.join(', ')}` })
  @IsOptional()
  severity?: (typeof SEVERITY_OPTIONS)[number];

  @IsIn(STATUS_OPTIONS, { message: `Status must be one of: ${STATUS_OPTIONS.join(', ')}` })
  @IsOptional()
  status?: (typeof STATUS_OPTIONS)[number];

  @Transform(({ value }) => (value ? String(value).trim() : undefined))
  @IsString()
  @IsOptional()
  userId?: string;

  @Transform(({ value }) => (value ? String(value).trim() : undefined))
  @IsString()
  @IsOptional()
  ip?: string;

  @Transform(({ value }) => (value ? String(value).trim() : undefined))
  @IsString()
  @IsOptional()
  endpoint?: string;

  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsDate()
  @IsOptional()
  start?: Date;

  @Transform(({ value }) => (value ? new Date(value) : undefined))
  @IsDate()
  @IsOptional()
  end?: Date;
}

