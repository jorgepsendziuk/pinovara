import { Request, Response } from 'express';
declare class PlanoGestaoController {
    getPlanoGestao(req: Request, res: Response): Promise<void>;
    updateRascunho(req: Request, res: Response): Promise<void>;
    upsertAcao(req: Request, res: Response): Promise<void>;
    deleteAcao(req: Request, res: Response): Promise<void>;
}
declare const _default: PlanoGestaoController;
export default _default;
//# sourceMappingURL=PlanoGestaoController.d.ts.map