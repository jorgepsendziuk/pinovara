import { Request, Response } from 'express';
import multer from 'multer';
import { AuthRequest } from '../middleware/auth';
export declare const upload: multer.Multer;
declare class RepositorioController {
    uploadArquivo(req: AuthRequest, res: Response): Promise<void>;
    updateArquivo(req: AuthRequest, res: Response): Promise<void>;
    listArquivos(req: Request, res: Response): Promise<void>;
    downloadArquivo(req: Request, res: Response): Promise<void>;
    getArquivo(req: Request, res: Response): Promise<void>;
    deleteArquivo(req: AuthRequest, res: Response): Promise<void>;
    getEstatisticas(req: Request, res: Response): Promise<void>;
}
export declare const repositorioController: RepositorioController;
export {};
//# sourceMappingURL=repositorioController.d.ts.map