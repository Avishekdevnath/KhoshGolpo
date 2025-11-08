import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async pingCheck(key = 'database'): Promise<HealthIndicatorResult> {
    try {
      await this.prisma.$runCommandRaw({ ping: 1 });
      return this.getStatus(key, true);
    } catch (error) {
      throw new HealthCheckError(
        'MongoDB ping check failed',
        this.getStatus(key, false),
      );
    }
  }
}

