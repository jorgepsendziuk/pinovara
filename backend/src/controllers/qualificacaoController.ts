import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import qualificacaoService from '../services/qualificacaoService';
import { QualificacaoFilters } from '../types/qualificacao';
import { HttpStatus } from '../types/api';
import auditService from '../services/auditService';
import { AuditAction } from '../types/audit';

class QualificacaoController {
  /**
   * GET /qualificacoes
   */
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filters: QualificacaoFilters = {
        titulo: req.query.titulo as string,
        ativo: req.query.ativo === 'true' ? true : req.query.ativo === 'false' ? false : undefined,
        id_organizacao: req.query.id_organizacao ? parseInt(req.query.id_organizacao as string) : undefined,
        id_instrutor: req.query.id_instrutor ? parseInt(req.query.id_instrutor as string) : undefined,
        created_by: req.query.created_by ? parseInt(req.query.created_by as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 
               req.query.pageSize ? parseInt(req.query.pageSize as string) : 10
      };

      const result = await qualificacaoService.list(filters);

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
   * GET /qualificacoes/:id
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

      const qualificacao = await qualificacaoService.getById(id);

      if (!qualificacao) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Qualificação não encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: qualificacao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * POST /qualificacoes
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

      const qualificacao = await qualificacaoService.create(req.body, req.user.id);

      // Registrar log de auditoria
      await auditService.createLog({
        action: AuditAction.CREATE,
        entity: 'qualificacao',
        entityId: qualificacao.id?.toString(),
        newData: qualificacao,
        userId: req.user.id,
        req
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Qualificação criada com sucesso',
        data: qualificacao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PUT /qualificacoes/:id
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
      const oldData = await qualificacaoService.getById(id);
      if (!oldData) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Qualificação não encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const qualificacao = await qualificacaoService.update(id, req.body, req.user.id);

      // Registrar log de auditoria
      await auditService.createLog({
        action: AuditAction.UPDATE,
        entity: 'qualificacao',
        entityId: qualificacao.id?.toString(),
        oldData,
        newData: qualificacao,
        userId: req.user.id,
        req
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Qualificação atualizada com sucesso',
        data: qualificacao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * DELETE /qualificacoes/:id
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
      const oldData = await qualificacaoService.getById(id);
      if (!oldData) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Qualificação não encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar permissões: admin pode excluir qualquer qualificação,
      // técnico só pode excluir qualificações que criou
      const isAdmin = req.user.roles?.some(role => 
        role.name === 'admin' && role.module.name === 'sistema'
      );

      if (!isAdmin) {
        // Se não é admin, verificar se é o criador da qualificação
        if (oldData.created_by !== req.user.id) {
          res.status(HttpStatus.FORBIDDEN).json({
            success: false,
            error: {
              message: 'Acesso negado. Você só pode excluir qualificações que criou.',
              statusCode: HttpStatus.FORBIDDEN
            },
            timestamp: new Date().toISOString()
          });
          return;
        }
      }

      await qualificacaoService.delete(id);

      // Registrar log de auditoria
      await auditService.createLog({
        action: AuditAction.DELETE,
        entity: 'qualificacao',
        entityId: id.toString(),
        oldData,
        userId: req.user.id,
        req
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Qualificação excluída com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private handleError(error: any, res: Response): void {
    console.error('❌ [QualificacaoController] Error:', error);
    
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

export const qualificacaoController = new QualificacaoController();

