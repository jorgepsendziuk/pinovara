import { Request, Response } from 'express';
import { ModuleService, createModuleSchema, createRoleSchema } from '../services/moduleService';
import { z } from 'zod';

export const moduleController = {
  // Módulos
  async createModule(req: Request, res: Response): Promise<void> {
    try {
      const module = await ModuleService.createModule(req.body);

      res.status(201).json({
        message: 'Módulo criado com sucesso',
        data: { module },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: {
            message: 'Dados inválidos',
            statusCode: 400,
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        });
        return;
      }

      if (error instanceof Error && error.message === 'Módulo já existe com este nome') {
        res.status(409).json({
          error: {
            message: error.message,
            statusCode: 409,
          },
        });
        return;
      }

      console.error('Erro ao criar módulo:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },

  async getAllModules(req: Request, res: Response): Promise<void> {
    try {
      const modules = await ModuleService.getAllModules();

      res.json({
        message: 'Módulos obtidos com sucesso',
        data: { modules },
      });
    } catch (error) {
      console.error('Erro ao obter módulos:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },

  async getModuleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const module = await ModuleService.getModuleById(Number(id));

      res.json({
        message: 'Módulo obtido com sucesso',
        data: { module },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Módulo não encontrado') {
        res.status(404).json({
          error: {
            message: error.message,
            statusCode: 404,
          },
        });
        return;
      }

      console.error('Erro ao obter módulo:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },

  async updateModule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const module = await ModuleService.updateModule(Number(id), req.body);

      res.json({
        message: 'Módulo atualizado com sucesso',
        data: { module },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Módulo não encontrado') {
          res.status(404).json({
            error: {
              message: error.message,
              statusCode: 404,
            },
          });
          return;
        }

        if (error.message === 'Já existe um módulo com este nome') {
          res.status(409).json({
            error: {
              message: error.message,
              statusCode: 409,
            },
          });
          return;
        }
      }

      console.error('Erro ao atualizar módulo:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },

  async deleteModule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await ModuleService.deleteModule(Number(id));

      res.json({
        message: 'Módulo excluído com sucesso',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Módulo não encontrado') {
          res.status(404).json({
            error: {
              message: error.message,
              statusCode: 404,
            },
          });
          return;
        }

        if (error.message === 'Não é possível excluir módulo que possui papéis associados') {
          res.status(409).json({
            error: {
              message: error.message,
              statusCode: 409,
            },
          });
          return;
        }
      }

      console.error('Erro ao excluir módulo:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },

  // Papéis
  async createRole(req: Request, res: Response): Promise<void> {
    try {
      const role = await ModuleService.createRole(req.body);

      res.status(201).json({
        message: 'Papel criado com sucesso',
        data: { role },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: {
            message: 'Dados inválidos',
            statusCode: 400,
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
        });
        return;
      }

      if (error instanceof Error) {
        if (error.message === 'Módulo não encontrado') {
          res.status(404).json({
            error: {
              message: error.message,
              statusCode: 404,
            },
          });
          return;
        }

        if (error.message === 'Papel já existe neste módulo') {
          res.status(409).json({
            error: {
              message: error.message,
              statusCode: 409,
            },
          });
          return;
        }
      }

      console.error('Erro ao criar papel:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },

  async getAllRoles(req: Request, res: Response): Promise<void> {
    try {
      const roles = await ModuleService.getAllRoles();

      res.json({
        message: 'Papéis obtidos com sucesso',
        data: { roles },
      });
    } catch (error) {
      console.error('Erro ao obter papéis:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },

  async getRoleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const role = await ModuleService.getRoleById(Number(id));

      res.json({
        message: 'Papel obtido com sucesso',
        data: { role },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Papel não encontrado') {
        res.status(404).json({
          error: {
            message: error.message,
            statusCode: 404,
          },
        });
        return;
      }

      console.error('Erro ao obter papel:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },

  async updateRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const role = await ModuleService.updateRole(Number(id), req.body);

      res.json({
        message: 'Papel atualizado com sucesso',
        data: { role },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Papel não encontrado') {
          res.status(404).json({
            error: {
              message: error.message,
              statusCode: 404,
            },
          });
          return;
        }

        if (error.message === 'Já existe um papel com este nome neste módulo') {
          res.status(409).json({
            error: {
              message: error.message,
              statusCode: 409,
            },
          });
          return;
        }
      }

      console.error('Erro ao atualizar papel:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },

  async deleteRole(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await ModuleService.deleteRole(Number(id));

      res.json({
        message: 'Papel excluído com sucesso',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Papel não encontrado') {
          res.status(404).json({
            error: {
              message: error.message,
              statusCode: 404,
            },
          });
          return;
        }

        if (error.message === 'Não é possível excluir papel que possui usuários associados') {
          res.status(409).json({
            error: {
              message: error.message,
              statusCode: 409,
            },
          });
          return;
        }
      }

      console.error('Erro ao excluir papel:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },
};