import { LoginData, RegisterData, LoginResponse, UserWithRoles } from '../types/auth';
declare class AuthService {
    login(data: LoginData): Promise<LoginResponse>;
    register(data: RegisterData): Promise<LoginResponse>;
    getUserById(userId: number): Promise<UserWithRoles>;
    verifyToken(token: string): Promise<UserWithRoles>;
    updateProfile(userId: number, data: {
        name: string;
        email: string;
    }): Promise<UserWithRoles>;
    private getExpiresInSeconds;
    private generateToken;
}
declare class ApiError extends Error {
    statusCode: number;
    code?: string;
    details?: any[];
    constructor(options: {
        message: string;
        statusCode: number;
        code?: string;
        details?: any[];
    });
}
export declare const authService: AuthService;
export { ApiError };
//# sourceMappingURL=authService.d.ts.map