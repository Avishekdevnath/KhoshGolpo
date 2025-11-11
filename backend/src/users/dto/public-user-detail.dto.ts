import { ApiProperty } from '@nestjs/swagger';
import { PublicUserSummaryDto } from './public-user-summary.dto';
import { UserThreadListItemDto } from './user-thread-list-item.dto';

export class PublicUserDetailDto {
  @ApiProperty({
    description: 'Public profile information for the user.',
    type: (): typeof PublicUserSummaryDto => PublicUserSummaryDto,
  })
  user!: PublicUserSummaryDto;

  @ApiProperty({
    description: 'Recently active threads authored by the user.',
    type: (): typeof UserThreadListItemDto => UserThreadListItemDto,
    isArray: true,
  })
  threads!: UserThreadListItemDto[];
}
