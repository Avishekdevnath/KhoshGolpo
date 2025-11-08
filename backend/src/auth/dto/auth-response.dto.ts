import { ApiProperty } from '@nestjs/swagger';
import { ProfileDto } from './profile.dto';

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token that authorizes subsequent API requests.',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'The authenticated user profile.',
    type: () => ProfileDto,
  })
  user!: ProfileDto;
}
