import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Login user with email and password
   * Returns JWT token if credentials are valid
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        tenant: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new UnauthorizedException('User account is inactive');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      tenant_id: user.tenant_id,
      role: user.role.name,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tenant_id: user.tenant_id,
        role: user.role.name,
        company_name: user.tenant.company_name,
      },
    };
  }

  /**
   * Register a new user
   * Only accessible to admins for tenant creation
   */
  async register(registerDto: RegisterDto) {
    const { tenant_id, email, name, password } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Check if tenant exists
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenant_id },
    });

    if (!tenant) {
      throw new BadRequestException('Invalid tenant ID');
    }

    // Get default 'user' role
    const userRole = await this.prisma.role.findUnique({
      where: { name: 'user' },
    });

    if (!userRole) {
      throw new BadRequestException('Default user role not found');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await this.prisma.user.create({
      data: {
        tenant_id,
        email,
        name,
        password_hash,
        role_id: userRole.id,
        status: 'active',
      },
      include: {
        role: true,
        tenant: true,
      },
    });

    // Generate JWT token
    const token = this.jwtService.sign({
      sub: newUser.id,
      email: newUser.email,
      tenant_id: newUser.tenant_id,
      role: newUser.role.name,
    });

    return {
      access_token: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        tenant_id: newUser.tenant_id,
        role: newUser.role.name,
        company_name: newUser.tenant.company_name,
      },
    };
  }

  /**
   * Validate JWT token and extract user info
   * Used by JWT Guard to verify requests
   */
  async validateToken(payload: {
    sub: string;
    email: string;
    tenant_id: string;
    role: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        role: true,
        tenant: true,
      },
    });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }

  /**
   * Verify user credentials (used by passport strategy if needed)
   */
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        tenant: true,
      },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }
}
