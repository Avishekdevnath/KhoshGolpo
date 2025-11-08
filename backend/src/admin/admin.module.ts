import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminModerationController } from './controllers/admin-moderation.controller';
import { AdminModerationService } from './services/admin-moderation.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersModule } from '../users/users.module';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminUsersService } from './services/admin-users.service';
import { SecurityModule } from '../security/security.module';
import { AdminSecurityController } from './controllers/admin-security.controller';
import { AdminSecurityService } from './services/admin-security.service';

@Module({
  imports: [PrismaModule, UsersModule, SecurityModule],
  controllers: [
    AdminModerationController,
    AdminUsersController,
    AdminSecurityController,
  ],
  providers: [
    AdminModerationService,
    AdminUsersService,
    AdminSecurityService,
    RolesGuard,
  ],
})
export class AdminModule {}

