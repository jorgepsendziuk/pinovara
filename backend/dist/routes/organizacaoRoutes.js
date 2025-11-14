"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const organizacaoController_1 = require("../controllers/organizacaoController");
const abrangenciaController_1 = require("../controllers/abrangenciaController");
const associadosJuridicosController_1 = require("../controllers/associadosJuridicosController");
const producaoController_1 = require("../controllers/producaoController");
const indicadoresController_1 = require("../controllers/indicadoresController");
const participantesController_1 = require("../controllers/participantesController");
const PlanoGestaoController_1 = __importStar(require("../controllers/PlanoGestaoController"));
const auth_1 = require("../middleware/auth");
const roleAuth_1 = require("../middleware/roleAuth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.use(roleAuth_1.checkOrganizacaoPermission);
router.get('/dashboard', organizacaoController_1.organizacaoController.getDashboard.bind(organizacaoController_1.organizacaoController));
router.get('/estados', organizacaoController_1.organizacaoController.getEstados.bind(organizacaoController_1.organizacaoController));
router.get('/municipios/:estadoId?', organizacaoController_1.organizacaoController.getMunicipios.bind(organizacaoController_1.organizacaoController));
router.get('/', organizacaoController_1.organizacaoController.list.bind(organizacaoController_1.organizacaoController));
router.post('/', organizacaoController_1.organizacaoController.create.bind(organizacaoController_1.organizacaoController));
router.get('/:id', organizacaoController_1.organizacaoController.getById.bind(organizacaoController_1.organizacaoController));
router.put('/:id', organizacaoController_1.organizacaoController.update.bind(organizacaoController_1.organizacaoController));
router.patch('/:id/validacao', organizacaoController_1.organizacaoController.updateValidacao.bind(organizacaoController_1.organizacaoController));
router.get('/:id/historico-validacao', organizacaoController_1.organizacaoController.getHistoricoValidacao.bind(organizacaoController_1.organizacaoController));
router.delete('/:id', organizacaoController_1.organizacaoController.delete.bind(organizacaoController_1.organizacaoController));
router.get('/:id/tecnicos', organizacaoController_1.organizacaoController.listEquipeTecnica.bind(organizacaoController_1.organizacaoController));
router.get('/:id/tecnicos/disponiveis', organizacaoController_1.organizacaoController.listTecnicosDisponiveis.bind(organizacaoController_1.organizacaoController));
router.post('/:id/tecnicos', organizacaoController_1.organizacaoController.addTecnicoEquipe.bind(organizacaoController_1.organizacaoController));
router.delete('/:id/tecnicos/:idTecnico', organizacaoController_1.organizacaoController.removeTecnicoEquipe.bind(organizacaoController_1.organizacaoController));
router.get('/:id/abrangencia-socios', abrangenciaController_1.abrangenciaController.list);
router.post('/:id/abrangencia-socios', abrangenciaController_1.abrangenciaController.create);
router.put('/:id/abrangencia-socios/:itemId', abrangenciaController_1.abrangenciaController.update);
router.delete('/:id/abrangencia-socios/:itemId', abrangenciaController_1.abrangenciaController.delete);
router.get('/:id/associados-juridicos', associadosJuridicosController_1.associadosJuridicosController.list);
router.post('/:id/associados-juridicos', associadosJuridicosController_1.associadosJuridicosController.create);
router.put('/:id/associados-juridicos/:itemId', associadosJuridicosController_1.associadosJuridicosController.update);
router.delete('/:id/associados-juridicos/:itemId', associadosJuridicosController_1.associadosJuridicosController.delete);
router.get('/:id/producao', producaoController_1.producaoController.list);
router.post('/:id/producao', producaoController_1.producaoController.create);
router.put('/:id/producao/:itemId', producaoController_1.producaoController.update);
router.delete('/:id/producao/:itemId', producaoController_1.producaoController.delete);
router.get('/:id/indicadores', indicadoresController_1.indicadoresController.list);
router.post('/:id/indicadores', indicadoresController_1.indicadoresController.create);
router.delete('/:id/indicadores/:indicadorId', indicadoresController_1.indicadoresController.delete);
router.get('/:id/participantes', participantesController_1.participantesController.list);
router.post('/:id/participantes', participantesController_1.participantesController.create);
router.put('/:id/participantes/:participanteId', participantesController_1.participantesController.update);
router.delete('/:id/participantes/:participanteId', participantesController_1.participantesController.delete);
router.get('/:id/plano-gestao', PlanoGestaoController_1.default.getPlanoGestao.bind(PlanoGestaoController_1.default));
router.put('/:id/plano-gestao/rascunho', PlanoGestaoController_1.default.updateRascunho.bind(PlanoGestaoController_1.default));
router.put('/:id/plano-gestao/relatorio-sintetico', PlanoGestaoController_1.default.updateRelatorioSintetico.bind(PlanoGestaoController_1.default));
router.get('/:id/plano-gestao/pdf', PlanoGestaoController_1.default.gerarPdf.bind(PlanoGestaoController_1.default));
router.post('/:id/plano-gestao/acoes', PlanoGestaoController_1.default.createAcaoPersonalizada.bind(PlanoGestaoController_1.default));
router.put('/:id/plano-gestao/acoes/personalizadas/:acaoId', PlanoGestaoController_1.default.updateAcaoPersonalizada.bind(PlanoGestaoController_1.default));
router.delete('/:id/plano-gestao/acoes/personalizadas/:acaoId', PlanoGestaoController_1.default.deleteAcaoPersonalizada.bind(PlanoGestaoController_1.default));
router.put('/:id/plano-gestao/acoes/:idAcaoModelo', PlanoGestaoController_1.default.upsertAcao.bind(PlanoGestaoController_1.default));
router.delete('/:id/plano-gestao/acoes/:idAcaoModelo', PlanoGestaoController_1.default.deleteAcao.bind(PlanoGestaoController_1.default));
router.post('/:id/plano-gestao/evidencias', PlanoGestaoController_1.uploadEvidencia.single('arquivo'), PlanoGestaoController_1.default.uploadEvidencia.bind(PlanoGestaoController_1.default));
router.get('/:id/plano-gestao/evidencias', PlanoGestaoController_1.default.listEvidencias.bind(PlanoGestaoController_1.default));
router.delete('/:id/plano-gestao/evidencias/:idEvidencia', PlanoGestaoController_1.default.deleteEvidencia.bind(PlanoGestaoController_1.default));
router.get('/:id/plano-gestao/evidencias/:idEvidencia/download', PlanoGestaoController_1.default.downloadEvidencia.bind(PlanoGestaoController_1.default));
exports.default = router;
//# sourceMappingURL=organizacaoRoutes.js.map