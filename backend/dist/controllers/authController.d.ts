import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
declare class AuthController {
    /**
     * POST /auth/login
     */
    login(req: Request, res: Response): Promise<void>;
    /**
     * POST /auth/register
     */
    register(req: Request, res: Response): Promise<void>;
    /**
     * GET /auth/me
     */
    me(req: AuthRequest, res: Response): Promise<void>;
    /**
     * GET /auth/verify
     */
    verify(req: Request, res: Response): Promise<void>;
    /**
     * POST /auth/logout
     */
    logout(req: Request, res: Response): Promise<void>;
    /**
     * PUT /auth/profile
     */
    updateProfile(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Tratar erros de forma padronizada
     */
    private handleError;
}
export declare const authController: AuthController;
export {};
//# sourceMappingURL=authController.d.ts.map