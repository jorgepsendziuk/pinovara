"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const documentoController_1 = require("../controllers/documentoController");
const auth_1 = require("../middleware/auth");
const roleAuth_1 = require("../middleware/roleAuth");
const router = (0, express_1.Router)();
// Todas as rotas precisam de autenticação e verificação de permissões
router.use(auth_1.authenticateToken);
router.use(roleAuth_1.checkOrganizacaoPermission);
// Upload de documento
router.post('/organizacoes/:id/documentos', documentoController_1.upload.single('arquivo'), documentoController_1.documentoController.uploadDocumento.bind(documentoController_1.documentoController));
// Listar documentos de uma organização
router.get('/organizacoes/:id/documentos', documentoController_1.documentoController.listDocumentos.bind(documentoController_1.documentoController));
// Download de documento
router.get('/organizacoes/:id/documentos/:docId/download', documentoController_1.documentoController.downloadDocumento.bind(documentoController_1.documentoController));
// Deletar documento
router.delete('/organizacoes/:id/documentos/:docId', documentoController_1.documentoController.deleteDocumento.bind(documentoController_1.documentoController));
exports.default = router;
