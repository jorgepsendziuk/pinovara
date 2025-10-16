"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.odkSyncController = void 0;
const odkSyncService_1 = __importDefault(require("../services/odkSyncService"));
exports.odkSyncController = {
    async syncAll(req, res) {
        try {
            console.log('🚀 Iniciando sincronização em massa via API...');
            const resultado = await odkSyncService_1.default.syncAll();
            res.json({
                success: true,
                message: `Sincronização concluída: ${resultado.total_fotos} fotos e ${resultado.total_arquivos} arquivos`,
                data: resultado,
            });
        }
        catch (error) {
            console.error('Erro na sincronização em massa:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao sincronizar organizações',
            });
        }
    },
    async getStats(req, res) {
        try {
            const stats = await odkSyncService_1.default.getStats();
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Erro ao buscar estatísticas',
            });
        }
    },
};
//# sourceMappingURL=odkSyncController.js.map