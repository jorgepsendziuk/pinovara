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
      // Verificar se é admin ou supervisor
      const isAdmin = req.user?.roles?.some(role => 
        role.name === 'admin' && role.module.name === 'sistema'
      );
      const isSupervisor = req.user?.roles?.some(role => 
        role.name === 'supervisao' && role.module.name === 'organizacoes'
      );
      const canSeeAll = isAdmin || isSupervisor;

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

      // Se não for admin/supervisor, filtrar para mostrar apenas as que criou + as padrão (1, 2, 3)
      if (!canSeeAll && req.user?.id) {
        // Não aplicar filtro de created_by aqui, vamos filtrar no service
        // Passar informação de que precisa filtrar
        (filters as any).userId = req.user.id;
        (filters as any).filterByUser = true;
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

      // Verificar permissões de acesso
      const isAdmin = req.user?.roles?.some(role => 
        role.name === 'admin' && role.module.name === 'sistema'
      );
      const isSupervisor = req.user?.roles?.some(role => 
        role.name === 'supervisao' && role.module.name === 'organizacoes'
      );
      const canSeeAll = isAdmin || isSupervisor;
      const isPadrao = id === 1 || id === 2 || id === 3;

      // Se não for admin/supervisor, verificar se pode ver esta qualificação
      if (!canSeeAll && !isPadrao && qualificacao.created_by !== req.user?.id) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Acesso negado. Você só pode visualizar qualificações que criou ou as qualificações padrão do sistema.',
            statusCode: HttpStatus.FORBIDDEN
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

      // Verificar permissões para edição de qualificações padrão (1, 2, 3)
      const isAdmin = req.user.roles?.some(role => 
        role.name === 'admin' && role.module.name === 'sistema'
      );
      const isSupervisor = req.user.roles?.some(role => 
        role.name === 'supervisao' && role.module.name === 'organizacoes'
      );

      // Qualificações padrão só podem ser editadas por admin ou supervisor
      if ((id === 1 || id === 2 || id === 3) && !isAdmin && !isSupervisor) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Acesso negado. Apenas administradores e supervisores podem editar qualificações padrão do sistema.',
            statusCode: HttpStatus.FORBIDDEN
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
      // Verificar se o usuário tem permissão (deve ser técnico, admin ou supervisor)
      const isAdmin = req.user?.roles?.some(role =>
        role.name === 'admin' && role.module.name === 'sistema'
      );
      const isSupervisor = req.user?.roles?.some(role =>
        role.name === 'supervisor' && role.module.name === 'organizacoes'
      );
      const isTecnico = req.user?.roles?.some(role =>
        role.name === 'tecnico' && role.module.name === 'organizacoes'
      );

      if (!isAdmin && !isSupervisor && !isTecnico) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Acesso negado. Apenas técnicos, supervisores ou administradores podem acessar esta funcionalidade.',
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
}

export const qualificacaoController = new QualificacaoController();

