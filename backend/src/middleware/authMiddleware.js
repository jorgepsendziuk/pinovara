"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentUserHasPermission = exports.getCurrentUser = exports.isAuthenticated = exports.optionalAuth = exports.requireOwnership = exports.requireAdmin = exports.requireAnyPermission = exports.requirePermission = exports.authenticateToken = void 0;
const authService_1 = require("../services/authService");
// ========== MIDDLEWARE DE AUTENTICAÇÃO ==========
/**
 * Middleware para verificar token JWT
 */
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                error: {
                    message: 'Token de acesso não fornecido',
                    statusCode: 401,
                    code: 'TOKEN_MISSING',
                },
            });
            return;
        }
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : authHeader;
        if (!token) {
            res.status(401).json({
                error: {
                    message: 'Token de acesso inválido',
                    statusCode: 401,
                    code: 'TOKEN_INVALID',
                },
            });
            return;
        }
        const decoded = (0, authService_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro interno';
        res.status(401).json({
            error: {
                message: errorMessage,
                statusCode: 401,
                code: errorMessage === 'Token expirado' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID',
            },
        });
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Middleware para verificar permissões específicas
 */
const requirePermission = (moduleName, roleName) => {
    return async (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                error: {
                    message: 'Usuário não autenticado',
                    statusCode: 401,
                    code: 'USER_NOT_AUTHENTICATED',
                },
            });
            return;
        }
        const hasAccess = (0, authService_1.hasPermission)(req.user, moduleName, roleName);
        if (!hasAccess) {
            res.status(403).json({
                error: {
                    message: `Acesso negado. Requer permissão: ${roleName ? `${roleName} em ${moduleName}` : moduleName}`,
                    statusCode: 403,
                    code: 'INSUFFICIENT_PERMISSIONS',
                    required: { module: moduleName, role: roleName },
                },
            });
            return;
        }
        next();
    };
};
exports.requirePermission = requirePermission;
/**
 * Middleware para verificar múltiplas permissões (OU)
 */
const requireAnyPermission = (permissions) => {
    return async (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                error: {
                    message: 'Usuário não autenticado',
                    statusCode: 401,
                    code: 'USER_NOT_AUTHENTICATED',
                },
            });
            return;
        }
        const hasAccess = (0, authService_1.hasAnyPermission)(req.user, permissions);
        if (!hasAccess) {
            const permissionDescriptions = permissions.map(p => p.role ? `${p.role} em ${p.module}` : p.module).join(' ou ');
            res.status(403).json({
                error: {
                    message: `Acesso negado. Requer uma das seguintes permissões: ${permissionDescriptions}`,
                    statusCode: 403,
                    code: 'INSUFFICIENT_PERMISSIONS',
                    required: permissions,
                },
            });
            return;
        }
        next();
    };
};
exports.requireAnyPermission = requireAnyPermission;
/**
 * Middleware para verificar se usuário é administrador
 */
exports.requireAdmin = (0, exports.requirePermission)('sistema', 'admin');
/**
 * Middleware para verificar se usuário é dono do recurso
 */
const requireOwnership = (resourceIdParam = 'id') => {
    return async (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                error: {
                    message: 'Usuário não autenticado',
                    statusCode: 401,
                    code: 'USER_NOT_AUTHENTICATED',
                },
            });
            return;
        }
        const resourceId = req.params[resourceIdParam];
        // Se o ID do recurso for igual ao ID do usuário, permitir acesso
        if (req.user.id === Number(resourceId)) {
            next();
            return;
        }
        // Caso contrário, verificar se é admin
        const hasAdminAccess = (0, authService_1.hasPermission)(req.user, 'sistema', 'admin');
        if (!hasAdminAccess) {
            res.status(403).json({
                error: {
                    message: 'Acesso negado. Você só pode acessar seus próprios dados.',
                    statusCode: 403,
                    code: 'ACCESS_DENIED',
                },
            });
            return;
        }
        next();
    };
};
exports.requireOwnership = requireOwnership;
/**
 * Middleware opcional de autenticação (não falha se não autenticado)
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.startsWith('Bearer ')
                ? authHeader.substring(7)
                : authHeader;
            if (token) {
                const decoded = (0, authService_1.verifyToken)(token);
                req.user = decoded;
            }
        }
    }
    catch (error) {
        // Ignorar erros de autenticação opcional
    }
    next();
};
exports.optionalAuth = optionalAuth;
// ========== UTILITÁRIOS ==========
/**
 * Verificar se requisição é autenticada
 */
const isAuthenticated = (req) => {
    return !!req.user;
};
exports.isAuthenticated = isAuthenticated;
/**
 * Obter usuário da requisição (assume que está autenticado)
 */
const getCurrentUser = (req) => {
    if (!req.user) {
        throw new Error('Usuário não autenticado');
    }
    return req.user;
};
exports.getCurrentUser = getCurrentUser;
/**
 * Verificar se usuário atual tem uma permissão
 */
const currentUserHasPermission = (req, moduleName, roleName) => {
    if (!req.user)
        return false;
    return (0, authService_1.hasPermission)(req.user, moduleName, roleName);
};
exports.currentUserHasPermission = currentUserHasPermission;
//# sourceMappingURL=authMiddleware.js.map