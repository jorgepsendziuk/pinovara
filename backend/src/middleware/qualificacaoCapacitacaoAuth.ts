import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { ErrorCode, HttpStatus } from '../types/api';
import { permissionService } from '../services/permissionService';

/**
 * Middleware para verificar permissões nas qualificações e capacitações baseado na role
 * Usa role_permissions se disponível; caso contrário fallback para lógica hardcoded
 */
export const checkQualificacaoCapacitacaoPermission = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
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

  const userId = typeof req.user.id === 'string' ? parseInt(req.user.id, 10) : req.user.id;
  const isAdmin = req.user.roles?.some((role: any) => role.name === 'admin' && role.module?.name === 'sistema');
  const isCoordinator = req.user.roles?.some((role: any) => role.name === 'coordenador' && role.module?.name === 'organizacoes');
  const isSupervisor = req.user.roles?.some((role: any) => role.name === 'supervisao' && role.module?.name === 'organizacoes');
  const isTechnician = req.user.roles?.some((role: any) => role.name === 'tecnico' && (role.module?.name === 'organizacoes' || role.module?.name === 'qualificacoes'));

  let canAccessAll: boolean;
  let canEdit: boolean;
  let canValidate: boolean;

  const useDb = await permissionService.hasRolePermissionsData(userId);
  if (useDb) {
    const codes = await permissionService.getEffectivePermissions(userId);
    canAccessAll = codes.includes('qualificacoes.list_all') || codes.includes('capacitacoes.list_all') || codes.includes('sistema.admin');
    canEdit = codes.includes('qualificacoes.edit') || codes.includes('capacitacoes.edit') || codes.includes('sistema.admin');
    canValidate = codes.includes('qualificacoes.validate') || codes.includes('capacitacoes.validate') || codes.includes('sistema.admin');
  } else {
    canAccessAll = isAdmin || isCoordinator || isSupervisor;
    canEdit = isAdmin || isTechnician;
    canValidate = isAdmin || isCoordinator;
  }

  (req as any).userPermissions = {
    isAdmin,
    isCoordinator,
    isSupervisor,
    isTechnician,
    canAccessAll,
    canEdit,
    canValidate,
    userId: req.user.id
  };

  next();
};

export default {
  checkQualificacaoCapacitacaoPermission
};
