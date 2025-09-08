import { Request, Response } from 'express';
import { z } from 'zod';
import {
  AuthService,
  registerSchema,
  loginSchema,
  validateRegisterData,
  validateLoginData,
  LoginResponse,
  RegisterResponse
} from '../services/authService';

// ========== CONTROLADORES ==========

/**
 * Controller para registro de usuários
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar dados de entrada
    const validatedData = validateRegisterData(req.body);

    // Registrar usuário
    const result: RegisterResponse = await AuthService.register(validatedData);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: result,
    });
  } catch (error) {
    handleAuthError(error, res);
  }
};

/**
 * Controller para login de usuários
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validar dados de entrada
    const validatedData = validateLoginData(req.body);

    // Fazer login
    const result: LoginResponse = await AuthService.login(validatedData);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: result,
    });
  } catch (error) {
    handleAuthError(error, res);
  }
};

/**
 * Controller para obter dados do usuário atual
 */
export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Usuário não autenticado',
          statusCode: 401,
          code: 'USER_NOT_AUTHENTICATED',
        },
      });
      return;
    }

    // Buscar dados atualizados do usuário
    const user = await AuthService.getUserById(req.user.id);

    res.json({
      success: true,
      message: 'Dados do usuário obtidos com sucesso',
      data: { user },
    });
  } catch (error) {
    handleAuthError(error, res);
  }
};

/**
 * Controller para logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  // Em uma implementação mais robusta, você poderia:
  // 1. Invalidar o token adicionando-o a uma blacklist no Redis
  // 2. Remover o refresh token se existir
  // 3. Limpar sessões ativas

  res.json({
    success: true,
    message: 'Logout realizado com sucesso',
  });
};

/**
 * Controller para renovar token (futuro)
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // TODO: Implementar refresh token
    res.status(501).json({
      success: false,
      error: {
        message: 'Funcionalidade não implementada',
        statusCode: 501,
        code: 'NOT_IMPLEMENTED',
      },
    });
  } catch (error) {
    handleAuthError(error, res);
  }
};

/**
 * Controller para verificar status da autenticação
 */
export const verifyAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        authenticated: false,
        error: {
          message: 'Token inválido ou expirado',
          statusCode: 401,
          code: 'TOKEN_INVALID',
        },
      });
      return;
    }

    res.json({
      success: true,
      authenticated: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    handleAuthError(error, res);
  }
};

// ========== UTILITÁRIOS ==========

/**
 * Handler unificado para erros de autenticação
 */
const handleAuthError = (error: unknown, res: Response): void => {
  console.error('Erro de autenticação:', error);

  // Erros de validação Zod
  if (error instanceof z.ZodError) {
    res.status(400).json({
      success: false,
      error: {
        message: 'Dados inválidos',
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        })),
      },
    });
    return;
  }

  // Erros customizados
  if (error instanceof Error) {
    const errorMappings: Record<string, { status: number; code: string }> = {
      'Usuário já existe com este email': { status: 409, code: 'USER_EXISTS' },
      'Credenciais inválidas': { status: 401, code: 'INVALID_CREDENTIALS' },
      'Conta desativada. Entre em contato com o administrador.': { status: 403, code: 'ACCOUNT_DISABLED' },
      'Usuário não encontrado': { status: 404, code: 'USER_NOT_FOUND' },
      'Token expirado': { status: 401, code: 'TOKEN_EXPIRED' },
      'Token inválido': { status: 401, code: 'TOKEN_INVALID' },
    };

    const mapping = errorMappings[error.message];
    if (mapping) {
      res.status(mapping.status).json({
        success: false,
        error: {
          message: error.message,
          statusCode: mapping.status,
          code: mapping.code,
        },
      });
      return;
    }
  }

  // Erro genérico
  res.status(500).json({
    success: false,
    error: {
      message: 'Erro interno do servidor',
      statusCode: 500,
      code: 'INTERNAL_ERROR',
    },
  });
};

// ========== EXPORTAÇÕES ==========

export const authController = {
  register,
  login,
  me,
  logout,
  refreshToken,
  verifyAuth,
};