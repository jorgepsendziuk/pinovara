"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requirePermission = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Middleware de autenticação JWT
 */
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                error: {
                    message: 'Token de acesso necessário',
                    statusCode: 401
                }
            });
            return;
        }
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET não configurado');
            res.status(500).json({
                success: false,
                error: {
                    message: 'Erro de configuração do servidor',
                    statusCode: 500
                }
            });
            return;
        }
        // Verificar e decodificar token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Buscar usuário completo no banco com roles
        const user = await prisma.users.findUnique({
            where: { id: decoded.userId },
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
        if (!user || !user.active) {
            res.status(401).json({
                success: false,
                error: {
                    message: 'Token inválido ou usuário inativo',
                    statusCode: 401
                }
            });
            return;
        }
        // Formatar roles para o formato esperado
        const roles = user.user_roles?.map((ur) => ({
            id: ur.roles.id,
            name: ur.roles.name,
            module: {
                id: ur.roles.modules.id,
                name: ur.roles.modules.name
            }
        })) || [];
        // Adicionar dados do usuário à requisição
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            roles: roles
        };
        next();
    }
    catch (error) {
        console.error('Erro na autenticação:', error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                error: {
                    message: 'Token inválido',
                    statusCode: 401
                }
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: {
                message: 'Erro interno do servidor',
                statusCode: 500
            }
        });
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Middleware para verificar permissões específicas
 */
const requirePermission = (moduleName, roleName) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: {
                    message: 'Usuário não autenticado',
                    statusCode: 401
                }
            });
            return;
        }
        const hasPermission = req.user.roles.some(role => {
            const moduleMatch = role.module.name === moduleName;
            const roleMatch = !roleName || role.name === roleName;
            return moduleMatch && roleMatch;
        });
        if (!hasPermission) {
            res.status(403).json({
                success: false,
                error: {
                    message: 'Permissão insuficiente',
                    statusCode: 403
                }
            });
            return;
        }
        next();
    };
};
exports.requirePermission = requirePermission;
/**
 * Middleware opcional - não bloqueia se token não estiver presente
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.split(' ')[1];
        if (!token) {
            next();
            return;
        }
        if (!process.env.JWT_SECRET) {
            next();
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await prisma.users.findUnique({
            where: { id: decoded.userId },
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
        if (user && user.active) {
            // Formatar roles para o formato esperado
            const roles = user.user_roles?.map((ur) => ({
                id: ur.roles.id,
                name: ur.roles.name,
                module: {
                    id: ur.roles.modules.id,
                    name: ur.roles.modules.name
                }
            })) || [];
            req.user = {
                id: user.id,
                email: user.email,
                name: user.name,
                roles: roles
            };
        }
        next();
    }
    catch (error) {
        // Em caso de erro, apenas prosseguir sem autenticação
        next();
    }
};
exports.optionalAuth = optionalAuth;
