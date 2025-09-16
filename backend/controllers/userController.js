"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
const assignRoleSchema = zod_1.z.object({
    roleId: zod_1.z.number().int().positive('ID do papel deve ser um número positivo'),
});
exports.userController = {
    async getAllUsers(req, res) {
        try {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    active: true,
                    createdAt: true,
                    updatedAt: true,
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
                orderBy: {
                    name: 'asc',
                },
            });
            const formattedUsers = users.map(user => ({
                id: user.id,
                email: user.email,
                name: user.name,
                active: user.active,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                roles: user.userRoles.map(userRole => ({
                    id: userRole.role.id,
                    name: userRole.role.name,
                    module: {
                        id: userRole.role.module.id,
                        name: userRole.role.module.name,
                    },
                })),
            }));
            res.json({
                message: 'Usuários obtidos com sucesso',
                data: { users: formattedUsers },
            });
        }
        catch (error) {
            console.error('Erro ao obter usuários:', error);
            res.status(500).json({
                error: {
                    message: 'Erro interno do servidor',
                    statusCode: 500,
                },
            });
        }
    },
    async getUserById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const user = await prisma.user.findUnique({
                where: { id },
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
                res.status(404).json({
                    error: {
                        message: 'Usuário não encontrado',
                        statusCode: 404,
                    },
                });
                return;
            }
            const formattedUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                active: user.active,
                roles: user.userRoles.map((userRole) => ({
                    id: userRole.role.id,
                    name: userRole.role.name,
                    module: {
                        id: userRole.role.module.id,
                        name: userRole.role.module.name,
                    },
                })),
            };
            res.json({
                message: 'Usuário obtido com sucesso',
                data: { user: formattedUser },
            });
        }
        catch (error) {
            console.error('Erro ao obter usuário:', error);
            res.status(500).json({
                error: {
                    message: 'Erro interno do servidor',
                    statusCode: 500,
                },
            });
        }
    },
    async updateUserStatus(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { active } = req.body;
            if (typeof active !== 'boolean') {
                res.status(400).json({
                    error: {
                        message: 'Campo "active" deve ser um boolean',
                        statusCode: 400,
                    },
                });
                return;
            }
            const user = await prisma.user.findUnique({
                where: { id },
            });
            if (!user) {
                res.status(404).json({
                    error: {
                        message: 'Usuário não encontrado',
                        statusCode: 404,
                    },
                });
                return;
            }
            const updatedUser = await prisma.user.update({
                where: { id },
                data: { active },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    active: true,
                    updatedAt: true,
                },
            });
            res.json({
                message: `Usuário ${active ? 'ativado' : 'desativado'} com sucesso`,
                data: { user: updatedUser },
            });
        }
        catch (error) {
            console.error('Erro ao atualizar status do usuário:', error);
            res.status(500).json({
                error: {
                    message: 'Erro interno do servidor',
                    statusCode: 500,
                },
            });
        }
    },
    async assignRole(req, res) {
        try {
            const id = parseInt(req.params.id);
            const validatedData = assignRoleSchema.parse(req.body);
            // Verificar se usuário existe
            const user = await prisma.user.findUnique({
                where: { id },
            });
            if (!user) {
                res.status(404).json({
                    error: {
                        message: 'Usuário não encontrado',
                        statusCode: 404,
                    },
                });
                return;
            }
            // Verificar se papel existe
            const role = await prisma.role.findUnique({
                where: { id: validatedData.roleId },
                include: { module: true },
            });
            if (!role) {
                res.status(404).json({
                    error: {
                        message: 'Papel não encontrado',
                        statusCode: 404,
                    },
                });
                return;
            }
            // Verificar se associação já existe
            const existingUserRole = await prisma.userRole.findUnique({
                where: {
                    userId_roleId: {
                        userId: id,
                        roleId: validatedData.roleId,
                    },
                },
            });
            if (existingUserRole) {
                res.status(409).json({
                    error: {
                        message: 'Usuário já possui este papel',
                        statusCode: 409,
                    },
                });
                return;
            }
            // Criar associação
            const userRole = await prisma.userRole.create({
                data: {
                    userId: id,
                    roleId: validatedData.roleId,
                },
                include: {
                    role: {
                        include: {
                            module: true,
                        },
                    },
                },
            });
            res.json({
                message: 'Papel atribuído ao usuário com sucesso',
                data: {
                    userRole: {
                        id: userRole.id,
                        role: {
                            id: userRole.role.id,
                            name: userRole.role.name,
                            module: {
                                id: userRole.role.module.id,
                                name: userRole.role.module.name,
                            },
                        },
                    },
                },
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    error: {
                        message: 'Dados inválidos',
                        statusCode: 400,
                        details: error.errors.map(err => ({
                            field: err.path.join('.'),
                            message: err.message,
                        })),
                    },
                });
                return;
            }
            console.error('Erro ao atribuir papel:', error);
            res.status(500).json({
                error: {
                    message: 'Erro interno do servidor',
                    statusCode: 500,
                },
            });
        }
    },
    async removeRole(req, res) {
        try {
            const id = parseInt(req.params.id);
            const roleId = parseInt(req.params.roleId);
            // Verificar se associação existe
            const userRole = await prisma.userRole.findUnique({
                where: {
                    userId_roleId: {
                        userId: id,
                        roleId: roleId,
                    },
                },
            });
            if (!userRole) {
                res.status(409).json({
                    error: {
                        message: 'Usuário não possui este papel',
                        statusCode: 409,
                    },
                });
                return;
            }
            // Remover associação
            await prisma.userRole.delete({
                where: {
                    id: userRole.id,
                },
            });
            res.json({
                message: 'Papel removido do usuário com sucesso',
            });
        }
        catch (error) {
            console.error('Erro ao remover papel:', error);
            res.status(500).json({
                error: {
                    message: 'Erro interno do servidor',
                    statusCode: 500,
                },
            });
        }
    },
    async deleteUser(req, res) {
        try {
            const userId = parseInt(req.params.id, 10);
            if (isNaN(userId)) {
                res.status(400).json({
                    error: {
                        message: 'ID do usuário inválido',
                        statusCode: 400,
                    },
                });
                return;
            }
            // Verificar se usuário existe
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    userRoles: true,
                },
            });
            if (!user) {
                res.status(404).json({
                    error: {
                        message: 'Usuário não encontrado',
                        statusCode: 404,
                    },
                });
                return;
            }
            // Verificar se é o próprio usuário tentando se deletar
            if (req.user && req.user.id === userId) {
                res.status(400).json({
                    error: {
                        message: 'Não é possível deletar seu próprio usuário',
                        statusCode: 400,
                    },
                });
                return;
            }
            // Usar transação para garantir atomicidade
            await prisma.$transaction(async (tx) => {
                // 1. Deletar associações de papéis primeiro
                if (user.userRoles.length > 0) {
                    await tx.userRole.deleteMany({
                        where: { userId: userId },
                    });
                }
                // 2. Atualizar audit logs para null (remover referência ao usuário)
                await tx.auditLog.updateMany({
                    where: { userId: userId },
                    data: { userId: null },
                });
                // 3. Deletar o usuário
                await tx.user.delete({
                    where: { id: userId },
                });
            });
            res.json({
                message: 'Usuário deletado com sucesso',
            });
        }
        catch (error) {
            console.error('Erro ao deletar usuário:', error);
            res.status(500).json({
                error: {
                    message: 'Erro interno do servidor',
                    statusCode: 500,
                },
            });
        }
    },
};
//# sourceMappingURL=userController.js.map