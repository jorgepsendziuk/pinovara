"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireDeletePermission = exports.requireUploadPermission = void 0;
const requireUploadPermission = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: {
                message: 'Usuário não autenticado',
                code: 'AUTHENTICATION_REQUIRED',
                statusCode: 401
            },
            timestamp: new Date().toISOString()
        });
        return;
    }
    const isAdmin = req.user.roles?.some(role => role.name === 'admin' && role.module.name === 'sistema');
    const isCoordinator = req.user.roles?.some(role => role.name === 'coordenador' && role.module.name === 'organizacoes');
    const isSupervisor = req.user.roles?.some(role => role.name === 'supervisao' && role.module.name === 'organizacoes');
    if (!isAdmin && !isCoordinator && !isSupervisor) {
        res.status(403).json({
            success: false,
            error: {
                message: 'Acesso negado. Apenas administradores, coordenadores e supervisores podem enviar arquivos para o repositório público.',
                code: 'INSUFFICIENT_PERMISSIONS',
                statusCode: 403
            },
            timestamp: new Date().toISOString()
        });
        return;
    }
    req.userPermissions = {
        isAdmin,
        isCoordinator,
        isSupervisor,
        canUpload: true,
        userId: req.user.id
    };
    next();
};
exports.requireUploadPermission = requireUploadPermission;
const requireDeletePermission = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: {
                message: 'Usuário não autenticado',
                code: 'AUTHENTICATION_REQUIRED',
                statusCode: 401
            },
            timestamp: new Date().toISOString()
        });
        return;
    }
    const isAdmin = req.user.roles?.some(role => role.name === 'admin' && role.module.name === 'sistema');
    const isCoordinator = req.user.roles?.some(role => role.name === 'coordenador' && role.module.name === 'organizacoes');
    const isSupervisor = req.user.roles?.some(role => role.name === 'supervisao' && role.module.name === 'organizacoes');
    if (!isAdmin && !isCoordinator && !isSupervisor) {
        res.status(403).json({
            success: false,
            error: {
                message: 'Acesso negado. Apenas administradores, coordenadores e supervisores podem remover arquivos do repositório público.',
                code: 'INSUFFICIENT_PERMISSIONS',
                statusCode: 403
            },
            timestamp: new Date().toISOString()
        });
        return;
    }
    req.userPermissions = {
        isAdmin,
        isCoordinator,
        isSupervisor,
        canDelete: true,
        userId: req.user.id
    };
    next();
};
exports.requireDeletePermission = requireDeletePermission;
const optionalAuth = (req, res, next) => {
    if (req.user) {
        const isAdmin = req.user.roles?.some(role => role.name === 'admin' && role.module.name === 'sistema');
        const isCoordinator = req.user.roles?.some(role => role.name === 'coordenador' && role.module.name === 'organizacoes');
        const isSupervisor = req.user.roles?.some(role => role.name === 'supervisao' && role.module.name === 'organizacoes');
        req.userPermissions = {
            isAdmin,
            isCoordinator,
            isSupervisor,
            canUpload: isAdmin || isCoordinator || isSupervisor,
            canDelete: isAdmin || isCoordinator || isSupervisor,
            userId: req.user.id
        };
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=repositorioAuth.js.map