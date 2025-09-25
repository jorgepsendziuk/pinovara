import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { ErrorCode, HttpStatus } from '../types/api';

/**
 * Middleware para verificar se o usuário tem role específico
 */
export const requireRole = (moduleName: string, roleName: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
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

    const hasRole = req.user.roles?.some(role => 
      role.name === roleName && role.module.name === moduleName
    );

    if (!hasRole) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          message: `Acesso negado. Requer role '${roleName}' no módulo '${moduleName}'`,
          code: ErrorCode.INSUFFICIENT_PERMISSIONS,
          statusCode: HttpStatus.FORBIDDEN,
          details: {
            required: `${roleName} role in ${moduleName} module`,
            userRoles: req.user.roles?.map(r => `${r.name} (${r.module.name})`) || []
          }
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar se usuário é técnico
 */
export const requireTechnician = requireRole('organizacoes', 'tecnico');

/**
 * Middleware para verificar permissões nas organizações baseado na role
 */
export const checkOrganizacaoPermission = (req: AuthRequest, res: Response, next: NextFunction): void => {
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

  // Verificar se é admin (acesso total)
  const isAdmin = req.user.roles?.some(role => 
    role.name === 'admin' && role.module.name === 'sistema'
  );

  // Verificar se é técnico
  const isTechnician = req.user.roles?.some(role => 
    role.name === 'tecnico' && role.module.name === 'organizacoes'
  );

  // Adicionar informações sobre permissões à requisição
  (req as any).userPermissions = {
    isAdmin,
    isTechnician,
    canAccessAll: isAdmin,
    userId: req.user.id
  };

  next();
};

/**
 * Helper para verificar se usuário tem acesso a uma organização específica
 */
export const hasAccessToOrganizacao = (
  userPermissions: any, 
  organizacao: { id_tecnico?: number | null }
): boolean => {
  // Admin tem acesso a tudo
  if (userPermissions.canAccessAll) {
    return true;
  }

  // Técnico só tem acesso às organizações que ele criou
  if (userPermissions.isTechnician) {
    return organizacao.id_tecnico === userPermissions.userId;
  }

  // Por padrão, não tem acesso
  return false;
};

export default {
  requireRole,
  requireTechnician,
  checkOrganizacaoPermission,
  hasAccessToOrganizacao
};
