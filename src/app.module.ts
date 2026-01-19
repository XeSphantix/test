import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import { validateEnvironment } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { User } from './database/entities/user.entity';
import { Ticket } from './database/entities/ticket.entity';
import { Message } from './database/entities/message.entity';
import { TicketsModule } from './modules/tickets/tickets.module';
import { MessagesModule } from './modules/messages/messages.module';
import { DocumentsModule } from './modules/documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      validate: validateEnvironment,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (config: ReturnType<typeof databaseConfig>) => ({
        type: 'postgres',
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        database: config.database,
        ssl: config.ssl,
        synchronize: false,
        entities: [User, Ticket, Message],
      }),
      inject: [databaseConfig.KEY],
    }),
    AuthModule,
    UsersModule,
    TicketsModule,
    MessagesModule,
    DocumentsModule,
  ],
})
export class AppModule {}
