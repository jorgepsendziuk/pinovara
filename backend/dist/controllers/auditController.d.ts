import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
declare class AuditController {
    getAuditLogs(req: AuthRequest, res: Response): Promise<void>;
    getAuditStats(req: AuthRequest, res: Response): Promise<void>;
    exportAuditLogs(req: AuthRequest, res: Response): Promise<void>;
    private handleError;
}
declare const _default: AuditController;
export default _default;
//# sourceMappingURL=auditController.d.ts.map