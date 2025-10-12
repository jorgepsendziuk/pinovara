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
    /**
     * Listar todos os usuários com suas roles
     */
    getAllUsers(): Promise<UserWithRoles[]>;
    /**
     * Buscar usuário por ID com roles
     */
    getUserById(userId: number): Promise<UserWithRoles | null>;
    /**
     * Criar novo usuário
     */
    createUser(data: CreateUserData): Promise<UserWithRoles>;
    /**
     * Atualizar usuário
     */
    updateUser(userId: number, data: UpdateUserData): Promise<UserWithRoles>;
    /**
     * Deletar usuário
     */
    deleteUser(userId: number): Promise<void>;
    /**
     * Atualizar status do usuário (ativo/inativo)
     */
    updateUserStatus(userId: number, active: boolean): Promise<UserWithRoles>;
    /**
     * Atribuir role a um usuário
     */
    assignRoleToUser(userId: number, roleId: number): Promise<void>;
    /**
     * Remover role de um usuário
     */
    removeRoleFromUser(userId: number, roleId: number): Promise<void>;
    /**
     * Listar todas as roles disponíveis
     */
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
    /**
     * Formatar usuário com roles para resposta
     */
    private formatUserWithRoles;
    /**
     * Gerar token de personificação para um usuário
     */
    generateImpersonationToken(userId: number, adminUser: any): Promise<{
        token: string;
        user: UserWithRoles;
        expiresAt: Date;
    }>;
}
declare const _default: AdminService;
export default _default;
//# sourceMappingURL=adminService.d.ts.map