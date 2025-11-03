import { Request, Response } from 'express';
import { assinaturaSyncService } from '../services/assinaturaSyncService';

export const assinaturaSyncController = {
  /**
   * POST /api/organizacoes/:id/assinaturas/sync
   * Sincroniza assinaturas do ODK para organização
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

      const resultado = await assinaturaSyncService.syncAssinaturasFromODK(organizacaoId, userEmail);

      console.log('✍️ Resultado da sincronização de assinaturas:', {
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
      console.error('Erro ao sincronizar assinaturas:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao sincronizar assinaturas do ODK'
      });
    }
  },

  /**
   * GET /api/organizacoes/:id/assinaturas/odk-disponiveis
   * Lista assinaturas disponíveis no ODK (sem sincronizar)
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

      const resultado = await assinaturaSyncService.listarAssinaturasDisponiveis(organizacaoId);

      res.json({
        success: true,
        data: resultado
      });

    } catch (error: any) {
      console.error('Erro ao listar assinaturas ODK:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao listar assinaturas disponíveis no ODK'
      });
    }
  }
};


