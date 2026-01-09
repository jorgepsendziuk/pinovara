import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import capacitacaoService from '../services/capacitacaoService';
import { CapacitacaoFilters, CreateInscricaoData, CreatePresencaData } from '../types/capacitacao';
import { HttpStatus } from '../types/api';
import auditService from '../services/auditService';
import { AuditAction } from '../types/audit';

class CapacitacaoController {
  /**
   * GET /capacitacoes
   */
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Verificar se é admin ou supervisor
      const isAdmin = req.user?.roles?.some(role => 
        role.name === 'admin' && role.module.name === 'sistema'
      );
      const isSupervisor = req.user?.roles?.some(role => 
        role.name === 'supervisao' && role.module.name === 'organizacoes'
      );
      const canSeeAll = isAdmin || isSupervisor;

      const filters: CapacitacaoFilters = {
        id_qualificacao: req.query.id_qualificacao ? parseInt(req.query.id_qualificacao as string) : undefined,
        status: req.query.status as any,
        id_organizacao: req.query.id_organizacao ? parseInt(req.query.id_organizacao as string) : undefined,
        created_by: req.query.created_by ? parseInt(req.query.created_by as string) : undefined,
        data_inicio: req.query.data_inicio ? new Date(req.query.data_inicio as string) : undefined,
        data_fim: req.query.data_fim ? new Date(req.query.data_fim as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 
               req.query.pageSize ? parseInt(req.query.pageSize as string) : 10
      };

      // Se não for admin/supervisor, filtrar para mostrar apenas as que criou
      if (!canSeeAll && req.user?.id) {
        (filters as any).userId = req.user.id;
        (filters as any).filterByUser = true;
      }

      const result = await capacitacaoService.list(filters);

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
   * GET /capacitacoes/:id
   */
  async getById(req: AuthRequest, res: Response): Promise<void> {
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

      const capacitacao = await capacitacaoService.getById(id);

      if (!capacitacao) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Capacitação não encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar permissões de acesso
      const isAdmin = req.user?.roles?.some(role => 
        role.name === 'admin' && role.module.name === 'sistema'
      );
      const isSupervisor = req.user?.roles?.some(role => 
        role.name === 'supervisao' && role.module.name === 'organizacoes'
      );
      const canSeeAll = isAdmin || isSupervisor;

      // Se não for admin/supervisor, verificar se pode ver esta capacitação
      if (!canSeeAll && capacitacao.created_by !== req.user?.id) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Acesso negado. Você só pode visualizar capacitações que criou.',
            statusCode: HttpStatus.FORBIDDEN
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: capacitacao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * POST /capacitacoes
   */
  async create(req: AuthRequest, res: Response): Promise<void> {
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

      const capacitacao = await capacitacaoService.create(req.body, req.user.id);

      // Registrar log de auditoria
      await auditService.createLog({
        action: AuditAction.CREATE,
        entity: 'capacitacao',
        entityId: capacitacao.id?.toString(),
        newData: capacitacao,
        userId: req.user.id,
        req
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Capacitação criada com sucesso',
        data: capacitacao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PUT /capacitacoes/:id
   */
  async update(req: AuthRequest, res: Response): Promise<void> {
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

      // Buscar dados antigos para auditoria
      const oldData = await capacitacaoService.getById(id);
      if (!oldData) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Capacitação não encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const capacitacao = await capacitacaoService.update(id, req.body, req.user.id);

      // Registrar log de auditoria
      await auditService.createLog({
        action: AuditAction.UPDATE,
        entity: 'capacitacao',
        entityId: capacitacao.id?.toString(),
        oldData,
        newData: capacitacao,
        userId: req.user.id,
        req
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Capacitação atualizada com sucesso',
        data: capacitacao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * DELETE /capacitacoes/:id
   */
  async delete(req: AuthRequest, res: Response): Promise<void> {
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

      // Buscar dados para auditoria
      const oldData = await capacitacaoService.getById(id);
      if (!oldData) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Capacitação não encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      await capacitacaoService.delete(id);

      // Registrar log de auditoria
      await auditService.createLog({
        action: AuditAction.DELETE,
        entity: 'capacitacao',
        entityId: id.toString(),
        oldData,
        userId: req.user.id,
        req
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Capacitação excluída com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /capacitacoes/:id/inscricoes
   */
  async listInscricoes(req: AuthRequest, res: Response): Promise<void> {
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

      const inscricoes = await capacitacaoService.listInscricoes(id);

      res.status(HttpStatus.OK).json({
        success: true,
        data: inscricoes,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * POST /capacitacoes/:id/inscricoes
   */
  async createInscricao(req: AuthRequest, res: Response): Promise<void> {
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

      const inscricao = await capacitacaoService.createInscricao(id, req.body as CreateInscricaoData, req.user.id);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Inscrição criada com sucesso',
        data: inscricao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PUT /capacitacoes/:id/inscricoes/:inscricaoId
   */
  async updateInscricao(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const inscricaoId = parseInt(req.params.inscricaoId);
      
      if (isNaN(id) || isNaN(inscricaoId)) {
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

      const inscricao = await capacitacaoService.updateInscricao(id, inscricaoId, req.body as Partial<CreateInscricaoData>);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Inscrição atualizada com sucesso',
        data: inscricao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * DELETE /capacitacoes/:id/inscricoes/:inscricaoId
   */
  async deleteInscricao(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const inscricaoId = parseInt(req.params.inscricaoId);
      
      if (isNaN(id) || isNaN(inscricaoId)) {
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

      await capacitacaoService.deleteInscricao(id, inscricaoId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Inscrição excluída com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /capacitacoes/:id/presencas
   */
  async listPresencas(req: AuthRequest, res: Response): Promise<void> {
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

      const presencas = await capacitacaoService.listPresencas(id);

      res.status(HttpStatus.OK).json({
        success: true,
        data: presencas,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * POST /capacitacoes/:id/presencas
   */
  async createPresenca(req: AuthRequest, res: Response): Promise<void> {
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

      const presenca = await capacitacaoService.createPresenca(id, req.body as CreatePresencaData, req.user.id);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Presença registrada com sucesso',
        data: presenca,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PUT /capacitacoes/:id/presencas/:presencaId
   */
  async updatePresenca(req: AuthRequest, res: Response): Promise<void> {
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
      const idPresenca = parseInt(req.params.presencaId);
      
      if (isNaN(id) || isNaN(idPresenca)) {
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

      const presenca = await capacitacaoService.updatePresenca(id, idPresenca, req.body as Partial<CreatePresencaData>);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Presença atualizada com sucesso',
        data: presenca,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * DELETE /capacitacoes/:id/presencas/:presencaId
   */
  async deletePresenca(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const idPresenca = parseInt(req.params.presencaId);
      
      if (isNaN(id) || isNaN(idPresenca)) {
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

      await capacitacaoService.deletePresenca(id, idPresenca);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Presença excluída com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: any, res: Response): void {
    console.error('❌ [CapacitacaoController] Error:', error);
    
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

export const capacitacaoController = new CapacitacaoController();

