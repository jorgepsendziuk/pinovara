import { Response } from 'express';
import organizacaoService from '../services/organizacaoService';
import { ApiError } from '../services/authService';
import { OrganizacaoFilters } from '../types/organizacao';
import { HttpStatus } from '../types/api';
import { AuthRequest } from '../middleware/auth';
import { extractEmailFromCreatorUri } from '../utils/odkHelper';
import auditService from '../services/auditService';
import { AuditAction } from '../types/audit';

class OrganizacaoController {
  /**
   * GET /organizacoes
   */
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Verificar permissões do usuário
      const userPermissions = (req as any).userPermissions;
      
      const filters: OrganizacaoFilters = {
        nome: req.query.nome as string,
        cnpj: req.query.cnpj as string,
        estado: req.query.estado ? parseInt(req.query.estado as string) : undefined,
        municipio: req.query.municipio ? parseInt(req.query.municipio as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        // Aceitar tanto 'limit' quanto 'pageSize'
        limit: req.query.limit ? parseInt(req.query.limit as string) : 
               req.query.pageSize ? parseInt(req.query.pageSize as string) : 10,
        // Passar userId para filtro híbrido (id_tecnico OU email em _creator_uri_user)
        userId: userPermissions?.userId
      };

      const result = await organizacaoService.list(filters);

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
   * GET /organizacoes/:id
   */
  async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userPermissions = (req as any).userPermissions;

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

      const organizacao = await organizacaoService.getById(id);

      if (!organizacao) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Organização não encontrada',
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar se técnico tem acesso a esta organização (filtro híbrido)
      if (userPermissions?.isTechnician && !userPermissions?.canAccessAll) {
        let temAcesso = false;
        
        // Opção 1: id_tecnico bate
        if (organizacao.id_tecnico === userPermissions.userId) {
          temAcesso = true;
        }
        
        // Opção 2: email no _creator_uri_user bate
        if (!temAcesso && organizacao.creator_uri_user) {
          const creatorEmail = extractEmailFromCreatorUri(organizacao.creator_uri_user);
          if (creatorEmail && creatorEmail === req.user?.email?.toLowerCase()) {
            temAcesso = true;
          }
        }
        
        if (!temAcesso) {
          res.status(HttpStatus.FORBIDDEN).json({
            success: false,
            error: {
              message: 'Acesso negado. Técnicos só podem acessar organizações criadas por eles.',
              statusCode: HttpStatus.FORBIDDEN
            },
            timestamp: new Date().toISOString()
          });
          return;
        }
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: organizacao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * POST /organizacoes
   */
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userPermissions = (req as any).userPermissions;
      
      // Verificar se usuário pode editar (coordenador não pode criar)
      if (!userPermissions?.canEdit) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Sem permissão para criar organizações',
            statusCode: HttpStatus.FORBIDDEN
          },
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      // Automaticamente definir id_tecnico com o usuário que está criando
      // (seja técnico, admin ou qualquer outro)
      const data = {
        ...req.body,
        ...(userPermissions?.userId && {
          id_tecnico: userPermissions.userId
        })
      };

      const organizacao = await organizacaoService.create(data);

      // Registrar log de auditoria
      await auditService.createLog({
        action: AuditAction.CREATE,
        entity: 'organizacao',
        entityId: organizacao.id?.toString(),
        newData: organizacao,
        userId: req.user?.id,
        req
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Organização criada com sucesso',
        data: organizacao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PUT /organizacoes/:id
   */
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const data = req.body;
      const userPermissions = (req as any).userPermissions;

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

      // Verificar se usuário pode editar (coordenador não pode editar)
      if (!userPermissions?.canEdit) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Sem permissão para editar organizações',
            statusCode: HttpStatus.FORBIDDEN
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar se técnico tem acesso a esta organização antes de atualizar (filtro híbrido)
      if (userPermissions?.isTechnician && !userPermissions?.canAccessAll) {
        const organizacaoExistente = await organizacaoService.getById(id);
        if (!organizacaoExistente) {
          res.status(HttpStatus.NOT_FOUND).json({
            success: false,
            error: {
              message: 'Organização não encontrada',
              statusCode: HttpStatus.NOT_FOUND
            },
            timestamp: new Date().toISOString()
          });
          return;
        }
        
        let temAcesso = false;
        
        // Opção 1: id_tecnico bate
        if (organizacaoExistente.id_tecnico === userPermissions.userId) {
          temAcesso = true;
        }
        
        // Opção 2: email no _creator_uri_user bate
        if (!temAcesso && organizacaoExistente.creator_uri_user) {
          const creatorEmail = extractEmailFromCreatorUri(organizacaoExistente.creator_uri_user);
          if (creatorEmail && creatorEmail === req.user?.email?.toLowerCase()) {
            temAcesso = true;
          }
        }
        
        if (!temAcesso) {
          res.status(HttpStatus.FORBIDDEN).json({
            success: false,
            error: {
              message: 'Acesso negado. Técnicos só podem editar organizações criadas por eles.',
              statusCode: HttpStatus.FORBIDDEN
            },
            timestamp: new Date().toISOString()
          });
          return;
        }
      }

      // Capturar dados antes da atualização para auditoria
      const organizacaoAntes = await organizacaoService.getById(id);
      const organizacao = await organizacaoService.update(id, data);

      // Registrar log de auditoria
      await auditService.createLog({
        action: AuditAction.UPDATE,
        entity: 'organizacao',
        entityId: id.toString(),
        oldData: organizacaoAntes,
        newData: organizacao,
        userId: req.user?.id,
        req
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Organização atualizada com sucesso',
        data: organizacao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PATCH /organizacoes/:id/validacao
   * Atualizar apenas campos de validação (permitido para coordenadores)
   */
  async updateValidacao(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { validacao_status, validacao_obs, validacao_usuario } = req.body;
      const userPermissions = (req as any).userPermissions;

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

      // Verificar se usuário é coordenador ou admin (supervisor NÃO pode validar)
      if (!userPermissions?.isCoordinator && !userPermissions?.isAdmin) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Apenas coordenadores e administradores podem validar organizações',
            statusCode: HttpStatus.FORBIDDEN
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Atualizar apenas campos de validação
      const dadosValidacao = {
        validacao_status: validacao_status || null,
        validacao_obs: validacao_obs || null,
        validacao_usuario: validacao_usuario || req.user?.id || null,
        validacao_data: new Date()
      };

      const organizacao = await organizacaoService.updateValidacao(id, dadosValidacao);

      // Registrar auditoria
      await auditService.createLog({
        action: AuditAction.UPDATE,
        entity: 'organizacao',
        entityId: id.toString(),
        userId: req.user!.id,
        newData: dadosValidacao,
        req
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Validação atualizada com sucesso',
        data: organizacao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * DELETE /organizacoes/:id
   */
  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const userPermissions = (req as any).userPermissions;

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

      // Verificar se usuário pode editar (coordenador não pode deletar)
      if (!userPermissions?.canEdit) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Sem permissão para excluir organizações',
            statusCode: HttpStatus.FORBIDDEN
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Capturar dados antes da exclusão para auditoria
      const organizacaoAntes = await organizacaoService.getById(id);
      await organizacaoService.delete(id);

      // Registrar log de auditoria
      await auditService.createLog({
        action: AuditAction.DELETE,
        entity: 'organizacao',
        entityId: id.toString(),
        oldData: organizacaoAntes,
        userId: req.user?.id,
        req
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Organização removida com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /organizacoes/dashboard
   * Agora com filtro híbrido para técnicos
   */
  async getDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userPermissions = (req as any).userPermissions;
      
      // Passar userId para aplicar filtro híbrido se necessário
      const stats = await organizacaoService.getDashboardStats(userPermissions?.userId);

      res.status(HttpStatus.OK).json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /organizacoes/estados
   */
  async getEstados(req: AuthRequest, res: Response): Promise<void> {
    try {
      const estados = await organizacaoService.getEstados();

      res.status(HttpStatus.OK).json({
        success: true,
        data: estados,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Organizacao Controller Error:', error);
      this.handleError(error, res);
    }
  }

  /**
   * GET /organizacoes/municipios/:estadoId?
   */
  async getMunicipios(req: AuthRequest, res: Response): Promise<void> {
    try {
      const estadoId = req.params.estadoId ? parseInt(req.params.estadoId) : undefined;

      const municipios = await organizacaoService.getMunicipios(estadoId);

      res.status(HttpStatus.OK).json({
        success: true,
        data: municipios,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Organizacao Controller Error:', error);
      this.handleError(error, res);
    }
  }

  /**
   * Tratar erros de forma padronizada
   */
  private handleError(error: any, res: Response): void {
    console.error('Organizacao Controller Error:', error);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          message: error.message,
          statusCode: error.statusCode,
          code: error.code,
          details: error.details
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Erro genérico
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

export const organizacaoController = new OrganizacaoController();