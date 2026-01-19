import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { TicketCategory, TicketPriority } from '../../../database/entities/ticket.entity';

export class CreateTicketDto {
  @IsUUID()
  buildingId!: string;

  @IsUUID()
  unitId!: string;

  @IsString()
  @MaxLength(255)
  title!: string;

  @IsString()
  @MaxLength(5000)
  description!: string;

  @IsEnum(TicketCategory)
  category!: TicketCategory;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority = TicketPriority.Medium;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  locationWithinUnit?: string;
}
