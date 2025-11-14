export interface Organizacao {
  id: number;
  nome: string | null;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  estado: number | null;
  municipio: number | null;
  gps_lat: number | null;
  gps_lng: number | null;
  gps_alt: number | null;
  gps_acc: number | null;
  data_fundacao: string | null;
  inicio: string | null;
  fim: string | null;
  deviceid: string | null;
  data_visita: string | null;
  meta_instance_id: string | null;
  meta_instance_name: string | null;
  removido: boolean | null;
  id_tecnico: number | null;

  // Campos de validação
  validacao_status: number | null;
  validacao_usuario: number | null;
  validacao_data: Date | string | null;
  validacao_obs: string | null;
  
  // Campos de histórico de validação
  data_criacao?: Date | string | null;
  primeira_alteracao_status?: Date | string | null;
  data_aprovacao?: Date | string | null;
  validador_nome?: string | null;
  validador_email?: string | null;

  // Campos do representante
  representante_nome: string | null;
  representante_cpf: string | null;
  representante_rg: string | null;
  representante_telefone: string | null;
  representante_email: string | null;
  representante_end_logradouro: string | null;
  representante_end_bairro: string | null;
  representante_end_complemento: string | null;
  representante_end_numero: string | null;
  representante_end_cep: string | null;
  representante_funcao: number | null;

  // Campos de características
  caracteristicas_n_total_socios: number | null;
  caracteristicas_n_total_socios_caf: number | null;
  caracteristicas_n_distintos_caf: number | null;
  caracteristicas_n_socios_paa: number | null;
  caracteristicas_n_naosocios_paa: number | null;
  caracteristicas_n_socios_pnae: number | null;
  caracteristicas_n_naosocios_pnae: number | null;
  caracteristicas_n_ativos_total: number | null;
  caracteristicas_n_ativos_caf: number | null;
  caracteristicas_n_naosocio_op_total: number | null;
  caracteristicas_n_naosocio_op_caf: number | null;
  caracteristicas_n_ingressaram_total_12_meses: number | null;
  caracteristicas_n_ingressaram_caf_12_meses: number | null;

  // Total de Associados por categoria
  caracteristicas_ta_af_mulher: number | null;
  caracteristicas_ta_af_homem: number | null;
  caracteristicas_ta_a_mulher: number | null;
  caracteristicas_ta_a_homem: number | null;
  caracteristicas_ta_p_mulher: number | null;
  caracteristicas_ta_p_homem: number | null;
  caracteristicas_ta_i_mulher: number | null;
  caracteristicas_ta_i_homem: number | null;
  caracteristicas_ta_q_mulher: number | null;
  caracteristicas_ta_q_homem: number | null;
  caracteristicas_ta_e_mulher: number | null;
  caracteristicas_ta_e_homem: number | null;
  caracteristicas_ta_o_mulher: number | null;
  caracteristicas_ta_o_homem: number | null;

  // Tipos de CAF
  caracteristicas_ta_caf_organico: number | null;
  caracteristicas_ta_caf_agroecologico: number | null;
  caracteristicas_ta_caf_transicao: number | null;
  caracteristicas_ta_caf_convencional: number | null;

  // GOVERNANÇA ORGANIZACIONAL - campos dinâmicos
  [key: string]: any;
}

export interface DadosRepresentante {
  nome: string;
  cpf: string;
  rg: string;
  telefone: string;
  email: string;
  endLogradouro: string;
  endBairro: string;
  endComplemento: string;
  endNumero: string;
  endCep: string;
  funcao: number;
}

export interface DadosCaracteristicas {
  nTotalSocios: number;
  nTotalSociosCaf: number;
  nDistintosCaf: number;
  nSociosPaa: number;
  nNaosociosPaa: number;
  nSociosPnae: number;
  nNaosociosPnae: number;
  nAtivosTotal: number;
  nAtivosCaf: number;
  nNaosocioOpTotal: number;
  nNaosocioOpCaf: number;
  nIngressaramTotal12Meses: number;
  nIngressaramCaf12Meses: number;
}

export interface RespostaDiagnostico {
  resposta: number;
  comentario: string;
  proposta: string;
}

export interface GruposDiagnostico {
  [key: string]: RespostaDiagnostico;
}

export type AbaAtiva = 
  | 'identificacao' 
  | 'caracteristicas' 
  | 'abrangencia' 
  | 'associados-juridicos'
  | 'producao'
  | 'diagnostico' 
  | 'planoGestao'
  | 'validacao'
  | 'complementos';
export type AccordionAberto = string | null;

// ========== TIPOS AUXILIARES ==========

export interface Estado {
  id: number;
  descricao: string;
  nome?: string; // Opcional para compatibilidade
  uf?: string;
  codigo_ibge?: number;
}

export interface Municipio {
  id: number;
  descricao: string;
  nome?: string; // Opcional para compatibilidade
  id_estado?: number;
  estadoId?: number;
  codigo_ibge?: number;
}

export interface Funcao {
  id: number;
  nome: string;
  descricao?: string;
}

export interface RespostaQuestionario {
  id: number;
  valor: string;
  descricao?: string;
  categoria?: string;
}

// ========== TIPOS DE RESPOSTA DA API ==========

export interface MembroEquipeTecnica {
  id: number;
  id_tecnico: number;
  created_at: string | Date;
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

export interface OrganizacaoCompleta extends Organizacao {
  estado_nome?: string;
  municipio_nome?: string;
  tecnico_nome?: string;
  tecnico_email?: string;
  equipe_tecnica?: MembroEquipeTecnica[];
}

export interface ListaOrganizacoesResponse {
  organizacoes: OrganizacaoCompleta[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FiltrosOrganizacao {
  page?: number;
  limit?: number;
  pageSize?: number;
  nome?: string;
  cnpj?: string;
  estado?: number;
  municipio?: number;
  id_tecnico?: number;
}

export interface TecnicoResumo {
  id: number;
  name: string;
  email: string | null;
}

export interface CadastroOrganizacaoForm extends Partial<Organizacao> {
  // Campos adicionais para o formulário se necessário
}

export interface DashboardStats {
  total: number;
  validadas: number;
  pendentes: number;
  recusadas: number;
  porEstado?: Array<{
    estado: string;
    total: number;
  }>;
  porMunicipio?: Array<{
    municipio: string;
    total: number;
  }>;
}

export interface HistoricoValidacao {
  log_id: number;
  organizacao_id: number;
  data_mudanca: string | Date;
  status_anterior: number | null;
  status_novo: number | null;
  usuario_nome: string | null;
  usuario_email: string | null;
  observacoes: string | null;
  action?: string | null;
}
