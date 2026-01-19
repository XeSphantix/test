import { JwtService } from '@nestjs/jwt';
import { Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../../database/entities/message.entity';
import { SendMessageDto } from './dto/send-message.dto';

@WebSocketGateway({ namespace: '/chat', cors: true })
export class MessagesGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token as string | undefined;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      client.join(`user:${payload.sub}`);
      this.logger.debug(`Client connected: ${payload.sub}`);
    } catch (error) {
      this.logger.warn('WebSocket auth failed');
      client.disconnect();
    }
  }

  @SubscribeMessage('join_ticket_room')
  joinRoom(@MessageBody('ticketId') ticketId: string, @ConnectedSocket() client: Socket) {
    client.join(`ticket:${ticketId}`);
    client.emit('room_joined', { ticketId });
  }

  @SubscribeMessage('leave_ticket_room')
  leaveRoom(@MessageBody('ticketId') ticketId: string, @ConnectedSocket() client: Socket) {
    client.leave(`ticket:${ticketId}`);
    client.emit('room_left', { ticketId });
  }

  @SubscribeMessage('send_message')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
  async handleMessage(@MessageBody() payload: SendMessageDto, @ConnectedSocket() client: Socket) {
    if (client.data.userId !== payload.userId) {
      client.emit('auth_error', { message: 'User mismatch' });
      return;
    }

    const message = this.messageRepository.create({
      ticketId: payload.ticketId,
      userId: payload.userId,
      messageText: payload.message,
      isInternal: payload.isInternal ?? false,
    });

    const saved = await this.messageRepository.save(message);

    this.server.to(`ticket:${payload.ticketId}`).emit('new_message', {
      ticketId: payload.ticketId,
      message: {
        id: saved.id,
        userId: saved.userId,
        text: saved.messageText,
        createdAt: saved.createdAt,
        isInternal: saved.isInternal,
      },
    });

    client.emit('message_ack', { messageId: saved.id });
  }
}
