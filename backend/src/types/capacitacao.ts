export type CapacitacaoStatus = 'planejada' | 'em_andamento' | 'concluida' | 'cancelada';

export interface Capacitacao {
  id?: number;
  id_qualificacao: number;
  titulo?: string;
  data_inicio?: Date;
  data_fim?: Date;
  local?: string;
  turno?: string;
  status?: CapacitacaoStatus;
  link_inscricao?: string;
  link_avaliacao?: string;
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  organizacoes?: number[];
  qualificacao?: {
    id: number;
    titulo: string;
  };
  validacao_status?: number | null;
  validacao_usuario?: number | null;
  validacao_data?: Date | null;
  validacao_obs?: string | null;
}

export interface CapacitacaoFilters {
  id_qualificacao?: number;
  status?: CapacitacaoStatus;
  id_organizacao?: number;
  created_by?: number;
  data_inicio?: Date;
  data_fim?: Date;
  titulo?: string;
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

export interface CreateCapacitacaoData {
  id_qualificacao: number;
  titulo?: string;
  data_inicio?: Date;
  data_fim?: Date;
  local?: string;
  turno?: string;
  status?: CapacitacaoStatus;
  organizacoes?: number[];
}

export interface UpdateCapacitacaoData extends Partial<CreateCapacitacaoData> {}

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
  created_at?: Date;
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
  data: Date;
  created_by?: number;
  created_at?: Date;
}

export interface CreatePresencaData {
  id_inscricao?: number;
  nome?: string;
  presente: boolean;
  data: Date;
}

