import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            requestId?: string;
            startTime?: number;
        }
    }
}
export declare const accessLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const errorLogger: (error: Error, req: Request, res: Response, next: NextFunction) => void;
export declare const appLogger: {
    info: (message: string, data?: any) => void;
    warn: (message: string, data?: any) => void;
    error: (message: string, error?: Error | any) => void;
    debug: (message: string, data?: any) => void;
};
export declare const rateLimiter: (windowMs?: number, maxRequests?: number) => (req: Request, res: Response, next: NextFunction) => void;
declare const _default: {
    accessLogger: (req: Request, res: Response, next: NextFunction) => void;
    errorLogger: (error: Error, req: Request, res: Response, next: NextFunction) => void;
    appLogger: {
        info: (message: string, data?: any) => void;
        warn: (message: string, data?: any) => void;
        error: (message: string, error?: Error | any) => void;
        debug: (message: string, data?: any) => void;
    };
    rateLimiter: (windowMs?: number, maxRequests?: number) => (req: Request, res: Response, next: NextFunction) => void;
};
export default _default;
//# sourceMappingURL=logging.d.ts.map