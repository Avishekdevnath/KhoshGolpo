import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, Max } from 'class-validator';

export class PublicUserDetailQueryDto {
  @ApiPropertyOptional({
    description: 'Limit number of recent threads to include (max 20).',
    example: 5,
    default: 5,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(20)
  threadsLimit?: number;
}
