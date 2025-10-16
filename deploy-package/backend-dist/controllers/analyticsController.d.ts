import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
declare class AnalyticsController {
    getMetrics(req: AuthRequest, res: Response): Promise<void>;
}
export declare const analyticsController: AnalyticsController;
export {};
//# sourceMappingURL=analyticsController.d.ts.map