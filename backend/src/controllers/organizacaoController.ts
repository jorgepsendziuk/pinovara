import { Response } from 'express';
import organizacaoService from '../services/organizacaoService';
import { ApiError } from '../utils/ApiError';
import { OrganizacaoFilters } from '../types/organizacao';
import { HttpStatus } from '../types/api';
import { AuthRequest } from '../middleware/auth';
import { extractEmailFromCreatorUri } from '../utils/odkHelper';
import auditService from '../services/auditService';
import { AuditAction } from '../types/audit';
import { hasAccessToOrganizacao } from '../middleware/roleAuth';

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
        userId: userPermissions?.userId,
        // Incluir organizações removidas se o parâmetro for 'true'
        incluirRemovidas: req.query.incluirRemovidas === 'true'
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

      if (!this.verificarAcessoTecnico(userPermissions, organizacao, req)) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Acesso negado. Técnicos só podem acessar organizações criadas por eles ou onde foram autorizados.',
            statusCode: HttpStatus.FORBIDDEN
          },
          timestamp: new Date().toISOString()
        });
        return;
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
        let organizacaoExistente;
        try {
          organizacaoExistente = await organizacaoService.getById(id);
        } catch (error: any) {
          if (error instanceof ApiError && error.statusCode === HttpStatus.NOT_FOUND) {
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
          throw error;
        }

        if (!this.verificarAcessoTecnico(userPermissions, organizacaoExistente, req)) {
          res.status(HttpStatus.FORBIDDEN).json({
            success: false,
            error: {
              message: 'Acesso negado. Técnicos só podem editar organizações criadas por eles ou onde foram autorizados.',
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
   * GET /organizacoes/:id/historico-validacao
   * Buscar histórico completo de validação de uma organização
   */
  async getHistoricoValidacao(req: AuthRequest, res: Response): Promise<void> {
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

      const historico = await organizacaoService.getHistoricoValidacao(id);

      res.status(HttpStatus.OK).json({
        success: true,
        data: historico,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
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
   * GET /organizacoes/:id/tecnicos
   */
  async listEquipeTecnica(req: AuthRequest, res: Response): Promise<void> {
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

      if (!this.verificarAcessoTecnico(userPermissions, organizacao, req)) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Sem permissão para visualizar a equipe técnica desta organização.',
            statusCode: HttpStatus.FORBIDDEN
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: organizacao.equipe_tecnica || [],
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /organizacoes/:id/tecnicos/disponiveis
   */
  async listTecnicosDisponiveis(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const search = req.query.search as string | undefined;
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

      if (!this.podeGerenciarEquipe(userPermissions, organizacao)) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Sem permissão para gerenciar a equipe técnica desta organização.',
            statusCode: HttpStatus.FORBIDDEN
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const tecnicos = await organizacaoService.listarTecnicosDisponiveis(id, search);

      res.status(HttpStatus.OK).json({
        success: true,
        data: tecnicos,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * POST /organizacoes/:id/tecnicos
   */
  async addTecnicoEquipe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { id_tecnico, tecnicoId } = req.body || {};
      const tecnicoIdNumero = parseInt(
        id_tecnico !== undefined ? id_tecnico : tecnicoId
      );
      const userPermissions = (req as any).userPermissions;

      if (isNaN(id)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID da organização é obrigatório',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (isNaN(tecnicoIdNumero)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID do técnico é obrigatório',
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

      if (!this.podeGerenciarEquipe(userPermissions, organizacao)) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Sem permissão para adicionar técnicos nesta organização.',
            statusCode: HttpStatus.FORBIDDEN
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const membro = await organizacaoService.adicionarTecnicoEquipe(
        id,
        tecnicoIdNumero,
        req.user?.id ?? null
      );

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Técnico adicionado com sucesso',
        data: membro,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * DELETE /organizacoes/:id/tecnicos/:idTecnico
   */
  async removeTecnicoEquipe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const tecnicoId = parseInt(req.params.idTecnico);
      const userPermissions = (req as any).userPermissions;

      if (isNaN(id) || isNaN(tecnicoId)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'IDs inválidos',
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

      if (!this.podeGerenciarEquipe(userPermissions, organizacao)) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Sem permissão para remover técnicos desta organização.',
            statusCode: HttpStatus.FORBIDDEN
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      await organizacaoService.removerTecnicoEquipe(id, tecnicoId);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Técnico removido com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  private verificarAcessoTecnico(userPermissions: any, organizacao: any, req: AuthRequest): boolean {
    if (!userPermissions?.isTechnician || userPermissions?.canAccessAll) {
      return true;
    }

    const equipe = Array.isArray(organizacao.equipe_tecnica)
      ? organizacao.equipe_tecnica.map((m: any) => ({ id_tecnico: m.id_tecnico }))
      : Array.isArray(organizacao.organizacao_tecnico)
        ? organizacao.organizacao_tecnico.map((m: any) => ({ id_tecnico: m.id_tecnico }))
        : [];

    if (
      hasAccessToOrganizacao(userPermissions, {
        id_tecnico: organizacao.id_tecnico,
        equipe_tecnica: equipe
      })
    ) {
      return true;
    }

    if (organizacao.creator_uri_user) {
      const creatorEmail = extractEmailFromCreatorUri(organizacao.creator_uri_user);
      if (creatorEmail && creatorEmail === req.user?.email?.toLowerCase()) {
        return true;
      }
    }

    return false;
  }

  private podeGerenciarEquipe(userPermissions: any, organizacao: any): boolean {
    if (!userPermissions) return false;
    if (!userPermissions.canEdit) return false;
    if (userPermissions.isAdmin) return true;
    return organizacao.id_tecnico === userPermissions.userId;
  }

  /**
   * Tratar erros de forma padronizada
   */
  private handleError(error: any, res: Response): void {
    console.error('Organizacao Controller Error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);

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

    // Erro genérico - incluir mais informações em desenvolvimento
    const isDevelopment = process.env.NODE_ENV !== 'production';
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: isDevelopment ? (error.message || 'Erro interno do servidor') : 'Erro interno do servidor',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        ...(isDevelopment && {
          details: {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        })
      },
      timestamp: new Date().toISOString()
    });
  }
}

export const organizacaoController = new OrganizacaoController();