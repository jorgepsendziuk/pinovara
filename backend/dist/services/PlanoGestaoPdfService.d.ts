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
    private addPageWithHeader;
    private drawInfoCard;
    private renderResumo;
    private checkAndAddFooter;
    private renderTextBlock;
    private renderEvidencias;
    private renderPlano;
    gerarPdfPlanoGestao(idOrganizacao: number): Promise<PassThrough>;
}
declare const _default: PlanoGestaoPdfService;
export default _default;
//# sourceMappingURL=PlanoGestaoPdfService.d.ts.map