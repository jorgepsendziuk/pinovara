"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fotoController_1 = require("../controllers/fotoController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/:id/fotos', auth_1.authenticateToken, fotoController_1.uploadMiddleware, fotoController_1.fotoController.upload);
router.get('/:id/fotos', auth_1.authenticateToken, fotoController_1.fotoController.list);
router.get('/:id/fotos/:fotoId/view', fotoController_1.fotoController.view);
router.get('/:id/fotos/:fotoId/download', auth_1.authenticateToken, fotoController_1.fotoController.download);
router.delete('/:id/fotos/:fotoId', auth_1.authenticateToken, fotoController_1.fotoController.delete);
exports.default = router;
//# sourceMappingURL=fotoRoutes.js.map