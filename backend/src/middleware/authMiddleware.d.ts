import { Request, Response, NextFunction } from 'express';
import { AuthPayload } from '../services/authService';
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}
/**
 * Middleware para verificar token JWT
 */
export declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware para verificar permissões específicas
 */
export declare const requirePermission: (moduleName: string, roleName?: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware para verificar múltiplas permissões (OU)
 */
export declare const requireAnyPermission: (permissions: {
    module: string;
    role?: string;
}[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware para verificar se usuário é administrador
 */
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware para verificar se usuário é dono do recurso
 */
export declare const requireOwnership: (resourceIdParam?: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware opcional de autenticação (não falha se não autenticado)
 */
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Verificar se requisição é autenticada
 */
export declare const isAuthenticated: (req: Request) => boolean;
/**
 * Obter usuário da requisição (assume que está autenticado)
 */
export declare const getCurrentUser: (req: Request) => AuthPayload;
/**
 * Verificar se usuário atual tem uma permissão
 */
export declare const currentUserHasPermission: (req: Request, moduleName: string, roleName?: string) => boolean;
//# sourceMappingURL=authMiddleware.d.ts.map