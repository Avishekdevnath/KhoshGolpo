import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminModerationService } from '../services/admin-moderation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ListModerationPostsQueryDto } from '../dto/list-moderation-posts.query';
import { ListModerationThreadsQueryDto } from '../dto/list-moderation-threads.query';
import { PostSchema } from '../../posts/schemas/post.schema';
import { ThreadSchema } from '../../threads/schemas/thread.schema';
import { UserSchema } from '../../users/schemas/user.schema';
import { PaginationMetaDto } from '../../threads/dto/thread-responses.dto';

class ModerationPostResponseDto {
  post!: PostSchema;
  thread!: ThreadSchema;
  author!: UserSchema;
}

class ModerationPostListResponseDto {
  data!: ModerationPostResponseDto[];
  pagination!: PaginationMetaDto;
}

class ModerationThreadResponseDto {
  thread!: ThreadSchema;
  author!: UserSchema;
}

class ModerationThreadListResponseDto {
  data!: ModerationThreadResponseDto[];
  pagination!: PaginationMetaDto;
}

@ApiTags('Admin • Moderation')
@ApiBearerAuth('access-token')
@Roles('admin', 'moderator')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/moderation')
export class AdminModerationController {
  constructor(
    private readonly adminModerationService: AdminModerationService,
  ) {}

  @Get('posts')
  @ApiOkResponse({
    description: 'Paginated list of posts awaiting moderation review.',
    type: ModerationPostListResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Admin or moderator role required.' })
  async listPosts(
    @Query() query: ListModerationPostsQueryDto,
  ): Promise<ModerationPostListResponseDto> {
    const result = await this.adminModerationService.listPosts(query);
    return {
      data: result.data.map(({ post, thread, author }) => ({
        post: PostSchema.fromModel({ ...post }),
        thread: ThreadSchema.fromModel(thread),
        author: UserSchema.fromModel(author),
      })),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
      },
    };
  }

  @Get('threads')
  @ApiOkResponse({
    description: 'Paginated list of threads filtered by moderation status.',
    type: ModerationThreadListResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Admin or moderator role required.' })
  async listThreads(
    @Query() query: ListModerationThreadsQueryDto,
  ): Promise<ModerationThreadListResponseDto> {
    const result = await this.adminModerationService.listThreads(query);
    return {
      data: result.data.map(({ thread, author }) => ({
        thread: ThreadSchema.fromModel(thread),
        author: UserSchema.fromModel(author),
      })),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
      },
    };
  }
}
