"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireModerator = exports.requireAdmin = void 0;
const api_1 = require("../types/api");
/**
 * Middleware para verificar se o usuário autenticado tem permissão de administrador
 * Deve ser usado após o middleware authenticateToken
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(api_1.HttpStatus.UNAUTHORIZED).json({
            success: false,
            error: {
                message: 'Usuário não autenticado',
                code: api_1.ErrorCode.AUTHENTICATION_REQUIRED,
                statusCode: api_1.HttpStatus.UNAUTHORIZED
            },
            timestamp: new Date().toISOString()
        });
        return;
    }
    // Verificar se o usuário tem o papel 'admin' no módulo 'sistema'
    const hasAdminRole = req.user.roles?.some(role => role.name === 'admin' && role.module.name === 'sistema');
    if (!hasAdminRole) {
        console.warn(`⚠️ [AdminAuth] Access denied for user ${req.user.id} (${req.user.email}) - No admin role`);
        res.status(api_1.HttpStatus.FORBIDDEN).json({
            success: false,
            error: {
                message: 'Acesso negado. Requer privilégios de administrador',
                code: api_1.ErrorCode.INSUFFICIENT_PERMISSIONS,
                statusCode: api_1.HttpStatus.FORBIDDEN,
                details: {
                    required: 'admin role in sistema module',
                    userRoles: req.user.roles?.map(r => `${r.name} (${r.module.name})`) || []
                }
            },
            timestamp: new Date().toISOString()
        });
        return;
    }
    console.log(`✅ [AdminAuth] Admin access granted for user ${req.user.id} (${req.user.email})`);
    next();
};
exports.requireAdmin = requireAdmin;
/**
 * Middleware para verificar se o usuário tem qualquer permissão administrativa
 * (admin ou moderator no módulo sistema)
 */
const requireModerator = (req, res, next) => {
    if (!req.user) {
        res.status(api_1.HttpStatus.UNAUTHORIZED).json({
            success: false,
            error: {
                message: 'Usuário não autenticado',
                code: api_1.ErrorCode.AUTHENTICATION_REQUIRED,
                statusCode: api_1.HttpStatus.UNAUTHORIZED
            },
            timestamp: new Date().toISOString()
        });
        return;
    }
    // Verificar se o usuário tem papel 'admin' ou 'moderator' no módulo 'sistema'
    const hasModeratorRole = req.user.roles?.some(role => (role.name === 'admin' || role.name === 'moderator') && role.module.name === 'sistema');
    if (!hasModeratorRole) {
        console.warn(`⚠️ [AdminAuth] Moderator access denied for user ${req.user.id} (${req.user.email})`);
        res.status(api_1.HttpStatus.FORBIDDEN).json({
            success: false,
            error: {
                message: 'Acesso negado. Requer privilégios de moderador ou administrador',
                code: api_1.ErrorCode.INSUFFICIENT_PERMISSIONS,
                statusCode: api_1.HttpStatus.FORBIDDEN,
                details: {
                    required: 'admin or moderator role in sistema module',
                    userRoles: req.user.roles?.map(r => `${r.name} (${r.module.name})`) || []
                }
            },
            timestamp: new Date().toISOString()
        });
        return;
    }
    console.log(`✅ [AdminAuth] Moderator access granted for user ${req.user.id} (${req.user.email})`);
    next();
};
exports.requireModerator = requireModerator;
