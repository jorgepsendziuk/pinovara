import { Request, Response, NextFunction } from 'express';
import { verifyToken, AuthPayload, hasPermission, hasAnyPermission, getUserById } from '../services/authService';

// ========== EXTENSÃO DO REQUEST ==========

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

// ========== MIDDLEWARE DE AUTENTICAÇÃO ==========

/**
 * Middleware para verificar token JWT
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: {
          message: 'Token de acesso não fornecido',
          statusCode: 401,
          code: 'TOKEN_MISSING',
        },
      });
      return;
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      res.status(401).json({
        error: {
          message: 'Token de acesso inválido',
          statusCode: 401,
          code: 'TOKEN_INVALID',
        },
      });
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro interno';

    res.status(401).json({
      error: {
        message: errorMessage,
        statusCode: 401,
        code: errorMessage === 'Token expirado' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
      },
    });
  }
};

/**
 * Middleware para verificar permissões específicas
 */
export const requirePermission = (moduleName: string, roleName?: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'Usuário não autenticado',
          statusCode: 401,
          code: 'USER_NOT_AUTHENTICATED',
        },
      });
      return;
    }

    const hasAccess = hasPermission(req.user, moduleName, roleName);

    if (!hasAccess) {
      res.status(403).json({
        error: {
          message: `Acesso negado. Requer permissão: ${roleName ? `${roleName} em ${moduleName}` : moduleName}`,
          statusCode: 403,
          code: 'INSUFFICIENT_PERMISSIONS',
          required: { module: moduleName, role: roleName },
        },
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar múltiplas permissões (OU)
 */
export const requireAnyPermission = (permissions: { module: string; role?: string }[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'Usuário não autenticado',
          statusCode: 401,
          code: 'USER_NOT_AUTHENTICATED',
        },
      });
      return;
    }

    const hasAccess = hasAnyPermission(req.user, permissions);

    if (!hasAccess) {
      const permissionDescriptions = permissions.map(p =>
        p.role ? `${p.role} em ${p.module}` : p.module
      ).join(' ou ');

      res.status(403).json({
        error: {
          message: `Acesso negado. Requer uma das seguintes permissões: ${permissionDescriptions}`,
          statusCode: 403,
          code: 'INSUFFICIENT_PERMISSIONS',
          required: permissions,
        },
      });
      return;
    }

    next();
  };
};

/**
 * Middleware para verificar se usuário é administrador
 */
export const requireAdmin = requirePermission('sistema', 'admin');

/**
 * Middleware para verificar se usuário é dono do recurso
 */
export const requireOwnership = (resourceIdParam: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'Usuário não autenticado',
          statusCode: 401,
          code: 'USER_NOT_AUTHENTICATED',
        },
      });
      return;
    }

    const resourceId = req.params[resourceIdParam];

    // Se o ID do recurso for igual ao ID do usuário, permitir acesso
    if (req.user.id === Number(resourceId)) {
      next();
      return;
    }

    // Caso contrário, verificar se é admin
    const hasAdminAccess = hasPermission(req.user, 'sistema', 'admin');

    if (!hasAdminAccess) {
      res.status(403).json({
        error: {
          message: 'Acesso negado. Você só pode acessar seus próprios dados.',
          statusCode: 403,
          code: 'ACCESS_DENIED',
        },
      });
      return;
    }

    next();
  };
};

/**
 * Middleware opcional de autenticação (não falha se não autenticado)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : authHeader;

      if (token) {
        const decoded = verifyToken(token);
        req.user = decoded;
      }
    }
  } catch (error) {
    // Ignorar erros de autenticação opcional
  }

  next();
};

// ========== UTILITÁRIOS ==========

/**
 * Verificar se requisição é autenticada
 */
export const isAuthenticated = (req: Request): boolean => {
  return !!req.user;
};

/**
 * Obter usuário da requisição (assume que está autenticado)
 */
export const getCurrentUser = (req: Request): AuthPayload => {
  if (!req.user) {
    throw new Error('Usuário não autenticado');
  }
  return req.user;
};

/**
 * Verificar se usuário atual tem uma permissão
 */
export const currentUserHasPermission = (req: Request, moduleName: string, roleName?: string): boolean => {
  if (!req.user) return false;
  return hasPermission(req.user, moduleName, roleName);
};


