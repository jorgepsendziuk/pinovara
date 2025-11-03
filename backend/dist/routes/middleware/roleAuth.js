"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAccessToOrganizacao = exports.checkOrganizacaoPermission = exports.requireTechnician = exports.requireRole = void 0;
const api_1 = require("../types/api");
/**
 * Middleware para verificar se o usuário tem role específico
 */
const requireRole = (moduleName, roleName) => {
    return (req, res, next) => {
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
        const hasRole = req.user.roles?.some(role => role.name === roleName && role.module.name === moduleName);
        if (!hasRole) {
            res.status(api_1.HttpStatus.FORBIDDEN).json({
                success: false,
                error: {
                    message: `Acesso negado. Requer role '${roleName}' no módulo '${moduleName}'`,
                    code: api_1.ErrorCode.INSUFFICIENT_PERMISSIONS,
                    statusCode: api_1.HttpStatus.FORBIDDEN,
                    details: {
                        required: `${roleName} role in ${moduleName} module`,
                        userRoles: req.user.roles?.map(r => `${r.name} (${r.module.name})`) || []
                    }
                },
                timestamp: new Date().toISOString()
            });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
/**
 * Middleware para verificar se usuário é técnico
 */
exports.requireTechnician = (0, exports.requireRole)('organizacoes', 'tecnico');
/**
 * Middleware para verificar permissões nas organizações baseado na role
 */
const checkOrganizacaoPermission = (req, res, next) => {
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
    // Verificar se é admin (acesso total)
    const isAdmin = req.user.roles?.some(role => role.name === 'admin' && role.module.name === 'sistema');
    // Verificar se é técnico
    const isTechnician = req.user.roles?.some(role => role.name === 'tecnico' && role.module.name === 'organizacoes');
    // Verificar se é coordenador (visualização de todas organizações)
    const isCoordinator = req.user.roles?.some(role => role.name === 'coordenador' && role.module.name === 'organizacoes');
    const isSupervisor = req.user.roles?.some(role => role.name === 'supervisao' && role.module.name === 'organizacoes');
    // Adicionar informações sobre permissões à requisição
    req.userPermissions = {
        isAdmin,
        isTechnician,
        isCoordinator,
        isSupervisor,
        canAccessAll: isAdmin || isCoordinator || isSupervisor, // Coordenador e Supervisor veem todas organizações
        canEdit: isAdmin || isTechnician, // Coordenador e Supervisor NÃO podem editar
        userId: req.user.id
    };
    next();
};
exports.checkOrganizacaoPermission = checkOrganizacaoPermission;
/**
 * Helper para verificar se usuário tem acesso a uma organização específica
 */
const hasAccessToOrganizacao = (userPermissions, organizacao) => {
    // Admin tem acesso a tudo
    if (userPermissions.canAccessAll) {
        return true;
    }
    // Técnico só tem acesso às organizações que ele criou
    if (userPermissions.isTechnician) {
        return organizacao.id_tecnico === userPermissions.userId;
    }
    // Por padrão, não tem acesso
    return false;
};
exports.hasAccessToOrganizacao = hasAccessToOrganizacao;
exports.default = {
    requireRole: exports.requireRole,
    requireTechnician: exports.requireTechnician,
    checkOrganizacaoPermission: exports.checkOrganizacaoPermission,
    hasAccessToOrganizacao: exports.hasAccessToOrganizacao
};
