import { IsEnum } from 'class-validator';
import { TicketStatus } from '../../../database/entities/ticket.entity';

export class UpdateStatusDto {
  @IsEnum(TicketStatus)
  status!: TicketStatus;
}
