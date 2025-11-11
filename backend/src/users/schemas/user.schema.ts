import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { User } from '@prisma/client/index';

type UserStatusValue = 'active' | 'suspended' | 'banned';

export class UserSchema {
  @ApiProperty({ example: '65f1c0c2d4f1b4f1c0c2d4f1' })
  @IsString()
  id!: string;

  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'janedoe' })
  @IsString()
  handle!: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  displayName!: string;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'https://cdn.example.com/avatars/jane.png',
  })
  @IsOptional()
  @IsString()
  avatarUrl?: string | null;

  @ApiProperty({ type: [String], example: ['member'] })
  @IsArray()
  @IsString({ each: true })
  roles!: string[];

  @ApiProperty({ enum: ['active', 'suspended', 'banned'], example: 'active' })
  @IsIn(['active', 'suspended', 'banned'])
  status!: UserStatusValue;

  @ApiProperty({
    required: false,
    nullable: true,
    type: String,
    example: '2025-01-06T09:30:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  bannedAt?: Date | null;

  @ApiProperty({
    required: false,
    nullable: true,
    example: 'Repeated violation of community guidelines.',
  })
  @IsOptional()
  @IsString()
  bannedReason?: string | null;

  @ApiProperty({
    required: false,
    type: String,
    example: '2025-01-04T12:34:56.000Z',
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastActiveAt?: Date | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: String,
    example: '2025-01-07T10:15:00.000Z',
    description: 'Timestamp when the email address was verified.',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  emailVerifiedAt?: Date | null;

  @ApiProperty({ example: 3 })
  @IsNumber()
  threadsCount!: number;

  @ApiProperty({ example: 12 })
  @IsNumber()
  postsCount!: number;

  @ApiProperty({ example: '2025-01-01T08:00:00.000Z' })
  @Type(() => Date)
  @IsDate()
  createdAt!: Date;

  @ApiProperty({ example: '2025-01-02T09:30:00.000Z' })
  @Type(() => Date)
  @IsDate()
  updatedAt!: Date;

  static fromModel(user: User): UserSchema {
    const extendedUser = user as User & {
      status?: UserStatusValue;
      bannedAt?: Date | null;
      bannedReason?: string | null;
    };
    const schema = new UserSchema();
    schema.id = user.id;
    schema.email = user.email;
    schema.handle = user.handle;
    schema.displayName = user.displayName;
    schema.avatarUrl = user.avatarUrl ?? null;
    schema.roles = user.roles ?? [];
    schema.status = extendedUser.status ?? 'active';
    schema.bannedAt = extendedUser.bannedAt ?? undefined;
    schema.bannedReason = extendedUser.bannedReason ?? undefined;
    schema.lastActiveAt = user.lastActiveAt ?? undefined;
    schema.emailVerifiedAt =
      (user as User & { emailVerifiedAt?: Date | null }).emailVerifiedAt ??
      undefined;
    schema.threadsCount = user.threadsCount ?? 0;
    schema.postsCount = user.postsCount ?? 0;
    schema.createdAt = user.createdAt;
    schema.updatedAt = user.updatedAt;
    return schema;
  }
}
