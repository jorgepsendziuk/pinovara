export interface Organizacao {
    id: number;
    nome?: string | null;
    cnpj?: string | null;
    telefone?: string | null;
    email?: string | null;
    estado?: number | null;
    municipio?: number | null;
    gps_lat?: number | null;
    gps_lng?: number | null;
    gps_alt?: number | null;
    gps_acc?: number | null;
    data_fundacao?: Date | null;
    inicio?: Date | null;
    fim?: Date | null;
    deviceid?: string | null;
    data_visita?: Date | null;
    meta_instance_id?: string | null;
    meta_instance_name?: string | null;
    creator_uri_user?: string | null;
    removido?: boolean | null;
    id_tecnico?: number | null;
}
export interface OrganizacaoCompleta extends Organizacao {
    organizacao_abrangencia_pj: AbrangenciaPj[];
    organizacao_abrangencia_socio: AbrangenciaSocio[];
    organizacao_arquivo: Arquivo[];
    organizacao_foto: Foto[];
    organizacao_producao: Producao[];
    equipe_tecnica?: OrganizacaoEquipeMembro[];
}
export interface OrganizacaoEquipeMembro {
    id: number;
    id_tecnico: number;
    created_at: Date;
    created_by: number | null;
    tecnico: {
        id: number;
        name: string;
        email: string | null;
    } | null;
    criador: {
        id: number;
        name: string;
        email: string | null;
    } | null;
}
export interface AbrangenciaPj {
    id: number;
    razao_social?: string;
    sigla?: string;
    cnpj_pj?: string;
    num_socios_caf?: number;
    num_socios_total?: number;
    estado?: number;
    municipio?: number;
}
export interface AbrangenciaSocio {
    id: number;
    num_socios?: number;
    estado?: number;
    municipio?: number;
}
export interface Arquivo {
    id: number;
    arquivo?: string;
    obs?: string;
}
export interface Foto {
    id: number;
    grupo?: number;
    foto?: string;
    obs?: string;
}
export interface Producao {
    id: number;
    cultura?: string;
    anual?: number;
    mensal?: number;
}
export interface OrganizacaoFilters {
    nome?: string;
    cnpj?: string;
    estado?: number;
    municipio?: number;
    id_tecnico?: number;
    userId?: number;
    incluirRemovidas?: boolean;
    page?: number;
    limit?: number;
}
export interface OrganizacaoListResponse {
    organizacoes: Organizacao[];
    total: number;
    pagina: number;
    totalPaginas: number;
    limit: number;
}
//# sourceMappingURL=organizacao.d.ts.map