export interface AcaoModeloData {
    id: number;
    tipo: string;
    titulo: string;
    grupo: string | null;
    acao_modelo: string;
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
    acao: string | null;
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
export interface Evidencia {
    id: number;
    id_organizacao: number;
    tipo: 'foto' | 'lista_presenca';
    nome_arquivo: string;
    caminho_arquivo: string;
    descricao: string | null;
    uploaded_by: number;
    uploaded_by_name?: string | null;
    created_at: Date;
    updated_at: Date;
}
export interface PlanoGestaoResponse {
    plano_gestao_rascunho: string | null;
    plano_gestao_rascunho_updated_by: number | null;
    plano_gestao_rascunho_updated_at: Date | null;
    plano_gestao_rascunho_updated_by_name?: string | null;
    plano_gestao_relatorio_sintetico: string | null;
    plano_gestao_relatorio_sintetico_updated_by: number | null;
    plano_gestao_relatorio_sintetico_updated_at: Date | null;
    plano_gestao_relatorio_sintetico_updated_by_name?: string | null;
    evidencias: Evidencia[];
    planos: PlanoGestaoCompleto[];
}
declare class PlanoGestaoService {
    getPlanoGestao(idOrganizacao: number): Promise<PlanoGestaoResponse>;
    updateRascunho(idOrganizacao: number, rascunho: string | null, userId: number): Promise<void>;
    upsertAcao(idOrganizacao: number, idAcaoModelo: number, dados: {
        acao?: string | null;
        responsavel?: string | null;
        data_inicio?: Date | null;
        data_termino?: Date | null;
        como_sera_feito?: string | null;
        recursos?: string | null;
    }): Promise<void>;
    deleteAcao(idOrganizacao: number, idAcaoModelo: number): Promise<void>;
    updateRelatorioSintetico(idOrganizacao: number, relatorio: string | null, userId: number): Promise<void>;
    uploadEvidencia(idOrganizacao: number, tipo: 'foto' | 'lista_presenca', nomeArquivo: string, caminhoArquivo: string, descricao: string | null, userId: number): Promise<Evidencia>;
    listEvidencias(idOrganizacao: number): Promise<Evidencia[]>;
    deleteEvidencia(idEvidencia: number): Promise<{
        caminhoArquivo: string;
    }>;
}
declare const _default: PlanoGestaoService;
export default _default;
//# sourceMappingURL=PlanoGestaoService.d.ts.map