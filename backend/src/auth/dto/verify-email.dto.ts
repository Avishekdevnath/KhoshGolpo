import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Identifier for the email verification OTP entry.',
    example: '6f8f5f92-0a2a-4b96-8ace-b93a9960c9b9',
  })
  @IsString()
  @IsUUID()
  tokenId!: string;

  @ApiProperty({
    description: 'One-time passcode sent to the user via email.',
    example: '483921',
  })
  @IsString()
  @MinLength(4)
  @MaxLength(8)
  @Matches(/^\d+$/, { message: 'OTP must consist of digits only.' })
  otp!: string;
}
