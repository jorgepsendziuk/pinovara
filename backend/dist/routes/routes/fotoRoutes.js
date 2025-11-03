"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fotoController_1 = require("../controllers/fotoController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Upload de foto (requer autenticação)
router.post('/:id/fotos', auth_1.authenticateToken, fotoController_1.uploadMiddleware, fotoController_1.fotoController.upload);
// Listar fotos de uma organização (requer autenticação)
router.get('/:id/fotos', auth_1.authenticateToken, fotoController_1.fotoController.list);
// Visualizar foto (público - para imagens em <img src>)
router.get('/:id/fotos/:fotoId/view', fotoController_1.fotoController.view);
// Download de foto (requer autenticação)
router.get('/:id/fotos/:fotoId/download', auth_1.authenticateToken, fotoController_1.fotoController.download);
// Deletar foto (requer autenticação)
router.delete('/:id/fotos/:fotoId', auth_1.authenticateToken, fotoController_1.fotoController.delete);
exports.default = router;
