import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { HttpStatus } from '../types/api';
import auditService from '../services/auditService';
import { AuditAction } from '../types/audit';

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

      // Registrar log de auditoria
      await auditService.createLog({
        action: AuditAction.CREATE,
        entity: 'associado_juridico',
        entityId: item.id?.toString(),
        newData: item,
        userId: (req as any).user?.id,
        req
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

      // Capturar dados antes da atualização para auditoria
      const itemAntes = await prisma.organizacao_abrangencia_pj.findUnique({
        where: { id: itemId }
      });

      const item = await prisma.organizacao_abrangencia_pj.update({
        where: { id: itemId },
        data: {
          razao_social: nomeOrganizacao,
          cnpj_pj: cnpj,
          last_update_date: new Date(),
        },
      });

      // Registrar log de auditoria
      await auditService.createLog({
        action: AuditAction.UPDATE,
        entity: 'associado_juridico',
        entityId: itemId.toString(),
        oldData: itemAntes,
        newData: item,
        userId: (req as any).user?.id,
        req
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

      // Capturar dados antes da exclusão para auditoria
      const itemAntes = await prisma.organizacao_abrangencia_pj.findUnique({
        where: { id: itemId }
      });

      await prisma.organizacao_abrangencia_pj.delete({
        where: { id: itemId },
      });

      // Registrar log de auditoria
      await auditService.createLog({
        action: AuditAction.DELETE,
        entity: 'associado_juridico',
        entityId: itemId.toString(),
        oldData: itemAntes,
        userId: (req as any).user?.id,
        req
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

