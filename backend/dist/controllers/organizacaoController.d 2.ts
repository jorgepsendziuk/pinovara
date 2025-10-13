import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
declare class OrganizacaoController {
    /**
     * GET /organizacoes
     */
    list(req: AuthRequest, res: Response): Promise<void>;
    /**
     * GET /organizacoes/:id
     */
    getById(req: AuthRequest, res: Response): Promise<void>;
    /**
     * POST /organizacoes
     */
    create(req: AuthRequest, res: Response): Promise<void>;
    /**
     * PUT /organizacoes/:id
     */
    update(req: AuthRequest, res: Response): Promise<void>;
    /**
     * DELETE /organizacoes/:id
     */
    delete(req: AuthRequest, res: Response): Promise<void>;
    /**
     * GET /organizacoes/dashboard
     */
    getDashboard(req: AuthRequest, res: Response): Promise<void>;
    /**
     * GET /organizacoes/estados
     */
    getEstados(req: AuthRequest, res: Response): Promise<void>;
    /**
     * GET /organizacoes/municipios/:estadoId?
     */
    getMunicipios(req: AuthRequest, res: Response): Promise<void>;
    /**
     * Tratar erros de forma padronizada
     */
    private handleError;
}
export declare const organizacaoController: OrganizacaoController;
export {};
//# sourceMappingURL=organizacaoController.d.ts.map