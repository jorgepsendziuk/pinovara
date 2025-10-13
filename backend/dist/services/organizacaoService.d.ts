import { Organizacao, OrganizacaoFilters, OrganizacaoListResponse } from '../types/organizacao';
declare class OrganizacaoService {
    /**
     * Listar organizações com filtros e paginação
     */
    list(filters?: OrganizacaoFilters): Promise<OrganizacaoListResponse>;
    /**
     * Buscar organização por ID - TODOS OS CAMPOS PARA EDIÇÃO
     */
    getById(organizacaoId: number): Promise<Organizacao | null>;
    /**
     * Criar nova organização
     */
    create(data: Partial<Organizacao>): Promise<Organizacao>;
    /**
     * Atualizar organização
     */
    update(id: number, data: Partial<Organizacao>): Promise<Organizacao>;
    /**
     * Remover organização (soft delete)
     */
    delete(id: number): Promise<void>;
    /**
     * Estatísticas do dashboard
     */
    getDashboardStats(): Promise<{
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
            dataVisita: Date;
            estado: string;
            temGps: boolean;
        }[];
        organizacoesComGps: {
            id: number;
            nome: string;
            lat: number;
            lng: number;
            estado: string;
        }[];
    }>;
    /**
     * Buscar municípios (filtrados por estado opcionalmente)
     */
    getMunicipios(estadoId?: number): Promise<any>;
    /**
     * Buscar estados
     */
    getEstados(): Promise<unknown>;
    /**
     * Helper para obter nome do estado
     */
    getEstadoNome(codigo?: number | null): string;
}
declare const _default: OrganizacaoService;
export default _default;
//# sourceMappingURL=organizacaoService.d.ts.map