"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.indicadoresController = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.indicadoresController = {
    // Listar indicadores da organização
    async list(req, res) {
        try {
            const organizacaoId = parseInt(req.params.id);
            const indicadores = await prisma.organizacao_indicador.findMany({
                where: { id_organizacao: organizacaoId }
            });
            return res.json({
                success: true,
                data: indicadores
            });
        }
        catch (error) {
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
    async create(req, res) {
        try {
            const organizacaoId = parseInt(req.params.id);
            const { id_indicador } = req.body;
            // Verificar se já existe
            const existe = await prisma.organizacao_indicador.findFirst({
                where: {
                    id_organizacao: organizacaoId,
                    valor: id_indicador
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
                    uri: `indicador_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    creator_uri_user: 'user_admin',
                    creation_date: new Date(),
                    last_update_date: new Date(),
                    parent_auri: `organizacao_${organizacaoId}`,
                    ordinal_number: 1,
                    top_level_auri: `organizacao_${organizacaoId}`,
                    id_organizacao: organizacaoId,
                    valor: id_indicador
                }
            });
            return res.status(201).json({
                success: true,
                data: indicador
            });
        }
        catch (error) {
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
    async delete(req, res) {
        try {
            const organizacaoId = parseInt(req.params.id);
            const indicadorId = parseInt(req.params.indicadorId);
            await prisma.organizacao_indicador.deleteMany({
                where: {
                    id_organizacao: organizacaoId,
                    valor: indicadorId
                }
            });
            return res.json({
                success: true,
                message: 'Indicador removido com sucesso'
            });
        }
        catch (error) {
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
