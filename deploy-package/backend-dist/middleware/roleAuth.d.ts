import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
export declare const requireRole: (moduleName: string, roleName: string) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireTechnician: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const checkOrganizacaoPermission: (req: AuthRequest, res: Response, next: NextFunction) => void;
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