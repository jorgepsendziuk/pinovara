import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import avaliacaoService from '../services/avaliacaoService';
import { CreateAvaliacaoVersaoData, CreateAvaliacaoPerguntaData } from '../types/avaliacao';
import { HttpStatus } from '../types/api';
import auditService from '../services/auditService';
import { AuditAction } from '../types/audit';

class AvaliacaoController {
  /**
   * GET /avaliacoes/versoes
   */
  async listVersoes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const ativo = req.query.ativo === 'true' ? true : req.query.ativo === 'false' ? false : undefined;
      const versoes = await avaliacaoService.listVersoes(ativo);

      res.status(HttpStatus.OK).json({
        success: true,
        data: versoes,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /avaliacoes/versoes/ativa
   */
  async getVersaoAtiva(req: AuthRequest, res: Response): Promise<void> {
    try {
      const versao = await avaliacaoService.getVersaoAtiva();

      if (!versao) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Nenhuma versão ativa encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: versao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /avaliacoes/versoes/:id
   */
  async getVersaoById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID inválido',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const versao = await avaliacaoService.getVersaoById(id);

      if (!versao) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Versão não encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: versao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * POST /avaliacoes/versoes
   */
  async createVersao(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'Usuário não autenticado',
            statusCode: HttpStatus.UNAUTHORIZED
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const versao = await avaliacaoService.createVersao(req.body as CreateAvaliacaoVersaoData, req.user.id);

      // Registrar log de auditoria
      await auditService.createLog({
        action: AuditAction.CREATE,
        entity: 'avaliacao_versao',
        entityId: versao.id?.toString(),
        newData: versao,
        userId: req.user.id,
        req
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Versão de avaliação criada com sucesso',
        data: versao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PUT /avaliacoes/versoes/:id
   */
  async updateVersao(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'Usuário não autenticado',
            statusCode: HttpStatus.UNAUTHORIZED
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID inválido',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const oldData = await avaliacaoService.getVersaoById(id);
      if (!oldData) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Versão não encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const versao = await avaliacaoService.updateVersao(id, req.body, req.user.id);

      // Registrar log de auditoria
      await auditService.createLog({
        action: AuditAction.UPDATE,
        entity: 'avaliacao_versao',
        entityId: versao.id?.toString(),
        oldData,
        newData: versao,
        userId: req.user.id,
        req
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Versão de avaliação atualizada com sucesso',
        data: versao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /avaliacoes/versoes/:id/perguntas
   */
  async listPerguntas(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID inválido',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const perguntas = await avaliacaoService.listPerguntas(id);

      res.status(HttpStatus.OK).json({
        success: true,
        data: perguntas,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * POST /avaliacoes/versoes/:id/perguntas
   */
  async createPergunta(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID inválido',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const pergunta = await avaliacaoService.createPergunta(id, req.body as CreateAvaliacaoPerguntaData);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Pergunta criada com sucesso',
        data: pergunta,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PUT /avaliacoes/perguntas/:id
   */
  async updatePergunta(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID inválido',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const pergunta = await avaliacaoService.updatePergunta(id, req.body);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Pergunta atualizada com sucesso',
        data: pergunta,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * DELETE /avaliacoes/perguntas/:id
   */
  async deletePergunta(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID inválido',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      await avaliacaoService.deletePergunta(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Pergunta excluída com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /capacitacoes/:id/avaliacoes
   */
  async listAvaliacoes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID inválido',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const avaliacoes = await avaliacaoService.listAvaliacoes(id);

      res.status(HttpStatus.OK).json({
        success: true,
        data: avaliacoes,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /capacitacoes/:id/avaliacoes/estatisticas
   */
  async getEstatisticas(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID inválido',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const estatisticas = await avaliacaoService.getEstatisticas(id);

      res.status(HttpStatus.OK).json({
        success: true,
        data: estatisticas,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: any, res: Response): void {
    console.error('❌ [AvaliacaoController] Error:', error);
    
    if (error instanceof Error && 'statusCode' in error) {
      const apiError = error as any;
      res.status(apiError.statusCode || HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: apiError.message || 'Erro ao processar requisição',
          code: apiError.code,
          statusCode: apiError.statusCode || HttpStatus.INTERNAL_SERVER_ERROR
        },
        timestamp: new Date().toISOString()
      });
    } else {
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
}

export const avaliacaoController = new AvaliacaoController();

