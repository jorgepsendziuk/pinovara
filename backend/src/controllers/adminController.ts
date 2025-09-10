import { Request, Response } from 'express';
import { AdminService, createSettingSchema, updateSettingSchema } from '../services/adminService';
import { z } from 'zod';

export const adminController = {
  // System Info
  async getSystemInfo(req: Request, res: Response): Promise<void> {
    try {
      const systemInfo = await AdminService.getSystemInfo();
      
      res.json({
        message: 'Informações do sistema obtidas com sucesso',
        data: systemInfo,
      });
    } catch (error) {
      console.error('Erro ao obter informações do sistema:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },

  // System Settings
  async getAllSettings(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;
      const settings = await AdminService.getAllSettings(category as string);
      
      res.json({
        message: 'Configurações obtidas com sucesso',
        data: { settings },
      });
    } catch (error) {
      console.error('Erro ao obter configurações:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },

  async getSettingsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const settings = await AdminService.getSettingsByCategory();
      
      res.json({
        message: 'Configurações por categoria obtidas com sucesso',
        data: settings,
      });
    } catch (error) {
      console.error('Erro ao obter configurações por categoria:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },

  async getSettingByKey(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const setting = await AdminService.getSettingByKey(key);
      
      res.json({
        message: 'Configuração obtida com sucesso',
        data: { setting },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Configuração não encontrada') {
        res.status(404).json({
          error: {
            message: error.message,
            statusCode: 404,
          },
        });
        return;
      }

      console.error('Erro ao obter configuração:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },

  async createSetting(req: Request, res: Response): Promise<void> {
    try {
      const setting = await AdminService.createSetting(req.body);
      
      // Log the action
      if (req.user) {
        await AdminService.logAction(
          'CREATE',
          'system_settings',
          setting.id.toString(),
          null,
          setting,
          req.user.id,
          req.headers['user-agent'],
          req.ip
        );
      }

      res.status(201).json({
        message: 'Configuração criada com sucesso',
        data: { setting },
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

      if (error instanceof Error && error.message === 'Configuração já existe com esta chave') {
        res.status(409).json({
          error: {
            message: error.message,
            statusCode: 409,
          },
        });
        return;
      }

      console.error('Erro ao criar configuração:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },

  async updateSetting(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      
      // Get old data for audit
      const oldSetting = await AdminService.getSettingByKey(key);
      const updatedSetting = await AdminService.updateSetting(key, req.body);
      
      // Log the action
      if (req.user) {
        await AdminService.logAction(
          'UPDATE',
          'system_settings',
          updatedSetting.id.toString(),
          oldSetting,
          updatedSetting,
          req.user.id,
          req.headers['user-agent'],
          req.ip
        );
      }

      res.json({
        message: 'Configuração atualizada com sucesso',
        data: { setting: updatedSetting },
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

      if (error instanceof Error && error.message === 'Configuração não encontrada') {
        res.status(404).json({
          error: {
            message: error.message,
            statusCode: 404,
          },
        });
        return;
      }

      console.error('Erro ao atualizar configuração:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },

  async deleteSetting(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      
      // Get old data for audit
      const oldSetting = await AdminService.getSettingByKey(key);
      await AdminService.deleteSetting(key);
      
      // Log the action
      if (req.user) {
        await AdminService.logAction(
          'DELETE',
          'system_settings',
          oldSetting.id.toString(),
          oldSetting,
          null,
          req.user.id,
          req.headers['user-agent'],
          req.ip
        );
      }

      res.json({
        message: 'Configuração excluída com sucesso',
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Configuração não encontrada') {
        res.status(404).json({
          error: {
            message: error.message,
            statusCode: 404,
          },
        });
        return;
      }

      console.error('Erro ao excluir configuração:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },

  // Audit Logs
  async getAllAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      
      const filters: any = {};
      if (req.query.action) filters.action = req.query.action as string;
      if (req.query.entity) filters.entity = req.query.entity as string;
      if (req.query.userId) filters.userId = req.query.userId as string;
      if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
      if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

      const result = await AdminService.getAllAuditLogs(page, limit, filters);
      
      res.json({
        message: 'Logs de auditoria obtidos com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao obter logs de auditoria:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },

  async getAuditLogById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const log = await AdminService.getAuditLogById(id);
      
      res.json({
        message: 'Log de auditoria obtido com sucesso',
        data: { log },
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Log de auditoria não encontrado') {
        res.status(404).json({
          error: {
            message: error.message,
            statusCode: 404,
          },
        });
        return;
      }

      console.error('Erro ao obter log de auditoria:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },

  async getAuditLogStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await AdminService.getAuditLogStats();
      
      res.json({
        message: 'Estatísticas de auditoria obtidas com sucesso',
        data: stats,
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de auditoria:', error);
      res.status(500).json({
        error: {
          message: 'Erro interno do servidor',
          statusCode: 500,
        },
      });
    }
  },
};