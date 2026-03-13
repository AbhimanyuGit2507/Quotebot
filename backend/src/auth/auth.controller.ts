import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Login with email and password
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  /**
   * POST /api/auth/register
   * Register a new user in an existing tenant
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  /**
   * POST /api/auth/validate
   * Validate current JWT token (can be used for frontend token refresh checks)
   */
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validate() {
    return {
      message: 'Token is valid',
      timestamp: new Date().toISOString(),
    };
  }
}
