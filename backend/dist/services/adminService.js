"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const api_1 = require("../types/api");
const ApiError_1 = require("../utils/ApiError");
const prisma = new client_1.PrismaClient();
class AdminService {
    async getAllUsers() {
        try {
            const users = await prisma.users.findMany({
                include: {
                    user_roles: {
                        include: {
                            roles: {
                                include: {
                                    modules: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return users.map((user) => this.formatUserWithRoles(user));
        }
        catch (error) {
            console.error('❌ [AdminService] Error listing users:', error);
            throw new ApiError_1.ApiError({
                message: 'Erro ao listar usuários',
                statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR,
                code: api_1.ErrorCode.DATABASE_ERROR
            });
        }
    }
    async getUserById(userId) {
        try {
            const user = await prisma.users.findUnique({
                where: { id: userId },
                include: {
                    user_roles: {
                        include: {
                            roles: {
                                include: {
                                    modules: true
                                }
                            }
                        }
                    }
                }
            });
            return user ? this.formatUserWithRoles(user) : null;
        }
        catch (error) {
            console.error('❌ [AdminService] Error fetching user:', error);
            throw new ApiError_1.ApiError({
                message: 'Erro ao buscar usuário',
                statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR,
                code: api_1.ErrorCode.DATABASE_ERROR
            });
        }
    }
    async createUser(data) {
        const { email, password, name, active = true } = data;
        if (!email || !password || !name) {
            throw new ApiError_1.ApiError({
                message: 'Email, senha e nome são obrigatórios',
                statusCode: api_1.HttpStatus.BAD_REQUEST,
                code: api_1.ErrorCode.MISSING_REQUIRED_FIELD
            });
        }
        if (password.length < 6) {
            throw new ApiError_1.ApiError({
                message: 'Senha deve ter pelo menos 6 caracteres',
                statusCode: api_1.HttpStatus.BAD_REQUEST,
                code: api_1.ErrorCode.VALIDATION_ERROR
            });
        }
        const existingUser = await prisma.users.findUnique({
            where: { email: email.toLowerCase() }
        });
        if (existingUser) {
            throw new ApiError_1.ApiError({
                message: 'Email já cadastrado',
                statusCode: api_1.HttpStatus.CONFLICT,
                code: api_1.ErrorCode.RESOURCE_ALREADY_EXISTS
            });
        }
        try {
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            const user = await prisma.users.create({
                data: {
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    name: name.trim(),
                    active,
                    updatedAt: new Date()
                },
                include: {
                    user_roles: {
                        include: {
                            roles: {
                                include: {
                                    modules: true
                                }
                            }
                        }
                    }
                }
            });
            console.log('✅ [AdminService] User created:', user.id, user.email);
            return this.formatUserWithRoles(user);
        }
        catch (error) {
            console.error('❌ [AdminService] Error creating user:', error);
            throw new ApiError_1.ApiError({
                message: 'Erro ao criar usuário',
                statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR,
                code: api_1.ErrorCode.DATABASE_ERROR
            });
        }
    }
    async updateUser(userId, data) {
        const updateData = { ...data };
        if (data.password) {
            if (data.password.length < 6) {
                throw new ApiError_1.ApiError({
                    message: 'Senha deve ter pelo menos 6 caracteres',
                    statusCode: api_1.HttpStatus.BAD_REQUEST,
                    code: api_1.ErrorCode.VALIDATION_ERROR
                });
            }
            updateData.password = await bcryptjs_1.default.hash(data.password, 12);
            const currentUser = await prisma.users.findUnique({
                where: { id: userId }
            });
            if (currentUser) {
                const p_fullname = updateData.name || currentUser.name;
                const p_username = currentUser.email;
                const p_password = data.password;
                try {
                    const result = await prisma.$queryRawUnsafe(`
            SELECT public.fn_sync_user_to_odk($1, $2, $3)
          `, p_fullname, p_username, p_password);
                    console.log('✅ [AdminService] Usuário sincronizado com ODK:', currentUser.email);
                }
                catch (error) {
                    console.error('⚠️ [AdminService] Erro ao sincronizar com ODK:', error?.message);
                }
            }
        }
        if (data.email) {
            const existingUser = await prisma.users.findFirst({
                where: {
                    email: data.email.toLowerCase(),
                    NOT: { id: userId }
                }
            });
            if (existingUser) {
                throw new ApiError_1.ApiError({
                    message: 'Email já está sendo usado por outro usuário',
                    statusCode: api_1.HttpStatus.CONFLICT,
                    code: api_1.ErrorCode.RESOURCE_ALREADY_EXISTS
                });
            }
            updateData.email = data.email.toLowerCase();
        }
        if (data.name) {
            updateData.name = data.name.trim();
        }
        updateData.updatedAt = new Date();
        try {
            const user = await prisma.users.update({
                where: { id: userId },
                data: updateData,
                include: {
                    user_roles: {
                        include: {
                            roles: {
                                include: {
                                    modules: true
                                }
                            }
                        }
                    }
                }
            });
            console.log('✅ [AdminService] User updated:', userId);
            return this.formatUserWithRoles(user);
        }
        catch (error) {
            if (error.code === 'P2025') {
                throw new ApiError_1.ApiError({
                    message: 'Usuário não encontrado',
                    statusCode: api_1.HttpStatus.NOT_FOUND,
                    code: api_1.ErrorCode.RESOURCE_NOT_FOUND
                });
            }
            console.error('❌ [AdminService] Error updating user:', error);
            throw new ApiError_1.ApiError({
                message: 'Erro ao atualizar usuário',
                statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR,
                code: api_1.ErrorCode.DATABASE_ERROR
            });
        }
    }
    async deleteUser(userId) {
        try {
            const user = await prisma.users.findUnique({
                where: { id: userId }
            });
            if (!user) {
                throw new ApiError_1.ApiError({
                    message: 'Usuário não encontrado',
                    statusCode: api_1.HttpStatus.NOT_FOUND,
                    code: api_1.ErrorCode.RESOURCE_NOT_FOUND
                });
            }
            await prisma.users.delete({
                where: { id: userId }
            });
            console.log('✅ [AdminService] User deleted:', userId);
        }
        catch (error) {
            if (error instanceof ApiError_1.ApiError)
                throw error;
            console.error('❌ [AdminService] Error deleting user:', error);
            throw new ApiError_1.ApiError({
                message: 'Erro ao deletar usuário',
                statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR,
                code: api_1.ErrorCode.DATABASE_ERROR
            });
        }
    }
    async updateUserStatus(userId, active) {
        return this.updateUser(userId, { active });
    }
    async assignRoleToUser(userId, roleId) {
        try {
            const user = await prisma.users.findUnique({
                where: { id: userId }
            });
            if (!user) {
                throw new ApiError_1.ApiError({
                    message: 'Usuário não encontrado',
                    statusCode: api_1.HttpStatus.NOT_FOUND,
                    code: api_1.ErrorCode.RESOURCE_NOT_FOUND
                });
            }
            const role = await prisma.roles.findUnique({
                where: { id: roleId }
            });
            if (!role) {
                throw new ApiError_1.ApiError({
                    message: 'Papel não encontrado',
                    statusCode: api_1.HttpStatus.NOT_FOUND,
                    code: api_1.ErrorCode.RESOURCE_NOT_FOUND
                });
            }
            const existingUserRole = await prisma.user_roles.findFirst({
                where: {
                    userId,
                    roleId
                }
            });
            if (existingUserRole) {
                throw new ApiError_1.ApiError({
                    message: 'Usuário já possui este papel',
                    statusCode: api_1.HttpStatus.CONFLICT,
                    code: api_1.ErrorCode.RESOURCE_ALREADY_EXISTS
                });
            }
            await prisma.user_roles.create({
                data: {
                    userId,
                    roleId,
                    updatedAt: new Date()
                }
            });
            console.log('✅ [AdminService] Role assigned:', userId, roleId);
        }
        catch (error) {
            if (error instanceof ApiError_1.ApiError)
                throw error;
            console.error('❌ [AdminService] Error assigning role:', error);
            throw new ApiError_1.ApiError({
                message: 'Erro ao atribuir papel',
                statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR,
                code: api_1.ErrorCode.DATABASE_ERROR
            });
        }
    }
    async removeRoleFromUser(userId, roleId) {
        try {
            const userRole = await prisma.user_roles.findFirst({
                where: {
                    userId,
                    roleId
                }
            });
            if (!userRole) {
                throw new ApiError_1.ApiError({
                    message: 'Usuário não possui este papel',
                    statusCode: api_1.HttpStatus.NOT_FOUND,
                    code: api_1.ErrorCode.RESOURCE_NOT_FOUND
                });
            }
            await prisma.user_roles.delete({
                where: { id: userRole.id }
            });
            console.log('✅ [AdminService] Role removed:', userId, roleId);
        }
        catch (error) {
            if (error instanceof ApiError_1.ApiError)
                throw error;
            console.error('❌ [AdminService] Error removing role:', error);
            throw new ApiError_1.ApiError({
                message: 'Erro ao remover papel',
                statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR,
                code: api_1.ErrorCode.DATABASE_ERROR
            });
        }
    }
    async getAllRoles() {
        try {
            const roles = await prisma.roles.findMany({
                include: {
                    modules: true
                },
                where: {
                    active: true
                },
                orderBy: [
                    { modules: { name: 'asc' } },
                    { name: 'asc' }
                ]
            });
            return roles.map((role) => ({
                id: role.id,
                name: role.name,
                description: role.description || '',
                active: role.active,
                moduleId: role.moduleId,
                module: {
                    id: role.modules.id,
                    name: role.modules.name,
                    description: role.modules.description || '',
                    active: role.modules.active
                }
            }));
        }
        catch (error) {
            console.error('❌ [AdminService] Error listing roles:', error);
            throw new ApiError_1.ApiError({
                message: 'Erro ao listar papéis',
                statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR,
                code: api_1.ErrorCode.DATABASE_ERROR
            });
        }
    }
    formatUserWithRoles(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            active: user.active,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            roles: user.user_roles ? user.user_roles.map((ur) => ({
                id: ur.roles.id,
                name: ur.roles.name,
                description: ur.roles.description || '',
                active: ur.roles.active,
                moduleId: ur.roles.moduleId,
                module: {
                    id: ur.roles.modules.id,
                    name: ur.roles.modules.name,
                    description: ur.roles.modules.description || '',
                    active: ur.roles.modules.active
                }
            })) : []
        };
    }
    async generateImpersonationToken(userId, adminUser) {
        try {
            const user = await prisma.users.findUnique({
                where: { id: userId },
                include: {
                    user_roles: {
                        include: {
                            roles: {
                                include: {
                                    modules: true
                                }
                            }
                        }
                    }
                }
            });
            if (!user) {
                throw new ApiError_1.ApiError({
                    message: 'Usuário não encontrado',
                    statusCode: api_1.HttpStatus.NOT_FOUND,
                    code: api_1.ErrorCode.RESOURCE_NOT_FOUND
                });
            }
            if (!user.active) {
                throw new ApiError_1.ApiError({
                    message: 'Não é possível personificar um usuário inativo',
                    statusCode: api_1.HttpStatus.BAD_REQUEST,
                    code: api_1.ErrorCode.VALIDATION_ERROR
                });
            }
            const jwtSecret = process.env.JWT_SECRET;
            if (!jwtSecret) {
                throw new ApiError_1.ApiError({
                    message: 'Configuração JWT não encontrada',
                    statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR,
                    code: api_1.ErrorCode.INTERNAL_ERROR
                });
            }
            const tokenPayload = {
                userId: user.id,
                email: user.email,
                impersonatedBy: adminUser.id,
                isImpersonation: true
            };
            const token = jsonwebtoken_1.default.sign(tokenPayload, jwtSecret, {
                expiresIn: '8h',
                audience: 'pinovara-frontend',
                issuer: 'pinovara-api'
            });
            const userData = this.formatUserWithRoles(user);
            return {
                token,
                user: userData,
                expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000)
            };
        }
        catch (error) {
            console.error('Erro ao gerar token de personificação:', error);
            if (error instanceof ApiError_1.ApiError) {
                throw error;
            }
            throw new ApiError_1.ApiError({
                message: 'Erro ao gerar token de personificação',
                statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR,
                code: api_1.ErrorCode.INTERNAL_ERROR
            });
        }
    }
}
exports.default = new AdminService();
//# sourceMappingURL=adminService.js.map