"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.participantesController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.participantesController = {
    // Listar participantes da organização
    async list(req, res) {
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
        }
        catch (error) {
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
    async create(req, res) {
        try {
            const organizacaoId = parseInt(req.params.id);
            const { nome, cpf, telefone, relacao, relacao_outros, assinatura } = req.body;
            const participante = await prisma.organizacao_participante.create({
                data: {
                    uri: `participante_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    creator_uri_user: 'user_admin',
                    creation_date: new Date(),
                    last_update_date: new Date(),
                    parent_auri: `organizacao_${organizacaoId}`,
                    ordinal_number: 1,
                    top_level_auri: `organizacao_${organizacaoId}`,
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
        }
        catch (error) {
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
    async update(req, res) {
        try {
            const participanteId = parseInt(req.params.participanteId);
            const { nome, cpf, telefone, relacao, relacao_outros, assinatura } = req.body;
            const participante = await prisma.organizacao_participante.update({
                where: { id: participanteId },
                data: {
                    last_update_uri_user: 'user_admin',
                    last_update_date: new Date(),
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
        }
        catch (error) {
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
    async delete(req, res) {
        try {
            const participanteId = parseInt(req.params.participanteId);
            await prisma.organizacao_participante.delete({
                where: { id: participanteId }
            });
            return res.json({
                success: true,
                message: 'Participante removido com sucesso'
            });
        }
        catch (error) {
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
