"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fotoSyncController_1 = require("../controllers/fotoSyncController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/organizacoes/:id/fotos/sync', auth_1.authenticateToken, fotoSyncController_1.fotoSyncController.sync);
router.get('/organizacoes/:id/fotos/odk-disponiveis', auth_1.authenticateToken, fotoSyncController_1.fotoSyncController.listODKAvailable);
exports.default = router;
//# sourceMappingURL=fotoSyncRoutes.js.map