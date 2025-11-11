import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('notifications/webhook')
export class NotificationsWebhookController {
  constructor(private readonly configService: ConfigService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  handleWebhook(
    @Headers('x-webhook-secret') providedSecret: string | undefined,
    @Body() body: unknown,
  ): void {
    const expectedSecret = this.configService
      .get<string>('NOTIFICATION_WEBHOOK_SECRET')
      ?.trim();

    if (expectedSecret) {
      if (!providedSecret || providedSecret.trim() !== expectedSecret) {
        throw new HttpException(
          'Unauthorized webhook caller',
          HttpStatus.UNAUTHORIZED,
        );
      }
    }

    void body;
  }
}
