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
      // Técnicos só veem qualificações que criaram, estão na equipe ou padrão (1,2,3).
      // Admin, coordenador, supervisor e editor veem todas.
      const userPermissions = (req as any).userPermissions;
      const canSeeAll = userPermissions?.canAccessAll || userPermissions?.isAdmin || userPermissions?.isCoordinator || userPermissions?.isSupervisor || userPermissions?.isEditor || false;

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

      // Se não for admin/supervisor/coordenador, filtrar para mostrar apenas as que criou + as padrão (1, 2, 3)
      if (!canSeeAll && req.user?.id) {
        const userId = typeof req.user.id === 'string' ? parseInt(req.user.id, 10) : req.user.id;
        if (!isNaN(userId)) {
          (filters as any).userId = userId;
          (filters as any).filterByUser = true;
        }
      }

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

      // Técnicos só podem acessar qualificações que criaram, estão na equipe ou padrão.
      const userPermissions = (req as any).userPermissions;
      const canSeeAll = userPermissions?.isAdmin || userPermissions?.isCoordinator || userPermissions?.isSupervisor || false;
      const isPadrao = id === 1 || id === 2 || id === 3;

      // Se não for admin/supervisor/coordenador, verificar se pode ver esta qualificação
      if (!canSeeAll) {
        const isCriador = qualificacao.created_by === req.user?.id;
        const qualificacaoData = qualificacao as any;
        const isMembroEquipe = qualificacaoData.equipe_tecnica?.some(
          (membro: any) => membro.id_tecnico === req.user?.id
        ) || false;

        // Pode ver se: é criador OU membro da equipe técnica OU é qualificação padrão
        if (!isCriador && !isMembroEquipe && !isPadrao) {
          res.status(HttpStatus.FORBIDDEN).json({
            success: false,
            error: {
              message: 'Acesso negado. Você só pode visualizar qualificações que criou, está vinculado ou as qualificações padrão do sistema.',
              statusCode: HttpStatus.FORBIDDEN
            },
            timestamp: new Date().toISOString()
          });
          return;
        }
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

      // Verificar permissões para edição
      const userPermissions = (req as any).userPermissions;
      const isAdmin = userPermissions?.isAdmin || false;

      // Qualificações padrão (1, 2, 3) só podem ser editadas por admin
      if ((id === 1 || id === 2 || id === 3) && !isAdmin) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Acesso negado. Apenas administradores podem editar qualificações padrão do sistema.',
            statusCode: HttpStatus.FORBIDDEN
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Para outras qualificações, verificar se é admin OU (criador OU membro da equipe técnica)
      if (!isAdmin) {
        const isCriador = oldData.created_by === req.user?.id;
        const qualificacaoData = oldData as any;
        const isMembroEquipe = qualificacaoData.equipe_tecnica?.some(
          (membro: any) => membro.id_tecnico === req.user?.id
        ) || false;

        if (!isCriador && !isMembroEquipe) {
          res.status(HttpStatus.FORBIDDEN).json({
            success: false,
            error: {
              message: 'Acesso negado. Apenas administradores, o criador e a equipe técnica podem editar esta qualificação.',
              statusCode: HttpStatus.FORBIDDEN
            },
            timestamp: new Date().toISOString()
          });
          return;
        }
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

      // Qualificações padrão (1, 2, 3) não podem ser excluídas
      if (id === 1 || id === 2 || id === 3) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Não é possível excluir qualificações padrão do sistema.',
            statusCode: HttpStatus.FORBIDDEN
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar permissões: apenas admin pode excluir qualquer qualificação,
      // outros só podem excluir se forem criador ou membro da equipe técnica
      const userPermissions = (req as any).userPermissions;
      const isAdmin = userPermissions?.isAdmin || false;

      if (!isAdmin) {
        const isCriador = oldData.created_by === req.user?.id;
        const qualificacaoData = oldData as any;
        const isMembroEquipe = qualificacaoData.equipe_tecnica?.some(
          (membro: any) => membro.id_tecnico === req.user?.id
        ) || false;

        if (!isCriador && !isMembroEquipe) {
          res.status(HttpStatus.FORBIDDEN).json({
            success: false,
            error: {
              message: 'Acesso negado. Apenas administradores, o criador e a equipe técnica podem excluir esta qualificação.',
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

  /**
   * POST /qualificacoes/:id/tecnicos
   */
  async addTecnico(req: AuthRequest, res: Response): Promise<void> {
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
      const { id_tecnico } = req.body;

      if (isNaN(id) || !id_tecnico) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID da qualificação e ID do técnico são obrigatórios',
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      await qualificacaoService.addTecnico(id, id_tecnico, req.user.id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Técnico adicionado à equipe com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * DELETE /qualificacoes/:id/tecnicos/:idTecnico
   */
  async removeTecnico(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const idTecnico = parseInt(req.params.idTecnico);

      if (isNaN(id) || isNaN(idTecnico)) {
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

      await qualificacaoService.removeTecnico(id, idTecnico);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Técnico removido da equipe com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /qualificacoes/:id/tecnicos
   */
  async listTecnicos(req: AuthRequest, res: Response): Promise<void> {
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

      const tecnicos = await qualificacaoService.listTecnicos(id);

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
   * GET /qualificacoes/tecnicos-disponiveis
   * Listar técnicos disponíveis para adicionar em equipes (acessível por técnicos)
   */
  async listTecnicosDisponiveis(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Verificar se o usuário tem permissão (deve ser técnico, coordenador, supervisor ou admin)
      const userPermissions = (req as any).userPermissions;
      const isAdmin = userPermissions?.isAdmin || false;
      const isSupervisor = userPermissions?.isSupervisor || false;
      const isCoordinator = userPermissions?.isCoordinator || false;
      const isTecnico = userPermissions?.isTechnician || false;

      if (!isAdmin && !isSupervisor && !isCoordinator && !isTecnico) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Acesso negado. Apenas técnicos, coordenadores, supervisores ou administradores podem acessar esta funcionalidade.',
            statusCode: HttpStatus.FORBIDDEN
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Buscar todos os usuários ativos com role 'tecnico' no módulo 'organizacoes'
      const tecnicos = await qualificacaoService.listTecnicosDisponiveis();

      res.status(HttpStatus.OK).json({
        success: true,
        data: tecnicos,
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
          message: error instanceof Error ? error.message : 'Erro interno do servidor',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * PATCH /qualificacoes/:id/validacao
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
            message: 'Apenas coordenadores e administradores podem validar qualificações',
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

      const qualificacao = await qualificacaoService.updateValidacao(id, dadosValidacao);

      // Registrar auditoria
      await auditService.createLog({
        action: AuditAction.UPDATE,
        entity: 'qualificacao',
        entityId: id.toString(),
        userId: req.user!.id,
        newData: dadosValidacao,
        req
      });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Validação atualizada com sucesso',
        data: qualificacao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /qualificacoes/:id/historico-validacao
   * Buscar histórico completo de validação de uma qualificação
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

      const historico = await qualificacaoService.getHistoricoValidacao(id);

      res.status(HttpStatus.OK).json({
        success: true,
        data: historico,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }
}

export const qualificacaoController = new QualificacaoController();

