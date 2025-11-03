import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
export declare const requireUploadPermission: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireDeletePermission: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=repositorioAuth.d.ts.map