import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
declare class AdminController {
    /**
     * GET /admin/users
     * Listar todos os usuários
     */
    getUsers(req: AuthRequest, res: Response): Promise<void>;
    /**
     * GET /admin/users/:id
     * Buscar usuário específico
     */
    getUser(req: AuthRequest, res: Response): Promise<void>;
    /**
     * POST /admin/users
     * Criar novo usuário
     */
    createUser(req: AuthRequest, res: Response): Promise<void>;
    /**
     * PUT /admin/users/:id
     * Atualizar usuário
     */
    updateUser(req: AuthRequest, res: Response): Promise<void>;
    /**
     * DELETE /admin/users/:id
     * Deletar usuário
     */
    deleteUser(req: AuthRequest, res: Response): Promise<void>;
    /**
     * PUT /admin/users/:id/status
     * Atualizar status do usuário (ativo/inativo)
     */
    updateUserStatus(req: AuthRequest, res: Response): Promise<void>;
    /**
     * POST /admin/users/:id/roles
     * Atribuir role a usuário
     */
    assignRole(req: AuthRequest, res: Response): Promise<void>;
    /**
     * DELETE /admin/users/:id/roles/:roleId
     * Remover role de usuário
     */
    removeRole(req: AuthRequest, res: Response): Promise<void>;
    /**
     * GET /admin/roles
     * Listar todas as roles disponíveis
     */
    getRoles(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Tratamento de erro padrão
     */
    private handleError;
    /**
     * POST /admin/impersonate/:userId
     * Personificar um usuário
     */
    impersonateUser(req: AuthRequest, res: Response): Promise<void>;
}
declare const _default: AdminController;
export default _default;
//# sourceMappingURL=adminController.d.ts.map