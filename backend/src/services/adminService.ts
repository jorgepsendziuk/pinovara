import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
export const createSettingSchema = z.object({
  key: z.string().min(1, 'Chave é obrigatória'),
  value: z.string().min(1, 'Valor é obrigatório'),
  type: z.enum(['string', 'number', 'boolean', 'json']),
  description: z.string().optional(),
  category: z.string().default('general'),
});

export const updateSettingSchema = createSettingSchema.partial();

export const createAuditLogSchema = z.object({
  action: z.string().min(1, 'Ação é obrigatória'),
  entity: z.string().min(1, 'Entidade é obrigatória'),
  entityId: z.string().optional(),
  oldData: z.string().optional(),
  newData: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  userId: z.number().optional(),
});

export class AdminService {
  // System Settings Methods
  static async getAllSettings(category?: string) {
    const where = category ? { category, active: true } : { active: true };
    
    return prisma.systemSetting.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { key: 'asc' },
      ],
    });
  }

  static async getSettingByKey(key: string) {
    const setting = await prisma.systemSetting.findUnique({
      where: { key, active: true },
    });

    if (!setting) {
      throw new Error('Configuração não encontrada');
    }

    return setting;
  }

  static async createSetting(data: z.infer<typeof createSettingSchema>) {
    const validatedData = createSettingSchema.parse(data);

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

  static async updateSetting(key: string, data: z.infer<typeof updateSettingSchema>) {
    const validatedData = updateSettingSchema.parse(data);

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

  static async deleteSetting(key: string) {
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
    const grouped = settings.reduce((acc: Record<string, any[]>, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {});

    return grouped;
  }

  // Audit Logs Methods
  static async createAuditLog(data: z.infer<typeof createAuditLogSchema>) {
    const validatedData = createAuditLogSchema.parse(data);

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

  static async getAllAuditLogs(
    page: number = 1,
    limit: number = 50,
    filters?: {
      action?: string;
      entity?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
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

  static async getAuditLogById(id: number) {
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
    const [
      totalLogs,
      logsToday,
      logsByAction,
      logsByEntity,
    ] = await Promise.all([
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
  static async logAction(
    action: string,
    entity: string,
    entityId?: string,
    oldData?: any,
    newData?: any,
    userId?: number,
    userAgent?: string,
    ipAddress?: string
  ) {
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
    } catch (error) {
      console.error('Error creating audit log:', error);
      // Don't throw error to avoid breaking main operations
    }
  }

  // System Information
  static async getSystemInfo() {
    const [
      totalUsers,
      activeUsers,
      totalRoles,
      totalModules,
      totalSettings,
      totalLogs,
    ] = await Promise.all([
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