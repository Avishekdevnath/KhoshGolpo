import { Controller, Get, Header } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { MetricsService } from './metrics.service';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Header('Content-Type', 'text/plain; version=0.0.4')
  @ApiProduces('text/plain')
  @ApiOperation({
    summary: 'Expose Prometheus-compatible metrics.',
    description:
      'Returns application metrics formatted for Prometheus scraping (content-type text/plain).',
  })
  @ApiOkResponse({
    description: 'Prometheus metrics payload.',
    schema: {
      type: 'string',
      example: '# HELP http_requests_total Total number of HTTP requests\nhttp_requests_total 42',
    },
  })
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}

