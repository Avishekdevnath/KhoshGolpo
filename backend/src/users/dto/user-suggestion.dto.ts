import { ApiProperty } from '@nestjs/swagger';

export class UserSuggestionDto {
  @ApiProperty({
    description: 'Unique identifier of the user.',
    example: '64f1c0c2d4f1b4f1c0c2d4f1',
  })
  id!: string;

  @ApiProperty({
    description: 'Handle used for mentions.',
    example: 'jane.dev',
  })
  handle!: string;

  @ApiProperty({
    description: 'Display name of the user.',
    example: 'Jane Developer',
  })
  displayName!: string;

  @ApiProperty({
    description: 'Optional avatar URL for the user.',
    example: 'https://cdn.example.com/avatars/jane.png',
    nullable: true,
  })
  avatarUrl?: string | null;
}
