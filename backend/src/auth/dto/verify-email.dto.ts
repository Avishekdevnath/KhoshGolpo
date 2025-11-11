import { ApiProperty } from '@nestjs/swagger';
import { IsHexadecimal, IsString, IsUUID, Length } from 'class-validator';

export class VerifyEmailQueryDto {
  @ApiProperty({
    description: 'Identifier for the email verification token.',
    example: '6f8f5f92-0a2a-4b96-8ace-b93a9960c9b9',
  })
  @IsString()
  @IsUUID()
  tokenId!: string;

  @ApiProperty({
    description:
      'The raw email verification token sent to the user via email (hex string).',
    example: '2f3aef49dba6a8ed0ffb1f97cf8f0f9a3d9667bc1f9a8b2c3d4e5f6a7b8c9d0e',
  })
  @IsString()
  @IsHexadecimal()
  @Length(64, 128)
  token!: string;
}
