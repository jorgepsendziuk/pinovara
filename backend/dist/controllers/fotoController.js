"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fotoController = exports.uploadMiddleware = void 0;
const fotoService_1 = require("../services/fotoService");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configuração do Multer para upload de fotos
const UPLOAD_DIR = '/var/pinovara/shared/uploads/fotos';
// Garantir que o diretório existe
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const baseName = path_1.default.basename(file.originalname, ext)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9]/gi, '-') // Substitui especiais por hífen
            .replace(/-+/g, '-') // Remove hífens duplicados
            .replace(/^-|-$/g, '') // Remove hífens início/fim
            .toLowerCase();
        const cleanName = `${baseName}${ext}`;
        cb(null, cleanName);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            cb(null, true);
        }
        else {
            cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WEBP)'));
        }
    }
});
exports.uploadMiddleware = upload.single('foto');
exports.fotoController = {
    // Upload de foto
    async upload(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'Nenhum arquivo foi enviado'
                });
            }
            const organizacaoId = parseInt(req.params.id);
            const { obs } = req.body;
            const userEmail = req.user?.email || 'sistema';
            const foto = await fotoService_1.fotoService.create({
                foto: req.file.filename,
                obs,
                id_organizacao: organizacaoId,
                creator_uri_user: userEmail
            });
            res.json({
                success: true,
                data: foto
            });
        }
        catch (error) {
            console.error('Erro ao fazer upload de foto:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Erro ao fazer upload de foto'
            });
        }
    },
    // Listar fotos de uma organização
    async list(req, res) {
        try {
            const organizacaoId = parseInt(req.params.id);
            const fotos = await fotoService_1.fotoService.listByOrganizacao(organizacaoId);
            res.json({
                success: true,
                data: fotos
            });
        }
        catch (error) {
            console.error('Erro ao listar fotos:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Erro ao listar fotos'
            });
        }
    },
    // Visualizar foto (retorna a imagem para exibição)
    async view(req, res) {
        try {
            const fotoId = parseInt(req.params.fotoId);
            const foto = await fotoService_1.fotoService.findById(fotoId);
            if (!foto || !foto.foto) {
                console.log(`❌ Foto ${fotoId} não encontrada no banco`);
                return res.status(404).json({
                    success: false,
                    error: 'Foto não encontrada'
                });
            }
            const filePath = path_1.default.join(UPLOAD_DIR, foto.foto);
            console.log(`🔍 Buscando arquivo: ${filePath}`);
            if (!fs_1.default.existsSync(filePath)) {
                console.log(`❌ Arquivo não existe: ${filePath}`);
                return res.status(404).json({
                    success: false,
                    error: 'Arquivo não encontrado no servidor'
                });
            }
            console.log(`✅ Arquivo encontrado: ${foto.foto}`);
            // Detectar tipo MIME baseado na extensão
            const ext = path_1.default.extname(foto.foto).toLowerCase();
            const mimeTypes = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp'
            };
            const contentType = mimeTypes[ext] || 'image/jpeg';
            res.setHeader('Content-Type', contentType);
            res.sendFile(filePath);
        }
        catch (error) {
            console.error('Erro ao visualizar foto:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Erro ao visualizar foto'
            });
        }
    },
    // Download de foto
    async download(req, res) {
        try {
            const fotoId = parseInt(req.params.fotoId);
            const foto = await fotoService_1.fotoService.findById(fotoId);
            if (!foto || !foto.foto) {
                return res.status(404).json({
                    success: false,
                    error: 'Foto não encontrada'
                });
            }
            const filePath = path_1.default.join(UPLOAD_DIR, foto.foto);
            if (!fs_1.default.existsSync(filePath)) {
                return res.status(404).json({
                    success: false,
                    error: 'Arquivo não encontrado no servidor'
                });
            }
            // Garantir que arquivo tenha extensão no download
            const nomeDownload = foto.foto.includes('.') ? foto.foto : `${foto.foto}.jpg`;
            res.download(filePath, nomeDownload);
        }
        catch (error) {
            console.error('Erro ao fazer download de foto:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Erro ao fazer download de foto'
            });
        }
    },
    // Deletar foto
    async delete(req, res) {
        try {
            const fotoId = parseInt(req.params.fotoId);
            const foto = await fotoService_1.fotoService.findById(fotoId);
            if (!foto) {
                return res.status(404).json({
                    success: false,
                    error: 'Foto não encontrada'
                });
            }
            // Deletar arquivo físico
            if (foto.foto) {
                const filePath = path_1.default.join(UPLOAD_DIR, foto.foto);
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
            // Deletar registro do banco
            await fotoService_1.fotoService.delete(fotoId);
            res.json({
                success: true,
                message: 'Foto deletada com sucesso'
            });
        }
        catch (error) {
            console.error('Erro ao deletar foto:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Erro ao deletar foto'
            });
        }
    }
};
//# sourceMappingURL=fotoController.js.map