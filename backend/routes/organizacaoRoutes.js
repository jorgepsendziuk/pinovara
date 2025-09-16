"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const organizacaoController_1 = require("../controllers/organizacaoController");
const router = (0, express_1.Router)();
// Aplicar autenticação em todas as rotas
router.use(authMiddleware_1.authenticateToken);
// Dashboard de organizações
router.get('/dashboard', organizacaoController_1.getDashboard);
// Listar organizações com filtros
router.get('/', organizacaoController_1.getOrganizacoes);
// Buscar organização por ID
router.get('/:id', organizacaoController_1.getOrganizacaoById);
// Criar nova organização
router.post('/', organizacaoController_1.createOrganizacao);
// Atualizar organização
router.put('/:id', organizacaoController_1.updateOrganizacao);
// Excluir organização
router.delete('/:id', organizacaoController_1.deleteOrganizacao);
exports.default = router;
//# sourceMappingURL=organizacaoRoutes.js.map