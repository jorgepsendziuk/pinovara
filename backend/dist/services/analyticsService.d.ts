interface AnalyticsMetrics {
    usuarios: {
        total: number;
        ativos: number;
        novosUltimos7Dias: number;
        porRole: Array<{
            role: string;
            count: number;
        }>;
    };
    organizacoes: {
        total: number;
        novasUltimos7Dias: number;
        novasUltimos30Dias: number;
        porEstado: Array<{
            estado: string;
            count: number;
        }>;
        crescimentoDiario: Array<{
            data: string;
            total: number;
        }>;
    };
    tecnicos: {
        total: number;
        organizacoesPorTecnico: Array<{
            tecnico: string;
            email: string;
            totalOrganizacoes: number;
        }>;
    };
    qualidadeDados: {
        organizacoesComGPS: number;
        organizacoesSemGPS: number;
        percentualComGPS: number;
        organizacoesVinculadas: number;
        organizacoesNaoVinculadas: number;
        percentualVinculadas: number;
    };
    atividades: {
        totalAuditLogs: number;
        atividadesPorDia: Array<{
            data: string;
            count: number;
        }>;
        acoesMaisComuns: Array<{
            acao: string;
            count: number;
        }>;
    };
}
declare class AnalyticsService {
    getSystemMetrics(): Promise<AnalyticsMetrics>;
    private getUsuariosMetrics;
    private getOrganizacoesMetrics;
    private getTecnicosMetrics;
    private getQualidadeDadosMetrics;
    private getAtividadesMetrics;
}
declare const _default: AnalyticsService;
export default _default;
//# sourceMappingURL=analyticsService.d.ts.map