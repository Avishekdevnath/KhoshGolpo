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

export class ListUsersQueryDto {
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
  query?: string;

  @Transform(({ value }) => {
    if (!value) {
      return [];
    }
    const values = Array.isArray(value) ? value : String(value).split(',');
    return values
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length > 0);
  })
  @IsArray()
  @IsIn(ROLE_OPTIONS, { each: true })
  @IsOptional()
  roles: RoleValue[] = [];

  @Transform(({ value }) => {
    if (!value) {
      return [];
    }
    const values = Array.isArray(value) ? value : String(value).split(',');
    return values
      .map((item) => item.trim().toLowerCase())
      .filter((item) => item.length > 0);
  })
  @IsArray()
  @IsIn(STATUS_OPTIONS, { each: true })
  @IsOptional()
  status: StatusValue[] = [];

  @Transform(({ value }) => (value ? String(value).trim().toLowerCase() : 'latest'))
  @IsIn(['latest', 'activity', 'threads', 'posts'])
  sortBy: 'latest' | 'activity' | 'threads' | 'posts' = 'latest';
}

