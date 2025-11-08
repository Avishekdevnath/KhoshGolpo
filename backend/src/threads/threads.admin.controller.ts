import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ThreadsService } from './threads.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateThreadStatusDto } from './dto/update-thread-status.dto';
import { ThreadSchema } from './schemas/thread.schema';
import { ModeratePostDto } from './dto/moderate-post.dto';
import { PostSchema } from '../posts/schemas/post.schema';

@ApiTags('Admin • Threads')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('access-token')
@Roles('admin', 'moderator')
export class ThreadsAdminController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Patch('threads/:threadId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update the moderation status of a thread.' })
  @ApiParam({
    name: 'threadId',
    description: 'Identifier of the thread to update.',
  })
  @ApiOkResponse({
    description: 'Thread status updated successfully.',
    type: ThreadSchema,
  })
  async updateThreadStatus(
    @Param('threadId') threadId: string,
    @Body() dto: UpdateThreadStatusDto,
  ): Promise<ThreadSchema> {
    const thread = await this.threadsService.updateThreadStatus(
      threadId,
      dto.status,
    );
    return ThreadSchema.fromModel(thread);
  }

  @Patch('posts/:postId/moderation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Moderate a post and optionally lock its thread.' })
  @ApiParam({
    name: 'postId',
    description: 'Identifier of the post to moderate.',
  })
  @ApiOkResponse({
    description: 'Post moderation updated.',
    type: PostSchema,
  })
  async moderatePost(
    @Param('postId') postId: string,
    @Body() dto: ModeratePostDto,
  ): Promise<PostSchema> {
    const post = await this.threadsService.moderatePost(
      postId,
      dto.moderationState,
      dto.moderationFeedback,
      dto.lockThread,
    );
    return PostSchema.fromModel(post);
  }
}

