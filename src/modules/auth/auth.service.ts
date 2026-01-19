import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../../common/constants/roles.constant';
import { User } from '../../database/entities/user.entity';
import { JwtConfig } from '../../config/jwt.config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';

interface RefreshTokenRecord {
  userId: string;
  expiresAt: Date;
}

@Injectable()
export class AuthService {
  private readonly refreshTokens = new Map<string, RefreshTokenRecord>();

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const saltRounds = Number(this.configService.get('BCRYPT_SALT_ROUNDS') ?? 12);
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = this.usersRepository.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      phone: dto.phone ?? null,
      role: dto.role ?? UserRole.Tenant,
      organizationId: dto.organizationId ?? null,
    });

    const saved = await this.usersRepository.save(user);
    const tokens = await this.issueTokens(saved);

    return {
      user: this.sanitizeUser(saved),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersRepository.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersRepository.update(user.id, { lastLoginAt: new Date() });

    const tokens = await this.issueTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refresh(dto: RefreshTokenDto) {
    const record = this.refreshTokens.get(dto.refreshToken);
    if (!record) {
      throw new UnauthorizedException('Refresh token invalid');
    }

    if (record.expiresAt.getTime() < Date.now()) {
      this.refreshTokens.delete(dto.refreshToken);
      throw new UnauthorizedException('Refresh token expired');
    }

    const user = await this.usersRepository.findOne({ where: { id: record.userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.refreshTokens.delete(dto.refreshToken);

    const tokens = await this.issueTokens(user);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async logout(dto: LogoutDto) {
    this.refreshTokens.delete(dto.refreshToken);

    return { success: true };
  }

  private async issueTokens(user: User) {
    const jwtConfig = this.configService.get<JwtConfig>('jwt');
    if (!jwtConfig) {
      throw new Error('JWT configuration missing');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      org_id: user.organizationId,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwtConfig.accessSecret,
      expiresIn: jwtConfig.accessTtl,
    });

    const refreshToken = uuidv4();
    const refreshExpires = this.addDuration(new Date(), jwtConfig.refreshTtl);

    this.refreshTokens.set(refreshToken, { userId: user.id, expiresAt: refreshExpires });

    return {
      accessToken,
      refreshToken,
      expiresIn: jwtConfig.accessTtl,
    };
  }

  private sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      organizationId: user.organizationId,
    };
  }

  private addDuration(date: Date, duration: string) {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      return new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000);
    }

    const value = Number(match[1]);
    const unit = match[2];

    const multiplier: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return new Date(date.getTime() + value * (multiplier[unit] ?? 0));
  }
}
