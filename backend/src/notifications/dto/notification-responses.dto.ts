import { ApiProperty } from '@nestjs/swagger';
import { NotificationSchema } from '../schemas/notification.schema';
import { PaginationMetaDto } from '../../threads/dto/thread-responses.dto';

export class NotificationListResponseDto {
  @ApiProperty({ type: () => [NotificationSchema] })
  data!: NotificationSchema[];

  @ApiProperty({ type: () => PaginationMetaDto })
  pagination!: PaginationMetaDto;
}

