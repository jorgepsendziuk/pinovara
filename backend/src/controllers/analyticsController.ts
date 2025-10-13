import { Response } from 'express';
import analyticsService from '../services/analyticsService';
import { HttpStatus } from '../types/api';
import { AuthRequest } from '../middleware/auth';

class AnalyticsController {
  /**
   * GET /api/admin/analytics/metrics
   * Buscar todas as métricas do sistema
   */
  async getMetrics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const metrics = await analyticsService.getSystemMetrics();

      res.status(HttpStatus.OK).json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Erro ao buscar métricas:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Erro ao buscar métricas do sistema',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        },
        timestamp: new Date().toISOString()
      });
    }
  }
}

export const analyticsController = new AnalyticsController();

