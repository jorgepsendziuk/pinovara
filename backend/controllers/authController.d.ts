import { Request, Response } from 'express';
/**
 * Controller para registro de usuários
 */
export declare const register: (req: Request, res: Response) => Promise<void>;
/**
 * Controller para login de usuários
 */
export declare const login: (req: Request, res: Response) => Promise<void>;
/**
 * Controller para obter dados do usuário atual
 */
export declare const me: (req: Request, res: Response) => Promise<void>;
/**
 * Controller para logout
 */
export declare const logout: (req: Request, res: Response) => Promise<void>;
/**
 * Controller para renovar token (futuro)
 */
export declare const refreshToken: (req: Request, res: Response) => Promise<void>;
/**
 * Controller para verificar status da autenticação
 */
export declare const verifyAuth: (req: Request, res: Response) => Promise<void>;
/**
 * Controller para atualizar perfil do usuário
 */
export declare const updateProfile: (req: Request, res: Response) => Promise<void>;
/**
 * Controller para alterar senha do usuário
 */
export declare const changePassword: (req: Request, res: Response) => Promise<void>;
export declare const authController: {
    register: (req: Request, res: Response) => Promise<void>;
    login: (req: Request, res: Response) => Promise<void>;
    me: (req: Request, res: Response) => Promise<void>;
    logout: (req: Request, res: Response) => Promise<void>;
    refreshToken: (req: Request, res: Response) => Promise<void>;
    verifyAuth: (req: Request, res: Response) => Promise<void>;
    updateProfile: (req: Request, res: Response) => Promise<void>;
    changePassword: (req: Request, res: Response) => Promise<void>;
};
//# sourceMappingURL=authController.d.ts.map