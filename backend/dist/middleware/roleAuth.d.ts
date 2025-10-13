import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
/**
 * Middleware para verificar se o usuário tem role específico
 */
export declare const requireRole: (moduleName: string, roleName: string) => (req: AuthRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware para verificar se usuário é técnico
 */
export declare const requireTechnician: (req: AuthRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware para verificar permissões nas organizações baseado na role
 */
export declare const checkOrganizacaoPermission: (req: AuthRequest, res: Response, next: NextFunction) => void;
/**
 * Helper para verificar se usuário tem acesso a uma organização específica
 */
export declare const hasAccessToOrganizacao: (userPermissions: any, organizacao: {
    id_tecnico?: number | null;
}) => boolean;
declare const _default: {
    requireRole: (moduleName: string, roleName: string) => (req: AuthRequest, res: Response, next: NextFunction) => void;
    requireTechnician: (req: AuthRequest, res: Response, next: NextFunction) => void;
    checkOrganizacaoPermission: (req: AuthRequest, res: Response, next: NextFunction) => void;
    hasAccessToOrganizacao: (userPermissions: any, organizacao: {
        id_tecnico?: number | null;
    }) => boolean;
};
export default _default;
//# sourceMappingURL=roleAuth.d.ts.map