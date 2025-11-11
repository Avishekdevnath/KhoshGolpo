import { Module } from '@nestjs/common';
import { ThreadsController } from './threads.controller';
import { ThreadsAdminController } from './threads.admin.controller';
import { UserThreadsController } from './threads.user.controller';
import { ThreadsService } from './threads.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { RealtimeModule } from '../realtime/realtime.module';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    PrismaModule,
    AiModule,
    NotificationsModule,
    UsersModule,
    RealtimeModule,
    CacheModule,
  ],
  controllers: [
    ThreadsController,
    ThreadsAdminController,
    UserThreadsController,
  ],
  providers: [ThreadsService, RolesGuard],
  exports: [ThreadsService],
})
export class ThreadsModule {}
