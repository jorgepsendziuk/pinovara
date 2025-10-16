import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
export declare const requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const requireModerator: (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=adminAuth.d.ts.map