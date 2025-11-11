import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const STATUS_OPTIONS = ['active', 'suspended', 'banned'] as const;

export class UpdateUserStatusDto {
  @ApiProperty({
    description: 'Target status for the user account.',
    enum: STATUS_OPTIONS,
    example: 'suspended',
  })
  @IsIn(STATUS_OPTIONS)
  status!: 'active' | 'suspended' | 'banned';

  @ApiProperty({
    description: 'Optional reason for suspending/banning the account.',
    maxLength: 500,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
