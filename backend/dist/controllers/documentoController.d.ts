import { Response } from 'express';
import multer from 'multer';
import { AuthRequest } from '../middleware/auth';
export declare const upload: multer.Multer;
declare class DocumentoController {
    uploadDocumento(req: AuthRequest, res: Response): Promise<void>;
    listDocumentos(req: AuthRequest, res: Response): Promise<void>;
    downloadDocumento(req: AuthRequest, res: Response): Promise<void>;
    deleteDocumento(req: AuthRequest, res: Response): Promise<void>;
}
export declare const documentoController: DocumentoController;
export {};
//# sourceMappingURL=documentoController.d.ts.map