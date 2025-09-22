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

export type AbaAtiva = 'organizacao' | 'diagnostico';
export type AccordionAberto = string | null;
