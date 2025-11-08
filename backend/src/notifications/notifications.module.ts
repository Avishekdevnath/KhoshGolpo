import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { QueueModule } from '../queue/queue.module';
import { NotificationsService } from './notifications.service';
import { NotificationsWorkerService } from './notifications.worker.service';
import { NotificationsController } from './notifications.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [ConfigModule, QueueModule, PrismaModule, RealtimeModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsWorkerService],
  exports: [NotificationsService],
})
export class NotificationsModule {}

