"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = exports.createAuditLogSchema = exports.updateSettingSchema = exports.createSettingSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
// Validation schemas
exports.createSettingSchema = zod_1.z.object({
    key: zod_1.z.string().min(1, 'Chave é obrigatória'),
    value: zod_1.z.string().min(1, 'Valor é obrigatório'),
    type: zod_1.z.enum(['string', 'number', 'boolean', 'json']),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().default('general'),
});
exports.updateSettingSchema = exports.createSettingSchema.partial();
exports.createAuditLogSchema = zod_1.z.object({
    action: zod_1.z.string().min(1, 'Ação é obrigatória'),
    entity: zod_1.z.string().min(1, 'Entidade é obrigatória'),
    entityId: zod_1.z.string().optional(),
    oldData: zod_1.z.string().optional(),
    newData: zod_1.z.string().optional(),
    userAgent: zod_1.z.string().optional(),
    ipAddress: zod_1.z.string().optional(),
    userId: zod_1.z.number().optional(),
});
class AdminService {
    // System Settings Methods
    static async getAllSettings(category) {
        const where = category ? { category, active: true } : { active: true };
        return prisma.systemSetting.findMany({
            where,
            orderBy: [
                { category: 'asc' },
                { key: 'asc' },
            ],
        });
    }
    static async getSettingByKey(key) {
        const setting = await prisma.systemSetting.findUnique({
            where: { key, active: true },
        });
        if (!setting) {
            throw new Error('Configuração não encontrada');
        }
        return setting;
    }
    static async createSetting(data) {
        const validatedData = exports.createSettingSchema.parse(data);
        // Check if setting already exists
        const existingSetting = await prisma.systemSetting.findUnique({
            where: { key: validatedData.key },
        });
        if (existingSetting) {
            throw new Error('Configuração já existe com esta chave');
        }
        return prisma.systemSetting.create({
            data: validatedData,
        });
    }
    static async updateSetting(key, data) {
        const validatedData = exports.updateSettingSchema.parse(data);
        const setting = await prisma.systemSetting.findUnique({
            where: { key },
        });
        if (!setting) {
            throw new Error('Configuração não encontrada');
        }
        return prisma.systemSetting.update({
            where: { key },
            data: validatedData,
        });
    }
    static async deleteSetting(key) {
        const setting = await prisma.systemSetting.findUnique({
            where: { key },
        });
        if (!setting) {
            throw new Error('Configuração não encontrada');
        }
        return prisma.systemSetting.update({
            where: { key },
            data: { active: false },
        });
    }
    static async getSettingsByCategory() {
        const settings = await prisma.systemSetting.findMany({
            where: { active: true },
            orderBy: [
                { category: 'asc' },
                { key: 'asc' },
            ],
        });
        // Group by category
        const grouped = settings.reduce((acc, setting) => {
            if (!acc[setting.category]) {
                acc[setting.category] = [];
            }
            acc[setting.category].push(setting);
            return acc;
        }, {});
        return grouped;
    }
    // Audit Logs Methods
    static async createAuditLog(data) {
        const validatedData = exports.createAuditLogSchema.parse(data);
        return prisma.auditLog.create({
            data: validatedData,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });
    }
    static async getAllAuditLogs(page = 1, limit = 50, filters) {
        const skip = (page - 1) * limit;
        const where = {};
        if (filters?.action) {
            where.action = { contains: filters.action, mode: 'insensitive' };
        }
        if (filters?.entity) {
            where.entity = { contains: filters.entity, mode: 'insensitive' };
        }
        if (filters?.userId) {
            where.userId = filters.userId;
        }
        if (filters?.startDate || filters?.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.createdAt.lte = filters.endDate;
            }
        }
        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                skip,
                take: limit,
            }),
            prisma.auditLog.count({ where }),
        ]);
        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    static async getAuditLogById(id) {
        const log = await prisma.auditLog.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    },
                },
            },
        });
        if (!log) {
            throw new Error('Log de auditoria não encontrado');
        }
        return log;
    }
    static async getAuditLogStats() {
        const [totalLogs, logsToday, logsByAction, logsByEntity,] = await Promise.all([
            // Total logs
            prisma.auditLog.count(),
            // Logs today
            prisma.auditLog.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),
            // Logs by action (top 10)
            prisma.auditLog.groupBy({
                by: ['action'],
                _count: {
                    action: true,
                },
                orderBy: {
                    _count: {
                        action: 'desc',
                    },
                },
                take: 10,
            }),
            // Logs by entity (top 10)
            prisma.auditLog.groupBy({
                by: ['entity'],
                _count: {
                    entity: true,
                },
                orderBy: {
                    _count: {
                        entity: 'desc',
                    },
                },
                take: 10,
            }),
        ]);
        return {
            totalLogs,
            logsToday,
            logsByAction,
            logsByEntity,
        };
    }
    // Helper method to log actions automatically
    static async logAction(action, entity, entityId, oldData, newData, userId, userAgent, ipAddress) {
        try {
            await this.createAuditLog({
                action,
                entity,
                entityId,
                oldData: oldData ? JSON.stringify(oldData) : undefined,
                newData: newData ? JSON.stringify(newData) : undefined,
                userId,
                userAgent,
                ipAddress,
            });
        }
        catch (error) {
            console.error('Error creating audit log:', error);
            // Don't throw error to avoid breaking main operations
        }
    }
    // System Information
    static async getSystemInfo() {
        const [totalUsers, activeUsers, totalRoles, totalModules, totalSettings, totalLogs,] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { active: true } }),
            prisma.role.count({ where: { active: true } }),
            prisma.module.count({ where: { active: true } }),
            prisma.systemSetting.count({ where: { active: true } }),
            prisma.auditLog.count(),
        ]);
        return {
            users: {
                total: totalUsers,
                active: activeUsers,
                inactive: totalUsers - activeUsers,
            },
            system: {
                roles: totalRoles,
                modules: totalModules,
                settings: totalSettings,
                auditLogs: totalLogs,
            },
            database: {
                status: 'connected',
                lastCheck: new Date(),
            },
        };
    }
}
exports.AdminService = AdminService;
//# sourceMappingURL=adminService.js.map