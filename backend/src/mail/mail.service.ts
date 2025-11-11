import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

interface EmailVerificationPayload {
  email: string;
  displayName: string;
  verificationUrl: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter = nodemailer.createTransport(
    this.buildTransportConfig(),
  );
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    const fromName =
      this.configService.get<string>('EMAIL_FROM_NAME') ?? 'KhoshGolpo';
    const user = this.configService.getOrThrow<string>('GMAIL_USER');

    this.fromAddress = `"${fromName}" <${user}>`;
  }

  async sendEmailVerification(
    payload: EmailVerificationPayload,
  ): Promise<void> {
    const subject = 'Verify your email address';
    const text = this.renderEmailVerificationText(payload);
    const html = this.renderEmailVerificationHtml(payload);

    await this.sendMail({
      to: payload.email,
      subject,
      text,
      html,
    });
  }

  private async sendMail(options: SendMailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      this.logger.debug(
        `Email sent to ${options.to} with subject "${options.subject}"`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this.logger.error(
        `Failed to send email to ${options.to}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private buildTransportConfig(): SMTPTransport.Options {
    const host = this.configService.getOrThrow<string>('EMAIL_HOST');
    const port =
      this.configService.get<number>('EMAIL_PORT') ??
      (Number.parseInt(
        this.configService.get<string>('EMAIL_PORT') ?? '587',
        10,
      ) ||
        587);
    const secureConfig =
      this.configService.get<boolean>('EMAIL_SECURE') ??
      this.configService.get<string>('EMAIL_SECURE');
    const secure =
      typeof secureConfig === 'boolean'
        ? secureConfig
        : typeof secureConfig === 'string'
          ? secureConfig.toLowerCase() === 'true'
          : false;
    const user = this.configService.getOrThrow<string>('GMAIL_USER');
    const pass = this.configService.getOrThrow<string>('GMAIL_APP_PASSWORD');

    return {
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    };
  }

  private renderEmailVerificationText(
    payload: EmailVerificationPayload,
  ): string {
    return [
      `Hello ${payload.displayName},`,
      '',
      'Thanks for signing up for KhoshGolpo!',
      'Please verify your email address by clicking the link below:',
      payload.verificationUrl,
      '',
      'If you did not create this account, you can ignore this email.',
    ].join('\n');
  }

  private renderEmailVerificationHtml(
    payload: EmailVerificationPayload,
  ): string {
    return `
      <p>Hello ${payload.displayName},</p>
      <p>Thanks for signing up for <strong>KhoshGolpo</strong>!</p>
      <p>Please verify your email address by clicking the button below:</p>
      <p style="margin:24px 0;">
        <a href="${payload.verificationUrl}" style="background-color:#2563eb;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
          Verify Email
        </a>
      </p>
      <p>If the button doesn’t work, copy and paste this URL into your browser:</p>
      <p><a href="${payload.verificationUrl}">${payload.verificationUrl}</a></p>
      <p>If you did not create this account, you can ignore this email.</p>
    `;
  }
}
