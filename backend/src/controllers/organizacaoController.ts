import { Response } from 'express';
import { organizacaoService } from '../services/organizacaoService';
import { ApiError } from '../services/authService';
import { OrganizacaoFilters } from '../types/organizacao';
import { HttpStatus } from '../types/api';
import { AuthRequest } from '../middleware/auth';

class OrganizacaoController {
  /**
   * GET /organizacoes
   */
  async list(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filters: OrganizacaoFilters = {
        nome: req.query.nome as string,
        cnpj: req.query.cnpj as string,
        estado: req.query.estado ? parseInt(req.query.estado as string) : undefined,
        municipio: req.query.municipio ? parseInt(req.query.municipio as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      };

      const result = await organizacaoService.list(filters);

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
   * GET /organizacoes/:id
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

      const organizacao = await organizacaoService.getById(id);

      res.status(HttpStatus.OK).json({
        success: true,
        data: organizacao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * POST /organizacoes
   */
  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = req.body;
      const organizacao = await organizacaoService.create(data);

      res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'Organização criada com sucesso',
        data: organizacao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * PUT /organizacoes/:id
   */
  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const data = req.body;

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

      const organizacao = await organizacaoService.update(id, data);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Organização atualizada com sucesso',
        data: organizacao,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * DELETE /organizacoes/:id
   */
  async delete(req: AuthRequest, res: Response): Promise<void> {
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

      await organizacaoService.delete(id);

      res.status(HttpStatus.OK).json({
        success: true,
        message: 'Organização removida com sucesso',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * GET /organizacoes/dashboard
   */
  async getDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await organizacaoService.getDashboardStats();

      res.status(HttpStatus.OK).json({
        success: true,
        data: stats,
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
    console.error('Organizacao Controller Error:', error);

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

export const organizacaoController = new OrganizacaoController();