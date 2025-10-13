import { Organizacao, OrganizacaoFilters, OrganizacaoListResponse } from '../types/organizacao';
declare class OrganizacaoService {
    list(filters?: OrganizacaoFilters): Promise<OrganizacaoListResponse>;
    getById(organizacaoId: number): Promise<Organizacao | null>;
    create(data: Partial<Organizacao>): Promise<Organizacao>;
    update(id: number, data: Partial<Organizacao>): Promise<Organizacao>;
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
            estado_nome: string | null;
            municipio_nome: string | null;
            temGps: boolean;
        }[];
        organizacoesComGps: {
            id: number;
            nome: string;
            lat: number | null;
            lng: number | null;
            estado: number | null;
            estado_nome: string;
        }[];
    }>;
    getMunicipios(estadoId?: number): Promise<unknown>;
    getEstados(): Promise<unknown>;
    getEstadoNome(codigo?: number | null): string;
    private findUserByEmail;
    private getUserRoles;
    private isUserAdmin;
}
declare const _default: OrganizacaoService;
export default _default;
//# sourceMappingURL=organizacaoService.d.ts.map