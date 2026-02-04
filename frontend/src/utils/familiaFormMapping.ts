import { TabConfig } from '../types/familia';

/**
 * Mapeamento de campos do formulário por grupo/aba
 * Baseado na estrutura do formulário ODK em docs/familias.xml
 */
export const familiaTabsConfig: TabConfig[] = [
  {
    id: 'inicial',
    label: 'Informações Iniciais',
    fields: [
      'i_q1_10',
      'i_note_numeroimovel',
      'i_q1_10_1',
      'i_quilombo',
      'i_q1_17',
      'tem_nome'
    ]
  },
  {
    id: 'identificacao',
    label: 'Identificação da Unidade Familiar',
    fields: [
      'iuf_nome_ocupante',
      'iuf_nome_conjuge',
      'iuf_prop_nome',
      'iuf_desc_acess',
      'g00_0_conhecido',
      'g00_0_q1_2',
      'g00_0_sexo',
      'g00_0_data_nascimento',
      'g00_0_idade',
      'g00_0_nacionalidade',
      'g00_0_nascimento_uf',
      'nascimento_mun',
      'g00_0_identidade',
      'g00_0_identidade_orgao_t_doc',
      'g00_0_identidade_orgao',
      'g00_0_identidade_orgao_uf',
      'g00_0_estado_civil',
      'g00_0_data_casamento',
      'g00_0_regime_bens',
      'g00_0_nome_mae',
      'g00_0_profissao',
      'g00_0_profissao_outros',
      'g00_0_aposentado',
      'g00_0_ec_tel1',
      'g00_0_ec_tel2',
      'g00_0_email'
    ]
  },
  {
    id: 'conjuge',
    label: 'Identificação do Cônjuge',
    fields: [
      'g00_0_1_conjuge_conhecido',
      'g00_0_1_conjuge_cpf',
      'g00_0_1_conjuge_sexo',
      'g00_0_1_conjuge_data_nascimento',
      'g00_0_1_conjuge_idade',
      'g00_0_1_conjuge_nacionalidade',
      'g00_0_1_conjuge_nascimento_uf',
      'conjuge_nascimento_mun',
      'g00_0_1_conjuge_identidade',
      'g00_0_1_conjuge_identidade_orgao_t_doc',
      'g00_0_1_conjuge_identidade_orgao',
      'g00_0_1_conjuge_identidade_orgao_uf',
      'g00_0_1_conjuge_estado_civil',
      'g00_0_1_conjuge_data_casamento',
      'g00_0_1_conjuge_regime_bens',
      'g00_0_1_conjuge_nome_mae',
      'g00_0_1_conjuge_profissao',
      'g00_0_1_conjuge_profissao_outros',
      'g00_0_1_conjuge_aposentado',
      'g00_0_1_conjuge_ec_tel1',
      'g00_0_1_conjuge_ec_tel2',
      'g00_0_1_conjuge_email'
    ]
  },
  {
    id: 'endereco',
    label: 'Endereço para Correspondência',
    fields: [
      'ec_zona',
      'ec_logrado',
      'ec_numero',
      'ec_complem',
      'ec_bairro',
      'ec_cep',
      'ec_uf',
      'g1_1_1_ec_cod_ibg'
    ]
  },
  {
    id: 'imovel',
    label: 'Informações do Imóvel',
    fields: [
      'ii_titulo_definitivo',
      'ii_titulo_quitado',
      'ii_titulo_baixa',
      'ii_linha_credito',
      'ii_linha_credito_qual',
      'ii_fr_regularizacao',
      'ii_fr_r_doc',
      'ii_fr_r_doc_outro',
      'ii_p_principal',
      'ii_r_st',
      'ii_do_originaria',
      'ii_do_atual',
      'ii_o_primitivo',
      'ii_din_urbano',
      'ii_c_acesso',
      'ii_car_possui',
      'ii_car_protocolo',
      'ii_georreferenciada',
      'ii_ai_matricula',
      'ii_declarada_medida',
      'ii_vm_fiscal',
      'ii_d_possui',
      'ii_d_orgaopublico',
      'ii_d_orgaopublico_outros',
      'ii_d_cc_td',
      'ii_d_cc_ccdru',
      'ii_d_sncr',
      'ii_d_certific',
      'ii_d_comprobatoria',
      'ii_d_comprobatoria_outros'
    ]
  },
  {
    id: 'areas',
    label: 'Quadro de Áreas',
    fields: [
      'qa_q3_6_0',
      'qa_q3_6_1',
      'qa_q3_6_2',
      'qa_q3_6_3',
      'qa_q3_6_4',
      'qa_q3_6_5',
      'qa_q3_6_6',
      'qa_q3_6_7'
    ]
  },
  {
    id: 'rrf',
    label: 'Requisitos para Regularização Fundiária',
    fields: [
      'rrf_p_cultura',
      'rrf_eo_direta',
      'rrf_eo_forma',
      'rrf_ed_anterior',
      'rrf_ed_anterior_quem',
      'rrf_oc_proprietario',
      'rrf_oc_proprietario_quem',
      'rrf_oc_escravo',
      'rrf_oc_escravo_quem',
      'rrf_oc_beneficiado',
      'rrf_oc_beneficiado_quem',
      'rrf_oc_crime',
      'rrf_oc_crime_quem',
      'rrf_oc_cargo'
    ]
  },
  {
    id: 'nucleo',
    label: 'Núcleo Familiar',
    fields: ['nucleo'] // Array especial
  },
  {
    id: 'renda',
    label: 'Informações de Renda',
    fields: [
      'ir_q00_23',
      'ir_q00_26',
      'ir_q2_17',
      'ir_q2_17_1',
      'ir_q2_17_1_outro'
    ]
  },
  {
    id: 'saneamento',
    label: 'Saneamento Básico',
    fields: [
      'sb_q2_10',
      'sb_q2_10_outro',
      'sb_q2_7',
      'sb_q2_7_outro',
      'sb_q2_7_suficiente',
      'sb_descarte_residuo',
      'sb_descarte_residuo_outros'
    ]
  },
  {
    id: 'seguranca_alimentar',
    label: 'Segurança Alimentar',
    fields: [
      'san_tiveram_preocupacao',
      'san_acabaram_antes',
      'san_ficaram_sem',
      'san_comeram_pouco',
      'san_deixou_refeicao',
      'san_comeu_menos_devia',
      'san_sentiu_fome',
      'san_uma_refeicao',
      'san_refeicao_completa',
      'san_orientacao_profissional'
    ]
  },
  {
    id: 'producao',
    label: 'Produção Agrária',
    fields: [
      'pa_a_vegetal',
      'pa_a_vegetal_outros',
      'pa_a_animal',
      'pa_comercial',
      'pa_p_animal',
      'pa_p_vegetal',
      'pa_p_vegetal_outros'
    ]
  },
  {
    id: 'observacoes',
    label: 'Observações',
    fields: [
      'obs_gerais',
      'obs_form'
    ]
  }
];

/**
 * Função auxiliar para obter valor de campo aninhado
 */
export function getFieldValue(familia: any, fieldName: string): any {
  if (!familia) {
    console.log(`[DEBUG] getFieldValue - familia é null/undefined para campo ${fieldName}`);
    return null;
  }
  
  // Campos simples diretos
  if (familia[fieldName] !== undefined) {
    // Debug para campos importantes
    if (['iuf_nome_ocupante', 'g00_0_q1_2', 'i_q1_10', 'i_q1_17'].includes(fieldName)) {
      console.log(`[DEBUG] getFieldValue ${fieldName}:`, familia[fieldName]);
    }
    return familia[fieldName];
  }
  
  // Campos podem vir em formato diferente da API
  // Tentar variações comuns
  const variations = [
    fieldName,
    fieldName.replace(/_/g, ''),
    fieldName.toLowerCase(),
    fieldName.toUpperCase()
  ];
  
  for (const variation of variations) {
    if (familia[variation] !== undefined) {
      if (['iuf_nome_ocupante', 'g00_0_q1_2', 'i_q1_10', 'i_q1_17'].includes(fieldName)) {
        console.log(`[DEBUG] getFieldValue ${fieldName} encontrado como variação ${variation}:`, familia[variation]);
      }
      return familia[variation];
    }
  }
  
  // Debug para campos importantes que não foram encontrados
  if (['iuf_nome_ocupante', 'g00_0_q1_2', 'i_q1_10', 'i_q1_17'].includes(fieldName)) {
    console.log(`[DEBUG] getFieldValue ${fieldName} NÃO encontrado. Chaves disponíveis:`, Object.keys(familia).slice(0, 20));
  }
  
  return null;
}

/**
 * Mapeamento completo de labels dos campos conforme XML
 * Baseado em docs/familias.xml
 */
export const FIELD_LABELS: Record<string, string> = {
  // Informações Iniciais
  'i_q1_10': 'Número do lote - GEO',
  'i_note_numeroimovel': '(nota)',
  'i_q1_10_1': '(campo adicional)',
  'i_quilombo': 'Quilombo',
  'i_q1_17': 'Família residente aceitou a visita?',
  'tem_nome': 'O Técnico conseguiu o nome do Ocupante/Beneficiário?',
  
  // Identificação da Unidade Familiar (Básica)
  'iuf_nome_ocupante': 'Nome do ocupante atual',
  'iuf_nome_conjuge': 'Nome do cônjuge',
  'iuf_prop_nome': 'Nome da Propriedade',
  'iuf_desc_acess': 'Descrição de acesso ao imóvel',
  
  // Identificação Ocupante (Detalhada)
  'g00_0_conhecido': 'Conhecido por',
  'g00_0_q1_2': 'CPF',
  'g00_0_sexo': 'Sexo',
  'g00_0_data_nascimento': 'Data de Nascimento',
  'g00_0_idade': 'Idade (em anos)',
  'g00_0_nacionalidade': 'Nacionalidade',
  'g00_0_nascimento_uf': 'Estado de Nascimento',
  'nascimento_mun': 'Município de Nascimento do Ocupante Atual',
  'g00_0_identidade': 'Número Documento de Identidade',
  'g00_0_identidade_orgao_t_doc': 'Número Documento de Identidade - Tipo de Documento',
  'g00_0_identidade_orgao': 'Número Documento de Identidade - Órgão Emissor',
  'g00_0_identidade_orgao_uf': 'Número Documento de Identidade - Órgão Emissor - UF',
  'g00_0_estado_civil': 'Estado civil',
  'g00_0_data_casamento': 'Data de Casamento',
  'g00_0_regime_bens': 'Regime de Bens',
  'g00_0_nome_mae': 'Nome da mãe',
  'g00_0_profissao': 'Profissão',
  'g00_0_profissao_outros': 'Profissão - Outros',
  'g00_0_aposentado': 'Aposentado',
  'g00_0_ec_tel1': 'Telefone - 1 (Somente Números)',
  'g00_0_ec_tel2': 'Telefone - 2 (Somente Números)',
  'g00_0_email': 'E-mail',
  
  // Identificação Cônjuge
  'g00_0_1_conjuge_conhecido': 'Conhecido por',
  'g00_0_1_conjuge_cpf': 'CPF do cônjuge',
  'g00_0_1_conjuge_sexo': 'Sexo',
  'g00_0_1_conjuge_data_nascimento': 'Data de Nascimento',
  'g00_0_1_conjuge_idade': 'Idade (em anos)',
  'g00_0_1_conjuge_nacionalidade': 'Nacionalidade',
  'g00_0_1_conjuge_nascimento_uf': 'Estado de Nascimento',
  'conjuge_nascimento_mun': 'Município de Nascimento do Cônjuge',
  'g00_0_1_conjuge_identidade': 'Número Documento de Identidade',
  'g00_0_1_conjuge_identidade_orgao_t_doc': 'Número Documento de Identidade - Tipo de Documento',
  'g00_0_1_conjuge_identidade_orgao': 'Número Documento de Identidade - Órgão Emissor',
  'g00_0_1_conjuge_identidade_orgao_uf': 'Número Documento de Identidade - Órgão Emissor - UF',
  'g00_0_1_conjuge_estado_civil': 'Estado civil',
  'g00_0_1_conjuge_data_casamento': 'Data de Casamento',
  'g00_0_1_conjuge_regime_bens': 'Regime de Bens',
  'g00_0_1_conjuge_nome_mae': 'Nome da mãe',
  'g00_0_1_conjuge_profissao': 'Profissão',
  'g00_0_1_conjuge_profissao_outros': 'Profissão - Outros',
  'g00_0_1_conjuge_aposentado': 'Aposentado',
  'g00_0_1_conjuge_ec_tel1': 'Telefone - 1 (Somente Números)',
  'g00_0_1_conjuge_ec_tel2': 'Telefone - 2 (Somente Números)',
  'g00_0_1_conjuge_email': 'E-mail',
  
  // Endereço para Correspondência
  'ec_zona': 'Zona de localização',
  'ec_logrado': 'Endereço/Logradouro',
  'ec_numero': 'Número',
  'ec_complem': 'Complemento',
  'ec_bairro': 'Bairro',
  'ec_cep': 'CEP (Somente Números)',
  'ec_uf': 'Estado(UF)',
  'g1_1_1_ec_cod_ibg': 'Município',
  
  // Informações do Imóvel
  'ii_titulo_definitivo': 'Possui título definitivo ou CCU?',
  'ii_titulo_quitado': 'O título foi quitado?',
  'ii_titulo_baixa': 'Deu baixa nas cláusulas resolutivas?',
  'ii_linha_credito': 'Acessou alguma linha de crédito?',
  'ii_linha_credito_qual': 'Se sim, qual linha de crédito?',
  'ii_fr_regularizacao': 'Família residente está em processo de regularização fundiária?',
  'ii_fr_r_doc': 'A solicitação do processo de regularização foi realizada junto:',
  'ii_fr_r_doc_outro': 'Em caso de outro, digite aqui',
  'ii_p_principal': 'Processo Principal',
  'ii_r_st': 'Requerimento-ST',
  'ii_do_originaria': 'Data da ocupação originária do imóvel',
  'ii_do_atual': 'Data da ocupação atual',
  'ii_o_primitivo': 'É ocupante primitivo do imóvel?',
  'ii_din_urbano': 'Distância do imóvel ao núcleo urbano mais próximo (km)',
  'ii_c_acesso': 'Condições de acesso ao núcleo urbano',
  'ii_car_possui': 'A Unidade de Produção Familiar possui o CAR - Cadastro Ambiental Rural?',
  'ii_car_protocolo': 'Protocolo - CAR',
  'ii_georreferenciada': 'Georreferenciada',
  'ii_ai_matricula': 'Área do imóvel (ha)',
  'ii_declarada_medida': 'Declarada ou medida?',
  'ii_vm_fiscal': 'Valor do módulo fiscal',
  'ii_d_possui': 'Possui algum documento expedido por Órgão Público?',
  'ii_d_orgaopublico': 'Espécie de documento expedido por Órgão Público',
  'ii_d_orgaopublico_outros': 'Espécie de documento expedido por Órgão Público - Outros',
  'ii_d_cc_td': 'Possui Título de Domínio?',
  'ii_d_cc_ccdru': 'Possui Concessão de Direito Real de Uso - CDRU?',
  'ii_d_sncr': 'Código no Sistema Nacional de Cadastro Rural (SNCR)',
  'ii_d_certific': 'Certificação do Imóvel no INCRA - SIGEF',
  'ii_d_comprobatoria': 'O requerente possui alguma documentação comprobatória associada ao lote?',
  'ii_d_comprobatoria_outros': 'Documentação comprobatória - Outro',
  
  // Quadro de Áreas
  'qa_q3_6_0': 'Área da sede (ha)',
  'qa_q3_6_1': 'Área de plantio próprio(ha)',
  'qa_q3_6_2': 'Área de mata nativa (ha)',
  'qa_q3_6_3': 'Área Florestada (Floresta Plantada) (ha)',
  'qa_q3_6_4': 'Área de pousio (ha)',
  'qa_q3_6_5': 'Área de pastagem nativa (ha)',
  'qa_q3_6_6': 'Área de pastagem plantada (ha)',
  'qa_q3_6_7': 'Área degradada (ha)',
  
  // Requisitos para Regularização Fundiária
  'rrf_p_cultura': 'Possui cultura',
  'rrf_eo_direta': 'Exploração direta',
  'rrf_eo_forma': 'Exploração forma',
  'rrf_ed_anterior': 'Exploração direta anterior',
  'rrf_ed_anterior_quem': 'Exploração direta anterior - quem',
  'rrf_oc_proprietario': 'Ocupante proprietário',
  'rrf_oc_proprietario_quem': 'Ocupante proprietário - quem',
  'rrf_oc_escravo': 'Ocupante escravo',
  'rrf_oc_escravo_quem': 'Ocupante escravo - quem',
  'rrf_oc_beneficiado': 'Ocupante beneficiado',
  'rrf_oc_beneficiado_quem': 'Ocupante beneficiado - quem',
  'rrf_oc_crime': 'Ocupante crime',
  'rrf_oc_crime_quem': 'Ocupante crime - quem',
  'rrf_oc_cargo': 'Ocupante cargo',
  
  // Núcleo Familiar (array)
  'nucleo': 'Núcleo Familiar',
  
  // Informações de Renda
  'ir_q00_23': 'Qual a renda bruta anual total da família (fora e dentro do lote)',
  'ir_q00_26': 'Quantos % da renda é a renda extra lote (fora do lote)',
  'ir_q2_17': 'A família recebe algum tipo de programa social governamental',
  'ir_q2_17_1': 'Quais programas sociais',
  'ir_q2_17_1_outro': 'Em caso de outros, escreva aqui qual programa social',
  
  // Saneamento Básico
  'sb_q2_10': 'Saneamento básico da moradia (esgoto sanitário)',
  'sb_q2_10_outro': 'Saneamento - Outro',
  'sb_q2_7': 'Origem da água',
  'sb_q2_7_outro': 'Água - Outro',
  'sb_q2_7_suficiente': 'A água é suficiente',
  'sb_descarte_residuo': 'Descarte de resíduos',
  'sb_descarte_residuo_outros': 'Descarte resíduos - Outros',
  
  // Segurança Alimentar
  'san_tiveram_preocupacao': 'Nos últimos 3 meses, os moradores tiveram preocupação de que a comida acabasse antes de poder comprar ou receber mais comida?',
  'san_acabaram_antes': 'Nos últimos 3 meses, a comida acabou antes de poder comprar ou receber mais comida?',
  'san_ficaram_sem': 'Nos últimos 3 meses, os moradores ficaram sem dinheiro para comprar comida?',
  'san_comeram_pouco': 'Nos últimos 3 meses, os moradores comeram menos do que achavam que deveriam porque não havia dinheiro para comprar comida?',
  'san_deixou_refeicao': 'Nos últimos 3 meses, algum morador deixou de fazer uma refeição porque não havia dinheiro para comprar comida?',
  'san_comeu_menos_devia': 'Nos últimos 3 meses, algum morador comeu menos do que achava que devia porque não havia dinheiro para comprar comida?',
  'san_sentiu_fome': 'Nos últimos 3 meses, algum morador sentiu fome mas não comeu porque não havia dinheiro para comprar comida?',
  'san_uma_refeicao': 'Nos últimos 3 meses, algum morador fez apenas uma refeição ao dia porque não havia dinheiro para comprar comida?',
  'san_refeicao_completa': 'Nos últimos 3 meses, algum morador deixou de fazer uma refeição completa porque não havia dinheiro para comprar comida?',
  'san_orientacao_profissional': 'A família recebeu orientação profissional sobre segurança alimentar?',
  
  // Produção Agrária
  'pa_a_vegetal': 'Quais atividades vegetais a família desenvolve?',
  'pa_a_vegetal_outros': 'Atividade vegetal - Outros (especifique)',
  'pa_a_animal': 'Quais atividades animais a família desenvolve?',
  'pa_comercial': 'A família desenvolve produção para fins comerciais?',
  'pa_p_animal': 'Quais produções animais são comercializadas?',
  'pa_p_vegetal': 'Quais produções vegetais são comercializadas?',
  'pa_p_vegetal_outros': 'Produção vegetal comercializada - Outros (especifique)',
  
  // Observações
  'obs_gerais': 'Observações Gerais',
  'obs_form': 'Observações do Formulário'
};

/**
 * Obter label de um campo
 */
export function getFieldLabel(fieldName: string): string {
  return FIELD_LABELS[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Função auxiliar para formatar valor para exibição
 */
export function formatFieldValue(value: any, fieldType?: string): string {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  
  if (fieldType === 'date' && typeof value === 'string') {
    try {
      const date = new Date(value);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return value;
    }
  }
  
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  
  return String(value);
}
