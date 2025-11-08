import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import type { Server, Socket } from 'socket.io';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { RealtimeService } from './realtime.service';

interface JoinThreadPayload {
  threadId: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  private server!: Server;

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly realtimeService: RealtimeService,
  ) {}

  afterInit(server: Server): void {
    this.realtimeService.setServer(server);
    this.logger.log('Realtime gateway initialized.');
  }

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token) {
        throw new Error('Missing auth token.');
      }
      const payload = await this.verifyToken(token);
      this.realtimeService.registerUserSocket(client, payload.sub);
      client.emit('connection.success', { userId: payload.sub });
    } catch (error) {
      this.logger.warn(
        `Socket ${client.id} failed to authenticate: ${(error as Error).message}`,
      );
      client.emit('connection.error', {
        message: 'Unauthorized',
      });
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket): void {
    this.realtimeService.unregisterSocket(client);
  }

  @SubscribeMessage('joinThread')
  handleJoinThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: JoinThreadPayload,
  ): void {
    if (!body?.threadId || typeof body.threadId !== 'string') {
      client.emit('error', { message: 'Invalid threadId.' });
      return;
    }
    this.realtimeService.joinThreadRoom(client, body.threadId);
    client.emit('thread.joined', { threadId: body.threadId });
  }

  @SubscribeMessage('leaveThread')
  handleLeaveThread(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: JoinThreadPayload,
  ): void {
    if (!body?.threadId || typeof body.threadId !== 'string') {
      client.emit('error', { message: 'Invalid threadId.' });
      return;
    }
    this.realtimeService.leaveThreadRoom(client, body.threadId);
    client.emit('thread.left', { threadId: body.threadId });
  }

  private extractToken(client: Socket): string | undefined {
    const authHeader =
      client.handshake.headers.authorization ??
      client.handshake.headers.Authorization;
    if (authHeader && typeof authHeader === 'string') {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        return parts[1];
      }
    }
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      (client.handshake.query?.token as string | undefined);
    return typeof token === 'string' && token.length > 0 ? token : undefined;
  }

  private async verifyToken(token: string): Promise<JwtPayload> {
    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    return this.jwtService.verifyAsync<JwtPayload>(token, { secret });
  }
}

