import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminModerationController } from './controllers/admin-moderation.controller';
import { AdminModerationService } from './services/admin-moderation.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminUsersService } from './services/admin-users.service';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [AdminModerationController, AdminUsersController],
  providers: [AdminModerationService, AdminUsersService, RolesGuard],
})
export class AdminModule {}
