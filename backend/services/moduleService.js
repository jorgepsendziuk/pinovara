"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleService = exports.createRoleSchema = exports.createModuleSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const prisma = new client_1.PrismaClient();
exports.createModuleSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    description: zod_1.z.string().optional(),
});
exports.createRoleSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    description: zod_1.z.string().optional(),
    moduleId: zod_1.z.number().int().positive('ID do módulo deve ser um número positivo'),
});
class ModuleService {
    static async createModule(data) {
        const validatedData = exports.createModuleSchema.parse(data);
        // Verificar se módulo já existe
        const existingModule = await prisma.module.findUnique({
            where: { name: validatedData.name },
        });
        if (existingModule) {
            throw new Error('Módulo já existe com este nome');
        }
        return prisma.module.create({
            data: validatedData,
            include: {
                roles: true,
            },
        });
    }
    static async getAllModules() {
        return prisma.module.findMany({
            include: {
                roles: {
                    include: {
                        _count: {
                            select: {
                                userRoles: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        roles: true,
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
    }
    static async getModuleById(id) {
        const module = await prisma.module.findUnique({
            where: { id },
            include: {
                roles: {
                    include: {
                        _count: {
                            select: {
                                userRoles: true,
                            },
                        },
                    },
                },
            },
        });
        if (!module) {
            throw new Error('Módulo não encontrado');
        }
        return module;
    }
    static async updateModule(id, data) {
        const module = await prisma.module.findUnique({
            where: { id },
        });
        if (!module) {
            throw new Error('Módulo não encontrado');
        }
        // Se está alterando o nome, verificar se não conflita com outro módulo
        if (data.name && data.name !== module.name) {
            const existingModule = await prisma.module.findUnique({
                where: { name: data.name },
            });
            if (existingModule) {
                throw new Error('Já existe um módulo com este nome');
            }
        }
        return prisma.module.update({
            where: { id },
            data,
            include: {
                roles: true,
            },
        });
    }
    static async deleteModule(id) {
        const module = await prisma.module.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        roles: true,
                    },
                },
            },
        });
        if (!module) {
            throw new Error('Módulo não encontrado');
        }
        if (module._count.roles > 0) {
            throw new Error('Não é possível excluir módulo que possui papéis associados');
        }
        return prisma.module.delete({
            where: { id },
        });
    }
    static async createRole(data) {
        const validatedData = exports.createRoleSchema.parse(data);
        // Verificar se o módulo existe
        const module = await prisma.module.findUnique({
            where: { id: validatedData.moduleId },
        });
        if (!module) {
            throw new Error('Módulo não encontrado');
        }
        // Verificar se papel já existe no módulo
        const existingRole = await prisma.role.findUnique({
            where: {
                name_moduleId: {
                    name: validatedData.name,
                    moduleId: validatedData.moduleId,
                },
            },
        });
        if (existingRole) {
            throw new Error('Papel já existe neste módulo');
        }
        return prisma.role.create({
            data: validatedData,
            include: {
                module: true,
            },
        });
    }
    static async getAllRoles() {
        return prisma.role.findMany({
            include: {
                module: true,
                _count: {
                    select: {
                        userRoles: true,
                    },
                },
            },
            orderBy: [
                { module: { name: 'asc' } },
                { name: 'asc' },
            ],
        });
    }
    static async getRoleById(id) {
        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                module: true,
                _count: {
                    select: {
                        userRoles: true,
                    },
                },
            },
        });
        if (!role) {
            throw new Error('Papel não encontrado');
        }
        return role;
    }
    static async updateRole(id, data) {
        const role = await prisma.role.findUnique({
            where: { id },
        });
        if (!role) {
            throw new Error('Papel não encontrado');
        }
        // Se está alterando o nome, verificar se não conflita com outro papel no mesmo módulo
        if (data.name && data.name !== role.name) {
            const existingRole = await prisma.role.findUnique({
                where: {
                    name_moduleId: {
                        name: data.name,
                        moduleId: role.moduleId,
                    },
                },
            });
            if (existingRole) {
                throw new Error('Já existe um papel com este nome neste módulo');
            }
        }
        return prisma.role.update({
            where: { id },
            data,
            include: {
                module: true,
            },
        });
    }
    static async deleteRole(id) {
        const role = await prisma.role.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        userRoles: true,
                    },
                },
            },
        });
        if (!role) {
            throw new Error('Papel não encontrado');
        }
        if (role._count.userRoles > 0) {
            throw new Error('Não é possível excluir papel que possui usuários associados');
        }
        return prisma.role.delete({
            where: { id },
        });
    }
}
exports.ModuleService = ModuleService;
//# sourceMappingURL=moduleService.js.map