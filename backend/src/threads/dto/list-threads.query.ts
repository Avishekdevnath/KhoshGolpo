import { Transform } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListThreadsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number.parseInt(value, 10))
  page = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @Transform(({ value }) => Number.parseInt(value, 10))
  limit = 20;

  @IsOptional()
  @IsIn(['open', 'locked', 'archived'])
  status?: string;
}
