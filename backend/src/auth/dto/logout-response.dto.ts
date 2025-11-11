import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({
    description:
      'Indicates whether the logout operation completed successfully.',
    example: true,
  })
  success!: boolean;
}
