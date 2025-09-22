import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    name: string;
    roles: Array<{
      id: number;
      name: string;
      module: {
        id: number;
        name: string;
      };
    }>;
  };
}

/**
 * Middleware de autenticação JWT
 */
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Token de acesso necessário',
          statusCode: 401
        }
      });
      return;
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não configurado');
      res.status(500).json({
        success: false,
        error: {
          message: 'Erro de configuração do servidor',
          statusCode: 500
        }
      });
      return;
    }

    // Verificar e decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: number;
      email: string;
    };

    // Buscar usuário completo no banco
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.active) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Token inválido ou usuário inativo',
          statusCode: 401
        }
      });
      return;
    }

    // Adicionar dados do usuário à requisição
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
        roles: [] // Temporariamente vazio
    };

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Token inválido',
          statusCode: 401
        }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Erro interno do servidor',
        statusCode: 500
      }
    });
  }
};

/**
 * Middleware para verificar permissões específicas
 */
export const requirePermission = (moduleName: string, roleName?: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Usuário não autenticado',
          statusCode: 401
        }
      });
      return;
    }

    const hasPermission = req.user.roles.some(role => {
      const moduleMatch = role.module.name === moduleName;
      const roleMatch = !roleName || role.name === roleName;
      return moduleMatch && roleMatch;
    });

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: {
          message: 'Permissão insuficiente',
          statusCode: 403
        }
      });
      return;
    }

    next();
  };
};

/**
 * Middleware opcional - não bloqueia se token não estiver presente
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      next();
      return;
    }

    if (!process.env.JWT_SECRET) {
      next();
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: number;
      email: string;
    };

    const user = await prisma.users.findUnique({
      where: { id: decoded.userId }
    });

    if (user && user.active) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: [] // Temporariamente vazio
      };
    }

    next();
  } catch (error) {
    // Em caso de erro, apenas prosseguir sem autenticação
    next();
  }
};