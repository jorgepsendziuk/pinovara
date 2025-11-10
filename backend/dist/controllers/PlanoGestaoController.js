"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadEvidencia = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const PlanoGestaoService_1 = __importDefault(require("../services/PlanoGestaoService"));
const PlanoGestaoPdfService_1 = __importDefault(require("../services/PlanoGestaoPdfService"));
const UPLOAD_DIR = process.env.NODE_ENV === 'production'
    ? '/var/pinovara/shared/uploads/plano-gestao'
    : '/Users/jorgepsendziuk/Documents/pinovara/uploads/plano-gestao';
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        if (!fs_1.default.existsSync(UPLOAD_DIR)) {
            fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
        }
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const idOrganizacao = req.params.id;
        const timestamp = Date.now();
        const ext = path_1.default.extname(file.originalname);
        const nomeOriginalLimpo = path_1.default.basename(file.originalname, ext)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .toLowerCase()
            .substring(0, 50);
        const nomeArquivoFinal = `org${idOrganizacao}-${nomeOriginalLimpo}-${timestamp}${ext}`;
        cb(null, nomeArquivoFinal);
    }
});
exports.uploadEvidencia = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
});
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
    async gerarPdf(req, res) {
        try {
            const idOrganizacao = parseInt(req.params.id);
            if (isNaN(idOrganizacao)) {
                res.status(400).json({ error: 'ID da organização inválido' });
                return;
            }
            const pdfStream = await PlanoGestaoPdfService_1.default.gerarPdfPlanoGestao(idOrganizacao);
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=plano-gestao_${idOrganizacao}.pdf`);
            pdfStream.on('error', (error) => {
                console.error('Erro no stream de PDF do plano de gestão:', error);
                res.status(500).end();
            });
            pdfStream.pipe(res);
        }
        catch (error) {
            console.error('Erro ao gerar PDF do plano de gestão:', error);
            res.status(500).json({
                error: 'Erro ao gerar PDF do plano de gestão',
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
            console.log('📥 [PlanoGestao] Dados recebidos no upsert de ação:', JSON.stringify(dados));
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
            if ('acao' in dados) {
                if (dados.acao === null || dados.acao === undefined) {
                    dadosProcessados.acao = null;
                }
                else if (typeof dados.acao === 'string') {
                    const valorAcao = dados.acao.trim();
                    dadosProcessados.acao = valorAcao.length === 0 ? null : valorAcao;
                }
                else {
                    dadosProcessados.acao = String(dados.acao);
                }
            }
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
            if ('suprimida' in dados) {
                dadosProcessados.suprimida = Boolean(dados.suprimida);
            }
            console.log('🛠️ [PlanoGestao] Dados processados para upsert:', JSON.stringify(dadosProcessados));
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
    async createAcaoPersonalizada(req, res) {
        try {
            const idOrganizacao = parseInt(req.params.id);
            const { tipo, grupo, acao, responsavel, data_inicio, data_termino, como_sera_feito, recursos } = req.body;
            if (isNaN(idOrganizacao)) {
                res.status(400).json({ error: 'ID da organização inválido' });
                return;
            }
            if (!tipo || typeof tipo !== 'string') {
                res.status(400).json({ error: 'Tipo do plano é obrigatório' });
                return;
            }
            const dadosProcessados = {
                tipo: tipo,
                grupo: typeof grupo === 'string' || grupo === null ? grupo : String(grupo),
                acao: typeof acao === 'string' ? acao.trim() || null : (acao ?? null),
                responsavel: typeof responsavel === 'string' ? responsavel : responsavel ?? null,
                data_inicio: data_inicio ? new Date(data_inicio) : null,
                data_termino: data_termino ? new Date(data_termino) : null,
                como_sera_feito: typeof como_sera_feito === 'string' ? como_sera_feito : como_sera_feito ?? null,
                recursos: typeof recursos === 'string' ? recursos : recursos ?? null
            };
            const novaAcaoId = await PlanoGestaoService_1.default.createAcaoPersonalizada(idOrganizacao, dadosProcessados);
            res.status(201).json({
                message: 'Ação personalizada criada com sucesso',
                id: novaAcaoId
            });
        }
        catch (error) {
            console.error('Erro ao criar ação personalizada:', error);
            res.status(500).json({
                error: 'Erro ao criar ação personalizada',
                details: error.message
            });
        }
    }
    async updateAcaoPersonalizada(req, res) {
        try {
            const idOrganizacao = parseInt(req.params.id);
            const idAcao = parseInt(req.params.acaoId);
            const dados = req.body;
            if (isNaN(idOrganizacao) || isNaN(idAcao)) {
                res.status(400).json({ error: 'IDs inválidos' });
                return;
            }
            const dadosProcessados = {};
            if ('acao' in dados) {
                if (dados.acao === null || dados.acao === undefined) {
                    dadosProcessados.acao = null;
                }
                else if (typeof dados.acao === 'string') {
                    const valor = dados.acao.trim();
                    dadosProcessados.acao = valor.length === 0 ? null : valor;
                }
                else {
                    dadosProcessados.acao = String(dados.acao);
                }
            }
            if ('responsavel' in dados)
                dadosProcessados.responsavel = dados.responsavel;
            if ('data_inicio' in dados)
                dadosProcessados.data_inicio = dados.data_inicio ? new Date(dados.data_inicio) : null;
            if ('data_termino' in dados)
                dadosProcessados.data_termino = dados.data_termino ? new Date(dados.data_termino) : null;
            if ('como_sera_feito' in dados)
                dadosProcessados.como_sera_feito = dados.como_sera_feito;
            if ('recursos' in dados)
                dadosProcessados.recursos = dados.recursos;
            if ('suprimida' in dados)
                dadosProcessados.suprimida = Boolean(dados.suprimida);
            await PlanoGestaoService_1.default.updateAcaoPersonalizada(idOrganizacao, idAcao, dadosProcessados);
            res.status(200).json({ message: 'Ação personalizada atualizada com sucesso' });
        }
        catch (error) {
            console.error('Erro ao atualizar ação personalizada:', error);
            res.status(500).json({
                error: 'Erro ao atualizar ação personalizada',
                details: error.message
            });
        }
    }
    async deleteAcaoPersonalizada(req, res) {
        try {
            const idOrganizacao = parseInt(req.params.id);
            const idAcao = parseInt(req.params.acaoId);
            if (isNaN(idOrganizacao) || isNaN(idAcao)) {
                res.status(400).json({ error: 'IDs inválidos' });
                return;
            }
            await PlanoGestaoService_1.default.deleteAcaoPersonalizada(idOrganizacao, idAcao);
            res.status(200).json({ message: 'Ação personalizada removida com sucesso' });
        }
        catch (error) {
            console.error('Erro ao remover ação personalizada:', error);
            res.status(500).json({
                error: 'Erro ao remover ação personalizada',
                details: error.message
            });
        }
    }
    async updateRelatorioSintetico(req, res) {
        try {
            const idOrganizacao = parseInt(req.params.id);
            const { relatorio } = req.body;
            const userId = req.user?.id;
            if (isNaN(idOrganizacao)) {
                res.status(400).json({
                    error: 'ID da organização inválido'
                });
                return;
            }
            if (relatorio !== null && typeof relatorio !== 'string') {
                res.status(400).json({
                    error: 'Relatório deve ser uma string ou null'
                });
                return;
            }
            if (!userId) {
                res.status(401).json({
                    error: 'Usuário não autenticado'
                });
                return;
            }
            await PlanoGestaoService_1.default.updateRelatorioSintetico(idOrganizacao, relatorio, userId);
            res.status(200).json({
                message: 'Relatório sintético atualizado com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao atualizar relatório sintético:', error);
            if (error.message === 'Organização não encontrada') {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({
                error: 'Erro ao atualizar relatório sintético',
                details: error.message
            });
        }
    }
    async uploadEvidencia(req, res) {
        try {
            const idOrganizacao = parseInt(req.params.id);
            const file = req.file;
            const { tipo, descricao } = req.body;
            if (isNaN(idOrganizacao)) {
                res.status(400).json({
                    error: 'ID da organização inválido'
                });
                return;
            }
            if (!file) {
                res.status(400).json({
                    error: 'Nenhum arquivo foi enviado'
                });
                return;
            }
            if (!tipo || (tipo !== 'foto' && tipo !== 'lista_presenca')) {
                res.status(400).json({
                    error: 'Tipo deve ser "foto" ou "lista_presenca"'
                });
                return;
            }
            if (!req.user?.id) {
                res.status(401).json({
                    error: 'Usuário não autenticado'
                });
                return;
            }
            const caminhoArquivo = path_1.default.join(UPLOAD_DIR, file.filename);
            const evidencia = await PlanoGestaoService_1.default.uploadEvidencia(idOrganizacao, tipo, file.originalname, caminhoArquivo, descricao || null, req.user.id);
            res.status(201).json({
                message: 'Evidência enviada com sucesso',
                evidencia: evidencia
            });
        }
        catch (error) {
            console.error('Erro ao fazer upload de evidência:', error);
            if (req.file) {
                const filePath = path_1.default.join(UPLOAD_DIR, req.file.filename);
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
            if (error.message === 'Organização não encontrada') {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({
                error: 'Erro ao fazer upload de evidência',
                details: error.message
            });
        }
    }
    async listEvidencias(req, res) {
        try {
            const idOrganizacao = parseInt(req.params.id);
            if (isNaN(idOrganizacao)) {
                res.status(400).json({
                    error: 'ID da organização inválido'
                });
                return;
            }
            const evidencias = await PlanoGestaoService_1.default.listEvidencias(idOrganizacao);
            res.status(200).json(evidencias);
        }
        catch (error) {
            console.error('Erro ao listar evidências:', error);
            res.status(500).json({
                error: 'Erro ao listar evidências',
                details: error.message
            });
        }
    }
    async deleteEvidencia(req, res) {
        try {
            const idEvidencia = parseInt(req.params.idEvidencia);
            if (isNaN(idEvidencia)) {
                res.status(400).json({
                    error: 'ID da evidência inválido'
                });
                return;
            }
            const { caminhoArquivo } = await PlanoGestaoService_1.default.deleteEvidencia(idEvidencia);
            if (fs_1.default.existsSync(caminhoArquivo)) {
                fs_1.default.unlinkSync(caminhoArquivo);
            }
            res.status(200).json({
                message: 'Evidência deletada com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao deletar evidência:', error);
            if (error.message === 'Evidência não encontrada') {
                res.status(404).json({ error: error.message });
                return;
            }
            res.status(500).json({
                error: 'Erro ao deletar evidência',
                details: error.message
            });
        }
    }
    async downloadEvidencia(req, res) {
        try {
            const idEvidencia = parseInt(req.params.idEvidencia);
            const idOrganizacao = parseInt(req.params.id);
            if (isNaN(idEvidencia)) {
                res.status(400).json({
                    error: 'ID da evidência inválido'
                });
                return;
            }
            if (isNaN(idOrganizacao)) {
                res.status(400).json({
                    error: 'ID da organização inválido'
                });
                return;
            }
            const evidencias = await PlanoGestaoService_1.default.listEvidencias(idOrganizacao);
            const evidencia = evidencias.find(ev => ev.id === idEvidencia);
            if (!evidencia) {
                res.status(404).json({
                    error: 'Evidência não encontrada'
                });
                return;
            }
            if (!fs_1.default.existsSync(evidencia.caminho_arquivo)) {
                res.status(404).json({
                    error: 'Arquivo não encontrado no servidor'
                });
                return;
            }
            res.download(evidencia.caminho_arquivo, evidencia.nome_arquivo);
        }
        catch (error) {
            console.error('Erro ao fazer download de evidência:', error);
            res.status(500).json({
                error: 'Erro ao fazer download de evidência',
                details: error.message
            });
        }
    }
}
exports.default = new PlanoGestaoController();
//# sourceMappingURL=PlanoGestaoController.js.map