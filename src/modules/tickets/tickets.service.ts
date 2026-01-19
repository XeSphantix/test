import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus } from '../../database/entities/ticket.entity';
import { UserRole } from '../../common/constants/roles.constant';
import { User } from '../../database/entities/user.entity';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketsRepository: Repository<Ticket>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateTicketDto, userId: string, organizationId: string | null) {
    if (!organizationId) {
      throw new BadRequestException('Organization is required to create a ticket');
    }

    const ticketNumber = `T-${Date.now()}`;
    const ticket = this.ticketsRepository.create({
      ticketNumber,
      organizationId,
      buildingId: dto.buildingId,
      unitId: dto.unitId,
      createdByUserId: userId,
      assignedToUserId: null,
      title: dto.title,
      description: dto.description,
      category: dto.category,
      priority: dto.priority,
      status: TicketStatus.New,
      locationWithinUnit: dto.locationWithinUnit ?? null,
    });

    return this.ticketsRepository.save(ticket);
  }

  async findAll(organizationId: string) {
    return this.ticketsRepository.find({ where: { organizationId } });
  }

  async findById(id: string) {
    const ticket = await this.ticketsRepository.findOne({ where: { id } });
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async update(id: string, dto: UpdateTicketDto) {
    const ticket = await this.findById(id);
    Object.assign(ticket, dto);
    return this.ticketsRepository.save(ticket);
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const ticket = await this.findById(id);
    ticket.status = dto.status;
    if (dto.status === TicketStatus.Resolved) {
      ticket.resolvedAt = new Date();
    } else if (dto.status !== TicketStatus.Resolved) {
      ticket.resolvedAt = null;
    }

    return this.ticketsRepository.save(ticket);
  }

  async assign(id: string, dto: AssignTicketDto) {
    const ticket = await this.findById(id);
    if (ticket.status === TicketStatus.Closed) {
      throw new BadRequestException('Closed tickets cannot be assigned');
    }

    const assignee = await this.usersRepository.findOne({ where: { id: dto.assignedToUserId } });
    if (!assignee) {
      throw new BadRequestException('Assignee not found');
    }

    if (![UserRole.Staff, UserRole.ExternalCompany].includes(assignee.role)) {
      throw new BadRequestException('Assignee must be staff or external company');
    }

    ticket.assignedToUserId = dto.assignedToUserId;
    ticket.assignedAt = new Date();
    ticket.status = TicketStatus.Assigned;

    return this.ticketsRepository.save(ticket);
  }

  async remove(id: string) {
    const ticket = await this.findById(id);
    await this.ticketsRepository.remove(ticket);
    return { success: true };
  }
}
