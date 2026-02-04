// Tipos para o formulário completo de famílias baseado no XML ODK

export interface FamiliaCompleta {
  id: number;
  uri: string;
  creation_date: string | null;
  
  // Informações Iniciais (i)
  i_q1_10?: string | null;
  i_note_numeroimovel?: string | null;
  i_q1_10_1?: string | null;
  i_quilombo?: string | null;
  i_q1_17?: number | null;
  tem_nome?: number | null;
  
  // Identificação da Unidade Familiar (iuf)
  iuf_nome_ocupante?: string | null;
  iuf_nome_conjuge?: string | null;
  iuf_prop_nome?: string | null;
  iuf_desc_acess?: string | null;
  
  // Identificação Ocupante (g00_0)
  g00_0_conhecido?: string | null;
  g00_0_q1_2?: string | null; // CPF
  g00_0_sexo?: number | null;
  g00_0_data_nascimento?: string | null;
  g00_0_idade?: number | null;
  g00_0_nacionalidade?: number | null;
  g00_0_nascimento_uf?: number | null;
  g00_0_identidade?: string | null;
  g00_0_identidade_orgao_t_doc?: number | null;
  g00_0_identidade_orgao?: string | null;
  g00_0_identidade_orgao_uf?: number | null;
  g00_0_estado_civil?: number | null;
  g00_0_data_casamento?: string | null;
  g00_0_regime_bens?: number | null;
  g00_0_nome_mae?: string | null;
  g00_0_profissao?: number | null;
  g00_0_profissao_outros?: string | null;
  g00_0_aposentado?: number | null;
  g00_0_ec_tel1?: string | null;
  g00_0_ec_tel2?: string | null;
  g00_0_email?: string | null;
  nascimento_mun?: number | null;
  
  // Identificação Cônjuge (g00_0_1)
  g00_0_1_conjuge_conhecido?: string | null;
  g00_0_1_conjuge_cpf?: string | null;
  g00_0_1_conjuge_sexo?: number | null;
  g00_0_1_conjuge_data_nascimento?: string | null;
  g00_0_1_conjuge_idade?: number | null;
  g00_0_1_conjuge_nacionalidade?: number | null;
  g00_0_1_conjuge_nascimento_uf?: number | null;
  g00_0_1_conjuge_identidade?: string | null;
  g00_0_1_conjuge_identidade_orgao_t_doc?: number | null;
  g00_0_1_conjuge_identidade_orgao?: string | null;
  g00_0_1_conjuge_identidade_orgao_uf?: number | null;
  g00_0_1_conjuge_estado_civil?: number | null;
  g00_0_1_conjuge_data_casamento?: string | null;
  g00_0_1_conjuge_regime_bens?: number | null;
  g00_0_1_conjuge_nome_mae?: string | null;
  g00_0_1_conjuge_profissao?: number | null;
  g00_0_1_conjuge_profissao_outros?: string | null;
  g00_0_1_conjuge_aposentado?: number | null;
  g00_0_1_conjuge_ec_tel1?: string | null;
  g00_0_1_conjuge_ec_tel2?: string | null;
  g00_0_1_conjuge_email?: string | null;
  conjuge_nascimento_mun?: number | null;
  
  // Endereço para Correspondência (ec)
  ec_zona?: number | null;
  ec_logrado?: string | null;
  ec_numero?: string | null;
  ec_complem?: string | null;
  ec_bairro?: string | null;
  ec_cep?: string | null;
  ec_uf?: number | null;
  g1_1_1_ec_cod_ibg?: number | null;
  
  // Informações do Imóvel (ii)
  ii_titulo_definitivo?: number | null;
  ii_titulo_quitado?: number | null;
  ii_titulo_baixa?: number | null;
  ii_linha_credito?: number | null;
  ii_linha_credito_qual?: string | null;
  ii_fr_regularizacao?: number | null;
  ii_fr_r_doc?: number | null;
  ii_fr_r_doc_outro?: string | null;
  ii_p_principal?: string | null;
  ii_r_st?: string | null;
  ii_do_originaria?: string | null;
  ii_do_atual?: string | null;
  ii_o_primitivo?: number | null;
  ii_din_urbano?: number | null;
  ii_c_acesso?: number | null;
  ii_car_possui?: number | null;
  ii_car_protocolo?: string | null;
  ii_georreferenciada?: number | null;
  ii_ai_matricula?: number | null;
  ii_declarada_medida?: number | null;
  ii_vm_fiscal?: number | null;
  ii_d_possui?: number | null;
  ii_d_orgaopublico?: number | null;
  ii_d_orgaopublico_outros?: string | null;
  ii_d_cc_td?: number | null;
  ii_d_cc_ccdru?: number | null;
  ii_d_sncr?: string | null;
  ii_d_certific?: string | null;
  ii_d_comprobatoria?: number | null;
  ii_d_comprobatoria_outros?: string | null;
  
  // Quadro de Áreas (qa)
  qa_q3_6_0?: number | null; // Área sede
  qa_q3_6_1?: number | null; // Área plantio próprio
  qa_q3_6_2?: number | null; // Área mata nativa
  qa_q3_6_3?: number | null; // Área florestada
  qa_q3_6_4?: number | null; // Área pousio
  qa_q3_6_5?: number | null; // Área pastagem nativa
  qa_q3_6_6?: number | null; // Área pastagem plantada
  qa_q3_6_7?: number | null; // Área degradada
  
  // Requisitos RRF (rrf)
  rrf_p_cultura?: number | null;
  rrf_eo_direta?: number | null;
  rrf_eo_forma?: number | null;
  rrf_ed_anterior?: number | null;
  rrf_ed_anterior_quem?: number | null;
  rrf_oc_proprietario?: number | null;
  rrf_oc_proprietario_quem?: number | null;
  rrf_oc_escravo?: number | null;
  rrf_oc_escravo_quem?: number | null;
  rrf_oc_beneficiado?: number | null;
  rrf_oc_beneficiado_quem?: number | null;
  rrf_oc_crime?: number | null;
  rrf_oc_crime_quem?: number | null;
  rrf_oc_cargo?: number | null;
  
  // Núcleo Familiar (nucleo) - Array de objetos
  nucleo?: Array<{
    q2_1_1?: string | null; // Nome
    q2_1_2?: number | null; // Grau parentesco
    q2_1_2_1?: string | null; // Outro parentesco
    q2_1_3?: number | null; // Sexo
    q2_1_4?: string | null; // Data nascimento
    q2_1_4_1?: number | null; // Idade
  }> | null;
  
  // Informações de Renda (ir)
  ir_q00_23?: number | null;
  ir_q00_26?: number | null;
  ir_q2_17?: number | null;
  ir_q2_17_1?: number[] | null;
  ir_q2_17_1_outro?: string | null;
  
  // Saneamento Básico (sb)
  sb_q2_10?: number[] | null;
  sb_q2_10_outro?: string | null;
  sb_q2_7?: number[] | null;
  sb_q2_7_outro?: string | null;
  sb_q2_7_suficiente?: number | null;
  sb_descarte_residuo?: number | null;
  sb_descarte_residuo_outros?: string | null;
  
  // Segurança Alimentar (san)
  san_tiveram_preocupacao?: number | null;
  san_acabaram_antes?: number | null;
  san_ficaram_sem?: number | null;
  san_comeram_pouco?: number | null;
  san_deixou_refeicao?: number | null;
  san_comeu_menos_devia?: number | null;
  san_sentiu_fome?: number | null;
  san_uma_refeicao?: number | null;
  san_refeicao_completa?: number | null;
  san_orientacao_profissional?: number | null;
  
  // Produção Agrária (pa)
  pa_a_vegetal?: number[] | null;
  pa_a_vegetal_outros?: string | null;
  pa_a_animal?: number[] | null;
  pa_comercial?: number[] | null;
  pa_p_animal?: number[] | null;
  pa_p_vegetal?: number[] | null;
  pa_p_vegetal_outros?: string | null;
  
  // Observações
  obs_gerais?: string | null;
  obs_form?: string | null;
  
  // Relacionamentos
  gleba_rel?: { id: number; descricao: string } | null;
  estado_rel?: { id: number; descricao: string; uf: string } | null;
  municipio_rel?: { id: number; descricao: string } | null;
  validacao_rel?: { id: number; descricao: string } | null;
  validacao?: number | null;
  obs_validacao?: string | null;
  tecnico?: number | null;
  tecnico_rel?: { id: number; name: string; email?: string } | null;
  estagiario?: number | null;
  estagiario_rel?: { id: number; name: string; email?: string } | null;
  data_hora_validado?: string | Date | null;
  comunidade?: string | null;
  quilombo?: string | null;
  gps_lat?: number | null;
  gps_lng?: number | null;
  gps_alt?: number | null;
  gps_acc?: number | null;
  n_moradores?: number | null;
  formulario_completo?: number | null;
}

export interface TabConfig {
  id: string;
  label: string;
  fields: string[];
}
