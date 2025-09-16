import { Request, Response } from 'express';
export declare const adminController: {
    getSystemInfo(req: Request, res: Response): Promise<void>;
    getAllSettings(req: Request, res: Response): Promise<void>;
    getSettingsByCategory(req: Request, res: Response): Promise<void>;
    getSettingByKey(req: Request, res: Response): Promise<void>;
    createSetting(req: Request, res: Response): Promise<void>;
    updateSetting(req: Request, res: Response): Promise<void>;
    deleteSetting(req: Request, res: Response): Promise<void>;
    getAllAuditLogs(req: Request, res: Response): Promise<void>;
    getAuditLogById(req: Request, res: Response): Promise<void>;
    getAuditLogStats(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=adminController.d.ts.map