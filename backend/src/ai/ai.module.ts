import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QueueModule } from '../queue/queue.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AiService } from './ai.service';
import { AiWorkerService } from './ai.worker.service';

@Module({
  imports: [ConfigModule, QueueModule, PrismaModule],
  providers: [AiService, AiWorkerService],
  exports: [AiService],
})
export class AiModule {}

