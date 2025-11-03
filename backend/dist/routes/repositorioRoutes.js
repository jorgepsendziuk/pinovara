"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const repositorioController_1 = require("../controllers/repositorioController");
const auth_1 = require("../middleware/auth");
const repositorioAuth_1 = require("../middleware/repositorioAuth");
const router = (0, express_1.Router)();
router.get('/stats/estatisticas', repositorioAuth_1.optionalAuth, repositorioController_1.repositorioController.getEstatisticas);
router.get('/:id/download', (req, res, next) => {
    const id = req.params.id;
    if (!/^\d+$/.test(id)) {
        return next();
    }
    (0, repositorioAuth_1.optionalAuth)(req, res, next);
}, repositorioController_1.repositorioController.downloadArquivo);
router.get('/:id', (req, res, next) => {
    const id = req.params.id;
    if (!/^\d+$/.test(id)) {
        return next();
    }
    (0, repositorioAuth_1.optionalAuth)(req, res, next);
}, repositorioController_1.repositorioController.getArquivo);
router.get('/', repositorioAuth_1.optionalAuth, repositorioController_1.repositorioController.listArquivos);
router.post('/upload', auth_1.authenticateToken, repositorioAuth_1.requireUploadPermission, repositorioController_1.upload.single('arquivo'), repositorioController_1.repositorioController.uploadArquivo);
router.delete('/:id', auth_1.authenticateToken, repositorioAuth_1.requireDeletePermission, repositorioController_1.repositorioController.deleteArquivo);
exports.default = router;
//# sourceMappingURL=repositorioRoutes.js.map