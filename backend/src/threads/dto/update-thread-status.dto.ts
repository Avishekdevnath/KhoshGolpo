import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import type { ThreadStatus } from '@prisma/client/index';

const THREAD_STATUS_VALUES: ThreadStatus[] = ['open', 'locked', 'archived'];

export class UpdateThreadStatusDto {
  @ApiProperty({
    enum: THREAD_STATUS_VALUES,
    example: 'locked',
    description: 'New status to apply to the thread.',
  })
  @IsEnum(THREAD_STATUS_VALUES, {
    message: `Status must be one of: ${THREAD_STATUS_VALUES.join(', ')}`,
  })
  status!: ThreadStatus;
}
