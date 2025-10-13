import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        name: string;
        roles: Array<{
            id: number;
            name: string;
            module: {
                id: number;
                name: string;
            };
        }>;
    };
}
/**
 * Middleware de autenticação JWT
 */
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware para verificar permissões específicas
 */
export declare const requirePermission: (moduleName: string, roleName?: string) => (req: AuthRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware opcional - não bloqueia se token não estiver presente
 */
export declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map