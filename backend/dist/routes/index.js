"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const organizacaoRoutes_1 = __importDefault(require("./organizacaoRoutes"));
const healthRoutes_1 = __importDefault(require("./healthRoutes"));
const debugRoutes_1 = __importDefault(require("./debugRoutes"));
const adminRoutes_1 = __importDefault(require("./adminRoutes"));
const documentoRoutes_1 = __importDefault(require("./documentoRoutes"));
const fotoRoutes_1 = __importDefault(require("./fotoRoutes"));
const fotoSyncRoutes_1 = __importDefault(require("./fotoSyncRoutes"));
const arquivoSyncRoutes_1 = __importDefault(require("./arquivoSyncRoutes"));
const assinaturaSyncRoutes_1 = __importDefault(require("./assinaturaSyncRoutes"));
const relatorioRoutes_1 = __importDefault(require("./relatorioRoutes"));
const repositorioRoutes_1 = __importDefault(require("./repositorioRoutes"));
const qualificacaoRoutes_1 = __importDefault(require("./qualificacaoRoutes"));
const capacitacaoRoutes_1 = __importDefault(require("./capacitacaoRoutes"));
const avaliacaoRoutes_1 = __importDefault(require("./avaliacaoRoutes"));
const router = (0, express_1.Router)();
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API PINOVARA',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: [
                'POST /auth/login',
                'POST /auth/register',
                'GET /auth/verify',
                'GET /auth/me',
                'PUT /auth/profile',
                'POST /auth/logout'
            ],
            organizacoes: [
                'GET /organizacoes',
                'POST /organizacoes',
                'GET /organizacoes/:id',
                'PUT /organizacoes/:id',
                'DELETE /organizacoes/:id',
                'GET /organizacoes/dashboard',
                'POST /organizacoes/:id/documentos',
                'GET /organizacoes/:id/documentos',
                'GET /organizacoes/:id/documentos/:docId/download',
                'DELETE /organizacoes/:id/documentos/:docId',
                'POST /organizacoes/:id/fotos',
                'GET /organizacoes/:id/fotos',
                'GET /organizacoes/:id/fotos/:fotoId/download',
                'DELETE /organizacoes/:id/fotos/:fotoId'
            ],
            admin: [
                'GET /admin/users',
                'GET /admin/users/:id',
                'POST /admin/users',
                'PUT /admin/users/:id',
                'DELETE /admin/users/:id',
                'PUT /admin/users/:id/status',
                'GET /admin/roles',
                'POST /admin/users/:id/roles',
                'DELETE /admin/users/:id/roles/:roleId',
                'GET /admin/stats'
            ],
            repositorio: [
                'GET /repositorio',
                'GET /repositorio/:id',
                'GET /repositorio/:id/download',
                'GET /repositorio/stats/estatisticas',
                'POST /repositorio/upload',
                'DELETE /repositorio/:id'
            ],
            system: [
                'GET /',
                'GET /health'
            ]
        }
    });
});
router.use('/', healthRoutes_1.default);
router.use('/auth', authRoutes_1.default);
router.use('/admin', adminRoutes_1.default);
router.use('/debug', debugRoutes_1.default);
router.use('/organizacoes', fotoRoutes_1.default);
router.use('/', documentoRoutes_1.default);
router.use('/', fotoSyncRoutes_1.default);
router.use('/', arquivoSyncRoutes_1.default);
router.use('/', assinaturaSyncRoutes_1.default);
router.use('/', relatorioRoutes_1.default);
router.use('/organizacoes', organizacaoRoutes_1.default);
router.use('/qualificacoes', qualificacaoRoutes_1.default);
router.use('/capacitacoes', capacitacaoRoutes_1.default);
router.use('/avaliacoes', avaliacaoRoutes_1.default);
router.use('/repositorio', repositorioRoutes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map