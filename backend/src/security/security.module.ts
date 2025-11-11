import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityEventsService } from './security-events.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [SecurityEventsService],
  exports: [SecurityEventsService],
})
export class SecurityModule {}
