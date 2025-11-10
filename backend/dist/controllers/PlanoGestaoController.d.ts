import { Request, Response } from 'express';
import multer from 'multer';
import { AuthRequest } from '../middleware/auth';
export declare const uploadEvidencia: multer.Multer;
declare class PlanoGestaoController {
    getPlanoGestao(req: Request, res: Response): Promise<void>;
    gerarPdf(req: Request, res: Response): Promise<void>;
    updateRascunho(req: Request, res: Response): Promise<void>;
    upsertAcao(req: Request, res: Response): Promise<void>;
    deleteAcao(req: Request, res: Response): Promise<void>;
    createAcaoPersonalizada(req: Request, res: Response): Promise<void>;
    updateAcaoPersonalizada(req: Request, res: Response): Promise<void>;
    deleteAcaoPersonalizada(req: Request, res: Response): Promise<void>;
    updateRelatorioSintetico(req: Request, res: Response): Promise<void>;
    uploadEvidencia(req: AuthRequest, res: Response): Promise<void>;
    listEvidencias(req: Request, res: Response): Promise<void>;
    deleteEvidencia(req: AuthRequest, res: Response): Promise<void>;
    downloadEvidencia(req: Request, res: Response): Promise<void>;
}
declare const _default: PlanoGestaoController;
export default _default;
//# sourceMappingURL=PlanoGestaoController.d.ts.map