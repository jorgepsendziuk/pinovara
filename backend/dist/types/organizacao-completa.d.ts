/**
 * Tipos completos para organizações baseados na modelagem real do banco
 */
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
    caracteristicasTaAMulher?: number;
    caracteristicasTaAHomem?: number;
    caracteristicasTaEMulher?: number;
    caracteristicasTaEHomem?: number;
    caracteristicasTaOMulher?: number;
    caracteristicasTaOHomem?: number;
    caracteristicasTaIMulher?: number;
    caracteristicasTaIHomem?: number;
    caracteristicasTaPMulher?: number;
    caracteristicasTaPHomem?: number;
    caracteristicasTaAfMulher?: number;
    caracteristicasTaAfHomem?: number;
    caracteristicasTaQMulher?: number;
    caracteristicasTaQHomem?: number;
}
export interface CaracteristicasCafe {
    caracteristicasTaCafConvencional?: number;
    caracteristicasTaCafAgroecologico?: number;
    caracteristicasTaCafTransicao?: number;
    caracteristicasTaCafOrganico?: number;
}
export interface QuestionarioResposta {
    resposta?: number;
    comentario?: string;
    proposta?: string;
}
export interface GestaoOrganizacional {
    goOrganizacao7?: QuestionarioResposta;
    goOrganizacao8?: QuestionarioResposta;
    goOrganizacao9?: QuestionarioResposta;
    goOrganizacao10?: QuestionarioResposta;
    goOrganizacao11?: QuestionarioResposta;
    goOrganizacao12?: QuestionarioResposta;
    goOrganizacao13?: QuestionarioResposta;
    goDirecao14?: QuestionarioResposta;
    goDirecao15?: QuestionarioResposta;
    goDirecao16?: QuestionarioResposta;
    goDirecao17?: QuestionarioResposta;
    goDirecao18?: QuestionarioResposta;
    goDirecao19?: QuestionarioResposta;
    goDirecao20?: QuestionarioResposta;
    goDirecao21?: QuestionarioResposta;
    goControle20?: QuestionarioResposta;
    goControle21?: QuestionarioResposta;
    goControle22?: QuestionarioResposta;
    goControle23?: QuestionarioResposta;
    goControle24?: QuestionarioResposta;
    goControle25?: QuestionarioResposta;
    goEducacao26?: QuestionarioResposta;
    goEducacao27?: QuestionarioResposta;
    goEducacao28?: QuestionarioResposta;
    goEstrategia5?: QuestionarioResposta;
    goEstrategia6?: QuestionarioResposta;
    goEstrutura1?: QuestionarioResposta;
    goEstrutura2?: QuestionarioResposta;
    goEstrutura3?: QuestionarioResposta;
    goEstrutura4?: QuestionarioResposta;
}
export interface GestaoProcessosProdutivos {
    gppPlanejamento4?: QuestionarioResposta;
    gppPlanejamento5?: QuestionarioResposta;
    gppPlanejamento6?: QuestionarioResposta;
    gppLogistica7?: QuestionarioResposta;
    gppLogistica8?: QuestionarioResposta;
    gppLogistica9?: QuestionarioResposta;
    gppLogistica10?: QuestionarioResposta;
    gppLogistica11?: QuestionarioResposta;
    gppLogistica12?: QuestionarioResposta;
    gppValor13?: QuestionarioResposta;
    gppValor14?: QuestionarioResposta;
    gppValor15?: QuestionarioResposta;
    gppFluxo16?: QuestionarioResposta;
    gppFluxo17?: QuestionarioResposta;
    gppFluxo18?: QuestionarioResposta;
    gppFluxo19?: QuestionarioResposta;
    gppFluxo20?: QuestionarioResposta;
    gppFluxo21?: QuestionarioResposta;
    gppFluxo22?: QuestionarioResposta;
    gppQualidade23?: QuestionarioResposta;
    gppQualidade24?: QuestionarioResposta;
    gppQualidade25?: QuestionarioResposta;
    gppQualidade26?: QuestionarioResposta;
    gppQualidade27?: QuestionarioResposta;
    gppQualidade28?: QuestionarioResposta;
    gppProducao29?: QuestionarioResposta;
    gppRegSanitaria1?: QuestionarioResposta;
    gppRegSanitaria2?: QuestionarioResposta;
    gppRegSanitaria3?: QuestionarioResposta;
}
export interface GestaoComercial {
    gcEComercial1?: QuestionarioResposta;
    gcEComercial2?: QuestionarioResposta;
    gcEComercial3?: QuestionarioResposta;
    gcEComercial4?: QuestionarioResposta;
    gcEComercial5?: QuestionarioResposta;
    gcEComercial6?: QuestionarioResposta;
    gcEComercial7?: QuestionarioResposta;
    gcEComercial8?: QuestionarioResposta;
    gcEComercial9?: QuestionarioResposta;
    gcMercado10?: QuestionarioResposta;
    gcMercado11?: QuestionarioResposta;
    gcMercado12?: QuestionarioResposta;
    gcMercado13?: QuestionarioResposta;
    gcMercado14?: QuestionarioResposta;
    gcMercado15?: QuestionarioResposta;
    gcComercial15?: QuestionarioResposta;
    gcComercial16?: QuestionarioResposta;
    gcComercial17?: QuestionarioResposta;
    gcComercial18?: QuestionarioResposta;
    gcComercial19?: QuestionarioResposta;
    gcComercial20?: QuestionarioResposta;
    gcModelo21?: QuestionarioResposta;
    gcModelo22?: QuestionarioResposta;
    gcModelo23?: QuestionarioResposta;
    gcModelo24?: QuestionarioResposta;
    gcModelo25?: QuestionarioResposta;
    gcModelo26?: QuestionarioResposta;
    gcModelo27?: QuestionarioResposta;
}
export interface GestaoFinanceira {
    gfContas5?: QuestionarioResposta;
    gfContas6?: QuestionarioResposta;
    gfContas7?: QuestionarioResposta;
    gfContas8?: QuestionarioResposta;
    gfContas9?: QuestionarioResposta;
    gfContas10?: QuestionarioResposta;
    gfContas11?: QuestionarioResposta;
    gfContas12?: QuestionarioResposta;
    gfContas13?: QuestionarioResposta;
    gfCaixa14?: QuestionarioResposta;
    gfCaixa15?: QuestionarioResposta;
    gfCaixa16?: QuestionarioResposta;
    gfEstoque17?: QuestionarioResposta;
    gfEstoque18?: QuestionarioResposta;
    gfEstoque19?: QuestionarioResposta;
    gfResultado20?: QuestionarioResposta;
    gfResultado21?: QuestionarioResposta;
    gfAnalise22?: QuestionarioResposta;
    gfAnalise23?: QuestionarioResposta;
    gfAnalise24?: QuestionarioResposta;
    gfFiscal25?: QuestionarioResposta;
    gfFiscal26?: QuestionarioResposta;
    gfBalanco1?: QuestionarioResposta;
    gfBalanco2?: QuestionarioResposta;
    gfBalanco3?: QuestionarioResposta;
    gfBalanco4?: QuestionarioResposta;
}
export interface GestaoPessoas {
    gpPOrganizacao1?: QuestionarioResposta;
    gpPOrganizacao2?: QuestionarioResposta;
    gpPOrganizacao3?: QuestionarioResposta;
    gpPOrganizacao4?: QuestionarioResposta;
    gpPOrganizacao5?: QuestionarioResposta;
    gpPOrganizacao6?: QuestionarioResposta;
    gpPOrganizacao7?: QuestionarioResposta;
    gpPOrganizacao8?: QuestionarioResposta;
    gpPOrganizacao9?: QuestionarioResposta;
    gpPDesenvolvimento10?: QuestionarioResposta;
    gpPDesenvolvimento11?: QuestionarioResposta;
    gpPDesenvolvimento12?: QuestionarioResposta;
    gpPDesenvolvimento13?: QuestionarioResposta;
    gpTrabalho14?: QuestionarioResposta;
    gpTrabalho15?: QuestionarioResposta;
    gpTrabalho16?: QuestionarioResposta;
    gpTrabalho17?: QuestionarioResposta;
    gpGeracao18?: QuestionarioResposta;
    gpGeracao19?: QuestionarioResposta;
    gpGeracao20?: QuestionarioResposta;
}
export interface GestaoSocioambiental {
    gsSocioambiental1?: QuestionarioResposta;
    gsSocioambiental2?: QuestionarioResposta;
    gsSocioambiental3?: QuestionarioResposta;
    gsSocioambiental4?: QuestionarioResposta;
    gsSocioambiental5?: QuestionarioResposta;
    gsAmbiental6?: QuestionarioResposta;
    gsAmbiental7?: QuestionarioResposta;
    gsAmbiental8?: QuestionarioResposta;
    gsAmbiental9?: QuestionarioResposta;
    gsRegAmbiental10?: QuestionarioResposta;
    gsRegAmbiental11?: QuestionarioResposta;
    gsRegAmbiental12?: QuestionarioResposta;
    gsRegAmbiental13?: QuestionarioResposta;
    gsRegAmbiental14?: QuestionarioResposta;
    gsImpactosAmbiental15?: QuestionarioResposta;
    gsImpactosAmbiental16?: QuestionarioResposta;
    gsImpactosAmbiental17?: QuestionarioResposta;
    gsImpactosAmbiental18?: QuestionarioResposta;
    gsImpactosAmbiental19?: QuestionarioResposta;
    gsImpactosAmbiental20?: QuestionarioResposta;
    gsImpactosAmbiental21?: QuestionarioResposta;
    gsImpactosAmbiental22?: QuestionarioResposta;
}
export interface GestaoInovacao {
    giIic1?: QuestionarioResposta;
    giIic2?: QuestionarioResposta;
    giIic3?: QuestionarioResposta;
    giIic4?: QuestionarioResposta;
    giIic5?: QuestionarioResposta;
    giMar6?: QuestionarioResposta;
    giMar7?: QuestionarioResposta;
    giMar8?: QuestionarioResposta;
    giMar9?: QuestionarioResposta;
    giTime10?: QuestionarioResposta;
    giTime11?: QuestionarioResposta;
    giTime12?: QuestionarioResposta;
    giTime13?: QuestionarioResposta;
    giTime14?: QuestionarioResposta;
}
export interface InfraestruturaSustentabilidade {
    isRecursosNaturais5?: QuestionarioResposta;
    isRecursosNaturais6?: QuestionarioResposta;
    isRecursosNaturais7?: QuestionarioResposta;
    isRecursosNaturais8?: QuestionarioResposta;
    isAgua9?: QuestionarioResposta;
    isAgua10?: QuestionarioResposta;
    isConfortoAmbiental11?: QuestionarioResposta;
    isConfortoAmbiental12?: QuestionarioResposta;
    isConfortoAmbiental13?: QuestionarioResposta;
    isConfortoAmbiental14?: QuestionarioResposta;
    isResiduos15?: QuestionarioResposta;
    isResiduos16?: QuestionarioResposta;
    isResiduos17?: QuestionarioResposta;
    isResiduos18?: QuestionarioResposta;
    isEficienciaEnergetica1?: QuestionarioResposta;
    isEficienciaEnergetica2?: QuestionarioResposta;
    isEficienciaEnergetica3?: QuestionarioResposta;
    isEficienciaEnergetica4?: QuestionarioResposta;
}
export interface OrganizacaoCompleta extends OrganizacaoBase, Localizacao, EnderecoOrganizacao, DadosRepresentante, CaracteristicasSociais, CaracteristicasPorGenero, CaracteristicasCafe, GestaoOrganizacional, GestaoProcessosProdutivos, GestaoComercial, GestaoFinanceira, GestaoPessoas, GestaoSocioambiental, GestaoInovacao, InfraestruturaSustentabilidade {
    inicio?: Date;
    fim?: Date;
    deviceid?: string;
    dataVisita?: Date;
    metaInstanceId?: string;
    metaInstanceName?: string;
    removido: boolean;
    idTecnico?: number;
    simNaoProducao?: number;
    simNaoFile?: number;
    simNaoPj?: number;
    simNaoSocio?: number;
    obs?: string;
    abrangenciaPj?: any[];
    abrangenciaSocio?: any[];
    arquivos?: any[];
    fotos?: any[];
    producoes?: any[];
}
export interface CadastroOrganizacaoData {
    nome: string;
    cnpj?: string;
    telefone?: string;
    email?: string;
    dataFundacao?: string;
    estado?: number;
    municipio?: number;
    organizacaoEndLogradouro?: string;
    organizacaoEndBairro?: string;
    organizacaoEndComplemento?: string;
    organizacaoEndNumero?: string;
    organizacaoEndCep?: string;
    representanteNome?: string;
    representanteCpf?: string;
    representanteRg?: string;
    representanteTelefone?: string;
    representanteEmail?: string;
    representanteFuncao?: number;
    caracteristicasNTotalSocios?: number;
    caracteristicasNTotalSociosCaf?: number;
    caracteristicasNAtivosTotal?: number;
    obs?: string;
}
export interface EdicaoOrganizacaoData extends CadastroOrganizacaoData {
    id: number;
}
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
export declare const MODULOS_QUESTIONARIO: {
    readonly GO: "Gestão Organizacional";
    readonly GPP: "Gestão de Processos Produtivos";
    readonly GC: "Gestão Comercial";
    readonly GF: "Gestão Financeira";
    readonly GP: "Gestão de Pessoas";
    readonly GS: "Gestão Socioambiental";
    readonly GI: "Gestão da Inovação";
    readonly IS: "Infraestrutura e Sustentabilidade";
};
export declare const CAMPOS_OBRIGATORIOS_CADASTRO: readonly ["nome"];
export declare const CAMPOS_OBRIGATORIOS_REPRESENTANTE: readonly ["representanteNome", "representanteCpf"];
//# sourceMappingURL=organizacao-completa.d.ts.map