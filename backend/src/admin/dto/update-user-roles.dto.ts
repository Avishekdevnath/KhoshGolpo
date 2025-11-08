import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsIn } from 'class-validator';

const ROLE_OPTIONS = ['member', 'moderator', 'admin'] as const;

export class UpdateUserRolesDto {
  @ApiProperty({
    description: 'Complete set of roles to assign to the user.',
    enum: ROLE_OPTIONS,
    isArray: true,
    example: ['member', 'moderator'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsIn(ROLE_OPTIONS, { each: true })
  roles!: string[];
}

