import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    example: true,
    description:
      'Indicates whether the user must verify their email address before logging in.',
  })
  emailVerificationRequired!: boolean;

  @ApiProperty({
    example:
      'Account created successfully. Please check your inbox to verify your email address.',
  })
  message!: string;
}

