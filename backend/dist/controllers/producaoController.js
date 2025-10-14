"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.producaoController = void 0;
const client_1 = require("@prisma/client");
const api_1 = require("../types/api");
const prisma = new client_1.PrismaClient();
exports.producaoController = {
    async list(req, res) {
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
                unidadeMedida: 'kg',
                tipoProducao: 'organica',
                destinacao: 'paa',
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
    async create(req, res) {
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
    async update(req, res) {
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
        }
        catch (error) {
            console.error('Erro ao atualizar produção:', error);
            res.status(api_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: error.message },
            });
        }
    },
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
//# sourceMappingURL=producaoController.js.map