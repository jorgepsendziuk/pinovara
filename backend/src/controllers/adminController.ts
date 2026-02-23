import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import adminService from '../services/adminService';
import { permissionService } from '../services/permissionService';
import { ErrorCode, HttpStatus } from '../types/api';
import { ApiError } from '../utils/ApiError';
import auditService from '../services/auditService';
import { AuditAction } from '../types/audit';

class AdminController {
  /**
   * GET /admin/users
   * Listar todos os usuários
   */
  async getUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await adminService.getAllUsers();

      res.json({
        success: true,
        message: 'Usuários listados com sucesso',
        data: {
          users,
          total: users.length,
          active: users.filter(u => u.active).length,
          inactive: users.filter(u => !u.active).length,
          withRoles: users.filter(u => u.roles.length > 0).length
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [AdminController] Error in getUsers:', error);
      
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode
          },
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: {
            message: 'Erro interno do servidor',
            code: ErrorCode.INTERNAL_ERROR,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR
          },
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * GET /admin/users/:id
   * Buscar usuário específico
   */
  async getUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID de usuário inválido',
            code: ErrorCode.VALIDATION_ERROR,
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const user = await adminService.getUserById(userId);

      if (!user) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          error: {
            message: 'Usuário não encontrado',
            code: ErrorCode.RESOURCE_NOT_FOUND,
            statusCode: HttpStatus.NOT_FOUND
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.json({
        success: true,
        message: 'Usuário encontrado',
        data: { user },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * POST /admin/users
   * Criar novo usuário
   */
  async createUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, name, active = true } = req.body;

      const user = await adminService.createUser({
        email,
        password,
        name,
        active
      });

      // Registrar log de auditoria
      await auditService.createLog({
        action: AuditAction.CREATE,
        entity: 'users',
        entityId: user.id?.toString(),
        newData: user,
        userId: req.user?.id,
        req
      });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: { user },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * PUT /admin/users/:id
   * Atualizar usuário
   */
  async updateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID de usuário inválido',
            code: ErrorCode.VALIDATION_ERROR,
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { email, name, active, password } = req.body;

      // Capturar dados antes da atualização para auditoria
      const userAntes = await adminService.getUserById(userId);
      const user = await adminService.updateUser(userId, {
        email,
        name,
        active,
        password
      });

      // Registrar log de auditoria
      await auditService.createLog({
        action: AuditAction.UPDATE,
        entity: 'users',
        entityId: userId.toString(),
        oldData: userAntes,
        newData: user,
        userId: req.user?.id,
        req
      });

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: { user },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * DELETE /admin/users/:id
   * Deletar usuário
   */
  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = req.user?.id;

      if (isNaN(userId)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID de usuário inválido',
            code: ErrorCode.VALIDATION_ERROR,
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Proteção: não pode deletar a si mesmo
      if (userId === currentUserId) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Não é possível deletar seu próprio usuário',
            code: ErrorCode.INSUFFICIENT_PERMISSIONS,
            statusCode: HttpStatus.FORBIDDEN
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Capturar dados antes da exclusão para auditoria
      const userAntes = await adminService.getUserById(userId);
      await adminService.deleteUser(userId);

      // Registrar log de auditoria
      await auditService.createLog({
        action: AuditAction.DELETE,
        entity: 'users',
        entityId: userId.toString(),
        oldData: userAntes,
        userId: req.user?.id,
        req
      });

      res.json({
        success: true,
        message: 'Usuário deletado com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * PUT /admin/users/:id/status
   * Atualizar status do usuário (ativo/inativo)
   */
  async updateUserStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const currentUserId = req.user?.id;
      const { active } = req.body;

      if (isNaN(userId)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID de usuário inválido',
            code: ErrorCode.VALIDATION_ERROR,
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (typeof active !== 'boolean') {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Status deve ser booleano (true/false)',
            code: ErrorCode.VALIDATION_ERROR,
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Proteção: não pode desativar a si mesmo
      if (userId === currentUserId && !active) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Não é possível desativar seu próprio usuário',
            code: ErrorCode.INSUFFICIENT_PERMISSIONS,
            statusCode: HttpStatus.FORBIDDEN
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const user = await adminService.updateUserStatus(userId, active);

      res.json({
        success: true,
        message: `Usuário ${active ? 'ativado' : 'desativado'} com sucesso`,
        data: { user },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * POST /admin/users/:id/roles
   * Atribuir role a usuário
   */
  async assignRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const { roleId } = req.body;

      if (isNaN(userId)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID de usuário inválido',
            code: ErrorCode.VALIDATION_ERROR,
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      if (!roleId || isNaN(parseInt(roleId))) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'ID de papel é obrigatório',
            code: ErrorCode.MISSING_REQUIRED_FIELD,
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      await adminService.assignRoleToUser(userId, parseInt(roleId));

      res.json({
        success: true,
        message: 'Papel atribuído com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * DELETE /admin/users/:id/roles/:roleId
   * Remover role de usuário
   */
  async removeRole(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const roleId = parseInt(req.params.roleId);

      if (isNaN(userId) || isNaN(roleId)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'IDs de usuário e papel devem ser válidos',
            code: ErrorCode.VALIDATION_ERROR,
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      await adminService.removeRoleFromUser(userId, roleId);

      res.json({
        success: true,
        message: 'Papel removido com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * GET /admin/modules
   * Listar todos os módulos
   */
  async getModules(req: AuthRequest, res: Response): Promise<void> {
    try {
      const modules = await adminService.getAllModules();

      res.json({
        success: true,
        message: 'Módulos listados com sucesso',
        data: { modules },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * POST /admin/modules
   * Criar novo módulo
   */
  async createModule(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;

      const module = await adminService.createModule({ name, description });

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Módulo criado com sucesso',
        data: { module },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * PUT /admin/modules/:id
   * Atualizar módulo
   */
  async updateModule(req: AuthRequest, res: Response): Promise<void> {
    try {
      const moduleId = parseInt(req.params.id);
      if (isNaN(moduleId)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: { message: 'ID de módulo inválido', statusCode: HttpStatus.BAD_REQUEST },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const { name, description } = req.body;

      const module = await adminService.updateModule(moduleId, { name, description });

      res.json({
        success: true,
        message: 'Módulo atualizado com sucesso',
        data: { module },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * DELETE /admin/modules/:id
   * Excluir módulo
   */
  async deleteModule(req: AuthRequest, res: Response): Promise<void> {
    try {
      const moduleId = parseInt(req.params.id);
      if (isNaN(moduleId)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: { message: 'ID de módulo inválido', statusCode: HttpStatus.BAD_REQUEST },
          timestamp: new Date().toISOString()
        });
        return;
      }

      await adminService.deleteModule(moduleId);

      res.json({
        success: true,
        message: 'Módulo excluído com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * GET /admin/roles
   * Listar todas as roles disponíveis
   */
  async getRoles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const roles = await adminService.getAllRoles();

      res.json({
        success: true,
        message: 'Papéis listados com sucesso',
        data: {
          roles,
          total: roles.length
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * GET /admin/permissions/full
   * Listar permissões + role_permissions em uma única chamada (menos requisições)
   */
  async getPermissionsFull(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { permissions, rolePermissions } = await permissionService.getPermissionsFull();
      res.json({
        success: true,
        message: 'Permissões listadas',
        data: { permissions, rolePermissions },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * GET /admin/permissions
   * Listar todas as permissões do catálogo
   */
  async getPermissions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const permissions = await permissionService.getAllPermissions();
      res.json({
        success: true,
        message: 'Permissões listadas com sucesso',
        data: { permissions },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * GET /admin/roles/:roleId/permissions
   * Obter permissões de um role
   */
  async getRolePermissions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.roleId);
      if (isNaN(roleId)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: { message: 'ID de role inválido', statusCode: HttpStatus.BAD_REQUEST },
          timestamp: new Date().toISOString()
        });
        return;
      }
      const permissions = await permissionService.getPermissionsByRole(roleId);
      res.json({
        success: true,
        message: 'Permissões do role listadas',
        data: { permissions },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * PUT /admin/roles/:roleId/permissions
   * Atualizar permissões de um role
   * Body: { updates: Array<{ permissionId: number; enabled: boolean }> }
   */
  async updateRolePermissions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const roleId = parseInt(req.params.roleId);
      if (isNaN(roleId)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: { message: 'ID de role inválido', statusCode: HttpStatus.BAD_REQUEST },
          timestamp: new Date().toISOString()
        });
        return;
      }
      const { updates } = req.body;
      if (!Array.isArray(updates)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: { message: 'Body deve conter updates (array)', statusCode: HttpStatus.BAD_REQUEST },
          timestamp: new Date().toISOString()
        });
        return;
      }
      await permissionService.updateRolePermissions(roleId, updates);
      res.json({
        success: true,
        message: 'Permissões atualizadas com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  /**
   * Tratamento de erro padrão
   */
  private handleError(res: Response, error: unknown): void {
    console.error('❌ [AdminController] Error:', error);
    
    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: {
          message: 'Erro interno do servidor',
          code: ErrorCode.INTERNAL_ERROR,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        },
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * POST /admin/impersonate/:userId
   * Personificar um usuário
   */
  async impersonateUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const adminUser = req.user;

      if (!adminUser) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'Usuário não autenticado',
            code: ErrorCode.AUTHENTICATION_REQUIRED,
            statusCode: HttpStatus.UNAUTHORIZED
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Verificar se o admin tem permissão
      const isAdmin = adminUser.roles?.some(role =>
        role.name === 'admin' && role.module.name === 'sistema'
      );

      if (!isAdmin) {
        res.status(HttpStatus.FORBIDDEN).json({
          success: false,
          error: {
            message: 'Apenas administradores podem personificar usuários',
            code: ErrorCode.INSUFFICIENT_PERMISSIONS,
            statusCode: HttpStatus.FORBIDDEN
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Não permitir personificar a si mesmo
      if (adminUser.id === parseInt(userId)) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          error: {
            message: 'Não é possível personificar a si mesmo',
            code: ErrorCode.VALIDATION_ERROR,
            statusCode: HttpStatus.BAD_REQUEST
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Gerar token para o usuário personificado
      const impersonationData = await adminService.generateImpersonationToken(parseInt(userId), adminUser);

      res.json({
        success: true,
        message: 'Token de personificação gerado com sucesso',
        data: {
          token: impersonationData.token,
          user: impersonationData.user,
          impersonatedBy: adminUser.name,
          expiresAt: impersonationData.expiresAt
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ [AdminController] Error in impersonateUser:', error);

      if (error instanceof ApiError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            message: error.message,
            code: error.code,
            statusCode: error.statusCode
          },
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: {
            message: 'Erro interno do servidor',
            code: ErrorCode.INTERNAL_ERROR,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR
          },
          timestamp: new Date().toISOString()
        });
      }
    }
  }
}

export default new AdminController();
