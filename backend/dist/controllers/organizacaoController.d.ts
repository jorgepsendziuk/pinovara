import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
declare class OrganizacaoController {
    list(req: AuthRequest, res: Response): Promise<void>;
    getById(req: AuthRequest, res: Response): Promise<void>;
    create(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    delete(req: AuthRequest, res: Response): Promise<void>;
    getDashboard(req: AuthRequest, res: Response): Promise<void>;
    getEstados(req: AuthRequest, res: Response): Promise<void>;
    getMunicipios(req: AuthRequest, res: Response): Promise<void>;
    private handleError;
}
export declare const organizacaoController: OrganizacaoController;
export {};
//# sourceMappingURL=organizacaoController.d.ts.map