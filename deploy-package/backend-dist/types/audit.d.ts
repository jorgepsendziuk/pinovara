export declare enum AuditAction {
    LOGIN = "LOGIN",
    LOGOUT = "LOGOUT",
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    VIEW = "VIEW",
    EXPORT = "EXPORT",
    UPLOAD = "UPLOAD",
    ACCESS_DENIED = "ACCESS_DENIED",
    LOGIN_FAILED = "LOGIN_FAILED"
}
export interface AuditLogData {
    action: AuditAction;
    entity: string;
    entityId?: string;
    oldData?: any;
    newData?: any;
    userId?: number;
    ipAddress?: string;
    userAgent?: string;
}
export interface AuditLogFilters {
    action?: string;
    entity?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
}
export interface AuditLogStats {
    totalLogs: number;
    logsToday: number;
    logsByAction: Array<{
        action: string;
        _count: {
            action: number;
        };
    }>;
    logsByEntity: Array<{
        entity: string;
        _count: {
            entity: number;
        };
    }>;
}
export interface AuditLogResponse {
    id: number;
    action: string;
    entity: string;
    entityId?: string;
    oldData?: string;
    newData?: string;
    userAgent?: string;
    ipAddress?: string;
    createdAt: Date;
    userId?: number;
    user?: {
        id: number;
        email: string;
        name: string;
    };
}
//# sourceMappingURL=audit.d.ts.map