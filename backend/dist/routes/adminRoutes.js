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
const router = (0, express_1.Router)();
// Aplicar autenticação e autorização admin a todas as rotas
router.use(auth_1.authenticateToken);
router.use(adminAuth_1.requireAdmin);
// ========== USER MANAGEMENT ROUTES ==========
/**
 * GET /admin/users
 * Listar todos os usuários com suas roles
 */
router.get('/users', adminController_1.default.getUsers);
/**
 * GET /admin/users/:id
 * Buscar usuário específico por ID
 */
router.get('/users/:id', adminController_1.default.getUser);
/**
 * POST /admin/impersonate/:userId
 * Personificar um usuário (apenas para admins)
 * Gera um token JWT para o usuário personificado
 */
router.post('/impersonate/:userId', adminController_1.default.impersonateUser);
/**
 * POST /admin/users
 * Criar novo usuário
 *
 * Body: {
 *   email: string,
 *   password: string,
 *   name: string,
 *   active?: boolean
 * }
 */
router.post('/users', adminController_1.default.createUser);
/**
 * PUT /admin/users/:id
 * Atualizar usuário existente
 *
 * Body: {
 *   email?: string,
 *   name?: string,
 *   active?: boolean,
 *   password?: string
 * }
 */
router.put('/users/:id', adminController_1.default.updateUser);
/**
 * DELETE /admin/users/:id
 * Deletar usuário
 * Nota: Não é possível deletar seu próprio usuário
 */
router.delete('/users/:id', adminController_1.default.deleteUser);
/**
 * PUT /admin/users/:id/status
 * Atualizar status do usuário (ativo/inativo)
 *
 * Body: { active: boolean }
 */
router.put('/users/:id/status', adminController_1.default.updateUserStatus);
// ========== ROLE MANAGEMENT ROUTES ==========
/**
 * GET /admin/roles
 * Listar todas as roles disponíveis
 */
router.get('/roles', adminController_1.default.getRoles);
/**
 * POST /admin/users/:id/roles
 * Atribuir role a um usuário
 *
 * Body: { roleId: number }
 */
router.post('/users/:id/roles', adminController_1.default.assignRole);
/**
 * DELETE /admin/users/:id/roles/:roleId
 * Remover role de um usuário
 */
router.delete('/users/:id/roles/:roleId', adminController_1.default.removeRole);
// ========== ADMIN INFO ROUTES ==========
/**
 * GET /admin/stats
 * Estatísticas gerais do sistema (admin dashboard)
 */
router.get('/stats', async (req, res) => {
    try {
        // Esta rota pode ser expandida no futuro
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
/**
 * GET /admin/system-info
 * Informações detalhadas do sistema para o painel administrativo
 */
router.get('/system-info', async (req, res) => {
    try {
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
        const prisma = new PrismaClient();
        // Verificar conexão com banco de dados
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
                active: userCount // Por simplicidade, consideramos todos ativos por agora
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
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map