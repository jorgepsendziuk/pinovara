import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { ErrorCode, HttpStatus } from '../types/api';

/**
 * Middleware para verificar se o usuário autenticado tem permissão de administrador
 * Deve ser usado após o middleware authenticateToken
 */
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
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

  // Verificar se o usuário tem o papel 'admin' no módulo 'sistema'
  const hasAdminRole = req.user.roles?.some(role => 
    role.name === 'admin' && role.module.name === 'sistema'
  );

  if (!hasAdminRole) {
    console.warn(`⚠️ [AdminAuth] Access denied for user ${req.user.id} (${req.user.email}) - No admin role`);
    
    res.status(HttpStatus.FORBIDDEN).json({
      success: false,
      error: {
        message: 'Acesso negado. Requer privilégios de administrador',
        code: ErrorCode.INSUFFICIENT_PERMISSIONS,
        statusCode: HttpStatus.FORBIDDEN,
        details: {
          required: 'admin role in sistema module',
          userRoles: req.user.roles?.map(r => `${r.name} (${r.module.name})`) || []
        }
      },
      timestamp: new Date().toISOString()
    });
    return;
  }

  console.log(`✅ [AdminAuth] Admin access granted for user ${req.user.id} (${req.user.email})`);
  next();
};

/**
 * Middleware para verificar se o usuário tem qualquer permissão administrativa
 * (admin ou moderator no módulo sistema)
 */
export const requireModerator = (req: AuthRequest, res: Response, next: NextFunction): void => {
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

  // Verificar se o usuário tem papel 'admin' ou 'moderator' no módulo 'sistema'
  const hasModeratorRole = req.user.roles?.some(role => 
    (role.name === 'admin' || role.name === 'moderator') && role.module.name === 'sistema'
  );

  if (!hasModeratorRole) {
    console.warn(`⚠️ [AdminAuth] Moderator access denied for user ${req.user.id} (${req.user.email})`);
    
    res.status(HttpStatus.FORBIDDEN).json({
      success: false,
      error: {
        message: 'Acesso negado. Requer privilégios de moderador ou administrador',
        code: ErrorCode.INSUFFICIENT_PERMISSIONS,
        statusCode: HttpStatus.FORBIDDEN,
        details: {
          required: 'admin or moderator role in sistema module',
          userRoles: req.user.roles?.map(r => `${r.name} (${r.module.name})`) || []
        }
      },
      timestamp: new Date().toISOString()
    });
    return;
  }

  console.log(`✅ [AdminAuth] Moderator access granted for user ${req.user.id} (${req.user.email})`);
  next();
};
