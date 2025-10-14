interface CreateUserData {
    email: string;
    password: string;
    name: string;
    active?: boolean;
}
interface UpdateUserData {
    email?: string;
    name?: string;
    active?: boolean;
    password?: string;
}
interface UserWithRoles {
    id: number;
    email: string;
    name: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    roles: Array<{
        id: number;
        name: string;
        description: string;
        active: boolean;
        moduleId: number;
        module: {
            id: number;
            name: string;
            description: string;
            active: boolean;
        };
    }>;
}
declare class AdminService {
    getAllUsers(): Promise<UserWithRoles[]>;
    getUserById(userId: number): Promise<UserWithRoles | null>;
    createUser(data: CreateUserData): Promise<UserWithRoles>;
    updateUser(userId: number, data: UpdateUserData): Promise<UserWithRoles>;
    deleteUser(userId: number): Promise<void>;
    updateUserStatus(userId: number, active: boolean): Promise<UserWithRoles>;
    assignRoleToUser(userId: number, roleId: number): Promise<void>;
    removeRoleFromUser(userId: number, roleId: number): Promise<void>;
    getAllRoles(): Promise<{
        id: number;
        name: string;
        description: string;
        active: boolean;
        moduleId: number;
        module: {
            id: number;
            name: string;
            description: string;
            active: boolean;
        };
    }[]>;
    private formatUserWithRoles;
    generateImpersonationToken(userId: number, adminUser: any): Promise<{
        token: string;
        user: UserWithRoles;
        expiresAt: Date;
    }>;
}
declare const _default: AdminService;
export default _default;
//# sourceMappingURL=adminService.d.ts.map