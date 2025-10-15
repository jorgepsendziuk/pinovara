import { Request, Response, NextFunction } from 'express';
import { AuditAction } from '../types/audit';
export declare const auditMiddleware: (action: AuditAction, entity: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const auditLoginAttempt: (req: Request, res: Response, next: NextFunction) => void;
export declare const auditAccessDenied: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=audit.d.ts.map