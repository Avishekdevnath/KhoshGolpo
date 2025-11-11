import { ConfigService } from '@nestjs/config';
import { HttpException } from '@nestjs/common';
import { NotificationsWebhookController } from './notifications-webhook.controller';

describe('NotificationsWebhookController', () => {
  let configGet: jest.Mock;
  let controller: NotificationsWebhookController;

  beforeEach(() => {
    configGet = jest.fn();
    const configService = {
      get: configGet,
    } as unknown as ConfigService;
    controller = new NotificationsWebhookController(configService);
  });

  it('allows requests when secret is not configured', () => {
    configGet.mockReturnValue(undefined);

    expect(controller.handleWebhook(undefined, { foo: 'bar' })).toBeUndefined();
    expect(configGet).toHaveBeenCalledWith('NOTIFICATION_WEBHOOK_SECRET');
  });

  it('accepts requests with matching secret', () => {
    configGet.mockReturnValue('my-secret');

    expect(
      controller.handleWebhook('my-secret', { foo: 'bar' }),
    ).toBeUndefined();
  });

  it('rejects requests with mismatched secret', () => {
    configGet.mockReturnValue('expected-secret');

    expect(() => controller.handleWebhook('wrong-secret', {})).toThrow(
      HttpException,
    );
    expect(() => controller.handleWebhook(undefined, {})).toThrow(
      HttpException,
    );
  });
});
