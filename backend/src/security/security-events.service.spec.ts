import { SecurityEventsService } from './security-events.service';

describe('SecurityEventsService', () => {
  const prismaMock = {
    securityEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  } as any;

  const service = new SecurityEventsService(prismaMock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('records security events with defaults', async () => {
    const input = {
      type: 'login_failed',
      userId: 'user123',
      ip: '127.0.0.1',
    };

    await service.recordEvent(input);

    expect(prismaMock.securityEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        type: 'login_failed',
        userId: 'user123',
        ip: '127.0.0.1',
        severity: 'info',
        status: 'open',
      }),
    });
  });

  it('lists events with provided parameters', async () => {
    prismaMock.securityEvent.findMany.mockResolvedValueOnce([]);

    await service.listEvents({ where: { type: 'rate_limit' }, take: 10 });

    expect(prismaMock.securityEvent.findMany).toHaveBeenCalledWith({
      where: { type: 'rate_limit' },
      take: 10,
    });
  });

  it('counts events with provided filter', async () => {
    prismaMock.securityEvent.count.mockResolvedValueOnce(5);

    const count = await service.countEvents({ severity: 'warning' });

    expect(prismaMock.securityEvent.count).toHaveBeenCalledWith({
      where: { severity: 'warning' },
    });
    expect(count).toBe(5);
  });
});

