import { Request, Response } from 'express';
export declare const arquivoSyncController: {
    /**
     * Sincroniza arquivos do ODK para uma organização
     */
    syncFromODK(req: Request, res: Response): Promise<void>;
    /**
     * Lista arquivos disponíveis no ODK para uma organização
     */
    listODKAvailable(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=arquivoSyncController.d.ts.map