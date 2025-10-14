import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { HttpStatus } from '../types/api';

const prisma = new PrismaClient();

export const associadosJuridicosController = {
  /**
   * GET /organizacoes/:id/associados-juridicos
   */
  async list(req: Request, res: Response) {
    try {
      const organizacaoId = parseInt(req.params.id);

      const items = await prisma.organizacao_abrangencia_pj.findMany({
        where: { id_organizacao: organizacaoId },
      });

      const formattedItems = items.map(item => ({
        id: item.id,
        nomeOrganizacao: item.razao_social || '',
        cnpj: item.cnpj_pj || '',
        tipoRelacao: 'filiada', // Ajustar conforme schema
        dataFiliacao: item.creation_date?.toISOString().split('T')[0] || '',
        situacao: 'ativa', // Ajustar conforme schema
      }));

      res.json({ success: true, data: formattedItems });
    } catch (error: any) {
      console.error('Erro ao listar associados jurídicos:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: error.message },
      });
    }
  },

  /**
   * POST /organizacoes/:id/associados-juridicos
   */
  async create(req: Request, res: Response) {
    try {
      const organizacaoId = parseInt(req.params.id);
      const { nomeOrganizacao, cnpj } = req.body;

      const item = await prisma.organizacao_abrangencia_pj.create({
        data: {
          id_organizacao: organizacaoId,
          razao_social: nomeOrganizacao,
          cnpj_pj: cnpj,
          uri: `uuid:associado-${Date.now()}`,
          creator_uri_user: 'sistema',
          creation_date: new Date(),
          last_update_date: new Date(),
          ordinal_number: 1,
        },
      });

      res.status(HttpStatus.CREATED).json({ success: true, data: item });
    } catch (error: any) {
      console.error('Erro ao criar associado jurídico:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: error.message },
      });
    }
  },

  /**
   * PUT /organizacoes/:id/associados-juridicos/:itemId
   */
  async update(req: Request, res: Response) {
    try {
      const itemId = parseInt(req.params.itemId);
      const { nomeOrganizacao, cnpj } = req.body;

      const item = await prisma.organizacao_abrangencia_pj.update({
        where: { id: itemId },
        data: {
          razao_social: nomeOrganizacao,
          cnpj_pj: cnpj,
          last_update_date: new Date(),
        },
      });

      res.json({ success: true, data: item });
    } catch (error: any) {
      console.error('Erro ao atualizar associado jurídico:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: error.message },
      });
    }
  },

  /**
   * DELETE /organizacoes/:id/associados-juridicos/:itemId
   */
  async delete(req: Request, res: Response) {
    try {
      const itemId = parseInt(req.params.itemId);

      await prisma.organizacao_abrangencia_pj.delete({
        where: { id: itemId },
      });

      res.json({ success: true, message: 'Organização excluída com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir associado jurídico:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: { message: error.message },
      });
    }
  },
};

