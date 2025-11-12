import { PassThrough } from 'stream';
declare class PlanoGestaoPdfService {
    private formatDate;
    private calcularStatus;
    private renderHeader;
    private ensureSpace;
    private getColumnDefinitions;
    private getStatusColor;
    private buildActionRowValues;
    private isAcaoRespondida;
    private drawGroupHeader;
    private drawTableHeader;
    private calculateActionRowHeight;
    private drawActionRow;
    private renderFooter;
    private addPageWithHeader;
    private drawInfoCard;
    private renderResumo;
    private renderTextBlock;
    private renderEvidencias;
    private renderPlano;
    gerarPdfPlanoGestao(idOrganizacao: number): Promise<PassThrough>;
}
declare const _default: PlanoGestaoPdfService;
export default _default;
//# sourceMappingURL=PlanoGestaoPdfService.d.ts.map