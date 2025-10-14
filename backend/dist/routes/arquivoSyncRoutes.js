"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const arquivoSyncController_1 = require("../controllers/arquivoSyncController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/organizacoes/:id/arquivos/sync', auth_1.authenticateToken, arquivoSyncController_1.arquivoSyncController.syncFromODK);
router.get('/organizacoes/:id/arquivos/odk-disponiveis', auth_1.authenticateToken, arquivoSyncController_1.arquivoSyncController.listODKAvailable);
exports.default = router;
//# sourceMappingURL=arquivoSyncRoutes.js.map