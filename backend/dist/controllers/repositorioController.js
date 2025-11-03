"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.repositorioController = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const repositorioService_1 = require("../services/repositorioService");
const UPLOAD_DIR = process.env.NODE_ENV === 'production'
    ? '/var/pinovara/shared/uploads/repositorio'
    : '/Users/jorgepsendziuk/Documents/pinovara/uploads/repositorio';
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        if (!fs_1.default.existsSync(UPLOAD_DIR)) {
            fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
        }
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
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
        const nomeArquivoFinal = `repo-${nomeOriginalLimpo}-${timestamp}${ext}`;
        cb(null, nomeArquivoFinal);
    }
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        'application/zip',
        'application/x-rar-compressed',
        'application/x-7z-compressed'
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Tipo de arquivo não permitido. Apenas PDF, imagens, documentos Office, texto e arquivos compactados são aceitos.'));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
});
class RepositorioController {
    async uploadArquivo(req, res) {
        try {
            const file = req.file;
            const { descricao, categoria, tags } = req.body;
            if (!file) {
                res.status(400).json({
                    success: false,
                    error: { message: 'Nenhum arquivo foi enviado' }
                });
                return;
            }
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: { message: 'Usuário não autenticado' }
                });
                return;
            }
            const tagsArray = tags ? tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [];
            const arquivo = await repositorioService_1.repositorioService.create({
                nome_arquivo: file.filename,
                nome_original: file.originalname,
                caminho_arquivo: path_1.default.join(UPLOAD_DIR, file.filename),
                tamanho_bytes: file.size,
                tipo_mime: file.mimetype,
                extensao: path_1.default.extname(file.originalname).toLowerCase(),
                descricao: descricao || null,
                categoria: categoria || 'geral',
                tags: tagsArray,
                usuario_upload: req.user.email,
                usuario_upload_id: req.user.id,
            });
            res.status(201).json({
                success: true,
                data: arquivo,
                message: 'Arquivo enviado com sucesso para o repositório público'
            });
        }
        catch (error) {
            console.error('Erro ao fazer upload de arquivo:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Erro ao fazer upload de arquivo' }
            });
        }
    }
    async updateArquivo(req, res) {
        try {
            const { id } = req.params;
            const arquivoId = parseInt(id);
            const { descricao, categoria, tags } = req.body;
            if (isNaN(arquivoId)) {
                res.status(400).json({ success: false, error: { message: 'ID do arquivo inválido' } });
                return;
            }
            if (!req.user) {
                res.status(401).json({ success: false, error: { message: 'Usuário não autenticado' } });
                return;
            }
            const arquivo = await repositorioService_1.repositorioService.findById(arquivoId);
            if (!arquivo) {
                res.status(404).json({ success: false, error: { message: 'Arquivo não encontrado' } });
                return;
            }
            const isAdmin = req.userPermissions?.isAdmin === true || req.user.roles?.some(r => r.name === 'admin' && r.module?.name === 'sistema');
            if (arquivo.usuario_upload_id !== req.user.id && !isAdmin) {
                res.status(403).json({ success: false, error: { message: 'Sem permissão para editar este arquivo' } });
                return;
            }
            const tagsArray = typeof tags === 'string' ? tags.split(',').map((t) => t.trim()).filter(Boolean) : Array.isArray(tags) ? tags : [];
            const result = await repositorioService_1.repositorioService.update(arquivoId, {
                descricao: descricao ?? null,
                categoria: categoria || arquivo.categoria,
                tags: tagsArray
            });
            res.json({ success: true, data: result[0] });
        }
        catch (error) {
            console.error('Erro ao atualizar arquivo:', error);
            res.status(500).json({ success: false, error: { message: 'Erro ao atualizar arquivo' } });
        }
    }
    async listArquivos(req, res) {
        try {
            const { page = 1, limit = 20, categoria, search, tags, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
            const filtros = {
                categoria: categoria,
                search: search,
                tags: tags,
            };
            const arquivos = await repositorioService_1.repositorioService.list({
                page: parseInt(page),
                limit: parseInt(limit),
                filtros,
                sortBy: sortBy,
                sortOrder: sortOrder
            });
            res.json({
                success: true,
                data: arquivos
            });
        }
        catch (error) {
            console.error('Erro ao listar arquivos:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Erro ao listar arquivos' }
            });
        }
    }
    async downloadArquivo(req, res) {
        try {
            const { id } = req.params;
            const arquivoId = parseInt(id);
            if (isNaN(arquivoId)) {
                res.status(400).json({
                    success: false,
                    error: { message: 'ID do arquivo inválido' }
                });
                return;
            }
            const arquivo = await repositorioService_1.repositorioService.findById(arquivoId);
            if (!arquivo || !arquivo.ativo) {
                res.status(404).json({
                    success: false,
                    error: { message: 'Arquivo não encontrado' }
                });
                return;
            }
            if (!fs_1.default.existsSync(arquivo.caminho_arquivo)) {
                res.status(404).json({
                    success: false,
                    error: { message: 'Arquivo não encontrado no servidor' }
                });
                return;
            }
            await repositorioService_1.repositorioService.incrementDownloads(arquivoId);
            res.download(arquivo.caminho_arquivo, arquivo.nome_original, (err) => {
                if (err) {
                    console.error('Erro ao enviar arquivo:', err);
                    if (!res.headersSent) {
                        res.status(500).json({
                            success: false,
                            error: { message: 'Erro ao baixar arquivo' }
                        });
                    }
                }
            });
        }
        catch (error) {
            console.error('Erro ao baixar arquivo:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Erro ao baixar arquivo' }
            });
        }
    }
    async getArquivo(req, res) {
        try {
            const { id } = req.params;
            const arquivoId = parseInt(id);
            if (isNaN(arquivoId)) {
                res.status(400).json({
                    success: false,
                    error: { message: 'ID do arquivo inválido' }
                });
                return;
            }
            const arquivo = await repositorioService_1.repositorioService.findById(arquivoId);
            if (!arquivo || !arquivo.ativo) {
                res.status(404).json({
                    success: false,
                    error: { message: 'Arquivo não encontrado' }
                });
                return;
            }
            res.json({
                success: true,
                data: arquivo
            });
        }
        catch (error) {
            console.error('Erro ao obter arquivo:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Erro ao obter arquivo' }
            });
        }
    }
    async deleteArquivo(req, res) {
        try {
            const { id } = req.params;
            const arquivoId = parseInt(id);
            if (isNaN(arquivoId)) {
                res.status(400).json({
                    success: false,
                    error: { message: 'ID do arquivo inválido' }
                });
                return;
            }
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: { message: 'Usuário não autenticado' }
                });
                return;
            }
            const arquivo = await repositorioService_1.repositorioService.findById(arquivoId);
            if (!arquivo) {
                res.status(404).json({
                    success: false,
                    error: { message: 'Arquivo não encontrado' }
                });
                return;
            }
            const isAdmin = req.userPermissions?.isAdmin === true || req.user.roles?.some(r => r.name === 'admin' && r.module?.name === 'sistema');
            if (arquivo.usuario_upload_id !== req.user.id && !isAdmin) {
                res.status(403).json({
                    success: false,
                    error: { message: 'Apenas o proprietário do arquivo pode remover este item.' }
                });
                return;
            }
            await repositorioService_1.repositorioService.delete(arquivoId);
            res.json({
                success: true,
                message: 'Arquivo removido com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao deletar arquivo:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Erro ao deletar arquivo' }
            });
        }
    }
    async getEstatisticas(req, res) {
        try {
            const estatisticas = await repositorioService_1.repositorioService.getEstatisticas();
            res.json({
                success: true,
                data: estatisticas
            });
        }
        catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            res.status(500).json({
                success: false,
                error: { message: 'Erro ao obter estatísticas' }
            });
        }
    }
}
exports.repositorioController = new RepositorioController();
//# sourceMappingURL=repositorioController.js.map