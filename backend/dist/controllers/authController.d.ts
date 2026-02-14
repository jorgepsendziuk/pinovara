import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
declare class AuthController {
    login(req: Request, res: Response): Promise<void>;
    register(req: Request, res: Response): Promise<void>;
    me(req: AuthRequest, res: Response): Promise<void>;
    verify(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
    updateProfile(req: AuthRequest, res: Response): Promise<void>;
    meuAcessoSemPapel(req: AuthRequest, res: Response): Promise<void>;
    refresh(req: AuthRequest, res: Response): Promise<void>;
    private handleError;
}
export declare const authController: AuthController;
export {};
//# sourceMappingURL=authController.d.ts.map