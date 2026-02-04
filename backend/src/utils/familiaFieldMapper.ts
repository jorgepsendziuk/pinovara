/**
 * Mapeamento de campos do banco de dados para o formato esperado pelo frontend
 * O banco usa nomes diferentes do XML/frontend
 */

/**
 * Helper para obter valor, priorizando o valor do banco se existir
 */
function getValue(dbValue: any, frontendValue: any): any {
  // Se o valor do banco existe (não é null, undefined ou string vazia), use ele
  if (dbValue !== null && dbValue !== undefined && dbValue !== '') {
    return dbValue;
  }
  // Caso contrário, use o valor do frontend se existir
  if (frontendValue !== null && frontendValue !== undefined && frontendValue !== '') {
    return frontendValue;
  }
  // Retorna o valor do banco mesmo que seja null/undefined para manter consistência
  return dbValue;
}

/**
 * Helper para mapear campo do banco para frontend
 * Prioriza sempre o valor do banco se existir
 */
function mapField(familia: any, dbField: string, frontendField: string): any {
  // Primeiro tenta o campo do banco
  const dbValue = familia[dbField];
  
  // Debug para campos importantes
  const isImportantField = ['iuf_ocup_nome', 'iuf_ocup_cpf', 'num_imovel', 'aceitou_visita'].includes(dbField);
  
  if (isImportantField) {
    console.log(`[DEBUG] mapField ${dbField} -> ${frontendField}:`, {
      dbValue,
      dbValueType: typeof dbValue,
      dbValueExists: dbValue !== null && dbValue !== undefined,
      familiaKeys: Object.keys(familia).filter(k => k.includes('ocup') || k.includes('imovel') || k.includes('visita')).slice(0, 10)
    });
  }
  
  // Verificar se o valor existe (não é null nem undefined)
  // Para strings, aceitar string vazia como valor válido (pode ser necessário)
  // Para números, aceitar 0 como valor válido
  // Para booleanos, aceitar false como valor válido
  if (dbValue !== null && dbValue !== undefined) {
    // Se for string vazia, ainda retornar ela (pode ser um valor válido)
    if (isImportantField) {
      console.log(`[DEBUG] mapField ${dbField} retornando dbValue:`, dbValue);
    }
    return dbValue;
  }
  
  // Depois tenta o campo do frontend (caso já esteja mapeado)
  const frontendValue = familia[frontendField];
  if (frontendValue !== null && frontendValue !== undefined) {
    if (isImportantField) {
      console.log(`[DEBUG] mapField ${dbField} retornando frontendValue:`, frontendValue);
    }
    return frontendValue;
  }
  
  // Retorna o valor do banco mesmo que seja null/undefined
  if (isImportantField) {
    console.log(`[DEBUG] mapField ${dbField} retornando null/undefined`);
  }
  return dbValue;
}

/**
 * Helper para mapear campo com múltiplas variações de nomes no banco
 */
function mapFieldMultiple(familia: any, dbFields: string[], frontendField: string): any {
  // Tenta cada campo do banco na ordem
  for (const dbField of dbFields) {
    if (familia[dbField] !== null && familia[dbField] !== undefined && familia[dbField] !== '') {
      return familia[dbField];
    }
  }
  // Depois tenta o campo do frontend (caso já esteja mapeado)
  if (familia[frontendField] !== null && familia[frontendField] !== undefined && familia[frontendField] !== '') {
    return familia[frontendField];
  }
  // Retorna o primeiro campo do banco mesmo que seja null/undefined
  return familia[dbFields[0]];
}

/**
 * Mapeia campos do banco de dados para o formato do frontend
 */
export function mapFamiliaFromDB(familia: any): any {
  if (!familia) return null;

  const mapped: any = {
    ...familia,
    // Informações Iniciais
    i_q1_10: mapField(familia, 'num_imovel', 'i_q1_10'),
    i_q1_17: mapField(familia, 'aceitou_visita', 'i_q1_17'),
    tem_nome: mapField(familia, 'tem_nome', 'tem_nome'),
    // i_quilombo: usar cod_gleba se disponível, senão usar quilombo (texto)
    i_quilombo: familia.cod_gleba !== null && familia.cod_gleba !== undefined 
      ? familia.cod_gleba 
      : mapField(familia, 'quilombo', 'i_quilombo'),
    
    // Identificação da Unidade Familiar
    iuf_nome_ocupante: mapField(familia, 'iuf_ocup_nome', 'iuf_nome_ocupante'),
    iuf_nome_conjuge: mapField(familia, 'iuf_conj_nome', 'iuf_nome_conjuge'),
    iuf_desc_acess: mapField(familia, 'iuf_desc_acesso', 'iuf_desc_acess'),
    
    // Identificação Ocupante (g00_0)
    g00_0_conhecido: mapField(familia, 'iuf_ocup_conhecido', 'g00_0_conhecido'),
    g00_0_q1_2: mapField(familia, 'iuf_ocup_cpf', 'g00_0_q1_2'),
    g00_0_sexo: mapField(familia, 'iuf_ocup_sexo', 'g00_0_sexo'),
    g00_0_data_nascimento: mapField(familia, 'iuf_ocup_d_nascimento', 'g00_0_data_nascimento'),
    g00_0_idade: mapField(familia, 'iuf_ocup_idade', 'g00_0_idade'),
    g00_0_nacionalidade: mapField(familia, 'iuf_ocup_nacionalidade', 'g00_0_nacionalidade'),
    g00_0_nascimento_uf: mapField(familia, 'iuf_ocup_n_estado', 'g00_0_nascimento_uf'),
    nascimento_mun: mapField(familia, 'iuf_ocup_n_municipio_int', 'nascimento_mun'),
    g00_0_identidade: mapField(familia, 'iuf_ocup_nd_identidade', 'g00_0_identidade'),
    g00_0_identidade_orgao_t_doc: mapField(familia, 'iuf_ocup_nd_tipo', 'g00_0_identidade_orgao_t_doc'),
    g00_0_identidade_orgao: mapField(familia, 'iuf_ocup_nd_orgao', 'g00_0_identidade_orgao'),
    g00_0_identidade_orgao_uf: mapField(familia, 'iuf_ocup_nd_uf', 'g00_0_identidade_orgao_uf'),
    g00_0_estado_civil: mapField(familia, 'iuf_ocup_e_civil', 'g00_0_estado_civil'),
    g00_0_data_casamento: mapField(familia, 'iuf_ocup_d_casamento', 'g00_0_data_casamento'),
    g00_0_regime_bens: mapField(familia, 'iuf_ocup_r_bens', 'g00_0_regime_bens'),
    g00_0_nome_mae: mapField(familia, 'iuf_ocup_n_mae', 'g00_0_nome_mae'),
    g00_0_profissao: mapField(familia, 'iuf_ocup_profissao', 'g00_0_profissao'),
    g00_0_profissao_outros: mapField(familia, 'iuf_ocup_profissao_outros', 'g00_0_profissao_outros'),
    g00_0_aposentado: mapField(familia, 'iuf_ocup_aposentado', 'g00_0_aposentado'),
    g00_0_ec_tel1: mapField(familia, 'iuf_ocup_tel1', 'g00_0_ec_tel1'),
    g00_0_ec_tel2: mapField(familia, 'iuf_ocup_tel2', 'g00_0_ec_tel2'),
    g00_0_email: mapField(familia, 'iuf_ocup_email', 'g00_0_email'),
    
    // Identificação Cônjuge (g00_0_1)
    g00_0_1_conjuge_conhecido: mapField(familia, 'iuf_conj_conhecido', 'g00_0_1_conjuge_conhecido'),
    g00_0_1_conjuge_cpf: mapField(familia, 'iuf_conj_cpf', 'g00_0_1_conjuge_cpf'),
    g00_0_1_conjuge_sexo: mapField(familia, 'iuf_conj_sexo', 'g00_0_1_conjuge_sexo'),
    g00_0_1_conjuge_data_nascimento: mapField(familia, 'iuf_conj_d_nascimento', 'g00_0_1_conjuge_data_nascimento'),
    g00_0_1_conjuge_idade: mapField(familia, 'iuf_conj_idade', 'g00_0_1_conjuge_idade'),
    g00_0_1_conjuge_nacionalidade: mapField(familia, 'iuf_conj_nacionalidade', 'g00_0_1_conjuge_nacionalidade'),
    g00_0_1_conjuge_nascimento_uf: mapField(familia, 'iuf_conj_n_estado', 'g00_0_1_conjuge_nascimento_uf'),
    conjuge_nascimento_mun: mapField(familia, 'iuf_conj_n_municipio_int', 'conjuge_nascimento_mun'),
    g00_0_1_conjuge_identidade: mapField(familia, 'iuf_conj_nd_identidade', 'g00_0_1_conjuge_identidade'),
    g00_0_1_conjuge_identidade_orgao_t_doc: mapField(familia, 'iuf_conj_nd_tipo', 'g00_0_1_conjuge_identidade_orgao_t_doc'),
    g00_0_1_conjuge_identidade_orgao: mapField(familia, 'iuf_conj_nd_orgao', 'g00_0_1_conjuge_identidade_orgao'),
    g00_0_1_conjuge_identidade_orgao_uf: mapField(familia, 'iuf_conj_nd_uf', 'g00_0_1_conjuge_identidade_orgao_uf'),
    g00_0_1_conjuge_estado_civil: mapField(familia, 'iuf_conj_e_civil', 'g00_0_1_conjuge_estado_civil'),
    g00_0_1_conjuge_data_casamento: mapField(familia, 'iuf_conj_d_casamento', 'g00_0_1_conjuge_data_casamento'),
    g00_0_1_conjuge_regime_bens: mapField(familia, 'iuf_conj_r_bens', 'g00_0_1_conjuge_regime_bens'),
    g00_0_1_conjuge_nome_mae: mapField(familia, 'iuf_conj_n_mae', 'g00_0_1_conjuge_nome_mae'),
    g00_0_1_conjuge_profissao: mapField(familia, 'iuf_conj_profissao', 'g00_0_1_conjuge_profissao'),
    g00_0_1_conjuge_profissao_outros: mapField(familia, 'iuf_conj_profissao_outros', 'g00_0_1_conjuge_profissao_outros'),
    g00_0_1_conjuge_aposentado: mapField(familia, 'iuf_conj_aposentado', 'g00_0_1_conjuge_aposentado'),
    g00_0_1_conjuge_ec_tel1: mapField(familia, 'iuf_conj_tel1', 'g00_0_1_conjuge_ec_tel1'),
    g00_0_1_conjuge_ec_tel2: mapField(familia, 'iuf_conj_tel2', 'g00_0_1_conjuge_ec_tel2'),
    g00_0_1_conjuge_email: mapField(familia, 'iuf_conj_email', 'g00_0_1_conjuge_email'),
    
    // Endereço para Correspondência
    ec_zona: mapField(familia, 'ec_zona', 'ec_zona'),
    ec_logrado: mapField(familia, 'ec_logrado', 'ec_logrado'),
    ec_numero: mapField(familia, 'ec_numero', 'ec_numero'),
    ec_complem: mapField(familia, 'ec_complem', 'ec_complem'),
    ec_bairro: mapField(familia, 'ec_bairro', 'ec_bairro'),
    ec_cep: mapField(familia, 'ec_cep', 'ec_cep'),
    ec_uf: mapField(familia, 'ec_uf', 'ec_uf'),
    g1_1_1_ec_cod_ibg: mapField(familia, 'ec_cod_ibg', 'g1_1_1_ec_cod_ibg'),
    
    // Informações do Imóvel
    ii_titulo_definitivo: mapField(familia, 'ii_titulo_definitivo', 'ii_titulo_definitivo'),
    ii_titulo_quitado: mapField(familia, 'ii_titulo_quitado', 'ii_titulo_quitado'),
    ii_titulo_baixa: mapField(familia, 'ii_titulo_baixa', 'ii_titulo_baixa'),
    ii_linha_credito: mapField(familia, 'ii_linha_credito', 'ii_linha_credito'),
    ii_linha_credito_qual: mapField(familia, 'ii_linha_credito_qual', 'ii_linha_credito_qual'),
    ii_fr_regularizacao: mapField(familia, 'ii_fr_regularizacao', 'ii_fr_regularizacao'),
    ii_fr_r_doc: mapField(familia, 'ii_fr_r_doc', 'ii_fr_r_doc'),
    ii_fr_r_doc_outro: mapField(familia, 'ii_fr_r_doc_outro', 'ii_fr_r_doc_outro'),
    ii_p_principal: mapField(familia, 'ii_p_principal', 'ii_p_principal'),
    ii_r_st: mapField(familia, 'ii_r_st', 'ii_r_st'),
    ii_do_originaria: mapField(familia, 'ii_do_originaria', 'ii_do_originaria'),
    ii_do_atual: mapField(familia, 'ii_do_atual', 'ii_do_atual'),
    ii_o_primitivo: mapField(familia, 'ii_o_primitivo', 'ii_o_primitivo'),
    ii_din_urbano: mapField(familia, 'ii_din_urbano', 'ii_din_urbano'),
    ii_c_acesso: mapField(familia, 'ii_c_acesso', 'ii_c_acesso'),
    ii_car_possui: mapField(familia, 'ii_car_possui', 'ii_car_possui'),
    ii_car_protocolo: mapField(familia, 'ii_car_protocolo', 'ii_car_protocolo'),
    ii_georreferenciada: mapField(familia, 'ii_georreferenciada', 'ii_georreferenciada'),
    ii_ai_matricula: mapField(familia, 'ii_ai_matricula', 'ii_ai_matricula'),
    ii_declarada_medida: mapField(familia, 'ii_declarada_medida', 'ii_declarada_medida'),
    ii_vm_fiscal: mapField(familia, 'ii_vm_fiscal', 'ii_vm_fiscal'),
    ii_d_possui: mapField(familia, 'ii_d_possui', 'ii_d_possui'),
    ii_d_orgaopublico: mapField(familia, 'ii_d_orgaopublico', 'ii_d_orgaopublico'),
    ii_d_orgaopublico_outros: mapField(familia, 'ii_d_orgaopublico_outros', 'ii_d_orgaopublico_outros'),
    ii_d_cc_td: mapField(familia, 'ii_d_cc_td', 'ii_d_cc_td'),
    ii_d_cc_ccdru: mapField(familia, 'ii_d_cc_ccdru', 'ii_d_cc_ccdru'),
    ii_d_sncr: mapField(familia, 'ii_d_sncr', 'ii_d_sncr'),
    ii_d_certific: mapField(familia, 'ii_d_certific', 'ii_d_certific'),
    ii_d_comprobatoria: mapField(familia, 'ii_d_comprobatoria', 'ii_d_comprobatoria'),
    ii_d_comprobatoria_outros: mapField(familia, 'ii_d_comprobatoria_outros', 'ii_d_comprobatoria_outros'),
    
    // Quadro de Áreas
    qa_q3_6_0: mapField(familia, 'qa_a_sede', 'qa_q3_6_0'),
    qa_q3_6_1: mapField(familia, 'qa_a_p_proprio', 'qa_q3_6_1'),
    qa_q3_6_2: mapField(familia, 'qa_a_m_nativa', 'qa_q3_6_2'),
    qa_q3_6_3: mapField(familia, 'qa_a_florestada', 'qa_q3_6_3'),
    qa_q3_6_4: mapField(familia, 'qa_a_pousio', 'qa_q3_6_4'),
    qa_q3_6_5: mapField(familia, 'qa_a_p_nativa', 'qa_q3_6_5'),
    qa_q3_6_6: mapField(familia, 'qa_a_p_plantada', 'qa_q3_6_6'),
    qa_q3_6_7: mapField(familia, 'qa_a_degradada', 'qa_q3_6_7'),
    
    // Requisitos para Regularização Fundiária
    rrf_p_cultura: mapField(familia, 'rrf_p_cultura', 'rrf_p_cultura'),
    rrf_eo_direta: mapField(familia, 'rrf_eo_direta', 'rrf_eo_direta'),
    rrf_eo_forma: mapField(familia, 'rrf_eo_forma', 'rrf_eo_forma'),
    rrf_ed_anterior: mapField(familia, 'rrf_ed_anterior', 'rrf_ed_anterior'),
    rrf_ed_anterior_quem: mapField(familia, 'rrf_ed_anterior_quem', 'rrf_ed_anterior_quem'),
    rrf_oc_proprietario: mapField(familia, 'rrf_oc_proprietario', 'rrf_oc_proprietario'),
    rrf_oc_proprietario_quem: mapField(familia, 'rrf_oc_proprietario_quem', 'rrf_oc_proprietario_quem'),
    rrf_oc_escravo: mapField(familia, 'rrf_oc_escravo', 'rrf_oc_escravo'),
    rrf_oc_escravo_quem: mapField(familia, 'rrf_oc_escravo_quem', 'rrf_oc_escravo_quem'),
    rrf_oc_beneficiado: mapField(familia, 'rrf_oc_beneficiado', 'rrf_oc_beneficiado'),
    rrf_oc_beneficiado_quem: mapField(familia, 'rrf_oc_beneficiado_quem', 'rrf_oc_beneficiado_quem'),
    rrf_oc_crime: mapField(familia, 'rrf_oc_crime', 'rrf_oc_crime'),
    rrf_oc_crime_quem: mapField(familia, 'rrf_oc_crime_quem', 'rrf_oc_crime_quem'),
    rrf_oc_cargo: mapField(familia, 'rrf_oc_cargo', 'rrf_oc_cargo'),
    
    // Informações de Renda
    ir_q00_23: mapField(familia, 'ir_r_bruta', 'ir_q00_23'),
    ir_q00_26: mapField(familia, 'ir_r_e_lote', 'ir_q00_26'),
    ir_q2_17: mapField(familia, 'ir_f_p_social', 'ir_q2_17'),
    ir_q2_17_1: mapField(familia, 'ir_q2_17_1', 'ir_q2_17_1'),
    ir_q2_17_1_outro: mapField(familia, 'ir_f_p_social_outro', 'ir_q2_17_1_outro'),
    
    // Saneamento Básico
    sb_q2_10: mapField(familia, 'sb_q2_10', 'sb_q2_10'),
    sb_q2_10_outro: mapField(familia, 'sb_moradia_outro', 'sb_q2_10_outro'),
    sb_q2_7: mapField(familia, 'sb_q2_7', 'sb_q2_7'),
    sb_q2_7_outro: mapField(familia, 'sb_agua_outro', 'sb_q2_7_outro'),
    sb_q2_7_suficiente: mapField(familia, 'sb_agua_suficiente', 'sb_q2_7_suficiente'),
    sb_descarte_residuo: mapField(familia, 'sb_d_residuo', 'sb_descarte_residuo'),
    sb_descarte_residuo_outros: mapField(familia, 'sb_d_residuo_outro', 'sb_descarte_residuo_outros'),
    
    // Segurança Alimentar
    san_tiveram_preocupacao: mapFieldMultiple(familia, ['san_tiveram_preocupacao', 'san_preocupacao'], 'san_tiveram_preocupacao'),
    san_acabaram_antes: mapFieldMultiple(familia, ['san_acabaram_antes', 'san_acabou'], 'san_acabaram_antes'),
    san_ficaram_sem: mapFieldMultiple(familia, ['san_ficaram_sem', 'san_sem_dinheiro'], 'san_ficaram_sem'),
    san_comeram_pouco: mapField(familia, 'san_comeram_pouco', 'san_comeram_pouco'),
    san_deixou_refeicao: mapField(familia, 'san_deixou_refeicao', 'san_deixou_refeicao'),
    san_comeu_menos_devia: mapFieldMultiple(familia, ['san_comeu_menos_devia', 'san_comeu_menos'], 'san_comeu_menos_devia'),
    san_sentiu_fome: mapField(familia, 'san_sentiu_fome', 'san_sentiu_fome'),
    san_uma_refeicao: mapField(familia, 'san_uma_refeicao', 'san_uma_refeicao'),
    san_refeicao_completa: mapField(familia, 'san_refeicao_completa', 'san_refeicao_completa'),
    san_orientacao_profissional: mapFieldMultiple(familia, ['san_orientacao_profissional', 'san_orientacao'], 'san_orientacao_profissional'),
    
    // Produção Agrária
    pa_a_vegetal: mapField(familia, 'pa_a_vegetal', 'pa_a_vegetal'),
    pa_a_vegetal_outros: mapField(familia, 'pa_a_vegetal_outros', 'pa_a_vegetal_outros'),
    pa_a_animal: mapField(familia, 'pa_a_animal', 'pa_a_animal'),
    pa_comercial: mapField(familia, 'pa_comercial', 'pa_comercial'),
    pa_p_animal: mapField(familia, 'pa_p_animal', 'pa_p_animal'),
    pa_p_vegetal: mapField(familia, 'pa_p_vegetal', 'pa_p_vegetal'),
    pa_p_vegetal_outros: mapField(familia, 'pa_p_vegetal_outros', 'pa_p_vegetal_outros'),
    
    // Observações
    obs_gerais: mapField(familia, 'obs_gerais', 'obs_gerais'),
    obs_form: mapField(familia, 'obs_form', 'obs_form')
  };

  return mapped;
}

/**
 * Mapeia campos do frontend para o formato do banco de dados (para updates)
 */
export function mapFamiliaToDB(familia: any): any {
  if (!familia) return null;

  const mapped: any = {
    ...familia,
    // Informações Iniciais
    num_imovel: familia.i_q1_10 !== undefined ? familia.i_q1_10 : familia.num_imovel,
    aceitou_visita: familia.i_q1_17 !== undefined ? familia.i_q1_17 : familia.aceitou_visita,
    // Se i_quilombo for um número (ID de gleba), usar como cod_gleba
    cod_gleba: familia.i_quilombo !== undefined && typeof familia.i_quilombo === 'number' 
      ? familia.i_quilombo 
      : (familia.cod_gleba !== undefined ? familia.cod_gleba : null),
    // Manter quilombo como texto se não for número
    quilombo: familia.i_quilombo !== undefined && typeof familia.i_quilombo !== 'number'
      ? familia.i_quilombo
      : familia.quilombo,
    
    // Identificação da Unidade Familiar
    iuf_ocup_nome: familia.iuf_nome_ocupante !== undefined ? familia.iuf_nome_ocupante : familia.iuf_ocup_nome,
    iuf_conj_nome: familia.iuf_nome_conjuge !== undefined ? familia.iuf_nome_conjuge : familia.iuf_conj_nome,
    iuf_desc_acesso: familia.iuf_desc_acess !== undefined ? familia.iuf_desc_acess : familia.iuf_desc_acesso,
    
    // Identificação Ocupante
    iuf_ocup_cpf: familia.g00_0_q1_2 !== undefined ? familia.g00_0_q1_2 : familia.iuf_ocup_cpf,
    iuf_ocup_conhecido: familia.g00_0_conhecido !== undefined ? familia.g00_0_conhecido : familia.iuf_ocup_conhecido,
    iuf_ocup_sexo: familia.g00_0_sexo !== undefined ? familia.g00_0_sexo : familia.iuf_ocup_sexo,
    iuf_ocup_d_nascimento: familia.g00_0_data_nascimento !== undefined ? familia.g00_0_data_nascimento : familia.iuf_ocup_d_nascimento,
    iuf_ocup_idade: familia.g00_0_idade !== undefined ? familia.g00_0_idade : familia.iuf_ocup_idade,
    iuf_ocup_nacionalidade: familia.g00_0_nacionalidade !== undefined ? familia.g00_0_nacionalidade : familia.iuf_ocup_nacionalidade,
    iuf_ocup_n_estado: familia.g00_0_nascimento_uf !== undefined ? familia.g00_0_nascimento_uf : familia.iuf_ocup_n_estado,
    iuf_ocup_n_municipio_int: familia.nascimento_mun !== undefined ? familia.nascimento_mun : familia.iuf_ocup_n_municipio_int,
    iuf_ocup_nd_identidade: familia.g00_0_identidade !== undefined ? familia.g00_0_identidade : familia.iuf_ocup_nd_identidade,
    iuf_ocup_nd_tipo: familia.g00_0_identidade_orgao_t_doc !== undefined ? familia.g00_0_identidade_orgao_t_doc : familia.iuf_ocup_nd_tipo,
    iuf_ocup_nd_orgao: familia.g00_0_identidade_orgao !== undefined ? familia.g00_0_identidade_orgao : familia.iuf_ocup_nd_orgao,
    iuf_ocup_nd_uf: familia.g00_0_identidade_orgao_uf !== undefined ? familia.g00_0_identidade_orgao_uf : familia.iuf_ocup_nd_uf,
    iuf_ocup_e_civil: familia.g00_0_estado_civil !== undefined ? familia.g00_0_estado_civil : familia.iuf_ocup_e_civil,
    iuf_ocup_d_casamento: familia.g00_0_data_casamento !== undefined ? familia.g00_0_data_casamento : familia.iuf_ocup_d_casamento,
    iuf_ocup_r_bens: familia.g00_0_regime_bens !== undefined ? familia.g00_0_regime_bens : familia.iuf_ocup_r_bens,
    iuf_ocup_n_mae: familia.g00_0_nome_mae !== undefined ? familia.g00_0_nome_mae : familia.iuf_ocup_n_mae,
    iuf_ocup_profissao: familia.g00_0_profissao !== undefined ? familia.g00_0_profissao : familia.iuf_ocup_profissao,
    iuf_ocup_profissao_outros: familia.g00_0_profissao_outros !== undefined ? familia.g00_0_profissao_outros : familia.iuf_ocup_profissao_outros,
    iuf_ocup_aposentado: familia.g00_0_aposentado !== undefined ? familia.g00_0_aposentado : familia.iuf_ocup_aposentado,
    iuf_ocup_tel1: familia.g00_0_ec_tel1 !== undefined ? familia.g00_0_ec_tel1 : familia.iuf_ocup_tel1,
    iuf_ocup_tel2: familia.g00_0_ec_tel2 !== undefined ? familia.g00_0_ec_tel2 : familia.iuf_ocup_tel2,
    iuf_ocup_email: familia.g00_0_email !== undefined ? familia.g00_0_email : familia.iuf_ocup_email,
    
    // Quadro de Áreas
    qa_a_sede: familia.qa_q3_6_0 !== undefined ? familia.qa_q3_6_0 : familia.qa_a_sede,
    qa_a_p_proprio: familia.qa_q3_6_1 !== undefined ? familia.qa_q3_6_1 : familia.qa_a_p_proprio,
    qa_a_m_nativa: familia.qa_q3_6_2 !== undefined ? familia.qa_q3_6_2 : familia.qa_a_m_nativa,
    qa_a_florestada: familia.qa_q3_6_3 !== undefined ? familia.qa_q3_6_3 : familia.qa_a_florestada,
    qa_a_pousio: familia.qa_q3_6_4 !== undefined ? familia.qa_q3_6_4 : familia.qa_a_pousio,
    qa_a_p_nativa: familia.qa_q3_6_5 !== undefined ? familia.qa_q3_6_5 : familia.qa_a_p_nativa,
    qa_a_p_plantada: familia.qa_q3_6_6 !== undefined ? familia.qa_q3_6_6 : familia.qa_a_p_plantada,
    qa_a_degradada: familia.qa_q3_6_7 !== undefined ? familia.qa_q3_6_7 : familia.qa_a_degradada,
    
    // Informações de Renda
    ir_r_bruta: familia.ir_q00_23 !== undefined ? familia.ir_q00_23 : familia.ir_r_bruta,
    ir_r_e_lote: familia.ir_q00_26 !== undefined ? familia.ir_q00_26 : familia.ir_r_e_lote,
    ir_f_p_social: familia.ir_q2_17 !== undefined ? familia.ir_q2_17 : familia.ir_f_p_social,
    ir_f_p_social_outro: familia.ir_q2_17_1_outro !== undefined ? familia.ir_q2_17_1_outro : familia.ir_f_p_social_outro,
    
    // Saneamento
    sb_moradia_outro: familia.sb_q2_10_outro !== undefined ? familia.sb_q2_10_outro : familia.sb_moradia_outro,
    sb_agua_suficiente: familia.sb_q2_7_suficiente !== undefined ? familia.sb_q2_7_suficiente : familia.sb_agua_suficiente,
    sb_d_residuo_outro: familia.sb_descarte_residuo_outros !== undefined ? familia.sb_descarte_residuo_outros : familia.sb_d_residuo_outro,
    
    // Segurança Alimentar
    san_tiveram_preocupacao: familia.san_tiveram_preocupacao !== undefined ? familia.san_tiveram_preocupacao : familia.san_preocupacao,
    san_acabaram_antes: familia.san_acabaram_antes !== undefined ? familia.san_acabaram_antes : familia.san_acabou,
    san_orientacao_profissional: familia.san_orientacao_profissional !== undefined ? familia.san_orientacao_profissional : familia.san_orientacao
  };

  // Remover campos do frontend que não existem no banco
  delete mapped.i_q1_10;
  delete mapped.i_q1_17;
  delete mapped.iuf_nome_ocupante;
  delete mapped.iuf_nome_conjuge;
  delete mapped.iuf_desc_acess;
  delete mapped.g00_0_q1_2;
  delete mapped.g00_0_conhecido;
  delete mapped.g00_0_sexo;
  delete mapped.g00_0_data_nascimento;
  delete mapped.g00_0_idade;
  delete mapped.g00_0_nacionalidade;
  delete mapped.g00_0_nascimento_uf;
  delete mapped.nascimento_mun;
  delete mapped.g00_0_identidade;
  delete mapped.g00_0_identidade_orgao_t_doc;
  delete mapped.g00_0_identidade_orgao;
  delete mapped.g00_0_identidade_orgao_uf;
  delete mapped.g00_0_estado_civil;
  delete mapped.g00_0_data_casamento;
  delete mapped.g00_0_regime_bens;
  delete mapped.g00_0_nome_mae;
  delete mapped.g00_0_profissao;
  delete mapped.g00_0_profissao_outros;
  delete mapped.g00_0_aposentado;
  delete mapped.g00_0_ec_tel1;
  delete mapped.g00_0_ec_tel2;
  delete mapped.g00_0_email;
  delete mapped.qa_q3_6_0;
  delete mapped.qa_q3_6_1;
  delete mapped.qa_q3_6_2;
  delete mapped.qa_q3_6_3;
  delete mapped.qa_q3_6_4;
  delete mapped.qa_q3_6_5;
  delete mapped.qa_q3_6_6;
  delete mapped.qa_q3_6_7;
  delete mapped.ir_q00_23;
  delete mapped.ir_q00_26;
  delete mapped.ir_q2_17;
  delete mapped.ir_q2_17_1_outro;
  delete mapped.sb_q2_10_outro;
  delete mapped.sb_q2_7_suficiente;
  delete mapped.sb_descarte_residuo_outros;
  delete mapped.san_tiveram_preocupacao;
  delete mapped.san_acabaram_antes;
  delete mapped.san_orientacao_profissional;

  return mapped;
}
