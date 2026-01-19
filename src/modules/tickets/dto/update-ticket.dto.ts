import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TicketCategory, TicketPriority } from '../../../database/entities/ticket.entity';

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  locationWithinUnit?: string;
}
