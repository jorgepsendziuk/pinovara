import { PassThrough } from 'stream';
declare class PlanoGestaoPdfService {
    private formatDate;
    private calcularStatus;
    private renderHeader;
    private ensureSpace;
    private renderPlano;
    gerarPdfPlanoGestao(idOrganizacao: number): Promise<PassThrough>;
}
declare const _default: PlanoGestaoPdfService;
export default _default;
//# sourceMappingURL=PlanoGestaoPdfService.d.ts.map