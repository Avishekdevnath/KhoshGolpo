import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ThreadsService } from './threads.service';
import { ListThreadsQueryDto } from './dto/list-threads.query';
import { CreateThreadDto } from './dto/create-thread.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  type ActiveUser,
} from '../common/decorators/current-user.decorator';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ReactPostDto } from './dto/react-post.dto';
import { ThreadSchema } from './schemas/thread.schema';
import { PostSchema } from '../posts/schemas/post.schema';
import {
  CreatePostResponseDto,
  CreateThreadResponseDto,
  ReactPostResponseDto,
  ThreadDetailResponseDto,
  ThreadListResponseDto,
  UpdatePostResponseDto,
} from './dto/thread-responses.dto';

@ApiTags('Threads')
@Controller('threads')
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @ApiOperation({
    summary: 'List threads with pagination and filtering.',
    description:
      'Returns a paginated list of threads along with pagination metadata.',
  })
  @ApiOkResponse({
    description: 'Threads retrieved successfully.',
    type: ThreadListResponseDto,
  })
  @Get()
  async listThreads(@Query() query: ListThreadsQueryDto) {
    const result = await this.threadsService.listThreads(query);

    return {
      data: result.data.map((thread) => ThreadSchema.fromModel(thread)),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Create a new thread and its first post.',
  })
  @ApiCreatedResponse({
    description: 'Thread created successfully.',
    type: CreateThreadResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @Post()
  async createThread(
    @CurrentUser() user: ActiveUser,
    @Body() dto: CreateThreadDto,
  ) {
    const { thread, firstPost } = await this.threadsService.createThread(
      user,
      dto,
    );
    return {
      thread: ThreadSchema.fromModel(thread),
      firstPost: PostSchema.fromModel({ ...firstPost }),
    };
  }

  @ApiOperation({ summary: 'Get a thread with its posts.' })
  @ApiOkResponse({
    description: 'Thread and posts fetched successfully.',
    type: ThreadDetailResponseDto,
  })
  @ApiParam({
    name: 'threadId',
    description: 'Identifier of the thread to retrieve.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for the posts pagination (default: 1).',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of posts per page (default: 20).',
  })
  @Get(':threadId')
  async getThread(
    @Param('threadId') threadId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const pageNumber = Number.parseInt(page, 10) || 1;
    const limitNumber = Number.parseInt(limit, 10) || 20;

    const result = await this.threadsService.getThreadWithPosts(
      threadId,
      pageNumber,
      limitNumber,
    );

    return {
      thread: ThreadSchema.fromModel(result.thread),
      posts: result.posts.map((post) => PostSchema.fromModel({ ...post })),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.postsTotal,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new post in an existing thread.' })
  @ApiCreatedResponse({
    description: 'Post created successfully.',
    type: CreatePostResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @Post(':threadId/posts')
  async createPost(
    @Param('threadId') threadId: string,
    @CurrentUser() user: ActiveUser,
    @Body() dto: CreatePostDto,
  ) {
    const post = await this.threadsService.createPost(user, threadId, dto);
    return { post: PostSchema.fromModel({ ...post }) };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update an existing post.' })
  @ApiOkResponse({
    description: 'Post updated successfully.',
    type: UpdatePostResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @Patch(':threadId/posts/:postId')
  async updatePost(
    @Param('threadId') threadId: string,
    @Param('postId') postId: string,
    @CurrentUser() user: ActiveUser,
    @Body() dto: UpdatePostDto,
  ) {
    const post = await this.threadsService.updatePost(
      user,
      threadId,
      postId,
      dto.body,
    );
    return { post: PostSchema.fromModel({ ...post }) };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'React to a post with an upvote or downvote.' })
  @ApiOkResponse({
    description: 'Reaction applied successfully.',
    type: ReactPostResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @Post(':threadId/posts/:postId/reactions')
  async reactToPost(
    @Param('threadId') threadId: string,
    @Param('postId') postId: string,
    @CurrentUser() user: ActiveUser,
    @Body() dto: ReactPostDto,
  ) {
    const result = await this.threadsService.reactToPost(
      user,
      threadId,
      postId,
      dto.type,
    );
    return {
      post: PostSchema.fromModel({ ...result.post }),
      reaction: result.userReaction,
    };
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Remove your reaction from a post.' })
  @ApiOkResponse({
    description: 'Reaction removed successfully.',
    type: UpdatePostResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @Delete(':threadId/posts/:postId/reactions')
  async removeReaction(
    @Param('threadId') threadId: string,
    @Param('postId') postId: string,
    @CurrentUser() user: ActiveUser,
  ) {
    const post = await this.threadsService.removePostReaction(
      user,
      threadId,
      postId,
    );
    return { post: PostSchema.fromModel({ ...post }) };
  }
}
