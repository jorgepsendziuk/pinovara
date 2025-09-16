import { Request, Response } from 'express';
export declare const userController: {
    getAllUsers(req: Request, res: Response): Promise<void>;
    getUserById(req: Request, res: Response): Promise<void>;
    updateUserStatus(req: Request, res: Response): Promise<void>;
    assignRole(req: Request, res: Response): Promise<void>;
    removeRole(req: Request, res: Response): Promise<void>;
    deleteUser(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=userController.d.ts.map