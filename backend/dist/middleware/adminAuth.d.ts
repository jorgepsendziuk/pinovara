import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
/**
 * Middleware para verificar se o usuário autenticado tem permissão de administrador
 * Deve ser usado após o middleware authenticateToken
 */
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware para verificar se o usuário tem qualquer permissão administrativa
 * (admin ou moderator no módulo sistema)
 */
export declare const requireModerator: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=adminAuth.d.ts.map