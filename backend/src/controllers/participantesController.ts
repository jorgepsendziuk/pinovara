import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const participantesController = {
  // Listar participantes da organização
  async list(req: Request, res: Response) {
    try {
      const organizacaoId = parseInt(req.params.id);

      const participantes = await prisma.organizacao_participante.findMany({
        where: { id_organizacao: organizacaoId },
        orderBy: { id: 'asc' }
      });

      return res.json({
        success: true,
        data: participantes
      });
    } catch (error: any) {
      console.error('Erro ao listar participantes:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao listar participantes',
          details: error.message
        }
      });
    }
  },

  // Criar participante
  async create(req: Request, res: Response) {
    try {
      const organizacaoId = parseInt(req.params.id);
      const { nome, cpf, telefone, relacao, relacao_outros, assinatura } = req.body;

      const participante = await prisma.organizacao_participante.create({
        data: {
          id_organizacao: organizacaoId,
          nome,
          cpf: cpf.replace(/\D/g, ''), // Remove formatação
          telefone,
          relacao,
          relacao_outros: relacao_outros || null,
          assinatura: assinatura || null
        }
      });

      return res.status(201).json({
        success: true,
        data: participante
      });
    } catch (error: any) {
      console.error('Erro ao criar participante:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao criar participante',
          details: error.message
        }
      });
    }
  },

  // Atualizar participante
  async update(req: Request, res: Response) {
    try {
      const participanteId = parseInt(req.params.participanteId);
      const { nome, cpf, telefone, relacao, relacao_outros, assinatura } = req.body;

      const participante = await prisma.organizacao_participante.update({
        where: { id: participanteId },
        data: {
          nome,
          cpf: cpf.replace(/\D/g, ''), // Remove formatação
          telefone,
          relacao,
          relacao_outros: relacao_outros || null,
          assinatura: assinatura || null
        }
      });

      return res.json({
        success: true,
        data: participante
      });
    } catch (error: any) {
      console.error('Erro ao atualizar participante:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao atualizar participante',
          details: error.message
        }
      });
    }
  },

  // Remover participante
  async delete(req: Request, res: Response) {
    try {
      const participanteId = parseInt(req.params.participanteId);

      await prisma.organizacao_participante.delete({
        where: { id: participanteId }
      });

      return res.json({
        success: true,
        message: 'Participante removido com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao remover participante:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Erro ao remover participante',
          details: error.message
        }
      });
    }
  }
};

