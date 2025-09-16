"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = (0, express_1.Router)();
// Rate limiting para endpoints de autenticação
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 tentativas por janela
    message: {
        success: false,
        error: {
            message: 'Muitas tentativas de autenticação. Tente novamente em 15 minutos.',
            statusCode: 429,
            timestamp: new Date()
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas de login por janela
    message: {
        success: false,
        error: {
            message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
            statusCode: 429,
            timestamp: new Date()
        }
    },
    standardHeaders: true,
    legacyHeaders: false
});
// Middleware de validação de entrada (simples - pode ser expandido)
const validateRegisterInput = (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Nome, email e senha são obrigatórios',
                statusCode: 400,
                timestamp: new Date()
            }
        });
    }
    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Senha deve ter pelo menos 8 caracteres',
                statusCode: 400,
                timestamp: new Date()
            }
        });
    }
    next();
};
const validateLoginInput = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            error: {
                message: 'Email e senha são obrigatórios',
                statusCode: 400,
                timestamp: new Date()
            }
        });
    }
    next();
};
// Rotas públicas
router.post('/register', authLimiter, validateRegisterInput, authController_1.AuthController.register);
router.post('/login', loginLimiter, validateLoginInput, authController_1.AuthController.login);
// Rotas que podem ser acessadas com ou sem autenticação
router.post('/request-password-reset', authLimiter, authController_1.AuthController.requestPasswordReset);
router.post('/reset-password', authLimiter, authController_1.AuthController.resetPassword);
router.get('/verify-email/:token', authController_1.AuthController.verifyEmail);
// Rotas protegidas (requerem autenticação)
router.get('/me', auth_1.AuthMiddleware.authenticate, authController_1.AuthController.getMe);
router.post('/logout', auth_1.AuthMiddleware.authenticate, authController_1.AuthController.logout);
// Rotas administrativas (requerem privilégios de admin)
router.get('/admin/users', auth_1.AuthMiddleware.authenticate, auth_1.AuthMiddleware.requireAdmin, (req, res) => {
    // TODO: Implementar listagem de usuários para admin
    res.json({
        success: true,
        message: 'Rota administrativa - implementar listagem de usuários',
        timestamp: new Date()
    });
});
exports.default = router;
//# sourceMappingURL=auth.js.map