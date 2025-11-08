import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, type ActiveUser } from '../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileDto } from '../auth/dto/profile.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}

