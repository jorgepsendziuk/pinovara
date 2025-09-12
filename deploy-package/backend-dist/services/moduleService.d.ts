import { z } from 'zod';
export declare const createModuleSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
}>;
export declare const createRoleSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    moduleId: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    moduleId: number;
    description?: string | undefined;
}, {
    name: string;
    moduleId: number;
    description?: string | undefined;
}>;
export declare class ModuleService {
    static createModule(data: z.infer<typeof createModuleSchema>): Promise<{
        roles: {
            name: string;
            id: number;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            moduleId: number;
        }[];
    } & {
        name: string;
        id: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    static getAllModules(): Promise<({
        roles: ({
            _count: {
                userRoles: number;
            };
        } & {
            name: string;
            id: number;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            moduleId: number;
        })[];
        _count: {
            roles: number;
        };
    } & {
        name: string;
        id: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    })[]>;
    static getModuleById(id: number): Promise<{
        roles: ({
            _count: {
                userRoles: number;
            };
        } & {
            name: string;
            id: number;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            moduleId: number;
        })[];
    } & {
        name: string;
        id: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    static updateModule(id: number, data: Partial<z.infer<typeof createModuleSchema>>): Promise<{
        roles: {
            name: string;
            id: number;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            moduleId: number;
        }[];
    } & {
        name: string;
        id: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    static deleteModule(id: number): Promise<{
        name: string;
        id: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
    }>;
    static createRole(data: z.infer<typeof createRoleSchema>): Promise<{
        module: {
            name: string;
            id: number;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
    } & {
        name: string;
        id: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        moduleId: number;
    }>;
    static getAllRoles(): Promise<({
        module: {
            name: string;
            id: number;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
        _count: {
            userRoles: number;
        };
    } & {
        name: string;
        id: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        moduleId: number;
    })[]>;
    static getRoleById(id: number): Promise<{
        module: {
            name: string;
            id: number;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
        _count: {
            userRoles: number;
        };
    } & {
        name: string;
        id: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        moduleId: number;
    }>;
    static updateRole(id: number, data: Partial<Omit<z.infer<typeof createRoleSchema>, 'moduleId'>>): Promise<{
        module: {
            name: string;
            id: number;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
        };
    } & {
        name: string;
        id: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        moduleId: number;
    }>;
    static deleteRole(id: number): Promise<{
        name: string;
        id: number;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        moduleId: number;
    }>;
}
//# sourceMappingURL=moduleService.d.ts.map