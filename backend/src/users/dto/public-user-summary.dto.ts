import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, MaxLength } from 'class-validator';

export class PublicUserSummaryDto {
  @ApiProperty({
    description: 'Unique identifier of the user.',
    example: '65f1c0c2d4f1b4f1c0c2d4f1',
  })
  @IsString()
  id!: string;

  @ApiProperty({
    description: 'Public handle for the user.',
    example: 'jane.dev',
  })
  @IsString()
  handle!: string;

  @ApiProperty({
    description: 'Display name presented in the UI.',
    example: 'Jane Developer',
  })
  @IsString()
  @MaxLength(120)
  displayName!: string;

  @ApiProperty({
    description: 'Optional avatar URL for the user.',
    example: 'https://cdn.example.com/avatars/jane.png',
    nullable: true,
    required: false,
  })
  @IsOptional()
  avatarUrl?: string | null;

  @ApiProperty({
    description: 'Total threads created by the user.',
    example: 12,
  })
  threadsCount!: number;

  @ApiProperty({
    description: 'Total posts created by the user.',
    example: 48,
  })
  postsCount!: number;

  @ApiProperty({
    description: 'When the user joined the platform.',
    example: '2025-01-01T08:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  createdAt!: Date;

  @ApiProperty({
    description: 'When the user was last active (if available).',
    example: '2025-01-05T13:24:11.000Z',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastActiveAt?: Date | null;

  static fromUser<
    T extends {
      id: string;
      handle: string;
      displayName: string;
      avatarUrl?: string | null;
      threadsCount?: number | null;
      postsCount?: number | null;
      createdAt: Date;
      lastActiveAt?: Date | null;
    },
  >(user: T): PublicUserSummaryDto {
    const dto = new PublicUserSummaryDto();
    dto.id = user.id;
    dto.handle = user.handle;
    dto.displayName = user.displayName;
    dto.avatarUrl = user.avatarUrl ?? null;
    dto.threadsCount = user.threadsCount ?? 0;
    dto.postsCount = user.postsCount ?? 0;
    dto.createdAt = user.createdAt;
    dto.lastActiveAt = user.lastActiveAt ?? null;
    return dto;
  }
}
