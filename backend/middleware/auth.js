"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const authService_1 = require("../services/authService");
class AuthMiddleware {
}
exports.AuthMiddleware = AuthMiddleware;
_a = AuthMiddleware;
/**
 * Middleware para verificar JWT token
 */
AuthMiddleware.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                error: {
                    message: 'Token de autenticação não fornecido',
                    statusCode: 401,
                    timestamp: new Date()
                }
            });
        }
        // Extrair token do header "Bearer <token>"
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;
        if (!token) {
            return res.status(401).json({
                error: {
                    message: 'Token de autenticação inválido',
                    statusCode: 401,
                    timestamp: new Date()
                }
            });
        }
        // Verificar token
        const decoded = authService_1.AuthService.verifyToken(token);
        // Verificar se usuário ainda existe e está ativo
        const user = await authService_1.AuthService.getUserByToken(token);
        if (!user.isActive) {
            return res.status(401).json({
                error: {
                    message: 'Conta desativada',
                    statusCode: 401,
                    timestamp: new Date()
                }
            });
        }
        // Adicionar usuário ao request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };
        next();
    }
    catch (error) {
        console.error('Erro na autenticação:', error);
        return res.status(401).json({
            error: {
                message: error instanceof Error ? error.message : 'Erro na autenticação',
                statusCode: 401,
                timestamp: new Date()
            }
        });
    }
};
/**
 * Middleware para verificar se usuário é administrador
 */
AuthMiddleware.requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: {
                message: 'Autenticação requerida',
                statusCode: 401,
                timestamp: new Date()
            }
        });
    }
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({
            error: {
                message: 'Acesso negado. Requer privilégios de administrador',
                statusCode: 403,
                timestamp: new Date()
            }
        });
    }
    next();
};
/**
 * Middleware para verificar se usuário é moderador ou admin
 */
AuthMiddleware.requireModerator = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: {
                message: 'Autenticação requerida',
                statusCode: 401,
                timestamp: new Date()
            }
        });
    }
    if (!['ADMIN', 'MODERATOR'].includes(req.user.role)) {
        return res.status(403).json({
            error: {
                message: 'Acesso negado. Requer privilégios de moderador ou administrador',
                statusCode: 403,
                timestamp: new Date()
            }
        });
    }
    next();
};
/**
 * Middleware opcional - adiciona usuário se token for válido, mas não bloqueia se não houver
 */
AuthMiddleware.optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.startsWith('Bearer ')
                ? authHeader.substring(7)
                : authHeader;
            if (token) {
                const decoded = authService_1.AuthService.verifyToken(token);
                const user = await authService_1.AuthService.getUserByToken(token);
                if (user.isActive) {
                    req.user = {
                        id: decoded.id,
                        email: decoded.email,
                        role: decoded.role
                    };
                }
            }
        }
        next();
    }
    catch (error) {
        // Ignorar erros e continuar sem usuário
        next();
    }
};
/**
 * Middleware para verificar propriedade do recurso
 */
AuthMiddleware.requireOwnership = (resourceUserIdField = 'userId') => (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: {
                message: 'Autenticação requerida',
                statusCode: 401,
                timestamp: new Date()
            }
        });
    }
    // Verificar se o usuário é dono do recurso ou é admin
    const resourceUserId = req.body[resourceUserIdField] ||
        req.params[resourceUserIdField] ||
        req.query[resourceUserIdField];
    if (req.user.role !== 'ADMIN' && req.user.id !== resourceUserId) {
        return res.status(403).json({
            error: {
                message: 'Acesso negado. Você não tem permissão para este recurso',
                statusCode: 403,
                timestamp: new Date()
            }
        });
    }
    next();
};
//# sourceMappingURL=auth.js.map