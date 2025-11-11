import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsPositive } from 'class-validator';

export class ListNotificationsQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-indexed).',
    default: 1,
    minimum: 1,
  })
  @Transform(({ value }) => {
    const numeric = Number.parseInt(String(value ?? ''), 10);
    return Number.isFinite(numeric) && numeric > 0 ? numeric : 1;
  })
  @IsPositive()
  page = 1;

  @ApiPropertyOptional({
    description: 'Page size (max 100).',
    default: 20,
    minimum: 1,
  })
  @Transform(({ value }) => {
    const numeric = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return 20;
    }
    return Math.min(numeric, 100);
  })
  @IsPositive()
  limit = 20;

  @ApiPropertyOptional({
    description: 'Only return unread notifications when true.',
    default: false,
  })
  @Transform(({ value }) => {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(normalized)) {
        return true;
      }
      if (['false', '0', 'no', 'off', ''].includes(normalized)) {
        return false;
      }
    }
    return undefined;
  })
  @IsOptional()
  @IsBoolean()
  unreadOnly?: boolean;
}
