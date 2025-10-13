import { Request, Response } from 'express';
export declare const relatorioController: {
    /**
     * GET /api/organizacoes/:id/relatorio/pdf
     * Gera relatório PDF da organização
     */
    gerarPDF(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=relatorioController.d.ts.map