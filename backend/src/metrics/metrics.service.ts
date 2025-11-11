import { Injectable } from '@nestjs/common';
import {
  Registry,
  collectDefaultMetrics,
  register as globalRegistry,
} from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry: Registry;

  constructor() {
    this.registry = globalRegistry;
    collectDefaultMetrics({
      register: this.registry,
      prefix: 'khoshgolpo_backend_',
    });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
