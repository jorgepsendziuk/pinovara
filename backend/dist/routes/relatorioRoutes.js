"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const relatorioController_1 = require("../controllers/relatorioController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Gerar relatório PDF da organização
router.get('/organizacoes/:id/relatorio/pdf', auth_1.authenticateToken, relatorioController_1.relatorioController.gerarPDF);
exports.default = router;
//# sourceMappingURL=relatorioRoutes.js.map