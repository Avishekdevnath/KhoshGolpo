import { ConfigService } from '@nestjs/config';
import { NotificationsWorkerService } from './notifications.worker.service';

describe('NotificationsWorkerService', () => {
  let configGet: jest.MockedFunction<ConfigService['get']>;
  let service: NotificationsWorkerService;

  beforeEach(() => {
    configGet = jest.fn() as jest.MockedFunction<ConfigService['get']>;
    const configService = {
      get: configGet,
    } as unknown as ConfigService;

    service = new NotificationsWorkerService(configService);
  });

  it('includes webhook secret header when configured', () => {
    configGet.mockImplementation((key: string) => {
      if (key === 'NOTIFICATION_WEBHOOK_SECRET') {
        return 'worker-secret';
      }
      return undefined;
    });

    const headers = (
      service as unknown as {
        buildSecretHeader(): Record<string, string>;
      }
    ).buildSecretHeader();

    expect(headers).toEqual({ 'x-webhook-secret': 'worker-secret' });
  });

  it('omits webhook secret header when not configured', () => {
    configGet.mockReturnValue(undefined);

    const headers = (
      service as unknown as {
        buildSecretHeader(): Record<string, string>;
      }
    ).buildSecretHeader();

    expect(headers).toEqual({});
  });
});
