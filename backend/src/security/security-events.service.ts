import { Injectable } from '@nestjs/common';
import type { Prisma, SecurityEvent } from '@prisma/client';

export type SecurityEventDelegate = {
  create: (
    args: Prisma.SecurityEventCreateArgs,
  ) => Prisma.PrismaPromise<SecurityEvent>;
  findMany: (
    args: Prisma.SecurityEventFindManyArgs,
  ) => Prisma.PrismaPromise<SecurityEvent[]>;
  count: (args: Prisma.SecurityEventCountArgs) => Prisma.PrismaPromise<number>;
};

export type SecurityEventClient = {
  securityEvent: SecurityEventDelegate;
};

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
  constructor(private readonly prisma: SecurityEventClient) {}

  recordEvent(input: SecurityEventInput): Prisma.PrismaPromise<SecurityEvent> {
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

  listEvents(
    params: Prisma.SecurityEventFindManyArgs,
  ): Prisma.PrismaPromise<SecurityEvent[]> {
    return this.prisma.securityEvent.findMany(params);
  }

  countEvents(
    where: Prisma.SecurityEventWhereInput,
  ): Prisma.PrismaPromise<number> {
    return this.prisma.securityEvent.count({ where });
  }
}
