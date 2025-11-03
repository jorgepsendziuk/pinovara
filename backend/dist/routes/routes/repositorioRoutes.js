"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const repositorioController_1 = require("../controllers/repositorioController");
const auth_1 = require("../middleware/auth");
const repositorioAuth_1 = require("../middleware/repositorioAuth");
const router = (0, express_1.Router)();
// ========== ROTAS PÚBLICAS (todos podem acessar) ==========
// Obter estatísticas do repositório
router.get('/stats/estatisticas', repositorioAuth_1.optionalAuth, repositorioController_1.repositorioController.getEstatisticas);
// Download de arquivo
router.get('/:id/download', (req, res, next) => {
    const id = req.params.id;
    if (!/^\d+$/.test(id)) {
        return next(); // Passa para a próxima rota se não for numérico
    }
    (0, repositorioAuth_1.optionalAuth)(req, res, next);
}, repositorioController_1.repositorioController.downloadArquivo);
// Obter detalhes de um arquivo específico (somente se ID for numérico)
router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    if (!/^\d+$/.test(id)) {
        return next(); // Passa para a próxima rota se não for numérico
    }
    (0, repositorioAuth_1.optionalAuth)(req, res, next);
}, repositorioController_1.repositorioController.getArquivo);
// Listar arquivos do repositório (todos podem ver) - deve vir POR ÚLTIMO
router.get('/', repositorioAuth_1.optionalAuth, repositorioController_1.repositorioController.listArquivos);
// ========== ROTAS PROTEGIDAS (apenas admin/coordenador/supervisor) ==========
// Upload de arquivo (requer autenticação + permissão de upload)
router.post('/upload', auth_1.authenticateToken, repositorioAuth_1.requireUploadPermission, repositorioController_1.upload.single('arquivo'), repositorioController_1.repositorioController.uploadArquivo);
// Deletar arquivo (requer autenticação + permissão de delete)
router.delete('/:id', auth_1.authenticateToken, repositorioAuth_1.requireDeletePermission, repositorioController_1.repositorioController.deleteArquivo);
// Atualizar metadados (requer autenticação)
router.put('/:id', auth_1.authenticateToken, repositorioAuth_1.requireDeletePermission, repositorioController_1.repositorioController.updateArquivo);
exports.default = router;
