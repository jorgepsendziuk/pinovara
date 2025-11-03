"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arquivoSyncController = void 0;
const arquivoSyncService_1 = require("../services/arquivoSyncService");
exports.arquivoSyncController = {
    /**
     * Sincroniza arquivos do ODK para uma organização
     */
    async syncFromODK(req, res) {
        try {
            const organizacaoId = parseInt(req.params.id);
            const userEmail = req.user?.email || 'sistema';
            console.log(`🔄 Iniciando sincronização de arquivos ODK para organização ${organizacaoId} por ${userEmail}`);
            const result = await arquivoSyncService_1.arquivoSyncService.syncArquivosFromODK(organizacaoId, userEmail);
            console.log(`✅ Sincronização de arquivos concluída:`, {
                total_odk: result.total_odk,
                baixadas: result.baixadas,
                ja_existentes: result.ja_existentes,
                erros: result.erros
            });
            res.json({
                success: true,
                data: result
            });
        }
        catch (error) {
            console.error('❌ Erro no controller de sincronização de arquivos:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    },
    /**
     * Lista arquivos disponíveis no ODK para uma organização
     */
    async listODKAvailable(req, res) {
        try {
            const organizacaoId = parseInt(req.params.id);
            console.log(`🔍 Listando arquivos ODK disponíveis para organização ${organizacaoId}`);
            const arquivos = await arquivoSyncService_1.arquivoSyncService.listarArquivosDisponiveis(organizacaoId);
            console.log(`📊 ${arquivos.length} arquivos encontrados no ODK`);
            res.json({
                success: true,
                data: {
                    total: arquivos.length,
                    arquivos: arquivos.map(arquivo => ({
                        uri: arquivo.uri,
                        nome_arquivo: arquivo.nome_arquivo,
                        tamanho_bytes: arquivo.tamanho_bytes,
                        arquivo_obs: arquivo.arquivo_obs,
                        creation_date: arquivo.creation_date
                    }))
                }
            });
        }
        catch (error) {
            console.error('❌ Erro ao listar arquivos ODK disponíveis:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};
