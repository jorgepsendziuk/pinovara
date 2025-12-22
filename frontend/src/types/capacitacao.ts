export type CapacitacaoStatus = 'planejada' | 'em_andamento' | 'concluida' | 'cancelada';

export interface Capacitacao {
  id?: number;
  id_qualificacao: number;
  titulo?: string;
  data_inicio?: string;
  data_fim?: string;
  local?: string;
  turno?: string;
  status?: CapacitacaoStatus;
  link_inscricao?: string;
  link_avaliacao?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  organizacoes?: number[];
  organizacoes_completas?: Array<{
    id: number;
    nome: string;
    tecnico: {
      id: number;
      name: string;
      email: string;
    } | null;
  }>;
  qualificacao?: {
    id: number;
    titulo: string;
  };
  tecnico_criador?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface CapacitacaoFilters {
  id_qualificacao?: number;
  status?: CapacitacaoStatus;
  id_organizacao?: number;
  created_by?: number;
  data_inicio?: string;
  data_fim?: string;
  page?: number;
  limit?: number;
}

export interface CapacitacaoListResponse {
  capacitacoes: Capacitacao[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CapacitacaoInscricao {
  id?: number;
  id_capacitacao: number;
  nome: string;
  email?: string;
  telefone?: string;
  instituicao?: string;
  cpf?: string;
  rg?: string;
  inscrito_por?: number;
  created_at?: string;
}

export interface CreateInscricaoData {
  nome: string;
  email?: string;
  telefone?: string;
  instituicao?: string;
  cpf?: string;
  rg?: string;
}

export interface CapacitacaoPresenca {
  id?: number;
  id_capacitacao: number;
  id_inscricao?: number;
  nome?: string;
  presente: boolean;
  data: string;
  created_by?: number;
  created_at?: string;
}

export interface CapacitacaoEvidencia {
  id: number;
  id_capacitacao: number;
  tipo: string;
  nome_arquivo: string;
  caminho_arquivo: string;
  descricao?: string | null;
  data_evidencia?: string | null;
  local_evidencia?: string | null;
  uploaded_by?: number | null;
  created_at: string;
}

export interface CreateEvidenciaData {
  tipo: string;
  descricao?: string;
  data_evidencia?: string;
  local_evidencia?: string;
}

