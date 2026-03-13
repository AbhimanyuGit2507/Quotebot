import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            tenant_id: string;
            role: string;
            company_name: string;
        };
    }>;
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string;
            tenant_id: string;
            role: string;
            company_name: string;
        };
    }>;
    validateToken(payload: {
        sub: string;
        email: string;
        tenant_id: string;
        role: string;
    }): Promise<{
        role: {
            id: string;
            name: string;
            permissions_json: string;
            created_at: Date;
        };
        tenant: {
            id: string;
            created_at: Date;
            company_name: string;
            trading_name: string | null;
            plan: string;
            updated_at: Date;
        };
    } & {
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        email: string;
        tenant_id: string;
        password_hash: string;
        role_id: string;
        status: string;
    }>;
    validateUser(email: string, password: string): Promise<({
        role: {
            id: string;
            name: string;
            permissions_json: string;
            created_at: Date;
        };
        tenant: {
            id: string;
            created_at: Date;
            company_name: string;
            trading_name: string | null;
            plan: string;
            updated_at: Date;
        };
    } & {
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
        email: string;
        tenant_id: string;
        password_hash: string;
        role_id: string;
        status: string;
    }) | null>;
}
