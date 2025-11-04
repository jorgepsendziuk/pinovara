import { Request, Response } from 'express';
import PlanoGestaoService from '../services/PlanoGestaoService';

class PlanoGestaoController {
  /**
   * GET /api/organizacoes/:id/plano-gestao
   * Busca o plano de gestão completo de uma organização
   */
  async getPlanoGestao(req: Request, res: Response): Promise<void> {
    try {
      const idOrganizacao = parseInt(req.params.id);

      if (isNaN(idOrganizacao)) {
        res.status(400).json({ 
          error: 'ID da organização inválido' 
        });
        return;
      }

      const planoGestao = await PlanoGestaoService.getPlanoGestao(idOrganizacao);
      
      res.status(200).json(planoGestao);
    } catch (error: any) {
      console.error('Erro ao buscar plano de gestão:', error);
      
      if (error.message === 'Organização não encontrada') {
        res.status(404).json({ error: error.message });
        return;
      }
      
      res.status(500).json({ 
        error: 'Erro ao buscar plano de gestão',
        details: error.message 
      });
    }
  }

  /**
   * PUT /api/organizacoes/:id/plano-gestao/rascunho
   * Atualiza o rascunho/notas colaborativas do plano de gestão
   */
  async updateRascunho(req: Request, res: Response): Promise<void> {
    try {
      const idOrganizacao = parseInt(req.params.id);
      const { rascunho } = req.body;
      const userId = (req as any).user?.id;

      if (isNaN(idOrganizacao)) {
        res.status(400).json({ 
          error: 'ID da organização inválido' 
        });
        return;
      }

      if (rascunho !== null && typeof rascunho !== 'string') {
        res.status(400).json({ 
          error: 'Rascunho deve ser uma string ou null' 
        });
        return;
      }

      if (!userId) {
        res.status(401).json({ 
          error: 'Usuário não autenticado' 
        });
        return;
      }

      await PlanoGestaoService.updateRascunho(idOrganizacao, rascunho, userId);
      
      res.status(200).json({ 
        message: 'Rascunho atualizado com sucesso' 
      });
    } catch (error: any) {
      console.error('Erro ao atualizar rascunho:', error);
      
      if (error.message === 'Organização não encontrada') {
        res.status(404).json({ error: error.message });
        return;
      }
      
      res.status(500).json({ 
        error: 'Erro ao atualizar rascunho',
        details: error.message 
      });
    }
  }

  /**
   * PUT /api/organizacoes/:id/plano-gestao/acoes/:idAcaoModelo
   * Cria ou atualiza uma ação específica (lazy creation)
   */
  async upsertAcao(req: Request, res: Response): Promise<void> {
    try {
      const idOrganizacao = parseInt(req.params.id);
      const idAcaoModelo = parseInt(req.params.idAcaoModelo);
      const dados = req.body;

      if (isNaN(idOrganizacao)) {
        res.status(400).json({ 
          error: 'ID da organização inválido' 
        });
        return;
      }

      if (isNaN(idAcaoModelo)) {
        res.status(400).json({ 
          error: 'ID da ação modelo inválido' 
        });
        return;
      }

      // Validar e converter datas se fornecidas
      const dadosProcessados: any = {};

      if ('responsavel' in dados) {
        dadosProcessados.responsavel = dados.responsavel;
      }

      if ('data_inicio' in dados) {
        dadosProcessados.data_inicio = dados.data_inicio 
          ? new Date(dados.data_inicio) 
          : null;
      }

      if ('data_termino' in dados) {
        dadosProcessados.data_termino = dados.data_termino 
          ? new Date(dados.data_termino) 
          : null;
      }

      if ('como_sera_feito' in dados) {
        dadosProcessados.como_sera_feito = dados.como_sera_feito;
      }

      if ('recursos' in dados) {
        dadosProcessados.recursos = dados.recursos;
      }

      await PlanoGestaoService.upsertAcao(
        idOrganizacao, 
        idAcaoModelo, 
        dadosProcessados
      );
      
      res.status(200).json({ 
        message: 'Ação atualizada com sucesso' 
      });
    } catch (error: any) {
      console.error('Erro ao atualizar ação:', error);
      
      if (error.message === 'Organização não encontrada' || 
          error.message === 'Ação modelo não encontrada') {
        res.status(404).json({ error: error.message });
        return;
      }
      
      res.status(500).json({ 
        error: 'Erro ao atualizar ação',
        details: error.message 
      });
    }
  }

  /**
   * DELETE /api/organizacoes/:id/plano-gestao/acoes/:idAcaoModelo
   * Deleta uma ação editável (volta ao estado inicial do template)
   */
  async deleteAcao(req: Request, res: Response): Promise<void> {
    try {
      const idOrganizacao = parseInt(req.params.id);
      const idAcaoModelo = parseInt(req.params.idAcaoModelo);

      if (isNaN(idOrganizacao)) {
        res.status(400).json({ 
          error: 'ID da organização inválido' 
        });
        return;
      }

      if (isNaN(idAcaoModelo)) {
        res.status(400).json({ 
          error: 'ID da ação modelo inválido' 
        });
        return;
      }

      await PlanoGestaoService.deleteAcao(idOrganizacao, idAcaoModelo);
      
      res.status(200).json({ 
        message: 'Ação deletada com sucesso' 
      });
    } catch (error: any) {
      console.error('Erro ao deletar ação:', error);
      
      res.status(500).json({ 
        error: 'Erro ao deletar ação',
        details: error.message 
      });
    }
  }
}

export default new PlanoGestaoController();

