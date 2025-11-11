import { Injectable } from '@nestjs/common';
import type { Prisma, SecurityEvent } from '@prisma/client';
import { SecurityEventsService } from '../../security/security-events.service';
import type { ListSecurityEventsQueryDto } from '../dto/list-security-events.query';
import type { ListRateLimitQueryDto } from '../dto/list-rate-limit.query';

@Injectable()
export class AdminSecurityService {
  constructor(private readonly securityEventsService: SecurityEventsService) {}

  async listEvents(query: ListSecurityEventsQueryDto) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.SecurityEventWhereInput = {};
    if (query.type) {
      where.type = { equals: query.type, mode: 'insensitive' };
    }
    if (query.severity) {
      where.severity = query.severity;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.userId) {
      where.userId = query.userId;
    }
    if (query.ip) {
      where.ip = query.ip;
    }
    if (query.endpoint) {
      where.endpoint = { contains: query.endpoint, mode: 'insensitive' };
    }
    if (query.start || query.end) {
      where.createdAt = {};
      if (query.start) {
        where.createdAt.gte = query.start;
      }
      if (query.end) {
        where.createdAt.lte = query.end;
      }
    }

    const [events, total] = await Promise.all([
      this.securityEventsService.listEvents({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.securityEventsService.countEvents(where),
    ]);

    return {
      data: events,
      total,
      page,
      limit,
    };
  }

  async listRateLimitSummary(query: ListRateLimitQueryDto) {
    const { windowMinutes, groupBy, filter } = query;
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);

    const events: SecurityEvent[] = await this.securityEventsService.listEvents(
      {
        where: {
          type: 'rate_limit',
          createdAt: { gte: since },
        },
      },
    );

    const summary = new Map<
      string,
      {
        count: number;
        last: Date;
        sampleEndpoint?: string;
        sampleIp?: string;
        sampleUserId?: string;
      }
    >();

    events.forEach((event) => {
      const key =
        groupBy === 'user'
          ? (event.userId ?? 'unknown')
          : groupBy === 'ip'
            ? (event.ip ?? 'unknown')
            : (event.endpoint ?? 'unknown');

      if (filter && key !== filter) {
        return;
      }

      const existing = summary.get(key);
      if (existing) {
        existing.count += 1;
        if (event.createdAt > existing.last) {
          existing.last = event.createdAt;
          existing.sampleEndpoint = event.endpoint ?? existing.sampleEndpoint;
          existing.sampleIp = event.ip ?? existing.sampleIp;
          existing.sampleUserId = event.userId ?? existing.sampleUserId;
        }
      } else {
        summary.set(key, {
          count: 1,
          last: event.createdAt,
          sampleEndpoint: event.endpoint ?? undefined,
          sampleIp: event.ip ?? undefined,
          sampleUserId: event.userId ?? undefined,
        });
      }
    });

    const data = Array.from(summary.entries())
      .map(([key, value]) => ({
        key,
        count: value.count,
        lastOccurrence: value.last,
        sampleEndpoint: value.sampleEndpoint,
        sampleIp: value.sampleIp,
        sampleUserId: value.sampleUserId,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      data,
      windowMinutes,
      groupBy,
      totalActors: data.length,
    };
  }
}
