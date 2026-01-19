import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/roles.constant';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { TicketsService } from './tickets.service';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(UserRole.PropertyManager, UserRole.Staff, UserRole.ExternalCompany, UserRole.Tenant)
  create(@Body() dto: CreateTicketDto, @Req() request: { user: { id: string; organizationId: string | null } }) {
    return this.ticketsService.create(dto, request.user.id, request.user.organizationId);
  }

  @Get()
  @Roles(UserRole.PropertyManager, UserRole.Staff, UserRole.ExternalCompany, UserRole.Tenant)
  findAll(@Req() request: { user: { organizationId: string | null } }) {
    if (!request.user.organizationId) {
      return [];
    }

    return this.ticketsService.findAll(request.user.organizationId);
  }

  @Get(':id')
  @Roles(UserRole.PropertyManager, UserRole.Staff, UserRole.ExternalCompany, UserRole.Tenant)
  findOne(@Param('id') id: string) {
    return this.ticketsService.findById(id);
  }

  @Put(':id')
  @Roles(UserRole.PropertyManager, UserRole.Staff)
  update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketsService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles(UserRole.PropertyManager, UserRole.Staff, UserRole.ExternalCompany)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusDto) {
    return this.ticketsService.updateStatus(id, dto);
  }

  @Patch(':id/assign')
  @Roles(UserRole.PropertyManager)
  assign(@Param('id') id: string, @Body() dto: AssignTicketDto) {
    return this.ticketsService.assign(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.PropertyManager)
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}
