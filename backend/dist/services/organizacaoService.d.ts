import { Organizacao, OrganizacaoFilters, OrganizacaoListResponse } from '../types/organizacao';
declare class OrganizacaoService {
    list(filters?: OrganizacaoFilters): Promise<OrganizacaoListResponse>;
    getById(organizacaoId: number): Promise<any>;
    private _getByIdOLD_BACKUP;
    create(data: Partial<Organizacao>): Promise<Organizacao>;
    update(id: number, data: Partial<Organizacao>): Promise<Organizacao>;
    updateValidacao(id: number, dadosValidacao: {
        validacao_status: number | null;
        validacao_obs: string | null;
        validacao_usuario: number | null;
        validacao_data: Date;
    }): Promise<Organizacao>;
    delete(id: number): Promise<void>;
    getDashboardStats(userId?: number): Promise<{
        total: number;
        comGps: number;
        semGps: number;
        comQuestionario: number;
        semQuestionario: number;
        porEstado: {
            estado: string;
            total: number;
        }[];
        organizacoesRecentes: {
            id: number;
            nome: string;
            dataVisita: Date | null;
            data_visita: Date | null;
            estado: number | null;
            municipio: number | null;
            estado_nome: string | null | undefined;
            municipio_nome: string | null | undefined;
            localizacao: string;
            temGps: boolean;
            tecnico_nome: string | null;
            tecnico_email: string | null;
            validacao_status: number | null;
        }[];
        organizacoesComGps: {
            id: number;
            nome: string;
            lat: number | null;
            lng: number | null;
            estado: number | null;
            estado_nome: string;
            municipio_nome: string | null;
            validacao_status: number | null;
        }[];
    }>;
    getMunicipios(estadoId?: number): Promise<unknown>;
    getEstados(): Promise<unknown>;
    private getEstadoSigla;
    getEstadoNome(codigo?: number | null): string;
    private findUserByEmail;
    private getUserRoles;
    private isUserAdmin;
    private isUserCoordinator;
}
declare const _default: OrganizacaoService;
export default _default;
//# sourceMappingURL=organizacaoService.d.ts.map