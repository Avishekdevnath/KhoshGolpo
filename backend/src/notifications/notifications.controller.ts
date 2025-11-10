import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, type ActiveUser } from '../common/decorators/current-user.decorator';
import { ListNotificationsQueryDto } from './dto/list-notifications.query';
import { NotificationSchema } from './schemas/notification.schema';
import { NotificationListResponseDto } from './dto/notification-responses.dto';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for the current user.' })
  @ApiOkResponse({
    description: 'Paginated notifications.',
    type: NotificationListResponseDto,
  })
  async listUserNotifications(
    @CurrentUser() user: ActiveUser,
    @Query() query: ListNotificationsQueryDto,
  ): Promise<NotificationListResponseDto> {
    const result = await this.notificationsService.listUserNotifications(
      user.userId,
      query,
    );
    return {
      data: result.data.map(NotificationSchema.fromModel),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
      },
    };
  }
  // test
  @Patch(':notificationId/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a notification as read.' })
  @ApiOkResponse({
    description: 'Notification marked as read.',
    type: NotificationSchema,
  })
  async markNotificationAsRead(
    @CurrentUser() user: ActiveUser,
    @Param('notificationId') notificationId: string,
  ): Promise<NotificationSchema> {
    const notification = await this.notificationsService.markAsRead(
      user.userId,
      notificationId,
    );
    return NotificationSchema.fromModel(notification);
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read.' })
  @ApiOkResponse({
    description: 'Count of notifications updated.',
    schema: {
      properties: {
        updatedCount: { type: 'number', example: 5 },
      },
    },
  })
  async markAllAsRead(@CurrentUser() user: ActiveUser) {
    const updatedCount = await this.notificationsService.markAllAsRead(
      user.userId,
    );
    return { updatedCount };
  }
}

