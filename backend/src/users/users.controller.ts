import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import type { Thread } from '@prisma/client/index';
import {
  CurrentUser,
  type ActiveUser,
} from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ThreadsService } from '../threads/threads.service';
import { PaginationMetaDto } from '../threads/dto/thread-responses.dto';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileDto } from '../auth/dto/profile.dto';
import { PublicUserSummaryDto } from './dto/public-user-summary.dto';
import { PublicUserDetailDto } from './dto/public-user-detail.dto';
import { PublicUserListQueryDto } from './dto/public-user-list-query.dto';
import { PublicUserDetailQueryDto } from './dto/public-user-detail-query.dto';
import { UserThreadListItemDto } from './dto/user-thread-list-item.dto';
import { UserSearchQueryDto } from './dto/user-search-query.dto';
import { UserSuggestionDto } from './dto/user-suggestion.dto';

class PublicUserListResponseDto {
  @ApiProperty({ type: () => [PublicUserSummaryDto] })
  data!: PublicUserSummaryDto[];
  @ApiProperty({ type: () => PaginationMetaDto })
  pagination!: PaginationMetaDto;
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly threadsService: ThreadsService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    description: 'Paginated list of publicly visible users.',
    type: PublicUserListResponseDto,
  })
  async listPublicUsers(
    @Query() query: PublicUserListQueryDto,
  ): Promise<PublicUserListResponseDto> {
    const statusFilter =
      (query.status as 'active' | 'suspended' | 'banned' | undefined) ??
      'active';

    const { data, page, limit, total } =
      await this.usersService.listPublicUsers({
        query: query.query,
        page: query.page,
        limit: query.limit,
        role: query.role,
        status: statusFilter,
      });

    return {
      data: data.map((user) => PublicUserSummaryDto.fromUser(user)),
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  @Get('search')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Search users by handle or display name for mention suggestions.',
  })
  @ApiOkResponse({
    description: 'List of matching users.',
    type: UserSuggestionDto,
    isArray: true,
  })
  async searchUsers(
    @Query() query: UserSearchQueryDto,
  ): Promise<UserSuggestionDto[]> {
    const results = await this.usersService.searchUsers(
      query.query,
      query.limit,
      {
        status: query.status as 'active' | 'suspended' | 'banned' | undefined,
        role: query.role,
      },
    );
    return results.map((user) => ({
      id: user.id,
      handle: user.handle,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl ?? null,
      status: user.status,
      roles: user.roles,
    }));
  }

  @Get(':handle')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Fetch public profile and recent threads for a user.',
  })
  @ApiOkResponse({
    description: 'Public profile details.',
    type: PublicUserDetailDto,
  })
  async getPublicProfile(
    @Param('handle') handle: string,
    @Query() query: PublicUserDetailQueryDto,
  ): Promise<PublicUserDetailDto> {
    const profile = await this.usersService.findPublicProfileByHandle(handle);

    if (!profile || profile.status === 'banned') {
      throw new NotFoundException('User not found.');
    }

    if (profile.status === 'suspended') {
      throw new NotFoundException('User is not available.');
    }

    const threads: Thread[] =
      await this.threadsService.listRecentThreadsByAuthor(
        profile.id,
        query.threadsLimit ?? 5,
      );

    const threadSummaries = threads.map((thread) =>
      this.mapToThreadListItem(thread),
    );

    return {
      user: PublicUserSummaryDto.fromUser(profile),
      threads: threadSummaries,
    };
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update profile details of the authenticated user.',
  })
  @ApiOkResponse({
    description: 'Updated user profile.',
    type: ProfileDto,
  })
  async updateProfile(
    @CurrentUser() user: ActiveUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileDto> {
    const updated = await this.usersService.updateProfile(user.userId, dto);
    const profileSource =
      updated ?? (await this.usersService.findById(user.userId));
    if (!profileSource) {
      throw new NotFoundException('User not found.');
    }
    return ProfileDto.fromUser(profileSource);
  }

  private mapToThreadListItem({
    id,
    title,
    slug,
    status,
    lastActivityAt,
    postsCount,
    createdAt,
  }: Thread): UserThreadListItemDto {
    const dto = new UserThreadListItemDto();
    dto.id = id;
    dto.title = title;
    dto.slug = slug;
    dto.status = status;
    dto.lastActivityAt = lastActivityAt;
    dto.postsCount = postsCount ?? 0;
    dto.createdAt = createdAt;
    return dto;
  }
}
