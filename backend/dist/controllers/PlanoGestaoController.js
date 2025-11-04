"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const PlanoGestaoService_1 = __importDefault(require("../services/PlanoGestaoService"));
class PlanoGestaoController {
    async getPlanoGestao(req, res) {
        try {
            const idOrganizacao = parseInt(req.params.id);
            if (isNaN(idOrganizacao)) {
                res.status(400).json({
                    error: 'ID da organização inválido'
                });
                return;
            }
            const planoGestao = await PlanoGestaoService_1.default.getPlanoGestao(idOrganizacao);
            res.status(200).json(planoGestao);
        }
        catch (error) {
            console.error('Erro ao buscar plano de gestão:', error);
            if (error.message === 'Organização não encontrada') {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({
                error: 'Erro ao buscar plano de gestão',
                details: error.message
            });
        }
    }
    async updateRascunho(req, res) {
        try {
            const idOrganizacao = parseInt(req.params.id);
            const { rascunho } = req.body;
            const userId = req.user?.id;
            if (isNaN(idOrganizacao)) {
                res.status(400).json({
                    error: 'ID da organização inválido'
                });
                return;
            }
            if (rascunho !== null && typeof rascunho !== 'string') {
                res.status(400).json({
                    error: 'Rascunho deve ser uma string ou null'
                });
                return;
            }
            if (!userId) {
                res.status(401).json({
                    error: 'Usuário não autenticado'
                });
                return;
            }
            await PlanoGestaoService_1.default.updateRascunho(idOrganizacao, rascunho, userId);
            res.status(200).json({
                message: 'Rascunho atualizado com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao atualizar rascunho:', error);
            if (error.message === 'Organização não encontrada') {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({
                error: 'Erro ao atualizar rascunho',
                details: error.message
            });
        }
    }
    async upsertAcao(req, res) {
        try {
            const idOrganizacao = parseInt(req.params.id);
            const idAcaoModelo = parseInt(req.params.idAcaoModelo);
            const dados = req.body;
            if (isNaN(idOrganizacao)) {
                res.status(400).json({
                    error: 'ID da organização inválido'
                });
                return;
            }
            if (isNaN(idAcaoModelo)) {
                res.status(400).json({
                    error: 'ID da ação modelo inválido'
                });
                return;
            }
            const dadosProcessados = {};
            if ('responsavel' in dados) {
                dadosProcessados.responsavel = dados.responsavel;
            }
            if ('data_inicio' in dados) {
                dadosProcessados.data_inicio = dados.data_inicio
                    ? new Date(dados.data_inicio)
                    : null;
            }
            if ('data_termino' in dados) {
                dadosProcessados.data_termino = dados.data_termino
                    ? new Date(dados.data_termino)
                    : null;
            }
            if ('como_sera_feito' in dados) {
                dadosProcessados.como_sera_feito = dados.como_sera_feito;
            }
            if ('recursos' in dados) {
                dadosProcessados.recursos = dados.recursos;
            }
            await PlanoGestaoService_1.default.upsertAcao(idOrganizacao, idAcaoModelo, dadosProcessados);
            res.status(200).json({
                message: 'Ação atualizada com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao atualizar ação:', error);
            if (error.message === 'Organização não encontrada' ||
                error.message === 'Ação modelo não encontrada') {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({
                error: 'Erro ao atualizar ação',
                details: error.message
            });
        }
    }
    async deleteAcao(req, res) {
        try {
            const idOrganizacao = parseInt(req.params.id);
            const idAcaoModelo = parseInt(req.params.idAcaoModelo);
            if (isNaN(idOrganizacao)) {
                res.status(400).json({
                    error: 'ID da organização inválido'
                });
                return;
            }
            if (isNaN(idAcaoModelo)) {
                res.status(400).json({
                    error: 'ID da ação modelo inválido'
                });
                return;
            }
            await PlanoGestaoService_1.default.deleteAcao(idOrganizacao, idAcaoModelo);
            res.status(200).json({
                message: 'Ação deletada com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao deletar ação:', error);
            res.status(500).json({
                error: 'Erro ao deletar ação',
                details: error.message
            });
        }
    }
}
exports.default = new PlanoGestaoController();
//# sourceMappingURL=PlanoGestaoController.js.map