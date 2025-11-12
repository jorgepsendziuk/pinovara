"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAccessToOrganizacao = exports.checkOrganizacaoPermission = exports.requireTechnician = exports.requireRole = void 0;
const api_1 = require("../types/api");
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
exports.requireTechnician = (0, exports.requireRole)('organizacoes', 'tecnico');
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
    const isAdmin = req.user.roles?.some(role => role.name === 'admin' && role.module.name === 'sistema');
    const isTechnician = req.user.roles?.some(role => role.name === 'tecnico' && role.module.name === 'organizacoes');
    const isCoordinator = req.user.roles?.some(role => role.name === 'coordenador' && role.module.name === 'organizacoes');
    const isSupervisor = req.user.roles?.some(role => role.name === 'supervisao' && role.module.name === 'organizacoes');
    req.userPermissions = {
        isAdmin,
        isTechnician,
        isCoordinator,
        isSupervisor,
        canAccessAll: isAdmin || isCoordinator || isSupervisor,
        canEdit: isAdmin || isTechnician,
        userId: req.user.id
    };
    next();
};
exports.checkOrganizacaoPermission = checkOrganizacaoPermission;
const hasAccessToOrganizacao = (userPermissions, organizacao) => {
    if (userPermissions.canAccessAll) {
        return true;
    }
    if (userPermissions.isTechnician) {
        if (organizacao.id_tecnico === userPermissions.userId) {
            return true;
        }
        const equipeOrganizacao = Array.isArray(organizacao.organizacao_tecnico)
            ? organizacao.organizacao_tecnico
            : Array.isArray(organizacao.equipe_tecnica)
                ? organizacao.equipe_tecnica
                : [];
        if (equipeOrganizacao.some(membro => membro.id_tecnico === userPermissions.userId)) {
            return true;
        }
        return false;
    }
    return false;
};
exports.hasAccessToOrganizacao = hasAccessToOrganizacao;
exports.default = {
    requireRole: exports.requireRole,
    requireTechnician: exports.requireTechnician,
    checkOrganizacaoPermission: exports.checkOrganizacaoPermission,
    hasAccessToOrganizacao: exports.hasAccessToOrganizacao
};
//# sourceMappingURL=roleAuth.js.map