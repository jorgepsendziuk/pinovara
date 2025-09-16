"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = exports.validateLoginData = exports.validateRegisterData = exports.hasAnyPermission = exports.hasPermission = exports.getUserById = exports.loginUser = exports.registerUser = exports.verifyToken = exports.generateToken = exports.verifyPassword = exports.hashPassword = exports.loginSchema = exports.registerSchema = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
// ========== SCHEMAS DE VALIDAÇÃO ==========
exports.registerSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido').toLowerCase(),
    password: zod_1.z.string()
        .min(8, 'Senha deve ter pelo menos 8 caracteres')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
    name: zod_1.z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').trim(),
    confirmPassword: zod_1.z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Email inválido').toLowerCase(),
    password: zod_1.z.string().min(1, 'Senha é obrigatória'),
});
// ========== CONFIGURAÇÃO ==========
const JWT_CONFIG = {
    SECRET: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};
const SALT_ROUNDS = 12;
// ========== UTILITÁRIOS ==========
/**
 * Hash de senha usando bcrypt
 */
const hashPassword = async (password) => {
    return bcryptjs_1.default.hash(password, SALT_ROUNDS);
};
exports.hashPassword = hashPassword;
/**
 * Verificação de senha
 */
const verifyPassword = async (password, hash) => {
    return bcryptjs_1.default.compare(password, hash);
};
exports.verifyPassword = verifyPassword;
/**
 * Geração de token JWT
 */
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_CONFIG.SECRET, {
        expiresIn: JWT_CONFIG.EXPIRES_IN,
    });
};
exports.generateToken = generateToken;
/**
 * Verificação de token JWT
 */
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_CONFIG.SECRET);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw new Error('Token expirado');
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw new Error('Token inválido');
        }
        throw new Error('Erro na verificação do token');
    }
};
exports.verifyToken = verifyToken;
/**
 * Formatar dados do usuário para resposta
 */
const formatUser = (user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    active: user.active,
    roles: user.userRoles?.map((userRole) => ({
        id: userRole.role.id,
        name: userRole.role.name,
        module: {
            id: userRole.role.module.id,
            name: userRole.role.module.name,
        },
    })) || [],
});
// ========== SERVIÇOS PRINCIPAIS ==========
/**
 * Serviço de registro de usuário
 */
const registerUser = async (data) => {
    const validatedData = exports.registerSchema.parse(data);
    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
    });
    if (existingUser) {
        throw new Error('Usuário já existe com este email');
    }
    // Hash da senha
    const hashedPassword = await (0, exports.hashPassword)(validatedData.password);
    // Criar usuário
    const user = await prisma.user.create({
        data: {
            email: validatedData.email,
            password: hashedPassword,
            name: validatedData.name,
        },
        include: {
            userRoles: {
                include: {
                    role: {
                        include: {
                            module: true,
                        },
                    },
                },
            },
        },
    });
    const formattedUser = formatUser(user);
    const token = (0, exports.generateToken)(formattedUser);
    return {
        user: formattedUser,
        token,
        expiresIn: jsonwebtoken_1.default.decode(token)?.exp || 0,
    };
};
exports.registerUser = registerUser;
/**
 * Serviço de login
 */
const loginUser = async (data) => {
    const validatedData = exports.loginSchema.parse(data);
    // Buscar usuário
    const user = await prisma.user.findUnique({
        where: { email: validatedData.email },
        include: {
            userRoles: {
                include: {
                    role: {
                        include: {
                            module: true,
                        },
                    },
                },
            },
        },
    });
    if (!user) {
        throw new Error('Credenciais inválidas');
    }
    if (!user.active) {
        throw new Error('Conta desativada. Entre em contato com o administrador.');
    }
    // Verificar senha
    const isPasswordValid = await (0, exports.verifyPassword)(validatedData.password, user.password);
    if (!isPasswordValid) {
        throw new Error('Credenciais inválidas');
    }
    const formattedUser = formatUser(user);
    const token = (0, exports.generateToken)(formattedUser);
    return {
        user: formattedUser,
        token,
        expiresIn: jsonwebtoken_1.default.decode(token)?.exp || 0,
    };
};
exports.loginUser = loginUser;
/**
 * Buscar usuário por ID
 */
const getUserById = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            userRoles: {
                include: {
                    role: {
                        include: {
                            module: true,
                        },
                    },
                },
            },
        },
    });
    if (!user) {
        throw new Error('Usuário não encontrado');
    }
    return formatUser(user);
};
exports.getUserById = getUserById;
/**
 * Verificar se usuário tem uma permissão específica baseada no tipo de usuário
 */
const hasPermission = (user, moduleName, roleName) => {
    // Verificar se o usuário tem algum dos tipos de role
    return user.roles.some(role => {
        const userType = role.name; // O nome do role
        const roleModule = role.module?.name; // O nome do módulo do role
        // Se especificou um roleName e moduleName, verificar se ambos coincidem
        if (roleName && moduleName) {
            if (userType === roleName && roleModule === moduleName) {
                return true;
            }
        }
        // Se especificou apenas roleName, verificar apenas o role
        if (roleName && !moduleName) {
            if (userType === roleName) {
                return true;
            }
        }
        // Se especificou apenas moduleName, verificar apenas o módulo
        if (moduleName && !roleName) {
            if (roleModule === moduleName) {
                return true;
            }
        }
        // Lógica de permissões baseada no tipo de usuário (para compatibilidade)
        switch (userType) {
            case 'administracao':
                // Admin tem acesso a tudo
                return true;
            case 'admin':
                // Papel admin específico do módulo sistema
                if (roleModule === 'sistema') {
                    return true;
                }
                break;
            case 'gestao':
                // Gestão tem acesso de visualização a tudo
                return true;
            case 'tecnico':
                // Técnico só tem acesso ao módulo de técnicos
                return moduleName === 'tecnicos';
            case 'pesquisa':
                // Pesquisa tem acesso aos módulos especificados
                return ['pesquisa', 'dashboard', 'diagnostico', 'relatorios', 'mapas'].includes(moduleName);
            case 'associados':
                // Associados só tem acesso ao módulo de associados
                return moduleName === 'associados';
            case 'geoprocessamento':
                // Geoprocessamento tem acesso aos módulos especificados
                return ['mapas', 'dashboard', 'diagnostico', 'relatorios'].includes(moduleName);
            default:
                return false;
        }
        return false;
    });
};
exports.hasPermission = hasPermission;
/**
 * Verificar se usuário tem qualquer uma das permissões especificadas
 */
const hasAnyPermission = (user, permissions) => {
    return permissions.some(permission => (0, exports.hasPermission)(user, permission.module, permission.role));
};
exports.hasAnyPermission = hasAnyPermission;
// ========== VALIDAÇÃO ==========
const validateRegisterData = (data) => exports.registerSchema.parse(data);
exports.validateRegisterData = validateRegisterData;
const validateLoginData = (data) => exports.loginSchema.parse(data);
exports.validateLoginData = validateLoginData;
// ========== EXPORTAÇÕES ==========
exports.AuthService = {
    register: exports.registerUser,
    login: exports.loginUser,
    getUserById: exports.getUserById,
    hasPermission: exports.hasPermission,
    hasAnyPermission: exports.hasAnyPermission,
    hashPassword: exports.hashPassword,
    verifyPassword: exports.verifyPassword,
    generateToken: exports.generateToken,
    verifyToken: exports.verifyToken,
};
//# sourceMappingURL=authService.js.map