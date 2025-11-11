import type { Prisma, SecurityEvent } from '@prisma/client';
import type {
  SecurityEventClient,
  SecurityEventDelegate,
} from './security-events.service';
import { SecurityEventsService } from './security-events.service';

const prismaPromise = <T>(value: T): Prisma.PrismaPromise<T> =>
  Promise.resolve(value) as Prisma.PrismaPromise<T>;

const createSecurityEventClientMock = () => {
  const securityEvent = {
    create: jest.fn<
      Prisma.PrismaPromise<SecurityEvent>,
      [Prisma.SecurityEventCreateArgs]
    >(() => prismaPromise({} as SecurityEvent)),
    findMany: jest.fn<
      Prisma.PrismaPromise<SecurityEvent[]>,
      [Prisma.SecurityEventFindManyArgs]
    >(() => prismaPromise([] as SecurityEvent[])),
    count: jest.fn<
      Prisma.PrismaPromise<number>,
      [Prisma.SecurityEventCountArgs]
    >(() => prismaPromise(0)),
  } as jest.Mocked<SecurityEventDelegate>;

  const prisma = { securityEvent } satisfies SecurityEventClient;

  return { securityEvent, prisma };
};

describe('SecurityEventsService', () => {
  let securityEvent: jest.Mocked<SecurityEventDelegate>;
  let service: SecurityEventsService;

  beforeEach(() => {
    const mocks = createSecurityEventClientMock();
    securityEvent = mocks.securityEvent;
    service = new SecurityEventsService(mocks.prisma);
    jest.clearAllMocks();
  });

  it('records security events with defaults', async () => {
    await service.recordEvent({
      type: 'login_failed',
      userId: 'user123',
      ip: '127.0.0.1',
    });

    const [[createArgs]] = securityEvent.create.mock.calls;
    expect(createArgs.data).toMatchObject({
      type: 'login_failed',
      userId: 'user123',
      ip: '127.0.0.1',
      severity: 'info',
      status: 'open',
    });
  });

  it('lists events with provided parameters', async () => {
    await service.listEvents({ where: { type: 'rate_limit' }, take: 10 });

    expect(securityEvent.findMany).toHaveBeenCalledWith({
      where: { type: 'rate_limit' },
      take: 10,
    });
  });

  it('counts events with provided filter', async () => {
    await service.countEvents({ severity: 'warning' });

    expect(securityEvent.count).toHaveBeenCalledWith({
      where: { severity: 'warning' },
    });
  });
});
