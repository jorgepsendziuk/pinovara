"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// ========== ROTAS PÚBLICAS ==========
/**
 * @route POST /auth/register
 * @desc Registrar novo usuário
 * @access Public
 */
router.post('/register', authController_1.authController.register);
/**
 * @route POST /auth/login
 * @desc Fazer login no sistema
 * @access Public
 */
router.post('/login', authController_1.authController.login);
// ========== ROTAS PROTEGIDAS ==========
/**
 * @route GET /auth/me
 * @desc Obter dados do usuário autenticado
 * @access Private - Requer autenticação
 */
router.get('/me', authMiddleware_1.authenticateToken, authController_1.authController.me);
/**
 * @route POST /auth/logout
 * @desc Fazer logout do sistema
 * @access Private - Requer autenticação
 */
router.post('/logout', authMiddleware_1.authenticateToken, authController_1.authController.logout);
/**
 * @route GET /auth/verify
 * @desc Verificar se token é válido
 * @access Private - Requer autenticação
 */
router.get('/verify', authMiddleware_1.authenticateToken, authController_1.authController.verifyAuth);
/**
 * @route PUT /auth/profile
 * @desc Atualizar perfil do usuário
 * @access Private - Requer autenticação
 */
router.put('/profile', authMiddleware_1.authenticateToken, authController_1.authController.updateProfile);
/**
 * @route PUT /auth/change-password
 * @desc Alterar senha do usuário
 * @access Private - Requer autenticação
 */
router.put('/change-password', authMiddleware_1.authenticateToken, authController_1.authController.changePassword);
/**
 * @route POST /auth/refresh
 * @desc Renovar token de acesso (futuro)
 * @access Private - Requer autenticação
 */
router.post('/refresh', authMiddleware_1.authenticateToken, authController_1.authController.refreshToken);
// ========== VALIDAÇÃO DE ROTAS ==========
// Middleware para log de tentativas de autenticação
router.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';
    console.log(`[${timestamp}] Auth attempt: ${req.method} ${req.path} from ${ip} - ${userAgent}`);
    next();
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map