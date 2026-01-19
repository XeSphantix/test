import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Message } from '../../database/entities/message.entity';
import { MessagesGateway } from './messages.gateway';
import { JwtConfig } from '../../config/jwt.config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Message]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtConfig = configService.get<JwtConfig>('jwt');
        if (!jwtConfig) {
          throw new Error('JWT configuration missing');
        }

        return {
          secret: jwtConfig.accessSecret,
          signOptions: {
            expiresIn: jwtConfig.accessTtl,
          },
        };
      },
    }),
  ],
  providers: [MessagesGateway],
})
export class MessagesModule {}
