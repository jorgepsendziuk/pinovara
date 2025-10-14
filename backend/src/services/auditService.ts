import { PrismaClient } from '@prisma/client';
import { Request } from 'express';
import { AuditLogData, AuditAction } from '../types/audit';

const prisma = new PrismaClient();

class AuditService {
  /**
   * Criar log de auditoria
   */
  async createLog(data: AuditLogData & { req?: Request }): Promise<void> {
    try {
      const { action, entity, entityId, oldData, newData, userId, req } = data;
      
      // Capturar IP e User-Agent do request se disponível
      const ipAddress = req?.ip || req?.connection?.remoteAddress || 'unknown';
      const userAgent = req?.get('User-Agent') || 'unknown';

      // Criar diff apenas dos campos alterados para UPDATE
      let processedOldData = oldData;
      let processedNewData = newData;

      if (action === AuditAction.UPDATE && oldData && newData) {
        const diff = this.createDiff(oldData, newData);
        processedOldData = diff.oldData;
        processedNewData = diff.newData;
      }

      await prisma.audit_logs.create({
        data: {
          action,
          entity,
          entityId: entityId?.toString(),
          oldData: processedOldData ? JSON.stringify(processedOldData) : null,
          newData: processedNewData ? JSON.stringify(processedNewData) : null,
          userId,
          ipAddress,
          userAgent,
          createdAt: new Date()
        }
      });

      console.log(`✅ [AuditService] Log created: ${action} on ${entity}${entityId ? ` (ID: ${entityId})` : ''}`);
    } catch (error) {
      console.error('❌ [AuditService] Error creating audit log:', error);
      // Não falhar a operação principal se o log falhar
    }
  }

  /**
   * Criar diff entre dados antigos e novos (apenas campos alterados)
   */
  private createDiff(oldData: any, newData: any): { oldData: any; newData: any } {
    const diff: any = { oldData: {}, newData: {} };
    
    // Comparar apenas campos que existem em ambos os objetos
    const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
    
    for (const key of allKeys) {
      const oldValue = oldData?.[key];
      const newValue = newData?.[key];
      
      // Só incluir no diff se os valores forem diferentes
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        diff.oldData[key] = oldValue;
        diff.newData[key] = newValue;
      }
    }
    
    return diff;
  }

  /**
   * Buscar logs de auditoria com filtros
   */
  async getAuditLogs(filters: {
    action?: string;
    entity?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      action,
      entity,
      userId,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = filters;

    const where: any = {};

    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (userId) where.userId = userId;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.audit_logs.findMany({
        where,
        include: {
          users: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.audit_logs.count({ where })
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Buscar estatísticas de auditoria
   */
  async getAuditStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalLogs,
      logsToday,
      logsByAction,
      logsByEntity
    ] = await Promise.all([
      prisma.audit_logs.count(),
      prisma.audit_logs.count({
        where: {
          createdAt: {
            gte: today
          }
        }
      }),
      prisma.audit_logs.groupBy({
        by: ['action'],
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } }
      }),
      prisma.audit_logs.groupBy({
        by: ['entity'],
        _count: { entity: true },
        orderBy: { _count: { entity: 'desc' } }
      })
    ]);

    return {
      totalLogs,
      logsToday,
      logsByAction,
      logsByEntity
    };
  }

  /**
   * Exportar logs para CSV
   */
  async exportAuditLogs(filters: {
    action?: string;
    entity?: string;
    userId?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = {};

    if (filters.action) where.action = filters.action;
    if (filters.entity) where.entity = filters.entity;
    if (filters.userId) where.userId = filters.userId;
    
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const logs = await prisma.audit_logs.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Converter para CSV
    const csvHeaders = [
      'ID',
      'Data/Hora',
      'Ação',
      'Entidade',
      'ID da Entidade',
      'Usuário',
      'Email do Usuário',
      'IP',
      'User Agent'
    ];

    const csvRows = logs.map(log => [
      log.id,
      log.createdAt.toISOString(),
      log.action,
      log.entity,
      log.entityId || '',
      log.users?.name || 'Sistema',
      log.users?.email || '',
      log.ipAddress || '',
      log.userAgent || ''
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }
}

export default new AuditService();
