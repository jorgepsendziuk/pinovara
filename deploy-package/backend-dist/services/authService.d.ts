import { z } from 'zod';
export declare const registerSchema: z.ZodEffects<z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    confirmPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
}, {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
}>, {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
}, {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export interface AuthUser {
    id: number;
    email: string;
    name: string;
    active: boolean;
    roles: AuthRole[];
}
export interface AuthRole {
    id: number;
    name: string;
    module: {
        id: number;
        name: string;
    };
}
export interface AuthPayload extends AuthUser {
    iat?: number;
    exp?: number;
}
export interface LoginResponse {
    user: AuthUser;
    token: string;
    expiresIn: number;
}
export interface RegisterResponse extends LoginResponse {
}
/**
 * Hash de senha usando bcrypt
 */
export declare const hashPassword: (password: string) => Promise<string>;
/**
 * Verificação de senha
 */
export declare const verifyPassword: (password: string, hash: string) => Promise<boolean>;
/**
 * Geração de token JWT
 */
export declare const generateToken: (payload: Omit<AuthPayload, "iat" | "exp">) => string;
/**
 * Verificação de token JWT
 */
export declare const verifyToken: (token: string) => AuthPayload;
/**
 * Serviço de registro de usuário
 */
export declare const registerUser: (data: z.infer<typeof registerSchema>) => Promise<RegisterResponse>;
/**
 * Serviço de login
 */
export declare const loginUser: (data: z.infer<typeof loginSchema>) => Promise<LoginResponse>;
/**
 * Buscar usuário por ID
 */
export declare const getUserById: (userId: number) => Promise<AuthUser>;
/**
 * Verificar se usuário tem uma permissão específica baseada no tipo de usuário
 */
export declare const hasPermission: (user: AuthUser, moduleName: string, roleName?: string) => boolean;
/**
 * Verificar se usuário tem qualquer uma das permissões especificadas
 */
export declare const hasAnyPermission: (user: AuthUser, permissions: {
    module: string;
    role?: string;
}[]) => boolean;
export declare const validateRegisterData: (data: unknown) => {
    email: string;
    password: string;
    name: string;
    confirmPassword: string;
};
export declare const validateLoginData: (data: unknown) => {
    email: string;
    password: string;
};
export declare const AuthService: {
    register: (data: z.infer<typeof registerSchema>) => Promise<RegisterResponse>;
    login: (data: z.infer<typeof loginSchema>) => Promise<LoginResponse>;
    getUserById: (userId: number) => Promise<AuthUser>;
    hasPermission: (user: AuthUser, moduleName: string, roleName?: string) => boolean;
    hasAnyPermission: (user: AuthUser, permissions: {
        module: string;
        role?: string;
    }[]) => boolean;
    hashPassword: (password: string) => Promise<string>;
    verifyPassword: (password: string, hash: string) => Promise<boolean>;
    generateToken: (payload: Omit<AuthPayload, "iat" | "exp">) => string;
    verifyToken: (token: string) => AuthPayload;
};
//# sourceMappingURL=authService.d.ts.map