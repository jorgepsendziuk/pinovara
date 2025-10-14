import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const indicadoresController = {
  // Listar indicadores da organização
  async list(req: Request, res: Response) {
    try {
      const organizacaoId = parseInt(req.params.id);

      const indicadores = await prisma.organizacao_indicador.findMany({
        where: { id_organizacao: organizacaoId }
      });

      return res.json({
        success: true,
        data: indicadores
      });
    } catch (error: any) {
      console.error('Erro ao listar indicadores:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao listar indicadores',
          details: error.message
        }
      });
    }
  },

  // Adicionar indicador
  async create(req: Request, res: Response) {
    try {
      const organizacaoId = parseInt(req.params.id);
      const { id_indicador } = req.body;

      // Verificar se já existe
      const existe = await prisma.organizacao_indicador.findFirst({
        where: {
          id_organizacao: organizacaoId,
          id_indicador: id_indicador
        }
      });

      if (existe) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Indicador já está vinculado a esta organização'
          }
        });
      }

      const indicador = await prisma.organizacao_indicador.create({
        data: {
          id_organizacao: organizacaoId,
          id_indicador: id_indicador
        }
      });

      return res.status(201).json({
        success: true,
        data: indicador
      });
    } catch (error: any) {
      console.error('Erro ao criar indicador:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao criar indicador',
          details: error.message
        }
      });
    }
  },

  // Remover indicador
  async delete(req: Request, res: Response) {
    try {
      const organizacaoId = parseInt(req.params.id);
      const indicadorId = parseInt(req.params.indicadorId);

      await prisma.organizacao_indicador.deleteMany({
        where: {
          id_organizacao: organizacaoId,
          id_indicador: indicadorId
        }
      });

      return res.json({
        success: true,
        message: 'Indicador removido com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao remover indicador:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao remover indicador',
          details: error.message
        }
      });
    }
  }
};

