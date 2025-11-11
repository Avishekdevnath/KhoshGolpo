import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListThreadsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => {
    const numeric = Number.parseInt(String(value ?? ''), 10);
    return Number.isFinite(numeric) && numeric >= 1 ? numeric : 1;
  })
  page = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => {
    const numeric = Number.parseInt(String(value ?? ''), 10);
    if (!Number.isFinite(numeric) || numeric < 1) {
      return 20;
    }
    return Math.min(numeric, 50);
  })
  limit = 20;

  @IsOptional()
  @IsIn(['open', 'locked', 'archived'])
  status?: string;
}
