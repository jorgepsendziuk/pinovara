import { Request, Response } from 'express';
import { fotoSyncService } from '../services/fotoSyncService';

export const fotoSyncController = {
  /**
   * POST /api/organizacoes/:id/fotos/sync
   * Sincroniza fotos do ODK para organização
   */
  async sync(req: Request, res: Response) {
    try {
      const organizacaoId = parseInt(req.params.id);
      const userEmail = (req as any).user?.email || 'sistema';

      if (isNaN(organizacaoId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de organização inválido'
        });
      }

      const resultado = await fotoSyncService.syncFotosFromODK(organizacaoId, userEmail);

      console.log('📸 Resultado da sincronização:', {
        total_odk: resultado.total_odk,
        ja_existentes: resultado.ja_existentes,
        baixadas: resultado.baixadas,
        erros: resultado.erros
      });

      res.json({
        success: resultado.success,
        data: resultado
      });

    } catch (error: any) {
      console.error('Erro ao sincronizar fotos:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao sincronizar fotos do ODK'
      });
    }
  },

  /**
   * GET /api/organizacoes/:id/fotos/odk-disponiveis
   * Lista fotos disponíveis no ODK (sem sincronizar)
   */
  async listODKAvailable(req: Request, res: Response) {
    try {
      const organizacaoId = parseInt(req.params.id);

      if (isNaN(organizacaoId)) {
        return res.status(400).json({
          success: false,
          error: 'ID de organização inválido'
        });
      }

      const resultado = await fotoSyncService.listarFotosDisponiveis(organizacaoId);

      res.json({
        success: true,
        data: resultado
      });

    } catch (error: any) {
      console.error('Erro ao listar fotos ODK:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao listar fotos disponíveis no ODK'
      });
    }
  }
};

