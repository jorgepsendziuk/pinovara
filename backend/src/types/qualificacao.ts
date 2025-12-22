export interface Qualificacao {
  id?: number;
  titulo: string;
  objetivo_geral?: string;
  objetivos_especificos?: string;
  conteudo_programatico?: string;
  metodologia?: string;
  recursos_didaticos?: string;
  estrategia_avaliacao?: string;
  referencias?: string;
  ativo?: boolean;
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  organizacoes?: number[];
  instrutores?: number[];
}

export interface QualificacaoFilters {
  titulo?: string;
  ativo?: boolean;
  id_organizacao?: number;
  id_instrutor?: number;
  created_by?: number;
  page?: number;
  limit?: number;
}

export interface QualificacaoListResponse {
  qualificacoes: Qualificacao[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateQualificacaoData {
  titulo: string;
  objetivo_geral?: string;
  objetivos_especificos?: string;
  conteudo_programatico?: string;
  metodologia?: string;
  recursos_didaticos?: string;
  estrategia_avaliacao?: string;
  referencias?: string;
  ativo?: boolean;
  organizacoes?: number[];
  instrutores?: number[];
}

export interface UpdateQualificacaoData extends Partial<CreateQualificacaoData> {}

