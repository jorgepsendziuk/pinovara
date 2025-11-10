/**
 * Types para Plano de Gestão
 */

export interface AcaoModelo {
  id: number;
  tipo: string;
  titulo: string;
  grupo: string | null;
  acao: string; // Valor original do modelo (usado como hint quando não há valor editado)
  acao_modelo?: string; // Valor original do modelo (preservado separadamente)
  hint_como_sera_feito: string | null;
  hint_responsavel: string | null;
  hint_recursos: string | null;
  ordem: number;
  ativo: boolean;
}

export interface AcaoEditavel {
  id_acao_editavel?: number;
  acao: string | null;
  responsavel: string | null;
  data_inicio: string | null; // ISO format "YYYY-MM-DD"
  data_termino: string | null; // ISO format "YYYY-MM-DD"
  como_sera_feito: string | null;
  recursos: string | null;
  created_at: string | null;
  updated_at: string | null;
  adicionada?: boolean;
  suprimida?: boolean;
  tipo_plano?: string | null;
  grupo_plano?: string | null;
}

export interface AcaoCompleta extends AcaoModelo, AcaoEditavel {}

export interface GrupoAcoes {
  nome: string | null;
  acoes: AcaoCompleta[];
}

export interface PlanoGestao {
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
  created_at: string;
  updated_at: string;
}

export interface PlanoGestaoResponse {
  plano_gestao_rascunho: string | null;
  plano_gestao_rascunho_updated_by: number | null;
  plano_gestao_rascunho_updated_at: string | null;
  plano_gestao_rascunho_updated_by_name?: string | null;
  plano_gestao_relatorio_sintetico: string | null;
  plano_gestao_relatorio_sintetico_updated_by: number | null;
  plano_gestao_relatorio_sintetico_updated_at: string | null;
  plano_gestao_relatorio_sintetico_updated_by_name?: string | null;
  evidencias: Evidencia[];
  planos: PlanoGestao[];
}

export interface UpdateAcaoRequest {
  acao?: string | null;
  responsavel?: string | null;
  data_inicio?: string | null;
  data_termino?: string | null;
  como_sera_feito?: string | null;
  recursos?: string | null;
  suprimida?: boolean;
}

export interface UpdateRascunhoRequest {
  rascunho: string | null;
}

export interface UpdateRelatorioSinteticoRequest {
  relatorio: string | null;
}

