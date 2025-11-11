import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ThreadsService } from './threads.service';
import { ThreadSchema } from './schemas/thread.schema';
import { ThreadListResponseDto } from './dto/thread-responses.dto';
import { ListUserThreadsQueryDto } from './dto/list-user-threads.query';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  type ActiveUser,
} from '../common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
export class UserThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Get('me/threads')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'List threads authored by the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Threads retrieved successfully.',
    type: ThreadListResponseDto,
  })
  async listMyThreads(
    @CurrentUser() user: ActiveUser,
    @Query() query: ListUserThreadsQueryDto,
  ) {
    const result = await this.threadsService.listThreadsByAuthor(
      user.userId,
      query,
    );

    return {
      data: result.data.map((thread) => ThreadSchema.fromModel(thread)),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
      },
    };
  }

  @Get(':userId/threads')
  @ApiOperation({
    summary: 'List threads authored by a specific user.',
  })
  @ApiOkResponse({
    description: 'Threads retrieved successfully.',
    type: ThreadListResponseDto,
  })
  async listUserThreads(
    @Param('userId') userId: string,
    @Query() query: ListUserThreadsQueryDto,
  ) {
    const result = await this.threadsService.listThreadsByAuthor(userId, query);

    return {
      data: result.data.map((thread) => ThreadSchema.fromModel(thread)),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
      },
    };
  }
}
