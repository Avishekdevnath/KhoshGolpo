import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { PrismaHealthIndicator } from './prisma.health.indicator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Service health probe.' })
  @ApiOkResponse({
    description: 'Overall health status of dependencies.',
    schema: {
      example: {
        status: 'ok',
        info: { prisma: { status: 'up' } },
        error: {},
        details: { prisma: { status: 'up' } },
      },
    },
  })
  check() {
    return this.health.check([() => this.prismaIndicator.pingCheck()]);
  }
}

