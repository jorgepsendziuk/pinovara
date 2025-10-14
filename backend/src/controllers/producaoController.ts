import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { HttpStatus } from '../types/api';

const prisma = new PrismaClient();

export const producaoController = {
  /**
   * GET /organizacoes/:id/producao
   */
  async list(req: Request, res: Response) {
    try {
      const organizacaoId = parseInt(req.params.id);

      const items = await prisma.organizacao_producao.findMany({
        where: { id_organizacao: organizacaoId },
      });

      const formattedItems = items.map(item => ({
        id: item.id,
        cultura: item.cultura || '',
        volumeAnual: parseFloat(item.anual?.toString() || '0'),
        valorMedio: parseFloat(item.mensal?.toString() || '0'),
        unidadeMedida: 'kg', // Ajustar conforme schema
        tipoProducao: 'organica', // Ajustar conforme schema
        destinacao: 'paa', // Ajustar conforme schema
      }));

      res.json({ success: true, data: formattedItems });
    } catch (error: any) {
      console.error('Erro ao listar produção:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: error.message },
      });
    }
  },

  /**
   * POST /organizacoes/:id/producao
   */
  async create(req: Request, res: Response) {
    try {
      const organizacaoId = parseInt(req.params.id);
      const { cultura, volumeAnual, valorMedio } = req.body;

      const item = await prisma.organizacao_producao.create({
        data: {
          id_organizacao: organizacaoId,
          cultura,
          anual: volumeAnual,
          mensal: valorMedio,
          uri: `uuid:producao-${Date.now()}`,
          creator_uri_user: 'sistema',
          creation_date: new Date(),
          last_update_date: new Date(),
          ordinal_number: 1,
        },
      });

      res.status(HttpStatus.CREATED).json({ success: true, data: item });
    } catch (error: any) {
      console.error('Erro ao criar produção:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: error.message },
      });
    }
  },

  /**
   * PUT /organizacoes/:id/producao/:itemId
   */
  async update(req: Request, res: Response) {
    try {
      const itemId = parseInt(req.params.itemId);
      const { cultura, volumeAnual, valorMedio } = req.body;

      const item = await prisma.organizacao_producao.update({
        where: { id: itemId },
        data: {
          cultura,
          anual: volumeAnual,
          mensal: valorMedio,
          last_update_date: new Date(),
        },
      });

      res.json({ success: true, data: item });
    } catch (error: any) {
      console.error('Erro ao atualizar produção:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: error.message },
      });
    }
  },

  /**
   * DELETE /organizacoes/:id/producao/:itemId
   */
  async delete(req: Request, res: Response) {
    try {
      const itemId = parseInt(req.params.itemId);

      await prisma.organizacao_producao.delete({
        where: { id: itemId },
      });

      res.json({ success: true, message: 'Cultura excluída com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir produção:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
};

