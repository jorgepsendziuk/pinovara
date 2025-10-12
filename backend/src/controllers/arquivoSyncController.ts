import { Request, Response } from 'express';
import { arquivoSyncService } from '../services/arquivoSyncService';

export const arquivoSyncController = {
  /**
   * Sincroniza arquivos do ODK para uma organização
   */
  async syncFromODK(req: Request, res: Response) {
    try {
      const organizacaoId = parseInt(req.params.id);
      const userEmail = (req as any).user?.email || 'sistema';
      
      console.log(`🔄 Iniciando sincronização de arquivos ODK para organização ${organizacaoId} por ${userEmail}`);
      
      const result = await arquivoSyncService.syncArquivosFromODK(organizacaoId, userEmail);
      
      console.log(`✅ Sincronização de arquivos concluída:`, {
        total_odk: result.total_odk,
        baixadas: result.baixadas,
        ja_existentes: result.ja_existentes,
        erros: result.erros
      });
      
      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('❌ Erro no controller de sincronização de arquivos:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  /**
   * Lista arquivos disponíveis no ODK para uma organização
   */
  async listODKAvailable(req: Request, res: Response) {
    try {
      const organizacaoId = parseInt(req.params.id);
      
      console.log(`🔍 Listando arquivos ODK disponíveis para organização ${organizacaoId}`);
      
      const arquivos = await arquivoSyncService.listarArquivosDisponiveis(organizacaoId);
      
      console.log(`📊 ${arquivos.length} arquivos encontrados no ODK`);
      
      res.json({
        success: true,
        data: {
          total: arquivos.length,
          arquivos: arquivos.map(arquivo => ({
            uri: arquivo.uri,
            nome_arquivo: arquivo.nome_arquivo,
            tamanho_bytes: arquivo.tamanho_bytes,
            arquivo_obs: arquivo.arquivo_obs,
            creation_date: arquivo.creation_date
          }))
        }
      });
    } catch (error: any) {
      console.error('❌ Erro ao listar arquivos ODK disponíveis:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};
