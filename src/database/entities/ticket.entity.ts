import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum TicketPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Urgent = 'urgent',
}

export enum TicketStatus {
  New = 'new',
  Assigned = 'assigned',
  InProgress = 'in_progress',
  Pending = 'pending',
  Resolved = 'resolved',
  Closed = 'closed',
}

export enum TicketCategory {
  Plumbing = 'plumbing',
  Electrical = 'electrical',
  Hvac = 'hvac',
  Appliances = 'appliances',
  PestControl = 'pest_control',
  Structural = 'structural',
  Security = 'security',
  CommonArea = 'common_area',
  Other = 'other',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'ticket_number', type: 'varchar', length: 50, unique: true })
  ticketNumber!: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId!: string;

  @Column({ name: 'building_id', type: 'uuid' })
  buildingId!: string;

  @Column({ name: 'unit_id', type: 'uuid' })
  unitId!: string;

  @Column({ name: 'created_by_user_id', type: 'uuid' })
  createdByUserId!: string;

  @Column({ name: 'assigned_to_user_id', type: 'uuid', nullable: true })
  assignedToUserId!: string | null;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'enum', enum: TicketCategory })
  category!: TicketCategory;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.Medium })
  priority!: TicketPriority;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.New })
  status!: TicketStatus;

  @Column({ name: 'location_within_unit', type: 'varchar', length: 100, nullable: true })
  locationWithinUnit!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt!: Date;

  @Column({ name: 'assigned_at', type: 'timestamp', nullable: true })
  assignedAt!: Date | null;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt!: Date | null;
}
