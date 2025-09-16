import { z } from 'zod';
export declare const createSettingSchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodString;
    type: z.ZodEnum<["string", "number", "boolean", "json"]>;
    description: z.ZodOptional<z.ZodString>;
    category: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    value: string;
    type: "string" | "number" | "boolean" | "json";
    key: string;
    category: string;
    description?: string | undefined;
}, {
    value: string;
    type: "string" | "number" | "boolean" | "json";
    key: string;
    description?: string | undefined;
    category?: string | undefined;
}>;
export declare const updateSettingSchema: z.ZodObject<{
    key: z.ZodOptional<z.ZodString>;
    value: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<["string", "number", "boolean", "json"]>>;
    description: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    category: z.ZodOptional<z.ZodDefault<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    value?: string | undefined;
    type?: "string" | "number" | "boolean" | "json" | undefined;
    description?: string | undefined;
    key?: string | undefined;
    category?: string | undefined;
}, {
    value?: string | undefined;
    type?: "string" | "number" | "boolean" | "json" | undefined;
    description?: string | undefined;
    key?: string | undefined;
    category?: string | undefined;
}>;
export declare const createAuditLogSchema: z.ZodObject<{
    action: z.ZodString;
    entity: z.ZodString;
    entityId: z.ZodOptional<z.ZodString>;
    oldData: z.ZodOptional<z.ZodString>;
    newData: z.ZodOptional<z.ZodString>;
    userAgent: z.ZodOptional<z.ZodString>;
    ipAddress: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    action: string;
    entity: string;
    userId?: number | undefined;
    entityId?: string | undefined;
    oldData?: string | undefined;
    newData?: string | undefined;
    userAgent?: string | undefined;
    ipAddress?: string | undefined;
}, {
    action: string;
    entity: string;
    userId?: number | undefined;
    entityId?: string | undefined;
    oldData?: string | undefined;
    newData?: string | undefined;
    userAgent?: string | undefined;
    ipAddress?: string | undefined;
}>;
export declare class AdminService {
    static getAllSettings(category?: string): Promise<{
        value: string;
        type: string;
        id: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        key: string;
        category: string;
    }[]>;
    static getSettingByKey(key: string): Promise<{
        value: string;
        type: string;
        id: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        key: string;
        category: string;
    }>;
    static createSetting(data: z.infer<typeof createSettingSchema>): Promise<{
        value: string;
        type: string;
        id: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        key: string;
        category: string;
    }>;
    static updateSetting(key: string, data: z.infer<typeof updateSettingSchema>): Promise<{
        value: string;
        type: string;
        id: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        key: string;
        category: string;
    }>;
    static deleteSetting(key: string): Promise<{
        value: string;
        type: string;
        id: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        key: string;
        category: string;
    }>;
    static getSettingsByCategory(): Promise<Record<string, any[]>>;
    static createAuditLog(data: z.infer<typeof createAuditLogSchema>): Promise<{
        user: {
            email: string;
            name: string;
            id: number;
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
    }>;
    static getAllAuditLogs(page?: number, limit?: number, filters?: {
        action?: string;
        entity?: string;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        logs: ({
            user: {
                email: string;
                name: string;
                id: number;
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
    static getAuditLogById(id: number): Promise<{
        user: {
            email: string;
            name: string;
            id: number;
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
    }>;
    static getAuditLogStats(): Promise<{
        totalLogs: number;
        logsToday: number;
        logsByAction: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.AuditLogGroupByOutputType, "action"[]> & {
            _count: {
                action: number;
            };
        })[];
        logsByEntity: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.AuditLogGroupByOutputType, "entity"[]> & {
            _count: {
                entity: number;
            };
        })[];
    }>;
    static logAction(action: string, entity: string, entityId?: string, oldData?: any, newData?: any, userId?: number, userAgent?: string, ipAddress?: string): Promise<void>;
    static getSystemInfo(): Promise<{
        users: {
            total: number;
            active: number;
            inactive: number;
        };
        system: {
            roles: number;
            modules: number;
            settings: number;
            auditLogs: number;
        };
        database: {
            status: string;
            lastCheck: Date;
        };
    }>;
}
//# sourceMappingURL=adminService.d.ts.map