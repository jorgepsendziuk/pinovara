"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.changePassword = exports.updateProfile = exports.verifyAuth = exports.refreshToken = exports.logout = exports.me = exports.login = exports.register = void 0;
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const authService_1 = require("../services/authService");
const prisma = new client_1.PrismaClient();
// ========== CONTROLADORES ==========
/**
 * Controller para registro de usuários
 */
const register = async (req, res) => {
    try {
        // Validar dados de entrada
        const validatedData = (0, authService_1.validateRegisterData)(req.body);
        // Registrar usuário
        const result = await authService_1.AuthService.register(validatedData);
        res.status(201).json({
            success: true,
            message: 'Usuário registrado com sucesso',
            data: result,
        });
    }
    catch (error) {
        handleAuthError(error, res);
    }
};
exports.register = register;
/**
 * Controller para login de usuários
 */
const login = async (req, res) => {
    try {
        // Validar dados de entrada
        const validatedData = (0, authService_1.validateLoginData)(req.body);
        // Fazer login
        const result = await authService_1.AuthService.login(validatedData);
        res.json({
            success: true,
            message: 'Login realizado com sucesso',
            data: result,
        });
    }
    catch (error) {
        handleAuthError(error, res);
    }
};
exports.login = login;
/**
 * Controller para obter dados do usuário atual
 */
const me = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    message: 'Usuário não autenticado',
                    statusCode: 401,
                    code: 'USER_NOT_AUTHENTICATED',
                },
            });
            return;
        }
        // Buscar dados atualizados do usuário
        const user = await authService_1.AuthService.getUserById(req.user.id);
        res.json({
            success: true,
            message: 'Dados do usuário obtidos com sucesso',
            data: { user },
        });
    }
    catch (error) {
        handleAuthError(error, res);
    }
};
exports.me = me;
/**
 * Controller para logout
 */
const logout = async (req, res) => {
    // Em uma implementação mais robusta, você poderia:
    // 1. Invalidar o token adicionando-o a uma blacklist no Redis
    // 2. Remover o refresh token se existir
    // 3. Limpar sessões ativas
    res.json({
        success: true,
        message: 'Logout realizado com sucesso',
    });
};
exports.logout = logout;
/**
 * Controller para renovar token (futuro)
 */
const refreshToken = async (req, res) => {
    try {
        // TODO: Implementar refresh token
        res.status(501).json({
            success: false,
            error: {
                message: 'Funcionalidade não implementada',
                statusCode: 501,
                code: 'NOT_IMPLEMENTED',
            },
        });
    }
    catch (error) {
        handleAuthError(error, res);
    }
};
exports.refreshToken = refreshToken;
/**
 * Controller para verificar status da autenticação
 */
const verifyAuth = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                authenticated: false,
                error: {
                    message: 'Token inválido ou expirado',
                    statusCode: 401,
                    code: 'TOKEN_INVALID',
                },
            });
            return;
        }
        res.json({
            success: true,
            authenticated: true,
            data: {
                user: req.user,
            },
        });
    }
    catch (error) {
        handleAuthError(error, res);
    }
};
exports.verifyAuth = verifyAuth;
/**
 * Controller para atualizar perfil do usuário
 */
const updateProfile = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    message: 'Usuário não autenticado',
                    statusCode: 401,
                    code: 'USER_NOT_AUTHENTICATED',
                },
            });
            return;
        }
        const { name, email } = req.body;
        // Validações básicas
        if (!name || !email) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Nome e email são obrigatórios',
                    statusCode: 400,
                    code: 'VALIDATION_ERROR',
                },
            });
            return;
        }
        // Verificar se o email já está em uso por outro usuário
        const existingUser = await prisma.user.findFirst({
            where: {
                email: email.toLowerCase(),
                id: { not: req.user.id }
            }
        });
        if (existingUser) {
            res.status(409).json({
                success: false,
                error: {
                    message: 'Este email já está em uso por outro usuário',
                    statusCode: 409,
                    code: 'EMAIL_EXISTS',
                },
            });
            return;
        }
        // Atualizar usuário
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                name: name.trim(),
                email: email.toLowerCase().trim(),
            },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                module: true
                            }
                        }
                    }
                }
            }
        });
        // Formatar resposta
        const formattedUser = {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            active: updatedUser.active,
            roles: updatedUser.userRoles.map(userRole => ({
                id: userRole.role.id,
                name: userRole.role.name,
                module: {
                    id: userRole.role.module.id,
                    name: userRole.role.module.name
                }
            }))
        };
        res.json({
            success: true,
            message: 'Perfil atualizado com sucesso',
            data: { user: formattedUser },
        });
    }
    catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        handleAuthError(error, res);
    }
};
exports.updateProfile = updateProfile;
/**
 * Controller para alterar senha do usuário
 */
const changePassword = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    message: 'Usuário não autenticado',
                    statusCode: 401,
                    code: 'USER_NOT_AUTHENTICATED',
                },
            });
            return;
        }
        const { currentPassword, newPassword } = req.body;
        // Validações básicas
        if (!currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Senha atual e nova senha são obrigatórias',
                    statusCode: 400,
                    code: 'VALIDATION_ERROR',
                },
            });
            return;
        }
        // Validar força da nova senha
        if (newPassword.length < 8) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Nova senha deve ter pelo menos 8 caracteres',
                    statusCode: 400,
                    code: 'VALIDATION_ERROR',
                },
            });
            return;
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número',
                    statusCode: 400,
                    code: 'VALIDATION_ERROR',
                },
            });
            return;
        }
        // Buscar usuário com senha
        const user = await prisma.user.findUnique({
            where: { id: req.user.id }
        });
        if (!user) {
            res.status(404).json({
                success: false,
                error: {
                    message: 'Usuário não encontrado',
                    statusCode: 404,
                    code: 'USER_NOT_FOUND',
                },
            });
            return;
        }
        // Verificar senha atual
        const isCurrentPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Senha atual incorreta',
                    statusCode: 400,
                    code: 'INVALID_CURRENT_PASSWORD',
                },
            });
            return;
        }
        // Hash da nova senha
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 12);
        // Atualizar senha
        await prisma.user.update({
            where: { id: req.user.id },
            data: {
                password: hashedNewPassword,
            }
        });
        res.json({
            success: true,
            message: 'Senha alterada com sucesso',
        });
    }
    catch (error) {
        console.error('Erro ao alterar senha:', error);
        handleAuthError(error, res);
    }
};
exports.changePassword = changePassword;
// ========== UTILITÁRIOS ==========
/**
 * Handler unificado para erros de autenticação
 */
const handleAuthError = (error, res) => {
    console.error('Erro de autenticação:', error);
    // Erros de validação Zod
    if (error instanceof zod_1.z.ZodError) {
        res.status(400).json({
            success: false,
            error: {
                message: 'Dados inválidos',
                statusCode: 400,
                code: 'VALIDATION_ERROR',
                details: error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message,
                    code: err.code,
                })),
            },
        });
        return;
    }
    // Erros customizados
    if (error instanceof Error) {
        const errorMappings = {
            'Usuário já existe com este email': { status: 409, code: 'USER_EXISTS' },
            'Credenciais inválidas': { status: 401, code: 'INVALID_CREDENTIALS' },
            'Conta desativada. Entre em contato com o administrador.': { status: 403, code: 'ACCOUNT_DISABLED' },
            'Usuário não encontrado': { status: 404, code: 'USER_NOT_FOUND' },
            'Token expirado': { status: 401, code: 'TOKEN_EXPIRED' },
            'Token inválido': { status: 401, code: 'TOKEN_INVALID' },
        };
        const mapping = errorMappings[error.message];
        if (mapping) {
            res.status(mapping.status).json({
                success: false,
                error: {
                    message: error.message,
                    statusCode: mapping.status,
                    code: mapping.code,
                },
            });
            return;
        }
    }
    // Erro genérico
    res.status(500).json({
        success: false,
        error: {
            message: 'Erro interno do servidor',
            statusCode: 500,
            code: 'INTERNAL_ERROR',
        },
    });
};
// ========== EXPORTAÇÕES ==========
exports.authController = {
    register: exports.register,
    login: exports.login,
    me: exports.me,
    logout: exports.logout,
    refreshToken: exports.refreshToken,
    verifyAuth: exports.verifyAuth,
    updateProfile: exports.updateProfile,
    changePassword: exports.changePassword,
};
//# sourceMappingURL=authController.js.map