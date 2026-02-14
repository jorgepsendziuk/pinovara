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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const adminAuth_1 = require("../middleware/adminAuth");
const adminController_1 = __importDefault(require("../controllers/adminController"));
const analyticsController_1 = require("../controllers/analyticsController");
const odkSyncController_1 = require("../controllers/odkSyncController");
const auditController_1 = __importDefault(require("../controllers/auditController"));
const migrate_id_tecnico_1 = require("../scripts/migrate-id-tecnico");
const create_coordenador_role_1 = require("../scripts/create-coordenador-role");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.use(adminAuth_1.requireAdmin);
router.get('/users', adminController_1.default.getUsers);
router.get('/users/:id', adminController_1.default.getUser);
router.post('/impersonate/:userId', adminController_1.default.impersonateUser);
router.post('/users', adminController_1.default.createUser);
router.put('/users/:id', adminController_1.default.updateUser);
router.delete('/users/:id', adminController_1.default.deleteUser);
router.put('/users/:id/status', adminController_1.default.updateUserStatus);
router.get('/roles', adminController_1.default.getRoles);
router.get('/permissions', adminController_1.default.getPermissions);
router.get('/roles/:roleId/permissions', adminController_1.default.getRolePermissions);
router.put('/roles/:roleId/permissions', adminController_1.default.updateRolePermissions);
router.post('/users/:id/roles', adminController_1.default.assignRole);
router.delete('/users/:id/roles/:roleId', adminController_1.default.removeRole);
router.get('/stats', async (req, res) => {
    try {
        res.json({
            success: true,
            message: 'Estatísticas administrativas',
            data: {
                message: 'Endpoint disponível para estatísticas futuras'
            },
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ [AdminRoutes] Error in /stats:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Erro interno do servidor',
                statusCode: 500
            },
            timestamp: new Date().toISOString()
        });
    }
});
router.get('/system-info', async (req, res) => {
    try {
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
        const prisma = new PrismaClient();
        let dbStatus = 'connected';
        let userCount = 0;
        let orgCount = 0;
        let dbError = null;
        try {
            await prisma.$queryRaw `SELECT 1`;
            userCount = await prisma.users.count();
            orgCount = await prisma.organizacao.count();
        }
        catch (error) {
            dbStatus = 'error';
            dbError = error instanceof Error ? error.message : 'Database connection failed';
        }
        finally {
            await prisma.$disconnect();
        }
        const systemInfo = {
            database: {
                status: dbStatus,
                lastCheck: new Date().toISOString(),
                error: dbError
            },
            users: {
                total: userCount,
                active: userCount
            },
            organizations: {
                total: orgCount
            },
            system: {
                version: process.env.npm_package_version || '2.0.0',
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                nodeVersion: process.version,
                platform: process.platform,
                environment: process.env.NODE_ENV || 'development'
            },
            timestamp: new Date().toISOString()
        };
        res.json({
            success: true,
            data: systemInfo,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ [AdminRoutes] Error in /system-info:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Erro ao obter informações do sistema',
                statusCode: 500
            },
            timestamp: new Date().toISOString()
        });
    }
});
router.get('/analytics/metrics', analyticsController_1.analyticsController.getMetrics.bind(analyticsController_1.analyticsController));
router.get('/audit-logs', auditController_1.default.getAuditLogs);
router.get('/audit-logs/stats', auditController_1.default.getAuditStats);
router.get('/audit-logs/export', auditController_1.default.exportAuditLogs);
router.get('/odk/stats', odkSyncController_1.odkSyncController.getStats);
router.post('/odk/sync-all', odkSyncController_1.odkSyncController.syncAll);
router.post('/migrate-id-tecnico', async (req, res) => {
    try {
        console.log('🚀 Iniciando migração de id_tecnico via endpoint...');
        const result = await (0, migrate_id_tecnico_1.migrateIdTecnico)();
        res.json({
            success: true,
            message: 'Migração concluída com sucesso',
            data: result,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ [AdminRoutes] Erro na migração:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Erro ao executar migração',
                details: error instanceof Error ? error.message : 'Erro desconhecido',
                statusCode: 500
            },
            timestamp: new Date().toISOString()
        });
    }
});
router.post('/create-coordenador-role', async (req, res) => {
    try {
        console.log('🚀 Iniciando criação de role coordenador...');
        const result = await (0, create_coordenador_role_1.createCoordenadorRole)();
        res.json({
            success: true,
            message: result.message,
            data: result.details,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ [AdminRoutes] Erro ao criar coordenador:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Erro ao criar role coordenador',
                details: error instanceof Error ? error.message : 'Erro desconhecido',
                statusCode: 500
            },
            timestamp: new Date().toISOString()
        });
    }
});
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map