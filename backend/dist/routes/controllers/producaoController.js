"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.producaoController = void 0;
const client_1 = require("@prisma/client");
const api_1 = require("../types/api");
const prisma = new client_1.PrismaClient();
exports.producaoController = {
    /**
     * GET /organizacoes/:id/producao
     */
    async list(req, res) {
        try {
            const organizacaoId = parseInt(req.params.id);
            const items = await prisma.organizacao_producao.findMany({
                where: { id_organizacao: organizacaoId },
            });
            const formattedItems = items.map(item => ({
                id: item.id,
                cultura: item.cultura || '',
                mensal: parseFloat(item.mensal?.toString() || '0'),
                anual: parseFloat(item.anual?.toString() || '0'),
            }));
            res.json({ success: true, data: formattedItems });
        }
        catch (error) {
            console.error('Erro ao listar produção:', error);
            res.status(api_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: error.message },
            });
        }
    },
    /**
     * POST /organizacoes/:id/producao
     */
    async create(req, res) {
        try {
            const organizacaoId = parseInt(req.params.id);
            const { cultura, mensal, anual } = req.body;
            const item = await prisma.organizacao_producao.create({
                data: {
                    id_organizacao: organizacaoId,
                    cultura,
                    mensal,
                    anual,
                    uri: `uuid:producao-${Date.now()}`,
                    creator_uri_user: 'sistema',
                    creation_date: new Date(),
                    last_update_date: new Date(),
                    ordinal_number: 1,
                },
            });
            res.status(api_1.HttpStatus.CREATED).json({ success: true, data: item });
        }
        catch (error) {
            console.error('Erro ao criar produção:', error);
            res.status(api_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: error.message },
            });
        }
    },
    /**
     * PUT /organizacoes/:id/producao/:itemId
     */
    async update(req, res) {
        try {
            const itemId = parseInt(req.params.itemId);
            const { cultura, mensal, anual } = req.body;
            const item = await prisma.organizacao_producao.update({
                where: { id: itemId },
                data: {
                    cultura,
                    mensal,
                    anual,
                    last_update_date: new Date(),
                },
            });
            res.json({ success: true, data: item });
        }
        catch (error) {
            console.error('Erro ao atualizar produção:', error);
            res.status(api_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: error.message },
            });
        }
    },
    /**
     * DELETE /organizacoes/:id/producao/:itemId
     */
    async delete(req, res) {
        try {
            const itemId = parseInt(req.params.itemId);
            await prisma.organizacao_producao.delete({
                where: { id: itemId },
            });
            res.json({ success: true, message: 'Cultura excluída com sucesso' });
        }
        catch (error) {
            console.error('Erro ao excluir produção:', error);
            res.status(api_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: error.message },
            });
        }
    },
};
