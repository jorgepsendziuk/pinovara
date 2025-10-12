import { Request, Response } from 'express';
export declare const fotoSyncController: {
    /**
     * POST /api/organizacoes/:id/fotos/sync
     * Sincroniza fotos do ODK para organização
     */
    sync(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/organizacoes/:id/fotos/odk-disponiveis
     * Lista fotos disponíveis no ODK (sem sincronizar)
     */
    listODKAvailable(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=fotoSyncController.d.ts.map