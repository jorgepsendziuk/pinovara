import { LoginData, RegisterData, LoginResponse, UserWithRoles } from '../types/auth';
declare class AuthService {
    /**
     * Fazer login do usuário
     */
    login(data: LoginData): Promise<LoginResponse>;
    /**
     * Registrar novo usuário
     */
    register(data: RegisterData): Promise<LoginResponse>;
    /**
     * Obter dados do usuário por ID
     */
    getUserById(userId: number): Promise<UserWithRoles>;
    /**
     * Verificar se token é válido
     */
    verifyToken(token: string): Promise<UserWithRoles>;
    /**
     * Atualizar perfil do usuário
     */
    updateProfile(userId: number, data: {
        name: string;
        email: string;
    }): Promise<UserWithRoles>;
    /**
     * Gerar token JWT
     */
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
//# sourceMappingURL=authService-backup.d.ts.map