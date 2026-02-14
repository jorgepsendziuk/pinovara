import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { HttpStatus, ErrorCode } from '../types/api';
import { permissionService } from '../services/permissionService';

/**
 * Middleware para verificar permissões do módulo de Supervisão Ocupacional
 * Usa role_permissions se disponível; caso contrário fallback para lógica hardcoded
 */
export const checkSupervisaoOcupacionalPermission = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user;

    if (!user) {
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

    const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
    const isSystemAdmin = user.roles?.some((role: any) => role.module?.name === 'sistema' && role.name === 'admin');
    const isModuleAdmin = user.roles?.some((role: any) => role.module?.name === 'supervisao_ocupacional' && role.name === 'admin');
    const isCoordinator = user.roles?.some((role: any) => role.module?.name === 'supervisao_ocupacional' && role.name === 'coordenador');
    const isSupervisor = user.roles?.some((role: any) => role.module?.name === 'supervisao_ocupacional' && role.name === 'supervisor');
    const isTechnician = user.roles?.some((role: any) => role.module?.name === 'supervisao_ocupacional' && role.name === 'tecnico');
    const isEstagiario = user.roles?.some((role: any) => role.module?.name === 'supervisao_ocupacional' && role.name === 'estagiario');

    const hasPermission = isSystemAdmin || isModuleAdmin || isCoordinator || isSupervisor || isTechnician || isEstagiario;

    if (!hasPermission) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          message: 'Acesso negado ao módulo de Supervisão Ocupacional',
          code: ErrorCode.INSUFFICIENT_PERMISSIONS,
          statusCode: HttpStatus.FORBIDDEN
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    let canViewAll: boolean;
    let canEdit: boolean;
    let canValidate: boolean;
    let canViewOwnOnly: boolean;

    const useDb = await permissionService.hasRolePermissionsData(userId);
    if (useDb) {
      const codes = await permissionService.getEffectivePermissions(userId);
      canViewAll = codes.includes('supervisao.view_all') || codes.includes('sistema.admin');
      canEdit = codes.includes('supervisao.edit') || codes.includes('sistema.admin');
      canValidate = codes.includes('supervisao.validate') || codes.includes('sistema.admin');
      canViewOwnOnly = codes.includes('supervisao.view_own_only');
    } else {
      canViewAll = isSystemAdmin || isModuleAdmin || isCoordinator || isSupervisor || isTechnician;
      canEdit = isSystemAdmin || isModuleAdmin || isTechnician;
      canValidate = isSystemAdmin || isModuleAdmin || isCoordinator;
      canViewOwnOnly = isTechnician || isEstagiario;
    }

    (req as any).userPermissions = {
      userId: user.id,
      roles: user.roles,
      isSystemAdmin,
      isModuleAdmin,
      isCoordinator,
      isSupervisor,
      isTechnician,
      isEstagiario,
      canViewAll,
      canEdit,
      canValidate,
      canViewOwnOnly
    };

    next();
  } catch (error) {
    console.error('Erro no middleware de permissões:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: 'Erro ao verificar permissões',
        code: ErrorCode.INTERNAL_ERROR,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      },
      timestamp: new Date().toISOString()
    });
  }
};
