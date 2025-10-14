import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { HttpStatus } from '../types/api';

const prisma = new PrismaClient();

export const abrangenciaController = {
  /**
   * GET /organizacoes/:id/abrangencia-socios
   */
  async list(req: Request, res: Response) {
    try {
      const organizacaoId = parseInt(req.params.id);

      const items = await prisma.organizacao_abrangencia_socio.findMany({
        where: { id_organizacao: organizacaoId },
        include: {
          estado_organizacao_abrangencia_socio_estadoToestado: true,
          municipio_ibge: true,
        },
      });

      const formattedItems = items.map(item => ({
        id: item.id,
        estado: item.estado,
        municipio: item.municipio,
        numSocios: item.num_socios,
        estadoNome: item.estado_organizacao_abrangencia_socio_estadoToestado?.descricao,
        municipioNome: item.municipio_ibge?.descricao,
      }));

      res.json({ success: true, data: formattedItems });
    } catch (error: any) {
      console.error('Erro ao listar abrangência:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: error.message },
      });
    }
  },

  /**
   * POST /organizacoes/:id/abrangencia-socios
   */
  async create(req: Request, res: Response) {
    try {
      const organizacaoId = parseInt(req.params.id);
      const { estado, municipio, numSocios } = req.body;

      const item = await prisma.organizacao_abrangencia_socio.create({
        data: {
          id_organizacao: organizacaoId,
          estado: parseInt(estado),
          municipio: parseInt(municipio),
          num_socios: parseInt(numSocios),
          uri: `uuid:abrangencia-${Date.now()}`,
          creator_uri_user: 'sistema',
          creation_date: new Date(),
          last_update_date: new Date(),
          ordinal_number: 1,
        },
      });

      res.status(HttpStatus.CREATED).json({ success: true, data: item });
    } catch (error: any) {
      console.error('Erro ao criar abrangência:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: error.message },
      });
    }
  },

  /**
   * PUT /organizacoes/:id/abrangencia-socios/:itemId
   */
  async update(req: Request, res: Response) {
    try {
      const itemId = parseInt(req.params.itemId);
      const { estado, municipio, numSocios } = req.body;

      const item = await prisma.organizacao_abrangencia_socio.update({
        where: { id: itemId },
        data: {
          estado: parseInt(estado),
          municipio: parseInt(municipio),
          num_socios: parseInt(numSocios),
          last_update_date: new Date(),
        },
      });

      res.json({ success: true, data: item });
    } catch (error: any) {
      console.error('Erro ao atualizar abrangência:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: error.message },
      });
    }
  },

  /**
   * DELETE /organizacoes/:id/abrangencia-socios/:itemId
   */
  async delete(req: Request, res: Response) {
    try {
      const itemId = parseInt(req.params.itemId);

      await prisma.organizacao_abrangencia_socio.delete({
        where: { id: itemId },
      });

      res.json({ success: true, message: 'Município excluído com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir abrangência:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
};

