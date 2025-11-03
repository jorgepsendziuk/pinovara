"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const api_1 = require("../types/api");
const prisma = new client_1.PrismaClient();
class AuthService {
    /**
     * Fazer login do usuário
     */
    async login(data) {
        const { email, password } = data;
        // Validações básicas
        if (!email || !password) {
            throw new ApiError({
                message: 'Email e senha são obrigatórios',
                statusCode: api_1.HttpStatus.BAD_REQUEST,
                code: api_1.ErrorCode.MISSING_REQUIRED_FIELD
            });
        }
        // Buscar usuário com relacionamentos de roles
        const user = await prisma.users.findUnique({
            where: { email: email.toLowerCase() },
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
            throw new ApiError({
                message: 'Credenciais inválidas',
                statusCode: api_1.HttpStatus.UNAUTHORIZED,
                code: api_1.ErrorCode.INVALID_CREDENTIALS
            });
        }
        // Verificar senha
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new ApiError({
                message: 'Credenciais inválidas',
                statusCode: api_1.HttpStatus.UNAUTHORIZED,
                code: api_1.ErrorCode.INVALID_CREDENTIALS
            });
        }
        // Verificar se usuário está ativo
        if (!user.active) {
            throw new ApiError({
                message: 'Usuário inativo',
                statusCode: api_1.HttpStatus.UNAUTHORIZED,
                code: api_1.ErrorCode.INSUFFICIENT_PERMISSIONS
            });
        }
        // Gerar token
        const token = this.generateToken({ userId: user.id, email: user.email });
        const expiresIn = 7 * 24 * 60 * 60; // 7 dias
        // Debug: Log roles loading for olivanrabelo@gmail.com
        if (user.email === 'olivanrabelo@gmail.com') {
            console.log('🔍 [DEBUG] Loading roles for olivanrabelo@gmail.com:');
            console.log('- user.user_roles exists:', !!user.user_roles);
            console.log('- user.user_roles length:', user.user_roles?.length || 0);
            console.log('- user.user_roles data:', JSON.stringify(user.user_roles, null, 2));
        }
        // Formatar resposta
        const userWithRoles = {
            id: user.id,
            email: user.email,
            name: user.name,
            active: user.active,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            roles: user.user_roles ? user.user_roles.map((ur) => ({
                id: ur.roles.id,
                name: ur.roles.name,
                description: ur.roles.description,
                active: ur.roles.active,
                createdAt: ur.roles.createdAt,
                updatedAt: ur.roles.updatedAt,
                moduleId: ur.roles.moduleId,
                module: {
                    id: ur.roles.modules.id,
                    name: ur.roles.modules.name,
                    description: ur.roles.modules.description,
                    active: ur.roles.modules.active,
                    createdAt: ur.roles.modules.createdAt,
                    updatedAt: ur.roles.modules.updatedAt
                }
            })) : []
        };
        // Debug: Log final roles count
        if (user.email === 'olivanrabelo@gmail.com') {
            console.log('🎭 [DEBUG] Final roles count for olivanrabelo@gmail.com:', userWithRoles.roles.length);
        }
        return {
            user: userWithRoles,
            token,
            expiresIn
        };
    }
    /**
     * Registrar novo usuário
     */
    async register(data) {
        const { email, password, name } = data;
        // Validações
        if (!email || !password || !name) {
            throw new ApiError({
                message: 'Email, senha e nome são obrigatórios',
                statusCode: api_1.HttpStatus.BAD_REQUEST,
                code: api_1.ErrorCode.MISSING_REQUIRED_FIELD
            });
        }
        if (password.length < 6) {
            throw new ApiError({
                message: 'Senha deve ter pelo menos 6 caracteres',
                statusCode: api_1.HttpStatus.BAD_REQUEST,
                code: api_1.ErrorCode.VALIDATION_ERROR
            });
        }
        // Verificar se email já existe
        const existingUser = await prisma.users.findUnique({
            where: { email: email.toLowerCase() }
        });
        if (existingUser) {
            throw new ApiError({
                message: 'Email já cadastrado',
                statusCode: api_1.HttpStatus.CONFLICT,
                code: api_1.ErrorCode.RESOURCE_ALREADY_EXISTS
            });
        }
        // Hash da senha
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Criar usuário
        const user = await prisma.users.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name: name.trim(),
                active: true,
                updatedAt: new Date()
            },
            // Sem includes por enquanto
        });
        // Gerar token
        const token = this.generateToken({ userId: user.id, email: user.email });
        const expiresIn = 7 * 24 * 60 * 60; // 7 dias
        // Formatar resposta
        const userWithRoles = {
            id: user.id,
            email: user.email,
            name: user.name,
            active: user.active,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            roles: [] // Usuário recém-criado não tem roles ainda
        };
        return {
            user: userWithRoles,
            token,
            expiresIn
        };
    }
    /**
     * Obter dados do usuário por ID
     */
    async getUserById(userId) {
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
            throw new ApiError({
                message: 'Usuário não encontrado',
                statusCode: api_1.HttpStatus.NOT_FOUND,
                code: api_1.ErrorCode.RESOURCE_NOT_FOUND
            });
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            active: user.active,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            roles: user.user_roles.map((ur) => ({
                id: ur.roles.id,
                name: ur.roles.name,
                description: ur.roles.description,
                active: ur.roles.active,
                createdAt: ur.roles.createdAt,
                updatedAt: ur.roles.updatedAt,
                moduleId: ur.roles.moduleId,
                module: {
                    id: ur.roles.modules.id,
                    name: ur.roles.modules.name,
                    description: ur.roles.modules.description,
                    active: ur.roles.modules.active,
                    createdAt: ur.roles.modules.createdAt,
                    updatedAt: ur.roles.modules.updatedAt
                }
            }))
        };
    }
    /**
     * Verificar se token é válido
     */
    async verifyToken(token) {
        if (!process.env.JWT_SECRET) {
            throw new ApiError({
                message: 'Configuração de JWT inválida',
                statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR,
                code: api_1.ErrorCode.INTERNAL_ERROR
            });
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            return await this.getUserById(decoded.userId);
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new ApiError({
                    message: 'Token inválido',
                    statusCode: api_1.HttpStatus.UNAUTHORIZED,
                    code: api_1.ErrorCode.TOKEN_INVALID
                });
            }
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new ApiError({
                    message: 'Token expirado',
                    statusCode: api_1.HttpStatus.UNAUTHORIZED,
                    code: api_1.ErrorCode.TOKEN_EXPIRED
                });
            }
            throw error;
        }
    }
    /**
     * Atualizar perfil do usuário
     */
    async updateProfile(userId, data) {
        const { name, email } = data;
        // Validações básicas
        if (!name || !email) {
            throw new ApiError({
                message: 'Nome e email são obrigatórios',
                statusCode: api_1.HttpStatus.BAD_REQUEST,
                code: api_1.ErrorCode.MISSING_REQUIRED_FIELD
            });
        }
        if (name.trim().length < 2) {
            throw new ApiError({
                message: 'Nome deve ter pelo menos 2 caracteres',
                statusCode: api_1.HttpStatus.BAD_REQUEST,
                code: api_1.ErrorCode.VALIDATION_ERROR
            });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new ApiError({
                message: 'Email inválido',
                statusCode: api_1.HttpStatus.BAD_REQUEST,
                code: api_1.ErrorCode.VALIDATION_ERROR
            });
        }
        // Verificar se o email já está em uso por outro usuário
        const existingUser = await prisma.users.findFirst({
            where: {
                email: email.toLowerCase(),
                id: { not: userId }
            }
        });
        if (existingUser) {
            throw new ApiError({
                message: 'Este email já está em uso por outro usuário',
                statusCode: api_1.HttpStatus.CONFLICT,
                code: api_1.ErrorCode.RESOURCE_ALREADY_EXISTS
            });
        }
        // Atualizar usuário
        const updatedUser = await prisma.users.update({
            where: { id: userId },
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
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
        // Retornar dados formatados
        return {
            id: updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            active: updatedUser.active,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
            roles: updatedUser.user_roles ? updatedUser.user_roles.map((ur) => ({
                id: ur.roles.id,
                name: ur.roles.name,
                description: ur.roles.description,
                active: ur.roles.active,
                createdAt: ur.roles.createdAt,
                updatedAt: ur.roles.updatedAt,
                moduleId: ur.roles.moduleId,
                module: {
                    id: ur.roles.modules.id,
                    name: ur.roles.modules.name,
                    description: ur.roles.modules.description,
                    active: ur.roles.modules.active,
                    createdAt: ur.roles.modules.createdAt,
                    updatedAt: ur.roles.modules.updatedAt
                }
            })) : []
        };
    }
    /**
     * Gerar token JWT
     */
    generateToken(payload) {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET não configurado');
        }
        return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '7d',
            issuer: 'pinovara-api',
            audience: 'pinovara-frontend'
        });
    }
}
// Classe personalizada para erros da API
class ApiError extends Error {
    constructor(options) {
        super(options.message);
        this.statusCode = options.statusCode;
        this.code = options.code;
        this.details = options.details;
        this.name = 'ApiError';
    }
}
exports.ApiError = ApiError;
exports.authService = new AuthService();
