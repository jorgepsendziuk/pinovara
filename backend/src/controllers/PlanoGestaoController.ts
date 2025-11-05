import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import PlanoGestaoService from '../services/PlanoGestaoService';
import { AuthRequest } from '../middleware/auth';

// Pasta para arquivos de evidências do plano de gestão
const UPLOAD_DIR = process.env.NODE_ENV === 'production' 
  ? '/var/pinovara/shared/uploads/plano-gestao' 
  : '/Users/jorgepsendziuk/Documents/pinovara/uploads/plano-gestao';

// Configurar storage do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Criar pasta se não existir
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const idOrganizacao = req.params.id;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const nomeOriginalLimpo = path.basename(file.originalname, ext)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9]/g, '-')   // Substitui especiais por hífen
      .replace(/-+/g, '-')              // Remove hífens duplicados
      .replace(/^-|-$/g, '')            // Remove hífens início/fim
      .toLowerCase()
      .substring(0, 50);
    const nomeArquivoFinal = `org${idOrganizacao}-${nomeOriginalLimpo}-${timestamp}${ext}`;
    cb(null, nomeArquivoFinal);
  }
});

// Configurar upload - aceita qualquer tipo de arquivo (sem filtro)
export const uploadEvidencia = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

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

  /**
   * PUT /api/organizacoes/:id/plano-gestao/relatorio-sintetico
   * Atualiza o relatório sintético do plano de gestão
   */
  async updateRelatorioSintetico(req: Request, res: Response): Promise<void> {
    try {
      const idOrganizacao = parseInt(req.params.id);
      const { relatorio } = req.body;
      const userId = (req as any).user?.id;

      if (isNaN(idOrganizacao)) {
        res.status(400).json({ 
          error: 'ID da organização inválido' 
        });
        return;
      }

      if (relatorio !== null && typeof relatorio !== 'string') {
        res.status(400).json({ 
          error: 'Relatório deve ser uma string ou null' 
        });
        return;
      }

      if (!userId) {
        res.status(401).json({ 
          error: 'Usuário não autenticado' 
        });
        return;
      }

      await PlanoGestaoService.updateRelatorioSintetico(idOrganizacao, relatorio, userId);
      
      res.status(200).json({ 
        message: 'Relatório sintético atualizado com sucesso' 
      });
    } catch (error: any) {
      console.error('Erro ao atualizar relatório sintético:', error);
      
      if (error.message === 'Organização não encontrada') {
        res.status(404).json({ error: error.message });
        return;
      }
      
      res.status(500).json({ 
        error: 'Erro ao atualizar relatório sintético',
        details: error.message 
      });
    }
  }

  /**
   * POST /api/organizacoes/:id/plano-gestao/evidencias
   * Faz upload de uma evidência (foto ou lista de presença)
   */
  async uploadEvidencia(req: AuthRequest, res: Response): Promise<void> {
    try {
      const idOrganizacao = parseInt(req.params.id);
      const file = req.file;
      const { tipo, descricao } = req.body;

      if (isNaN(idOrganizacao)) {
        res.status(400).json({ 
          error: 'ID da organização inválido' 
        });
        return;
      }

      if (!file) {
        res.status(400).json({ 
          error: 'Nenhum arquivo foi enviado' 
        });
        return;
      }

      if (!tipo || (tipo !== 'foto' && tipo !== 'lista_presenca')) {
        res.status(400).json({ 
          error: 'Tipo deve ser "foto" ou "lista_presenca"' 
        });
        return;
      }

      if (!req.user?.id) {
        res.status(401).json({ 
          error: 'Usuário não autenticado' 
        });
        return;
      }

      const caminhoArquivo = path.join(UPLOAD_DIR, file.filename);
      const evidencia = await PlanoGestaoService.uploadEvidencia(
        idOrganizacao,
        tipo as 'foto' | 'lista_presenca',
        file.originalname,
        caminhoArquivo,
        descricao || null,
        req.user.id
      );
      
      res.status(201).json({ 
        message: 'Evidência enviada com sucesso',
        evidencia: evidencia
      });
    } catch (error: any) {
      console.error('Erro ao fazer upload de evidência:', error);
      
      // Se o arquivo foi salvo mas houve erro, tentar remover
      if (req.file) {
        const filePath = path.join(UPLOAD_DIR, req.file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      
      if (error.message === 'Organização não encontrada') {
        res.status(404).json({ error: error.message });
        return;
      }
      
      res.status(500).json({ 
        error: 'Erro ao fazer upload de evidência',
        details: error.message 
      });
    }
  }

  /**
   * GET /api/organizacoes/:id/plano-gestao/evidencias
   * Lista todas as evidências de uma organização
   */
  async listEvidencias(req: Request, res: Response): Promise<void> {
    try {
      const idOrganizacao = parseInt(req.params.id);

      if (isNaN(idOrganizacao)) {
        res.status(400).json({ 
          error: 'ID da organização inválido' 
        });
        return;
      }

      const evidencias = await PlanoGestaoService.listEvidencias(idOrganizacao);
      
      res.status(200).json(evidencias);
    } catch (error: any) {
      console.error('Erro ao listar evidências:', error);
      
      res.status(500).json({ 
        error: 'Erro ao listar evidências',
        details: error.message 
      });
    }
  }

  /**
   * DELETE /api/organizacoes/:id/plano-gestao/evidencias/:idEvidencia
   * Deleta uma evidência
   */
  async deleteEvidencia(req: AuthRequest, res: Response): Promise<void> {
    try {
      const idEvidencia = parseInt(req.params.idEvidencia);

      if (isNaN(idEvidencia)) {
        res.status(400).json({ 
          error: 'ID da evidência inválido' 
        });
        return;
      }

      const { caminhoArquivo } = await PlanoGestaoService.deleteEvidencia(idEvidencia);
      
      // Remover arquivo físico
      if (fs.existsSync(caminhoArquivo)) {
        fs.unlinkSync(caminhoArquivo);
      }
      
      res.status(200).json({ 
        message: 'Evidência deletada com sucesso' 
      });
    } catch (error: any) {
      console.error('Erro ao deletar evidência:', error);
      
      if (error.message === 'Evidência não encontrada') {
        res.status(404).json({ error: error.message });
        return;
      }
      
      res.status(500).json({ 
        error: 'Erro ao deletar evidência',
        details: error.message 
      });
    }
  }

  /**
   * GET /api/organizacoes/:id/plano-gestao/evidencias/:idEvidencia/download
   * Faz download de uma evidência
   */
  async downloadEvidencia(req: Request, res: Response): Promise<void> {
    try {
      const idEvidencia = parseInt(req.params.idEvidencia);
      const idOrganizacao = parseInt(req.params.id);

      if (isNaN(idEvidencia)) {
        res.status(400).json({ 
          error: 'ID da evidência inválido' 
        });
        return;
      }

      if (isNaN(idOrganizacao)) {
        res.status(400).json({ 
          error: 'ID da organização inválido' 
        });
        return;
      }

      const evidencias = await PlanoGestaoService.listEvidencias(idOrganizacao);
      const evidencia = evidencias.find(ev => ev.id === idEvidencia);

      if (!evidencia) {
        res.status(404).json({ 
          error: 'Evidência não encontrada' 
        });
        return;
      }

      if (!fs.existsSync(evidencia.caminho_arquivo)) {
        res.status(404).json({ 
          error: 'Arquivo não encontrado no servidor' 
        });
        return;
      }

      res.download(evidencia.caminho_arquivo, evidencia.nome_arquivo);
    } catch (error: any) {
      console.error('Erro ao fazer download de evidência:', error);
      
      res.status(500).json({ 
        error: 'Erro ao fazer download de evidência',
        details: error.message 
      });
    }
  }
}

export default new PlanoGestaoController();

