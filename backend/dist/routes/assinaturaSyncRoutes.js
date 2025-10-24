"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const assinaturaSyncController_1 = require("../controllers/assinaturaSyncController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/organizacoes/:id/assinaturas/sync', auth_1.authenticateToken, assinaturaSyncController_1.assinaturaSyncController.sync);
router.get('/organizacoes/:id/assinaturas/odk-disponiveis', auth_1.authenticateToken, assinaturaSyncController_1.assinaturaSyncController.listODKAvailable);
exports.default = router;
//# sourceMappingURL=assinaturaSyncRoutes.js.map