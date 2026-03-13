import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * JWT Guard - protects routes requiring authentication
 * Use @UseGuards(JwtAuthGuard) on controllers or methods
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
