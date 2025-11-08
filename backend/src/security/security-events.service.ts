import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface SecurityEventInput {
  type: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  endpoint?: string;
  details?: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'critical';
  status?: 'open' | 'escalated' | 'resolved';
}

@Injectable()
export class SecurityEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async recordEvent(input: SecurityEventInput) {
    const {
      type,
      userId,
      ip,
      userAgent,
      endpoint,
      details,
      severity = 'info',
      status = 'open',
    } = input;

    return this.prisma.securityEvent.create({
      data: {
        type,
        userId: userId ?? null,
        ip: ip ?? null,
        userAgent: userAgent ?? null,
        endpoint: endpoint ?? null,
        details: (details ?? null) as Prisma.JsonValue,
        severity,
        status,
      },
    });
  }

  async listEvents(params: Prisma.SecurityEventFindManyArgs) {
    return this.prisma.securityEvent.findMany(params);
  }

  async countEvents(where: Prisma.SecurityEventWhereInput) {
    return this.prisma.securityEvent.count({ where });
  }
}

