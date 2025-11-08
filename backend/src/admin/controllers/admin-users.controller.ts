import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminUsersService } from '../services/admin-users.service';
import { ListUsersQueryDto } from '../dto/list-users.query';
import { UserSchema } from '../../users/schemas/user.schema';
import { PaginationMetaDto } from '../../threads/dto/thread-responses.dto';
import { UpdateUserRolesDto } from '../dto/update-user-roles.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import type { User } from '@prisma/client';
import { CurrentUser, type ActiveUser } from '../../common/decorators/current-user.decorator';

class UserListResponseDto {
  data!: UserSchema[];
  pagination!: PaginationMetaDto;
}

@ApiTags('Admin • Users')
@ApiBearerAuth('access-token')
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOkResponse({
    description: 'Paginated list of users with role/status filters.',
    type: UserListResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Admin role required.' })
  async listUsers(@Query() query: ListUsersQueryDto): Promise<UserListResponseDto> {
    const result = await this.adminUsersService.listUsers(query);
    return {
      data: result.data.map((user) => UserSchema.fromModel(user as User)),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
      },
    };
  }

  @Patch(':userId/roles')
  @ApiOkResponse({
    description: 'Updated user with new roles applied.',
    type: UserSchema,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Admin role required.' })
  async updateRoles(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserRolesDto,
    @CurrentUser() actor: ActiveUser,
  ): Promise<UserSchema> {
    const updated = await this.adminUsersService.updateRoles(userId, dto, actor.userId);
    return UserSchema.fromModel(updated as User);
  }

  @Patch(':userId/status')
  @ApiOkResponse({
    description: 'Updated user status (active/suspended/banned).',
    type: UserSchema,
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Admin role required.' })
  async updateStatus(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser() actor: ActiveUser,
  ): Promise<UserSchema> {
    const updated = await this.adminUsersService.updateStatus(userId, dto, actor.userId);
    return UserSchema.fromModel(updated as User);
  }

  @Post(':userId/logout')
  @ApiOkResponse({
    description: 'All refresh tokens revoked for the target user.',
    schema: { properties: { success: { type: 'boolean', example: true } } },
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid access token.' })
  @ApiForbiddenResponse({ description: 'Admin role required.' })
  async forceLogout(
    @Param('userId') userId: string,
    @CurrentUser() actor: ActiveUser,
  ): Promise<{ success: boolean }> {
    return this.adminUsersService.forceLogout(userId, actor.userId);
  }
}

