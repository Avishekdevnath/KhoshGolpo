import { ApiProperty } from '@nestjs/swagger';
import { ThreadStatus } from '@prisma/client/index';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsString } from 'class-validator';

export class UserThreadListItemDto {
  @ApiProperty({
    description: 'Unique identifier of the thread.',
    example: 't1',
  })
  @IsString()
  id!: string;

  @ApiProperty({
    description: 'Displayed title of the thread.',
    example: 'My first thread',
  })
  @IsString()
  title!: string;

  @ApiProperty({
    description: 'URL-friendly slug for the thread.',
    example: 'my-first-thread',
  })
  @IsString()
  slug!: string;

  @ApiProperty({
    description: 'Current publication status of the thread.',
    enum: ThreadStatus,
    example: ThreadStatus.open,
  })
  @IsEnum(ThreadStatus)
  status!: ThreadStatus;

  @ApiProperty({
    description: 'Timestamp of the most recent activity within the thread.',
    example: '2025-01-03T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  lastActivityAt!: Date;

  @ApiProperty({
    description: 'Total number of posts within the thread.',
    example: 3,
  })
  @IsNumber()
  postsCount!: number;

  @ApiProperty({
    description: 'Date when the thread was created.',
    example: '2025-01-01T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  createdAt!: Date;
}
