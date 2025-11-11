import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    example: true,
    description:
      'Indicates whether the user must verify their email address before logging in.',
  })
  emailVerificationRequired!: boolean;

  @ApiProperty({
    example: '6f8f5f92-0a2a-4b96-8ace-b93a9960c9b9',
    description:
      'Identifier to supply alongside the OTP when confirming verification.',
  })
  verificationTokenId!: string;

  @ApiProperty({
    example: '2025-01-01T12:00:00.000Z',
    description:
      'Timestamp (ISO 8601) indicating when the OTP expires and can no longer be used.',
  })
  verificationExpiresAt!: string;

  @ApiProperty({
    example:
      'Account created successfully. Enter the verification code sent to your email to activate your account.',
  })
  message!: string;
}
