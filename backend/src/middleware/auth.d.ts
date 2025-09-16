import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
            };
        }
    }
}
export declare class AuthMiddleware {
    /**
     * Middleware para verificar JWT token
     */
    static authenticate: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Middleware para verificar se usuário é administrador
     */
    static requireAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    /**
     * Middleware para verificar se usuário é moderador ou admin
     */
    static requireModerator: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    /**
     * Middleware opcional - adiciona usuário se token for válido, mas não bloqueia se não houver
     */
    static optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Middleware para verificar propriedade do recurso
     */
    static requireOwnership: (resourceUserIdField?: string) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
}
//# sourceMappingURL=auth.d.ts.map