import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
declare class AdminController {
    getUsers(req: AuthRequest, res: Response): Promise<void>;
    getUser(req: AuthRequest, res: Response): Promise<void>;
    createUser(req: AuthRequest, res: Response): Promise<void>;
    updateUser(req: AuthRequest, res: Response): Promise<void>;
    deleteUser(req: AuthRequest, res: Response): Promise<void>;
    updateUserStatus(req: AuthRequest, res: Response): Promise<void>;
    assignRole(req: AuthRequest, res: Response): Promise<void>;
    removeRole(req: AuthRequest, res: Response): Promise<void>;
    getRoles(req: AuthRequest, res: Response): Promise<void>;
    private handleError;
    impersonateUser(req: AuthRequest, res: Response): Promise<void>;
}
declare const _default: AdminController;
export default _default;
//# sourceMappingURL=adminController.d.ts.map