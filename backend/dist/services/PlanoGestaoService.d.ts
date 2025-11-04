export interface AcaoModeloData {
    id: number;
    tipo: string;
    titulo: string;
    grupo: string | null;
    acao: string;
    hint_como_sera_feito: string | null;
    hint_responsavel: string | null;
    hint_recursos: string | null;
    ordem: number;
    ativo: boolean;
}
export interface AcaoEditavelData {
    id?: number;
    id_acao_modelo: number;
    responsavel: string | null;
    data_inicio: Date | null;
    data_termino: Date | null;
    como_sera_feito: string | null;
    recursos: string | null;
}
export interface AcaoCompleta extends AcaoModeloData {
    id_acao_editavel?: number;
    responsavel: string | null;
    data_inicio: Date | null;
    data_termino: Date | null;
    como_sera_feito: string | null;
    recursos: string | null;
    created_at: Date | null;
    updated_at: Date | null;
}
export interface GrupoAcoes {
    nome: string | null;
    acoes: AcaoCompleta[];
}
export interface PlanoGestaoCompleto {
    tipo: string;
    titulo: string;
    grupos: GrupoAcoes[];
}
export interface PlanoGestaoResponse {
    plano_gestao_rascunho: string | null;
    plano_gestao_rascunho_updated_by: number | null;
    plano_gestao_rascunho_updated_at: Date | null;
    plano_gestao_rascunho_updated_by_name?: string | null;
    planos: PlanoGestaoCompleto[];
}
declare class PlanoGestaoService {
    getPlanoGestao(idOrganizacao: number): Promise<PlanoGestaoResponse>;
    updateRascunho(idOrganizacao: number, rascunho: string | null, userId: number): Promise<void>;
    upsertAcao(idOrganizacao: number, idAcaoModelo: number, dados: {
        responsavel?: string | null;
        data_inicio?: Date | null;
        data_termino?: Date | null;
        como_sera_feito?: string | null;
        recursos?: string | null;
    }): Promise<void>;
    deleteAcao(idOrganizacao: number, idAcaoModelo: number): Promise<void>;
}
declare const _default: PlanoGestaoService;
export default _default;
//# sourceMappingURL=PlanoGestaoService.d.ts.map