/**
 * Types para Plano de Gestão
 */

export interface AcaoModelo {
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

export interface AcaoEditavel {
  id_acao_editavel?: number;
  responsavel: string | null;
  data_inicio: string | null; // ISO format "YYYY-MM-DD"
  data_termino: string | null; // ISO format "YYYY-MM-DD"
  como_sera_feito: string | null;
  recursos: string | null;
  created_at: string | null;
  updated_at: string | null;
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

export interface PlanoGestaoResponse {
  plano_gestao_rascunho: string | null;
  plano_gestao_rascunho_updated_by: number | null;
  plano_gestao_rascunho_updated_at: string | null;
  plano_gestao_rascunho_updated_by_name?: string | null;
  planos: PlanoGestao[];
}

export interface UpdateAcaoRequest {
  responsavel?: string | null;
  data_inicio?: string | null;
  data_termino?: string | null;
  como_sera_feito?: string | null;
  recursos?: string | null;
}

export interface UpdateRascunhoRequest {
  rascunho: string | null;
}

