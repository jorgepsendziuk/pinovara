"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organizacaoController_1 = require("../controllers/organizacaoController");
const auth_1 = require("../middleware/auth");
const roleAuth_1 = require("../middleware/roleAuth");
const router = (0, express_1.Router)();
// Todas as rotas de organizações precisam de autenticação e verificação de permissões
router.use(auth_1.authenticateToken);
router.use(roleAuth_1.checkOrganizacaoPermission);
// Dashboard - rota especial que deve vir antes das rotas com parâmetros
router.get('/dashboard', organizacaoController_1.organizacaoController.getDashboard.bind(organizacaoController_1.organizacaoController));
// Endpoints auxiliares para estados e municípios
router.get('/estados', organizacaoController_1.organizacaoController.getEstados.bind(organizacaoController_1.organizacaoController));
router.get('/municipios/:estadoId?', organizacaoController_1.organizacaoController.getMunicipios.bind(organizacaoController_1.organizacaoController));
// CRUD básico - agora com controle de acesso por role
router.get('/', organizacaoController_1.organizacaoController.list.bind(organizacaoController_1.organizacaoController));
router.post('/', organizacaoController_1.organizacaoController.create.bind(organizacaoController_1.organizacaoController));
router.get('/:id', organizacaoController_1.organizacaoController.getById.bind(organizacaoController_1.organizacaoController));
router.put('/:id', organizacaoController_1.organizacaoController.update.bind(organizacaoController_1.organizacaoController));
router.delete('/:id', organizacaoController_1.organizacaoController.delete.bind(organizacaoController_1.organizacaoController));
exports.default = router;
//# sourceMappingURL=organizacaoRoutes.js.map