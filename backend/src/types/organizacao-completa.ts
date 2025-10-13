/**
 * Tipos completos para organizações baseados na modelagem real do banco
 */

// ========== INTERFACES BÁSICAS ==========

export interface OrganizacaoBase {
  id: number;
  nome?: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  dataFundacao?: Date;
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
  // Empresário
  caracteristicasTaEMulher?: number;
  caracteristicasTaEHomem?: number;
  // Outro
  caracteristicasTaOMulher?: number;
  caracteristicasTaOHomem?: number;
  // Individual
  caracteristicasTaIMulher?: number;
  caracteristicasTaIHomem?: number;
  // Pessoa física
  caracteristicasTaPMulher?: number;
  caracteristicasTaPHomem?: number;
  // Agricultura familiar
  caracteristicasTaAfMulher?: number;
  caracteristicasTaAfHomem?: number;
  // Quilombola
  caracteristicasTaQMulher?: number;
  caracteristicasTaQHomem?: number;
}

export interface CaracteristicasCafe {
  caracteristicasTaCafConvencional?: number;
  caracteristicasTaCafAgroecologico?: number;
  caracteristicasTaCafTransicao?: number;
  caracteristicasTaCafOrganico?: number;
}

// ========== QUESTIONÁRIOS POR MÓDULO ==========

export interface QuestionarioResposta {
  resposta?: number;
  comentario?: string;
  proposta?: string;
}

// GO - Gestão Organizacional
export interface GestaoOrganizacional {
  // Organização (questões 7-13)
  goOrganizacao7?: QuestionarioResposta;
  goOrganizacao8?: QuestionarioResposta;
  goOrganizacao9?: QuestionarioResposta;
  goOrganizacao10?: QuestionarioResposta;
  goOrganizacao11?: QuestionarioResposta;
  goOrganizacao12?: QuestionarioResposta;
  goOrganizacao13?: QuestionarioResposta;
  
  // Direção (questões 14-21)
  goDirecao14?: QuestionarioResposta;
  goDirecao15?: QuestionarioResposta;
  goDirecao16?: QuestionarioResposta;
  goDirecao17?: QuestionarioResposta;
  goDirecao18?: QuestionarioResposta;
  goDirecao19?: QuestionarioResposta;
  goDirecao20?: QuestionarioResposta;
  goDirecao21?: QuestionarioResposta;
  
  // Controle (questões 20-25)
  goControle20?: QuestionarioResposta;
  goControle21?: QuestionarioResposta;
  goControle22?: QuestionarioResposta;
  goControle23?: QuestionarioResposta;
  goControle24?: QuestionarioResposta;
  goControle25?: QuestionarioResposta;
  
  // Educação (questões 26-28)
  goEducacao26?: QuestionarioResposta;
  goEducacao27?: QuestionarioResposta;
  goEducacao28?: QuestionarioResposta;
  
  // Estratégia (questões 5-6)
  goEstrategia5?: QuestionarioResposta;
  goEstrategia6?: QuestionarioResposta;
  
  // Estrutura (questões 1-4)
  goEstrutura1?: QuestionarioResposta;
  goEstrutura2?: QuestionarioResposta;
  goEstrutura3?: QuestionarioResposta;
  goEstrutura4?: QuestionarioResposta;
}

// GPP - Gestão de Processos Produtivos
export interface GestaoProcessosProdutivos {
  // Planejamento (questões 4-6)
  gppPlanejamento4?: QuestionarioResposta;
  gppPlanejamento5?: QuestionarioResposta;
  gppPlanejamento6?: QuestionarioResposta;
  
  // Logística (questões 7-12)
  gppLogistica7?: QuestionarioResposta;
  gppLogistica8?: QuestionarioResposta;
  gppLogistica9?: QuestionarioResposta;
  gppLogistica10?: QuestionarioResposta;
  gppLogistica11?: QuestionarioResposta;
  gppLogistica12?: QuestionarioResposta;
  
  // Valor (questões 13-15)
  gppValor13?: QuestionarioResposta;
  gppValor14?: QuestionarioResposta;
  gppValor15?: QuestionarioResposta;
  
  // Fluxo (questões 16-22)
  gppFluxo16?: QuestionarioResposta;
  gppFluxo17?: QuestionarioResposta;
  gppFluxo18?: QuestionarioResposta;
  gppFluxo19?: QuestionarioResposta;
  gppFluxo20?: QuestionarioResposta;
  gppFluxo21?: QuestionarioResposta;
  gppFluxo22?: QuestionarioResposta;
  
  // Qualidade (questões 23-28)
  gppQualidade23?: QuestionarioResposta;
  gppQualidade24?: QuestionarioResposta;
  gppQualidade25?: QuestionarioResposta;
  gppQualidade26?: QuestionarioResposta;
  gppQualidade27?: QuestionarioResposta;
  gppQualidade28?: QuestionarioResposta;
  
  // Produção (questão 29)
  gppProducao29?: QuestionarioResposta;
  
  // Regulamentação Sanitária (questões 1-3)
  gppRegSanitaria1?: QuestionarioResposta;
  gppRegSanitaria2?: QuestionarioResposta;
  gppRegSanitaria3?: QuestionarioResposta;
}

// GC - Gestão Comercial
export interface GestaoComercial {
  // Estratégia Comercial (questões 1-9)
  gcEComercial1?: QuestionarioResposta;
  gcEComercial2?: QuestionarioResposta;
  gcEComercial3?: QuestionarioResposta;
  gcEComercial4?: QuestionarioResposta;
  gcEComercial5?: QuestionarioResposta;
  gcEComercial6?: QuestionarioResposta;
  gcEComercial7?: QuestionarioResposta;
  gcEComercial8?: QuestionarioResposta;
  gcEComercial9?: QuestionarioResposta;
  
  // Mercado (questões 10-15)
  gcMercado10?: QuestionarioResposta;
  gcMercado11?: QuestionarioResposta;
  gcMercado12?: QuestionarioResposta;
  gcMercado13?: QuestionarioResposta;
  gcMercado14?: QuestionarioResposta;
  gcMercado15?: QuestionarioResposta;
  
  // Comercial (questões 15-20)
  gcComercial15?: QuestionarioResposta;
  gcComercial16?: QuestionarioResposta;
  gcComercial17?: QuestionarioResposta;
  gcComercial18?: QuestionarioResposta;
  gcComercial19?: QuestionarioResposta;
  gcComercial20?: QuestionarioResposta;
  
  // Modelo (questões 21-27)
  gcModelo21?: QuestionarioResposta;
  gcModelo22?: QuestionarioResposta;
  gcModelo23?: QuestionarioResposta;
  gcModelo24?: QuestionarioResposta;
  gcModelo25?: QuestionarioResposta;
  gcModelo26?: QuestionarioResposta;
  gcModelo27?: QuestionarioResposta;
}

// GF - Gestão Financeira
export interface GestaoFinanceira {
  // Contas (questões 5-13)
  gfContas5?: QuestionarioResposta;
  gfContas6?: QuestionarioResposta;
  gfContas7?: QuestionarioResposta;
  gfContas8?: QuestionarioResposta;
  gfContas9?: QuestionarioResposta;
  gfContas10?: QuestionarioResposta;
  gfContas11?: QuestionarioResposta;
  gfContas12?: QuestionarioResposta;
  gfContas13?: QuestionarioResposta;
  
  // Caixa (questões 14-16)
  gfCaixa14?: QuestionarioResposta;
  gfCaixa15?: QuestionarioResposta;
  gfCaixa16?: QuestionarioResposta;
  
  // Estoque (questões 17-19)
  gfEstoque17?: QuestionarioResposta;
  gfEstoque18?: QuestionarioResposta;
  gfEstoque19?: QuestionarioResposta;
  
  // Resultado (questões 20-21)
  gfResultado20?: QuestionarioResposta;
  gfResultado21?: QuestionarioResposta;
  
  // Análise (questões 22-24)
  gfAnalise22?: QuestionarioResposta;
  gfAnalise23?: QuestionarioResposta;
  gfAnalise24?: QuestionarioResposta;
  
  // Fiscal (questões 25-26)
  gfFiscal25?: QuestionarioResposta;
  gfFiscal26?: QuestionarioResposta;
  
  // Balanço (questões 1-4)
  gfBalanco1?: QuestionarioResposta;
  gfBalanco2?: QuestionarioResposta;
  gfBalanco3?: QuestionarioResposta;
  gfBalanco4?: QuestionarioResposta;
}

// GP - Gestão de Pessoas
export interface GestaoPessoas {
  // Pessoas Organização (questões 1-9)
  gpPOrganizacao1?: QuestionarioResposta;
  gpPOrganizacao2?: QuestionarioResposta;
  gpPOrganizacao3?: QuestionarioResposta;
  gpPOrganizacao4?: QuestionarioResposta;
  gpPOrganizacao5?: QuestionarioResposta;
  gpPOrganizacao6?: QuestionarioResposta;
  gpPOrganizacao7?: QuestionarioResposta;
  gpPOrganizacao8?: QuestionarioResposta;
  gpPOrganizacao9?: QuestionarioResposta;
  
  // Desenvolvimento (questões 10-13)
  gpPDesenvolvimento10?: QuestionarioResposta;
  gpPDesenvolvimento11?: QuestionarioResposta;
  gpPDesenvolvimento12?: QuestionarioResposta;
  gpPDesenvolvimento13?: QuestionarioResposta;
  
  // Trabalho (questões 14-17)
  gpTrabalho14?: QuestionarioResposta;
  gpTrabalho15?: QuestionarioResposta;
  gpTrabalho16?: QuestionarioResposta;
  gpTrabalho17?: QuestionarioResposta;
  
  // Geração (questões 18-20)
  gpGeracao18?: QuestionarioResposta;
  gpGeracao19?: QuestionarioResposta;
  gpGeracao20?: QuestionarioResposta;
}

// GS - Gestão Socioambiental
export interface GestaoSocioambiental {
  // Socioambiental (questões 1-5)
  gsSocioambiental1?: QuestionarioResposta;
  gsSocioambiental2?: QuestionarioResposta;
  gsSocioambiental3?: QuestionarioResposta;
  gsSocioambiental4?: QuestionarioResposta;
  gsSocioambiental5?: QuestionarioResposta;
  
  // Ambiental (questões 6-9)
  gsAmbiental6?: QuestionarioResposta;
  gsAmbiental7?: QuestionarioResposta;
  gsAmbiental8?: QuestionarioResposta;
  gsAmbiental9?: QuestionarioResposta;
  
  // Regulamentação Ambiental (questões 10-14)
  gsRegAmbiental10?: QuestionarioResposta;
  gsRegAmbiental11?: QuestionarioResposta;
  gsRegAmbiental12?: QuestionarioResposta;
  gsRegAmbiental13?: QuestionarioResposta;
  gsRegAmbiental14?: QuestionarioResposta;
  
  // Impactos Ambientais (questões 15-22)
  gsImpactosAmbiental15?: QuestionarioResposta;
  gsImpactosAmbiental16?: QuestionarioResposta;
  gsImpactosAmbiental17?: QuestionarioResposta;
  gsImpactosAmbiental18?: QuestionarioResposta;
  gsImpactosAmbiental19?: QuestionarioResposta;
  gsImpactosAmbiental20?: QuestionarioResposta;
  gsImpactosAmbiental21?: QuestionarioResposta;
  gsImpactosAmbiental22?: QuestionarioResposta;
}

// GI - Gestão da Inovação
export interface GestaoInovacao {
  // IIC (questões 1-5)
  giIic1?: QuestionarioResposta;
  giIic2?: QuestionarioResposta;
  giIic3?: QuestionarioResposta;
  giIic4?: QuestionarioResposta;
  giIic5?: QuestionarioResposta;
  
  // MAR (questões 6-9)
  giMar6?: QuestionarioResposta;
  giMar7?: QuestionarioResposta;
  giMar8?: QuestionarioResposta;
  giMar9?: QuestionarioResposta;
  
  // Time (questões 10-14)
  giTime10?: QuestionarioResposta;
  giTime11?: QuestionarioResposta;
  giTime12?: QuestionarioResposta;
  giTime13?: QuestionarioResposta;
  giTime14?: QuestionarioResposta;
}

// IS - Infraestrutura e Sustentabilidade
export interface InfraestruturaSustentabilidade {
  // Recursos Naturais (questões 5-8)
  isRecursosNaturais5?: QuestionarioResposta;
  isRecursosNaturais6?: QuestionarioResposta;
  isRecursosNaturais7?: QuestionarioResposta;
  isRecursosNaturais8?: QuestionarioResposta;
  
  // Água (questões 9-10)
  isAgua9?: QuestionarioResposta;
  isAgua10?: QuestionarioResposta;
  
  // Conforto Ambiental (questões 11-14)
  isConfortoAmbiental11?: QuestionarioResposta;
  isConfortoAmbiental12?: QuestionarioResposta;
  isConfortoAmbiental13?: QuestionarioResposta;
  isConfortoAmbiental14?: QuestionarioResposta;
  
  // Resíduos (questões 15-18)
  isResiduos15?: QuestionarioResposta;
  isResiduos16?: QuestionarioResposta;
  isResiduos17?: QuestionarioResposta;
  isResiduos18?: QuestionarioResposta;
  
  // Eficiência Energética (questões 1-4)
  isEficienciaEnergetica1?: QuestionarioResposta;
  isEficienciaEnergetica2?: QuestionarioResposta;
  isEficienciaEnergetica3?: QuestionarioResposta;
  isEficienciaEnergetica4?: QuestionarioResposta;
}

// ========== ORGANIZACAO COMPLETA ==========

export interface OrganizacaoCompleta extends 
  OrganizacaoBase,
  Localizacao,
  EnderecoOrganizacao,
  DadosRepresentante,
  CaracteristicasSociais,
  CaracteristicasPorGenero,
  CaracteristicasCafe,
  GestaoOrganizacional,
  GestaoProcessosProdutivos,
  GestaoComercial,
  GestaoFinanceira,
  GestaoPessoas,
  GestaoSocioambiental,
  GestaoInovacao,
  InfraestruturaSustentabilidade {
  
  // Campos de controle
  inicio?: Date;
  fim?: Date;
  deviceid?: string;
  dataVisita?: Date;
  metaInstanceId?: string;
  metaInstanceName?: string;
  removido: boolean;
  idTecnico?: number;
  
  // Flags sim/não
  simNaoProducao?: number;
  simNaoFile?: number;
  simNaoPj?: number;
  simNaoSocio?: number;
  
  // Observações
  obs?: string;
  
  // Relacionamentos
  abrangenciaPj?: any[];
  abrangenciaSocio?: any[];
  arquivos?: any[];
  fotos?: any[];
  producoes?: any[];
}

// ========== INTERFACES PARA FORMULÁRIOS ==========

export interface CadastroOrganizacaoData {
  // Dados básicos (obrigatórios)
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  dataFundacao?: string;
  
  // Localização
  estado?: number;
  municipio?: number;
  
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
  representanteFuncao?: number;
  
  // Características básicas
  caracteristicasNTotalSocios?: number;
  caracteristicasNTotalSociosCaf?: number;
  caracteristicasNAtivosTotal?: number;
  
  // Observações
  obs?: string;
}

export interface EdicaoOrganizacaoData extends CadastroOrganizacaoData {
  id: number;
}

// ========== INTERFACES AUXILIARES ==========

export interface EstadoData {
  id: number;
  nome: string;
  uf: string;
}

export interface MunicipioData {
  id: number;
  nome: string;
  codigo_ibge: number;
  estadoId: number;
}

export interface FuncaoData {
  id: number;
  nome: string;
  descricao?: string;
}

export interface RespostaData {
  id: number;
  valor: string;
  descricao?: string;
  categoria?: string;
}

// ========== INTERFACES PARA FILTROS ==========

export interface FiltrosOrganizacao {
  nome?: string;
  cnpj?: string;
  estado?: number;
  municipio?: number;
  dataInicio?: string;
  dataFim?: string;
  representante?: string;
  status?: 'ativo' | 'inativo' | 'todos';
  temQuestionario?: boolean;
  page?: number;
  limit?: number;
  orderBy?: 'nome' | 'dataVisita' | 'dataFundacao' | 'createdAt';
  order?: 'asc' | 'desc';
}

// ========== INTERFACES PARA DASHBOARD ==========

export interface DashboardOrganizacoes {
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
    dataVisita: Date;
  }>;
  estatisticasGerais: {
    totalSocios: number;
    totalSociosCaf: number;
    mediaAtivos: number;
  };
}

// ========== VALIDAÇÃO E CONSTANTES ==========

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

export const CAMPOS_OBRIGATORIOS_CADASTRO = [
  'nome'
] as const;

export const CAMPOS_OBRIGATORIOS_REPRESENTANTE = [
  'representanteNome',
  'representanteCpf'
] as const;