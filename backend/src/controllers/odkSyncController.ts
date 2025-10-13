import { Request, Response } from 'express';
import odkSyncService from '../services/odkSyncService';

export const odkSyncController = {
  /**
   * POST /admin/odk/sync-all
   * Sincroniza fotos e arquivos de todas as organizações
   */
  async syncAll(req: Request, res: Response) {
    try {
      console.log('🚀 Iniciando sincronização em massa via API...');
      
      const resultado = await odkSyncService.syncAll();

      res.json({
        success: true,
        message: `Sincronização concluída: ${resultado.total_fotos} fotos e ${resultado.total_arquivos} arquivos`,
        data: resultado,
      });
    } catch (error: any) {
      console.error('Erro na sincronização em massa:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao sincronizar organizações',
      });
    }
  },

  /**
   * GET /admin/odk/stats
   * Retorna estatísticas de fotos/arquivos
   */
  async getStats(req: Request, res: Response) {
    try {
      const stats = await odkSyncService.getStats();

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar estatísticas',
      });
    }
  },
};

