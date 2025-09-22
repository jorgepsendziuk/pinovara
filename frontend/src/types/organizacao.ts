/**
 * Tipos para organizações no frontend
 * Baseado na modelagem completa do banco de dados
 */

// ========== INTERFACES BÁSICAS ==========

export interface OrganizacaoBase {
  id: number;
  nome?: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  dataFundacao?: string;
  dataVisita?: string;
  removido: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Localizacao {
  estado?: number;
  municipio?: number;
  gpsLat?: number;
  gpsLng?: number;
  gpsAlt?: number;
  gpsAcc?: number;
}

export interface EnderecoOrganizacao {
  organizacaoEndLogradouro?: string;
  organizacaoEndBairro?: string;
  organizacaoEndComplemento?: string;
  organizacaoEndNumero?: string;
  organizacaoEndCep?: string;
}

export interface DadosRepresentante {
  representanteNome?: string;
  representanteCpf?: string;
  representanteRg?: string;
  representanteTelefone?: string;
  representanteEmail?: string;
  representanteEndLogradouro?: string;
  representanteEndBairro?: string;
  representanteEndComplemento?: string;
  representanteEndNumero?: string;
  representanteEndCep?: string;
  representanteFuncao?: number;
}

export interface CaracteristicasSociais {
  caracteristicasNTotalSocios?: number;
  caracteristicasNTotalSociosCaf?: number;
  caracteristicasNDistintosCaf?: number;
  caracteristicasNSociosPaa?: number;
  caracteristicasNNaosociosPaa?: number;
  caracteristicasNSociosPnae?: number;
  caracteristicasNNaosociosPnae?: number;
  caracteristicasNAtivosTotal?: number;
  caracteristicasNAtivosCaf?: number;
  caracteristicasNNaosocioOpTotal?: number;
  caracteristicasNNaosocioOpCaf?: number;
  caracteristicasNIngressaramTotal12Meses?: number;
  caracteristicasNIngressaramCaf12Meses?: number;
}

export interface CaracteristicasPorGenero {
  // Associados
  caracteristicasTaAMulher?: number;
  caracteristicasTaAHomem?: number;
  // Empresários
  caracteristicasTaEMulher?: number;
  caracteristicasTaEHomem?: number;
  // Outros
  caracteristicasTaOMulher?: number;
  caracteristicasTaOHomem?: number;
  // Individuais
  caracteristicasTaIMulher?: number;
  caracteristicasTaIHomem?: number;
  // Pessoa física
  caracteristicasTaPMulher?: number;
  caracteristicasTaPHomem?: number;
  // Agricultura familiar
  caracteristicasTaAfMulher?: number;
  caracteristicasTaAfHomem?: number;
  // Quilombolas
  caracteristicasTaQMulher?: number;
  caracteristicasTaQHomem?: number;
}

export interface CaracteristicasCafe {
  caracteristicasTaCafConvencional?: number;
  caracteristicasTaCafAgroecologico?: number;
  caracteristicasTaCafTransicao?: number;
  caracteristicasTaCafOrganico?: number;
}

// ========== QUESTIONÁRIOS ==========

export interface QuestionarioResposta {
  resposta?: number;
  comentario?: string;
  proposta?: string;
}

export interface GestaoOrganizacional {
  // Organização
  goOrganizacao7?: QuestionarioResposta;
  goOrganizacao8?: QuestionarioResposta;
  goOrganizacao9?: QuestionarioResposta;
  goOrganizacao10?: QuestionarioResposta;
  goOrganizacao11?: QuestionarioResposta;
  goOrganizacao12?: QuestionarioResposta;
  goOrganizacao13?: QuestionarioResposta;
  
  // Direção
  goDirecao14?: QuestionarioResposta;
  goDirecao15?: QuestionarioResposta;
  goDirecao16?: QuestionarioResposta;
  goDirecao17?: QuestionarioResposta;
  goDirecao18?: QuestionarioResposta;
  goDirecao19?: QuestionarioResposta;
  goDirecao20?: QuestionarioResposta;
  goDirecao21?: QuestionarioResposta;
  
  // Controle
  goControle20?: QuestionarioResposta;
  goControle21?: QuestionarioResposta;
  goControle22?: QuestionarioResposta;
  goControle23?: QuestionarioResposta;
  goControle24?: QuestionarioResposta;
  goControle25?: QuestionarioResposta;
  
  // Educação
  goEducacao26?: QuestionarioResposta;
  goEducacao27?: QuestionarioResposta;
  goEducacao28?: QuestionarioResposta;
  
  // Estratégia
  goEstrategia5?: QuestionarioResposta;
  goEstrategia6?: QuestionarioResposta;
  
  // Estrutura
  goEstrutura1?: QuestionarioResposta;
  goEstrutura2?: QuestionarioResposta;
  goEstrutura3?: QuestionarioResposta;
  goEstrutura4?: QuestionarioResposta;
}

// ========== INTERFACE COMPLETA ==========

export interface OrganizacaoCompleta extends
  OrganizacaoBase,
  Localizacao,
  EnderecoOrganizacao,
  DadosRepresentante,
  CaracteristicasSociais,
  CaracteristicasPorGenero,
  CaracteristicasCafe,
  GestaoOrganizacional {
  
  // Campos de controle
  inicio?: string;
  fim?: string;
  deviceid?: string;
  metaInstanceId?: string;
  metaInstanceName?: string;
  idTecnico?: number;
  
  // Flags sim/não
  simNaoProducao?: number;
  simNaoFile?: number;
  simNaoPj?: number;
  simNaoSocio?: number;
  
  // Observações
  obs?: string;
  
  // Relacionamentos
  abrangenciaPj?: AbrangenciaPj[];
  abrangenciaSocio?: AbrangenciaSocio[];
  arquivos?: Arquivo[];
  fotos?: Foto[];
  producoes?: Producao[];
}

// ========== INTERFACES AUXILIARES ==========

export interface AbrangenciaPj {
  id: number;
  razaoSocial?: string;
  sigla?: string;
  cnpjPj?: string;
  numSociosCaf?: number;
  numSociosTotal?: number;
  estado?: number;
  municipio?: number;
}

export interface AbrangenciaSocio {
  id: number;
  numSocios?: number;
  estado?: number;
  municipio?: number;
}

export interface Arquivo {
  id: number;
  arquivo?: string;
  obs?: string;
}

export interface Foto {
  id: number;
  grupo?: number;
  foto?: string;
  obs?: string;
}

export interface Producao {
  id: number;
  cultura?: string;
  anual?: number;
  mensal?: number;
}

// ========== DADOS AUXILIARES ==========

export interface Estado {
  id: number;
  nome: string;
  uf: string;
  codigo_ibge?: number;
}

export interface Municipio {
  id: number;
  nome: string;
  codigo_ibge: number;
  estadoId: number;
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

// ========== INTERFACES PARA FORMULÁRIOS ==========

export interface CadastroOrganizacaoForm {
  // Dados básicos
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  dataFundacao?: string;
  
  // Localização
  estado?: string;
  municipio?: string;
  gpsLat?: string;
  gpsLng?: string;
  gpsAlt?: string;
  gpsAcc?: string;
  
  // Endereço
  organizacaoEndLogradouro?: string;
  organizacaoEndBairro?: string;
  organizacaoEndComplemento?: string;
  organizacaoEndNumero?: string;
  organizacaoEndCep?: string;
  
  // Representante
  representanteNome?: string;
  representanteCpf?: string;
  representanteRg?: string;
  representanteTelefone?: string;
  representanteEmail?: string;
  representanteEndLogradouro?: string;
  representanteEndBairro?: string;
  representanteEndComplemento?: string;
  representanteEndNumero?: string;
  representanteEndCep?: string;
  representanteFuncao?: string;
  
  // Características
  caracteristicasNTotalSocios?: string;
  caracteristicasNTotalSociosCaf?: string;
  caracteristicasNDistintosCaf?: string;
  caracteristicasNSociosPaa?: string;
  caracteristicasNNaosociosPaa?: string;
  caracteristicasNSociosPnae?: string;
  caracteristicasNNaosociosPnae?: string;
  caracteristicasNAtivosTotal?: string;
  caracteristicasNAtivosCaf?: string;
  
  // Café
  caracteristicasTaCafConvencional?: string;
  caracteristicasTaCafAgroecologico?: string;
  caracteristicasTaCafTransicao?: string;
  caracteristicasTaCafOrganico?: string;
  
  // Gênero
  caracteristicasTaAMulher?: string;
  caracteristicasTaAHomem?: string;
  caracteristicasTaEMulher?: string;
  caracteristicasTaEHomem?: string;
  caracteristicasTaAfMulher?: string;
  caracteristicasTaAfHomem?: string;
  
  // Flags
  simNaoProducao?: string;
  simNaoFile?: string;
  simNaoPj?: string;
  simNaoSocio?: string;
  
  // Observações
  obs?: string;
}

// ========== INTERFACES PARA FILTROS E LISTAGEM ==========

export interface FiltrosOrganizacao {
  busca?: string;
  nome?: string;
  cnpj?: string;
  estado?: string;
  municipio?: string;
  status?: string;
  dataInicio?: string;
  dataFim?: string;
  representante?: string;
  temQuestionario?: boolean;
  page?: number;
  limit?: number;
}

export interface ListaOrganizacoesResponse {
  organizacoes: OrganizacaoCompleta[];
  total: number;
  pagina: number;
  totalPaginas: number;
  limit: number;
}

// ========== INTERFACES PARA DASHBOARD ==========

export interface DashboardStats {
  total: number;
  totalAtivas: number;
  totalInativas: number;
  comQuestionarios: number;
  semQuestionarios: number;
  porEstado: Array<{
    estado: string;
    total: number;
  }>;
  porMunicipio: Array<{
    municipio: string;
    total: number;
  }>;
  ultimasVisitas: Array<{
    id: number;
    nome: string;
    dataVisita: string;
  }>;
  estatisticasGerais: {
    totalSocios: number;
    totalSociosCaf: number;
    mediaAtivos: number;
  };
}

// ========== VALIDAÇÃO E CONSTANTES ==========

export const OPCOES_SIM_NAO = [
  { id: 1, valor: 'Sim' },
  { id: 2, valor: 'Não' }
] as const;

export const MODULOS_QUESTIONARIO = {
  GO: 'Gestão Organizacional',
  GPP: 'Gestão de Processos Produtivos',
  GC: 'Gestão Comercial',
  GF: 'Gestão Financeira',
  GP: 'Gestão de Pessoas',
  GS: 'Gestão Socioambiental',
  GI: 'Gestão da Inovação',
  IS: 'Infraestrutura e Sustentabilidade'
} as const;

export const CAMPOS_OBRIGATORIOS = [
  'nome'
] as const;

export const CAMPOS_NUMERICOS = [
  'estado',
  'municipio',
  'gpsLat',
  'gpsLng',
  'gpsAlt',
  'gpsAcc',
  'representanteFuncao',
  'caracteristicasNTotalSocios',
  'caracteristicasNTotalSociosCaf',
  'caracteristicasNDistintosCaf',
  'caracteristicasNSociosPaa',
  'caracteristicasNNaosociosPaa',
  'caracteristicasNSociosPnae',
  'caracteristicasNNaosociosPnae',
  'caracteristicasNAtivosTotal',
  'caracteristicasNAtivosCaf',
  'caracteristicasNNaosocioOpTotal',
  'caracteristicasNNaosocioOpCaf',
  'caracteristicasNIngressaramTotal12Meses',
  'caracteristicasNIngressaramCaf12Meses',
  'caracteristicasTaAMulher',
  'caracteristicasTaAHomem',
  'caracteristicasTaEMulher',
  'caracteristicasTaEHomem',
  'caracteristicasTaOMulher',
  'caracteristicasTaOHomem',
  'caracteristicasTaIMulher',
  'caracteristicasTaIHomem',
  'caracteristicasTaPMulher',
  'caracteristicasTaPHomem',
  'caracteristicasTaAfMulher',
  'caracteristicasTaAfHomem',
  'caracteristicasTaQMulher',
  'caracteristicasTaQHomem',
  'caracteristicasTaCafConvencional',
  'caracteristicasTaCafAgroecologico',
  'caracteristicasTaCafTransicao',
  'caracteristicasTaCafOrganico',
  'simNaoProducao',
  'simNaoFile',
  'simNaoPj',
  'simNaoSocio'
] as const;

// ========== DADOS PADRÃO PARA DESENVOLVIMENTO ==========

export const ESTADOS_PADRAO: Estado[] = [
  { id: 1, nome: 'Minas Gerais', uf: 'MG', codigo_ibge: 31 },
  { id: 2, nome: 'Bahia', uf: 'BA', codigo_ibge: 29 },
  { id: 3, nome: 'Espírito Santo', uf: 'ES', codigo_ibge: 32 },
  { id: 4, nome: 'São Paulo', uf: 'SP', codigo_ibge: 35 },
  { id: 5, nome: 'Rio de Janeiro', uf: 'RJ', codigo_ibge: 33 },
  { id: 6, nome: 'Goiás', uf: 'GO', codigo_ibge: 52 }
];

export const MUNICIPIOS_PADRAO: Municipio[] = [
  // Minas Gerais
  { id: 1, nome: 'Diamantina', codigo_ibge: 3120904, estadoId: 1 },
  { id: 2, nome: 'Belo Horizonte', codigo_ibge: 3106200, estadoId: 1 },
  { id: 3, nome: 'Uberlândia', codigo_ibge: 3170206, estadoId: 1 },
  { id: 4, nome: 'Contagem', codigo_ibge: 3118601, estadoId: 1 },
  
  // Bahia
  { id: 5, nome: 'Salvador', codigo_ibge: 2927408, estadoId: 2 },
  { id: 6, nome: 'Feira de Santana', codigo_ibge: 2910750, estadoId: 2 },
  { id: 7, nome: 'Vitória da Conquista', codigo_ibge: 2933307, estadoId: 2 },
  
  // Espírito Santo
  { id: 8, nome: 'Vitória', codigo_ibge: 3205309, estadoId: 3 },
  { id: 9, nome: 'Serra', codigo_ibge: 3205002, estadoId: 3 },
  { id: 10, nome: 'Vila Velha', codigo_ibge: 3205200, estadoId: 3 },
  
  // São Paulo
  { id: 11, nome: 'São Paulo', codigo_ibge: 3550308, estadoId: 4 },
  { id: 12, nome: 'Guarulhos', codigo_ibge: 3518800, estadoId: 4 },
  { id: 13, nome: 'Campinas', codigo_ibge: 3509502, estadoId: 4 }
];

export const FUNCOES_PADRAO: Funcao[] = [
  { id: 1, nome: 'Presidente', descricao: 'Presidente da organização' },
  { id: 2, nome: 'Vice-Presidente', descricao: 'Vice-Presidente da organização' },
  { id: 3, nome: 'Secretário', descricao: 'Secretário da organização' },
  { id: 4, nome: 'Tesoureiro', descricao: 'Tesoureiro da organização' },
  { id: 5, nome: 'Diretor Executivo', descricao: 'Diretor Executivo da organização' },
  { id: 6, nome: 'Diretor Administrativo', descricao: 'Diretor Administrativo da organização' },
  { id: 7, nome: 'Coordenador Geral', descricao: 'Coordenador Geral da organização' },
  { id: 8, nome: 'Coordenador de Projeto', descricao: 'Coordenador de Projeto específico' },
  { id: 9, nome: 'Conselheiro', descricao: 'Membro do Conselho' },
  { id: 10, nome: 'Outro', descricao: 'Outra função não listada' }
];

// ========== FUNÇÕES UTILITÁRIAS ==========

export const formatarCNPJ = (cnpj: string): string => {
  const apenasNumeros = cnpj.replace(/\D/g, '');
  if (apenasNumeros.length !== 14) return cnpj;
  
  return apenasNumeros.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
};

export const formatarCPF = (cpf: string): string => {
  const apenasNumeros = cpf.replace(/\D/g, '');
  if (apenasNumeros.length !== 11) return cpf;
  
  return apenasNumeros.replace(
    /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
    '$1.$2.$3-$4'
  );
};

export const formatarCEP = (cep: string): string => {
  const apenasNumeros = cep.replace(/\D/g, '');
  if (apenasNumeros.length !== 8) return cep;
  
  return apenasNumeros.replace(
    /^(\d{5})(\d{3})$/,
    '$1-$2'
  );
};

export const formatarTelefone = (telefone: string): string => {
  const apenasNumeros = telefone.replace(/\D/g, '');
  
  if (apenasNumeros.length === 10) {
    return apenasNumeros.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  } else if (apenasNumeros.length === 11) {
    return apenasNumeros.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  
  return telefone;
};

export const validarEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const calcularProgressoQuestionarios = (organizacao: OrganizacaoCompleta): number => {
  // Lógica para calcular progresso dos questionários
  // Por enquanto, retorna 0 (será implementado quando os questionários estiverem completos)
  return 0;
};

export const obterStatusOrganizacao = (organizacao: OrganizacaoCompleta): 'ativo' | 'inativo' | 'pendente' => {
  if (organizacao.removido) return 'inativo';
  
  const temDadosBasicos = !!(organizacao.nome && organizacao.cnpj);
  const temRepresentante = !!organizacao.representanteNome;
  const temCaracteristicas = !!(organizacao.caracteristicasNTotalSocios);
  
  if (temDadosBasicos && temRepresentante && temCaracteristicas) {
    return 'ativo';
  }
  
  return 'pendente';
};