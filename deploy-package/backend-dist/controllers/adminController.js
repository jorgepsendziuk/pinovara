"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adminService_1 = __importDefault(require("../services/adminService"));
const api_1 = require("../types/api");
const ApiError_1 = require("../utils/ApiError");
const auditService_1 = __importDefault(require("../services/auditService"));
const audit_1 = require("../types/audit");
class AdminController {
    async getUsers(req, res) {
        try {
            const users = await adminService_1.default.getAllUsers();
            res.json({
                success: true,
                message: 'Usuários listados com sucesso',
                data: {
                    users,
                    total: users.length,
                    active: users.filter(u => u.active).length,
                    inactive: users.filter(u => !u.active).length,
                    withRoles: users.filter(u => u.roles.length > 0).length
                },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('❌ [AdminController] Error in getUsers:', error);
            if (error instanceof ApiError_1.ApiError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: {
                        message: error.message,
                        code: error.code,
                        statusCode: error.statusCode
                    },
                    timestamp: new Date().toISOString()
                });
            }
            else {
                res.status(api_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    error: {
                        message: 'Erro interno do servidor',
                        code: api_1.ErrorCode.INTERNAL_ERROR,
                        statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR
                    },
                    timestamp: new Date().toISOString()
                });
            }
        }
    }
    async getUser(req, res) {
        try {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'ID de usuário inválido',
                        code: api_1.ErrorCode.VALIDATION_ERROR,
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const user = await adminService_1.default.getUserById(userId);
            if (!user) {
                res.status(api_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    error: {
                        message: 'Usuário não encontrado',
                        code: api_1.ErrorCode.RESOURCE_NOT_FOUND,
                        statusCode: api_1.HttpStatus.NOT_FOUND
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            res.json({
                success: true,
                message: 'Usuário encontrado',
                data: { user },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async createUser(req, res) {
        try {
            const { email, password, name, active = true } = req.body;
            const user = await adminService_1.default.createUser({
                email,
                password,
                name,
                active
            });
            await auditService_1.default.createLog({
                action: audit_1.AuditAction.CREATE,
                entity: 'users',
                entityId: user.id?.toString(),
                newData: user,
                userId: req.user?.id,
                req
            });
            res.status(api_1.HttpStatus.CREATED).json({
                success: true,
                message: 'Usuário criado com sucesso',
                data: { user },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async updateUser(req, res) {
        try {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'ID de usuário inválido',
                        code: api_1.ErrorCode.VALIDATION_ERROR,
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const { email, name, active, password } = req.body;
            const userAntes = await adminService_1.default.getUserById(userId);
            const user = await adminService_1.default.updateUser(userId, {
                email,
                name,
                active,
                password
            });
            await auditService_1.default.createLog({
                action: audit_1.AuditAction.UPDATE,
                entity: 'users',
                entityId: userId.toString(),
                oldData: userAntes,
                newData: user,
                userId: req.user?.id,
                req
            });
            res.json({
                success: true,
                message: 'Usuário atualizado com sucesso',
                data: { user },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async deleteUser(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const currentUserId = req.user?.id;
            if (isNaN(userId)) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'ID de usuário inválido',
                        code: api_1.ErrorCode.VALIDATION_ERROR,
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (userId === currentUserId) {
                res.status(api_1.HttpStatus.FORBIDDEN).json({
                    success: false,
                    error: {
                        message: 'Não é possível deletar seu próprio usuário',
                        code: api_1.ErrorCode.INSUFFICIENT_PERMISSIONS,
                        statusCode: api_1.HttpStatus.FORBIDDEN
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const userAntes = await adminService_1.default.getUserById(userId);
            await adminService_1.default.deleteUser(userId);
            await auditService_1.default.createLog({
                action: audit_1.AuditAction.DELETE,
                entity: 'users',
                entityId: userId.toString(),
                oldData: userAntes,
                userId: req.user?.id,
                req
            });
            res.json({
                success: true,
                message: 'Usuário deletado com sucesso',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async updateUserStatus(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const currentUserId = req.user?.id;
            const { active } = req.body;
            if (isNaN(userId)) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'ID de usuário inválido',
                        code: api_1.ErrorCode.VALIDATION_ERROR,
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (typeof active !== 'boolean') {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'Status deve ser booleano (true/false)',
                        code: api_1.ErrorCode.VALIDATION_ERROR,
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (userId === currentUserId && !active) {
                res.status(api_1.HttpStatus.FORBIDDEN).json({
                    success: false,
                    error: {
                        message: 'Não é possível desativar seu próprio usuário',
                        code: api_1.ErrorCode.INSUFFICIENT_PERMISSIONS,
                        statusCode: api_1.HttpStatus.FORBIDDEN
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const user = await adminService_1.default.updateUserStatus(userId, active);
            res.json({
                success: true,
                message: `Usuário ${active ? 'ativado' : 'desativado'} com sucesso`,
                data: { user },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async assignRole(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const { roleId } = req.body;
            if (isNaN(userId)) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'ID de usuário inválido',
                        code: api_1.ErrorCode.VALIDATION_ERROR,
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (!roleId || isNaN(parseInt(roleId))) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'ID de papel é obrigatório',
                        code: api_1.ErrorCode.MISSING_REQUIRED_FIELD,
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            await adminService_1.default.assignRoleToUser(userId, parseInt(roleId));
            res.json({
                success: true,
                message: 'Papel atribuído com sucesso',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async removeRole(req, res) {
        try {
            const userId = parseInt(req.params.id);
            const roleId = parseInt(req.params.roleId);
            if (isNaN(userId) || isNaN(roleId)) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'IDs de usuário e papel devem ser válidos',
                        code: api_1.ErrorCode.VALIDATION_ERROR,
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            await adminService_1.default.removeRoleFromUser(userId, roleId);
            res.json({
                success: true,
                message: 'Papel removido com sucesso',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    async getRoles(req, res) {
        try {
            const roles = await adminService_1.default.getAllRoles();
            res.json({
                success: true,
                message: 'Papéis listados com sucesso',
                data: {
                    roles,
                    total: roles.length
                },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(res, error);
        }
    }
    handleError(res, error) {
        console.error('❌ [AdminController] Error:', error);
        if (error instanceof ApiError_1.ApiError) {
            res.status(error.statusCode).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                    statusCode: error.statusCode
                },
                timestamp: new Date().toISOString()
            });
        }
        else {
            res.status(api_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: {
                    message: 'Erro interno do servidor',
                    code: api_1.ErrorCode.INTERNAL_ERROR,
                    statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR
                },
                timestamp: new Date().toISOString()
            });
        }
    }
    async impersonateUser(req, res) {
        try {
            const { userId } = req.params;
            const adminUser = req.user;
            if (!adminUser) {
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
            const isAdmin = adminUser.roles?.some(role => role.name === 'admin' && role.module.name === 'sistema');
            if (!isAdmin) {
                res.status(api_1.HttpStatus.FORBIDDEN).json({
                    success: false,
                    error: {
                        message: 'Apenas administradores podem personificar usuários',
                        code: api_1.ErrorCode.INSUFFICIENT_PERMISSIONS,
                        statusCode: api_1.HttpStatus.FORBIDDEN
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (adminUser.id === parseInt(userId)) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'Não é possível personificar a si mesmo',
                        code: api_1.ErrorCode.VALIDATION_ERROR,
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const impersonationData = await adminService_1.default.generateImpersonationToken(parseInt(userId), adminUser);
            res.json({
                success: true,
                message: 'Token de personificação gerado com sucesso',
                data: {
                    token: impersonationData.token,
                    user: impersonationData.user,
                    impersonatedBy: adminUser.name,
                    expiresAt: impersonationData.expiresAt
                },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('❌ [AdminController] Error in impersonateUser:', error);
            if (error instanceof ApiError_1.ApiError) {
                res.status(error.statusCode).json({
                    success: false,
                    error: {
                        message: error.message,
                        code: error.code,
                        statusCode: error.statusCode
                    },
                    timestamp: new Date().toISOString()
                });
            }
            else {
                res.status(api_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    error: {
                        message: 'Erro interno do servidor',
                        code: api_1.ErrorCode.INTERNAL_ERROR,
                        statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR
                    },
                    timestamp: new Date().toISOString()
                });
            }
        }
    }
}
exports.default = new AdminController();
//# sourceMappingURL=adminController.js.map