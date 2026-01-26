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
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  organizacoes?: number[];
  instrutores?: number[];
  equipe_tecnica?: Array<{
    id_tecnico: number;
    tecnico: {
      id: number;
      name: string;
      email: string;
    };
  }>;
  criador?: {
    id: number;
    name: string;
    email: string;
  } | null;
  validacao_status?: number | null;
  validacao_usuario?: number | null;
  validacao_data?: string | null;
  validacao_obs?: string | null;
  validacao_usuario_nome?: string | null;
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

