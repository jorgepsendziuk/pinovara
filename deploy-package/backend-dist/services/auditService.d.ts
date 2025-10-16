import { AuditLogData } from '../types/audit';
import { AuthRequest } from '../middleware/auth';
declare class AuditService {
    createLog(data: AuditLogData & {
        req?: AuthRequest;
    }): Promise<void>;
    private createDiff;
    getAuditLogs(filters: {
        action?: string;
        entity?: string;
        userId?: number;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        logs: ({
            users: {
                email: string;
                id: number;
                name: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            userId: number | null;
            action: string;
            entity: string;
            entityId: string | null;
            oldData: string | null;
            newData: string | null;
            userAgent: string | null;
            ipAddress: string | null;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAuditStats(): Promise<{
        totalLogs: number;
        logsToday: number;
        logsByAction: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.Audit_logsGroupByOutputType, "action"[]> & {
            _count: {
                action: number;
            };
        })[];
        logsByEntity: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.Audit_logsGroupByOutputType, "entity"[]> & {
            _count: {
                entity: number;
            };
        })[];
    }>;
    exportAuditLogs(filters: {
        action?: string;
        entity?: string;
        userId?: number;
        startDate?: string;
        endDate?: string;
    }): Promise<string>;
}
declare const _default: AuditService;
export default _default;
//# sourceMappingURL=auditService.d.ts.map