import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  @IsString()
  @Matches(/^[a-z0-9_.-]{3,20}$/i, {
    message:
      'Handle must be 3-20 characters using letters, numbers, underscores, dots or dashes',
  })
  handle!: string;

  @IsString()
  @IsOptional()
  @MaxLength(80)
  displayName?: string;
}
