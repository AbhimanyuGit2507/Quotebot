import { AuthService } from './auth.service';
interface JwtPayload {
    sub: string;
    email: string;
    tenant_id: string;
    role: string;
    iat?: number;
    exp?: number;
}
declare const JwtStrategy_base: new (...args: any) => any;
export declare class JwtStrategy extends JwtStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        email: string;
        name: string;
        tenant_id: string;
        role: string;
        permissions: any;
    }>;
}
export {};
