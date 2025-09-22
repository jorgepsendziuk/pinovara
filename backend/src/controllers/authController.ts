import { Request, Response } from 'express';
import { authService, ApiError } from '../services/authService';
import { LoginData, RegisterData } from '../types/auth';
import { HttpStatus } from '../types/api';
import { AuthRequest } from '../middleware/auth';

class AuthController {
  /**
   * POST /auth/login
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const loginData: LoginData = req.body;
      const result = await authService.login(loginData);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * POST /auth/register
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const registerData: RegisterData = req.body;
      const result = await authService.register(registerData);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /auth/me
   */
  async me(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
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

      const user = await authService.getUserById(req.user.id);

      res.status(HttpStatus.OK).json({
        success: true,
        data: { user },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /auth/verify
   */
  async verify(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];

      if (!token) {
        res.status(HttpStatus.UNAUTHORIZED).json({
          success: false,
          error: {
            message: 'Token não fornecido',
            statusCode: HttpStatus.UNAUTHORIZED
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      const user = await authService.verifyToken(token);

      res.status(HttpStatus.OK).json({
        success: true,
        data: { 
          authenticated: true,
          user 
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Para verificação, retornar não autenticado ao invés de erro
      if (error instanceof ApiError) {
        res.status(HttpStatus.OK).json({
          success: true,
          data: { 
            authenticated: false 
          },
          timestamp: new Date().toISOString()
        });
        return;
      }

      this.handleError(error, res);
    }
  }

  /**
   * POST /auth/logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Em uma implementação completa, aqui seria adicionado o token a uma blacklist
      // Por enquanto, apenas retorna sucesso
      
      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Logout realizado com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PUT /auth/profile
   */
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
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

      const { name, email } = req.body;
      const updatedUser = await authService.updateProfile(req.user.id, { name, email });

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: { user: updatedUser },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Tratar erros de forma padronizada
   */
  private handleError(error: any, res: Response): void {
    console.error('Auth Controller Error:', error);

    if (error instanceof ApiError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          message: error.message,
          statusCode: error.statusCode,
          code: error.code,
          details: error.details
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Erro genérico
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: 'Erro interno do servidor',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      },
      timestamp: new Date().toISOString()
    });
  }
}

export const authController = new AuthController();