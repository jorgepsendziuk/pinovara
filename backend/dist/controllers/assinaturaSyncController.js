"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assinaturaSyncController = void 0;
const assinaturaSyncService_1 = require("../services/assinaturaSyncService");
exports.assinaturaSyncController = {
    async sync(req, res) {
        try {
            const organizacaoId = parseInt(req.params.id);
            const userEmail = req.user?.email || 'sistema';
            if (isNaN(organizacaoId)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de organização inválido'
                });
            }
            const resultado = await assinaturaSyncService_1.assinaturaSyncService.syncAssinaturasFromODK(organizacaoId, userEmail);
            console.log('✍️ Resultado da sincronização de assinaturas:', {
                total_odk: resultado.total_odk,
                ja_existentes: resultado.ja_existentes,
                baixadas: resultado.baixadas,
                erros: resultado.erros
            });
            res.json({
                success: resultado.success,
                data: resultado
            });
        }
        catch (error) {
            console.error('Erro ao sincronizar assinaturas:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Erro ao sincronizar assinaturas do ODK'
            });
        }
    },
    async listODKAvailable(req, res) {
        try {
            const organizacaoId = parseInt(req.params.id);
            if (isNaN(organizacaoId)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de organização inválido'
                });
            }
            const resultado = await assinaturaSyncService_1.assinaturaSyncService.listarAssinaturasDisponiveis(organizacaoId);
            res.json({
                success: true,
                data: resultado
            });
        }
        catch (error) {
            console.error('Erro ao listar assinaturas ODK:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Erro ao listar assinaturas disponíveis no ODK'
            });
        }
    }
};
//# sourceMappingURL=assinaturaSyncController.js.map