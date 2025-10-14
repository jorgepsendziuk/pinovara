import { Response } from 'express';
import auditService from '../services/auditService';
import { HttpStatus } from '../types/api';
import { AuthRequest } from '../middleware/auth';

class AuditController {
  /**
   * GET /admin/audit-logs
   * Listar logs de auditoria com filtros
   */
  async getAuditLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        action,
        entity,
        userId,
        startDate,
        endDate,
        page = 1,
        limit = 20
      } = req.query;

      const filters = {
        action: action as string,
        entity: entity as string,
        userId: userId ? parseInt(userId as string) : undefined,
        startDate: startDate as string,
        endDate: endDate as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string)
      };

      const result = await auditService.getAuditLogs(filters);

      res.status(HttpStatus.OK).json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /admin/audit-logs/stats
   * Buscar estatísticas de auditoria
   */
  async getAuditStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await auditService.getAuditStats();

      res.status(HttpStatus.OK).json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /admin/audit-logs/export
   * Exportar logs de auditoria para CSV
   */
  async exportAuditLogs(req: AuthRequest, res: Response): Promise<void> {
    try {
      const {
        action,
        entity,
        userId,
        startDate,
        endDate
      } = req.query;

      const filters = {
        action: action as string,
        entity: entity as string,
        userId: userId ? parseInt(userId as string) : undefined,
        startDate: startDate as string,
        endDate: endDate as string
      };

      const csvContent = await auditService.exportAuditLogs(filters);

      // Configurar headers para download
      const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.status(HttpStatus.OK).send(csvContent);
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Tratar erros de forma padronizada
   */
  private handleError(error: any, res: Response): void {
    console.error('❌ [AuditController] Error:', error);
    
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: 'Erro interno do servidor',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      },
      timestamp: new Date().toISOString()
    });
  }
}

export default new AuditController();
