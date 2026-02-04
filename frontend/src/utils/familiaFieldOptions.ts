/**
 * Opções para campos select/select1 do formulário de famílias
 * Baseado em docs/familias.xml
 */

export interface FieldOption {
  value: string | number;
  label: string;
}

export type FieldOptionsMap = Record<string, FieldOption[]>;

/**
 * Mapeamento de opções para cada campo de escolha
 */
export const FIELD_OPTIONS: FieldOptionsMap = {
  // Informações Iniciais
  'i_q1_17': [
    { value: 1, label: 'Sim' },
    { value: 2, label: 'Não' },
    { value: 3, label: 'Não encontrado' },
    { value: 4, label: 'Imóvel vago' },
    { value: 5, label: 'Litígio' },
    { value: 6, label: 'Sim - Entrevista Remota' }
  ],
  'tem_nome': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],

  // Identificação Ocupante
  'g00_0_sexo': [
    { value: 1, label: 'Masculino' },
    { value: 2, label: 'Feminino' },
    { value: 3, label: 'Outros' }
  ],
  'g00_0_nacionalidade': [
    { value: 1, label: 'Brasileira' },
    { value: 2, label: 'Estrangeira' },
    { value: 3, label: 'Brasileira Naturalizada' }
  ],
  'g00_0_identidade_orgao_t_doc': [
    { value: 1, label: 'Carteira Identidade' },
    { value: 2, label: 'Carteira funcional' },
    { value: 3, label: 'CNH' },
    { value: 4, label: 'Passaporte' },
    { value: 5, label: 'CTPS' }
  ],
  'g00_0_estado_civil': [
    { value: 1, label: 'Casado(a)' },
    { value: 2, label: 'Solteiro(a)' },
    { value: 3, label: 'Separado(a)' },
    { value: 4, label: 'Divorciado(a)' },
    { value: 5, label: 'Viúvo(a)' },
    { value: 7, label: 'União Estável' }
  ],
  'g00_0_regime_bens': [
    { value: 1, label: 'Comunhão Parcial' },
    { value: 2, label: 'Comunhão Universal' },
    { value: 3, label: 'Separação de Bens' },
    { value: 4, label: 'Participação Final' },
    { value: 5, label: 'Comunhão total' }
  ],
  'g00_0_aposentado': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'g00_0_nascimento_uf': [
    { value: 1, label: 'AC - Acre' },
    { value: 2, label: 'AL - Alagoas' },
    { value: 3, label: 'AP - Amapá' },
    { value: 4, label: 'AM - Amazonas' },
    { value: 5, label: 'BA - Bahia' },
    { value: 6, label: 'CE - Ceará' },
    { value: 7, label: 'DF - Distrito Federal' },
    { value: 8, label: 'ES - Espírito Santo' },
    { value: 9, label: 'GO - Goiás' },
    { value: 10, label: 'MA - Maranhão' },
    { value: 11, label: 'MT - Mato Grosso' },
    { value: 12, label: 'MS - Mato Grosso do Sul' },
    { value: 13, label: 'MG - Minas Gerais' },
    { value: 14, label: 'PA - Pará' },
    { value: 15, label: 'PB - Paraíba' },
    { value: 16, label: 'PR - Paraná' },
    { value: 17, label: 'PE - Pernambuco' },
    { value: 18, label: 'PI - Piauí' },
    { value: 19, label: 'RJ - Rio de Janeiro' },
    { value: 20, label: 'RN - Rio Grande do Norte' },
    { value: 21, label: 'RS - Rio Grande do Sul' },
    { value: 22, label: 'RO - Rondônia' },
    { value: 23, label: 'RR - Roraima' },
    { value: 24, label: 'SC - Santa Catarina' },
    { value: 25, label: 'SP - São Paulo' },
    { value: 26, label: 'SE - Sergipe' },
    { value: 27, label: 'TO - Tocantins' }
  ],
  'g00_0_identidade_orgao_uf': [
    { value: 1, label: 'AC - Acre' },
    { value: 2, label: 'AL - Alagoas' },
    { value: 3, label: 'AP - Amapá' },
    { value: 4, label: 'AM - Amazonas' },
    { value: 5, label: 'BA - Bahia' },
    { value: 6, label: 'CE - Ceará' },
    { value: 7, label: 'DF - Distrito Federal' },
    { value: 8, label: 'ES - Espírito Santo' },
    { value: 9, label: 'GO - Goiás' },
    { value: 10, label: 'MA - Maranhão' },
    { value: 11, label: 'MT - Mato Grosso' },
    { value: 12, label: 'MS - Mato Grosso do Sul' },
    { value: 13, label: 'MG - Minas Gerais' },
    { value: 14, label: 'PA - Pará' },
    { value: 15, label: 'PB - Paraíba' },
    { value: 16, label: 'PR - Paraná' },
    { value: 17, label: 'PE - Pernambuco' },
    { value: 18, label: 'PI - Piauí' },
    { value: 19, label: 'RJ - Rio de Janeiro' },
    { value: 20, label: 'RN - Rio Grande do Norte' },
    { value: 21, label: 'RS - Rio Grande do Sul' },
    { value: 22, label: 'RO - Rondônia' },
    { value: 23, label: 'RR - Roraima' },
    { value: 24, label: 'SC - Santa Catarina' },
    { value: 25, label: 'SP - São Paulo' },
    { value: 26, label: 'SE - Sergipe' },
    { value: 27, label: 'TO - Tocantins' }
  ],
  'g00_0_profissao': [
    { value: 1, label: 'Agricultor(a)' },
    { value: 2, label: 'Pecuarista' },
    { value: 3, label: 'Agricultor(a)/Pecuarista' },
    { value: 4, label: 'Do lar' },
    { value: 5, label: 'Aposentado(a)' },
    { value: 6, label: 'Artesão' },
    { value: 7, label: 'Assalariado agrícola permanente' },
    { value: 8, label: 'Assalariado agrícola temporário' },
    { value: 9, label: 'Bolsista (Estudante)' },
    { value: 10, label: 'Comerciante' },
    { value: 11, label: 'Comerciário' },
    { value: 12, label: 'Engenheiro(a)' },
    { value: 13, label: 'Pedreiro' },
    { value: 14, label: 'Diarista' },
    { value: 15, label: 'Empregado doméstico' },
    { value: 16, label: 'Estudante' },
    { value: 17, label: 'Feirante' },
    { value: 18, label: 'Funcionário Público' },
    { value: 19, label: 'Motorista' },
    { value: 20, label: 'Professor' },
    { value: 99, label: 'Outros' },
    { value: 100, label: 'Não possui' }
  ],

  // Identificação Cônjuge
  'g00_0_1_conjuge_sexo': [
    { value: 1, label: 'Masculino' },
    { value: 2, label: 'Feminino' },
    { value: 3, label: 'Outros' }
  ],
  'g00_0_1_conjuge_nacionalidade': [
    { value: 1, label: 'Brasileira' },
    { value: 2, label: 'Estrangeira' },
    { value: 3, label: 'Brasileira Naturalizada' }
  ],
  'g00_0_1_conjuge_identidade_orgao_t_doc': [
    { value: 1, label: 'Carteira Identidade' },
    { value: 2, label: 'Carteira funcional' },
    { value: 3, label: 'CNH' },
    { value: 4, label: 'Passaporte' },
    { value: 5, label: 'CTPS' }
  ],
  'g00_0_1_conjuge_estado_civil': [
    { value: 1, label: 'Casado(a)' },
    { value: 2, label: 'Solteiro(a)' },
    { value: 3, label: 'Separado(a)' },
    { value: 4, label: 'Divorciado(a)' },
    { value: 5, label: 'Viúvo(a)' },
    { value: 7, label: 'União Estável' }
  ],
  'g00_0_1_conjuge_regime_bens': [
    { value: 1, label: 'Comunhão Parcial' },
    { value: 2, label: 'Comunhão Universal' },
    { value: 3, label: 'Separação de Bens' },
    { value: 4, label: 'Participação Final' },
    { value: 5, label: 'Comunhão total' }
  ],
  'g00_0_1_conjuge_aposentado': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'g00_0_1_conjuge_nascimento_uf': [
    { value: 1, label: 'AC - Acre' },
    { value: 2, label: 'AL - Alagoas' },
    { value: 3, label: 'AP - Amapá' },
    { value: 4, label: 'AM - Amazonas' },
    { value: 5, label: 'BA - Bahia' },
    { value: 6, label: 'CE - Ceará' },
    { value: 7, label: 'DF - Distrito Federal' },
    { value: 8, label: 'ES - Espírito Santo' },
    { value: 9, label: 'GO - Goiás' },
    { value: 10, label: 'MA - Maranhão' },
    { value: 11, label: 'MT - Mato Grosso' },
    { value: 12, label: 'MS - Mato Grosso do Sul' },
    { value: 13, label: 'MG - Minas Gerais' },
    { value: 14, label: 'PA - Pará' },
    { value: 15, label: 'PB - Paraíba' },
    { value: 16, label: 'PR - Paraná' },
    { value: 17, label: 'PE - Pernambuco' },
    { value: 18, label: 'PI - Piauí' },
    { value: 19, label: 'RJ - Rio de Janeiro' },
    { value: 20, label: 'RN - Rio Grande do Norte' },
    { value: 21, label: 'RS - Rio Grande do Sul' },
    { value: 22, label: 'RO - Rondônia' },
    { value: 23, label: 'RR - Roraima' },
    { value: 24, label: 'SC - Santa Catarina' },
    { value: 25, label: 'SP - São Paulo' },
    { value: 26, label: 'SE - Sergipe' },
    { value: 27, label: 'TO - Tocantins' }
  ],
  'g00_0_1_conjuge_identidade_orgao_uf': [
    { value: 1, label: 'AC - Acre' },
    { value: 2, label: 'AL - Alagoas' },
    { value: 3, label: 'AP - Amapá' },
    { value: 4, label: 'AM - Amazonas' },
    { value: 5, label: 'BA - Bahia' },
    { value: 6, label: 'CE - Ceará' },
    { value: 7, label: 'DF - Distrito Federal' },
    { value: 8, label: 'ES - Espírito Santo' },
    { value: 9, label: 'GO - Goiás' },
    { value: 10, label: 'MA - Maranhão' },
    { value: 11, label: 'MT - Mato Grosso' },
    { value: 12, label: 'MS - Mato Grosso do Sul' },
    { value: 13, label: 'MG - Minas Gerais' },
    { value: 14, label: 'PA - Pará' },
    { value: 15, label: 'PB - Paraíba' },
    { value: 16, label: 'PR - Paraná' },
    { value: 17, label: 'PE - Pernambuco' },
    { value: 18, label: 'PI - Piauí' },
    { value: 19, label: 'RJ - Rio de Janeiro' },
    { value: 20, label: 'RN - Rio Grande do Norte' },
    { value: 21, label: 'RS - Rio Grande do Sul' },
    { value: 22, label: 'RO - Rondônia' },
    { value: 23, label: 'RR - Roraima' },
    { value: 24, label: 'SC - Santa Catarina' },
    { value: 25, label: 'SP - São Paulo' },
    { value: 26, label: 'SE - Sergipe' },
    { value: 27, label: 'TO - Tocantins' }
  ],
  'g00_0_1_conjuge_profissao': [
    { value: 1, label: 'Agricultor(a)' },
    { value: 2, label: 'Pecuarista' },
    { value: 3, label: 'Agricultor(a)/Pecuarista' },
    { value: 4, label: 'Do lar' },
    { value: 5, label: 'Aposentado(a)' },
    { value: 6, label: 'Artesão' },
    { value: 7, label: 'Assalariado agrícola permanente' },
    { value: 8, label: 'Assalariado agrícola temporário' },
    { value: 9, label: 'Bolsista (Estudante)' },
    { value: 10, label: 'Comerciante' },
    { value: 11, label: 'Comerciário' },
    { value: 12, label: 'Engenheiro(a)' },
    { value: 13, label: 'Pedreiro' },
    { value: 14, label: 'Diarista' },
    { value: 15, label: 'Empregado doméstico' },
    { value: 16, label: 'Estudante' },
    { value: 17, label: 'Feirante' },
    { value: 18, label: 'Funcionário Público' },
    { value: 19, label: 'Motorista' },
    { value: 20, label: 'Professor' },
    { value: 99, label: 'Outros' },
    { value: 100, label: 'Não possui' }
  ],

  // Endereço para Correspondência
  'ec_zona': [
    { value: 1, label: 'Zona Rural' },
    { value: 2, label: 'Zona Urbana' }
  ],
  'ec_uf': [
    { value: 1, label: 'AC - Acre' },
    { value: 2, label: 'AL - Alagoas' },
    { value: 3, label: 'AP - Amapá' },
    { value: 4, label: 'AM - Amazonas' },
    { value: 5, label: 'BA - Bahia' },
    { value: 6, label: 'CE - Ceará' },
    { value: 7, label: 'DF - Distrito Federal' },
    { value: 8, label: 'ES - Espírito Santo' },
    { value: 9, label: 'GO - Goiás' },
    { value: 10, label: 'MA - Maranhão' },
    { value: 11, label: 'MT - Mato Grosso' },
    { value: 12, label: 'MS - Mato Grosso do Sul' },
    { value: 13, label: 'MG - Minas Gerais' },
    { value: 14, label: 'PA - Pará' },
    { value: 15, label: 'PB - Paraíba' },
    { value: 16, label: 'PR - Paraná' },
    { value: 17, label: 'PE - Pernambuco' },
    { value: 18, label: 'PI - Piauí' },
    { value: 19, label: 'RJ - Rio de Janeiro' },
    { value: 20, label: 'RN - Rio Grande do Norte' },
    { value: 21, label: 'RS - Rio Grande do Sul' },
    { value: 22, label: 'RO - Rondônia' },
    { value: 23, label: 'RR - Roraima' },
    { value: 24, label: 'SC - Santa Catarina' },
    { value: 25, label: 'SP - São Paulo' },
    { value: 26, label: 'SE - Sergipe' },
    { value: 27, label: 'TO - Tocantins' }
  ],

  // Informações do Imóvel
  'ii_titulo_definitivo': [
    { value: 1, label: 'Sim' },
    { value: 2, label: 'Não' },
    { value: 3, label: 'Não soube informar' }
  ],
  'ii_titulo_quitado': [
    { value: 1, label: 'Sim' },
    { value: 2, label: 'Não' },
    { value: 3, label: 'Não soube informar' },
    { value: 4, label: 'Isento' }
  ],
  'ii_titulo_baixa': [
    { value: 1, label: 'Sim' },
    { value: 2, label: 'Não' },
    { value: 3, label: 'Não soube informar' }
  ],
  'ii_linha_credito': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'ii_fr_regularizacao': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'ii_fr_r_doc': [
    { value: 1, label: 'PGT' },
    { value: 2, label: 'Terra Legal' },
    { value: 3, label: 'Diretamente no INCRA' },
    { value: 99, label: 'Outro' }
  ],
  'ii_o_primitivo': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'ii_c_acesso': [
    { value: 1, label: 'Terrestre rodovia asfaltada' },
    { value: 2, label: 'Terrestre via não pavimentada' },
    { value: 3, label: 'Fluvial transporte hidroviário' }
  ],
  'ii_car_possui': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'ii_georreferenciada': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'ii_declarada_medida': [
    { value: 1, label: 'Declarada' },
    { value: 2, label: 'Medida' }
  ],
  'ii_d_possui': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'ii_d_orgaopublico': [
    { value: 1, label: 'CATP' },
    { value: 2, label: 'CPCV' },
    { value: 3, label: 'AO' },
    { value: 99, label: 'Outros' }
  ],
  'ii_d_cc_td': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'ii_d_cc_ccdru': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],

  // Requisitos para Regularização Fundiária
  'rrf_p_cultura': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'rrf_eo_direta': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'rrf_eo_forma': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'rrf_ed_anterior': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'rrf_oc_proprietario': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'rrf_oc_escravo': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'rrf_oc_beneficiado': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'rrf_oc_crime': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'rrf_oc_cargo': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],

  // Informações de Renda
  'ir_q00_23': [
    { value: 0, label: 'R$ 0' },
    { value: 1, label: 'R$ 1 a R$ 20.999' },
    { value: 2, label: 'R$ 21.000 a R$ 40.999' },
    { value: 3, label: 'R$ 41.000 a R$ 60.999' },
    { value: 4, label: 'R$ 61.000 a R$ 80.999' },
    { value: 5, label: 'R$ 81.000 a R$ 100.999' },
    { value: 6, label: 'R$ 101.000 a R$ 150.999' },
    { value: 7, label: 'R$ 151.000 a R$ 200.999' },
    { value: 8, label: 'R$ 201.000 a R$ 250.999' },
    { value: 9, label: 'R$ 251.000 a R$ 300.999' },
    { value: 10, label: 'R$ 301.000 a R$ 399.999' },
    { value: 11, label: 'Acima de R$ 400.000' }
  ],
  'ir_q00_26': [
    { value: 0, label: 'R$ 0' },
    { value: 1, label: 'R$ 1 a R$ 20.999' },
    { value: 2, label: 'R$ 21.000 a R$ 40.999' },
    { value: 3, label: 'R$ 41.000 a R$ 60.999' },
    { value: 4, label: 'R$ 61.000 a R$ 80.999' },
    { value: 5, label: 'R$ 81.000 a R$ 100.999' },
    { value: 6, label: 'R$ 101.000 a R$ 150.999' },
    { value: 7, label: 'R$ 151.000 a R$ 200.999' },
    { value: 8, label: 'R$ 201.000 a R$ 250.999' },
    { value: 9, label: 'R$ 251.000 a R$ 300.999' },
    { value: 10, label: 'R$ 301.000 a R$ 399.999' },
    { value: 11, label: 'Acima de R$ 400.000' }
  ],
  'ir_q2_17': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'ir_q2_17_1': [
    { value: 1, label: 'Bolsa Família' },
    { value: 2, label: 'Cesta Básica' },
    { value: 3, label: 'Bolsa Verde' },
    { value: 99, label: 'Outros' }
  ],

  // Saneamento Básico
  'sb_q2_10': [
    { value: 1, label: 'Rede pública de esgoto' },
    { value: 2, label: 'Fossa rudimentar' },
    { value: 3, label: 'Fossa séptica' },
    { value: 4, label: 'Rio/canal/vala' },
    { value: 5, label: 'Não possui banheiro' },
    { value: 99, label: 'Outro' }
  ],
  'sb_q2_7': [
    { value: 1, label: 'Rede pública' },
    { value: 2, label: 'Nascente' },
    { value: 3, label: 'Poço artesiano' },
    { value: 4, label: 'Poço comum' },
    { value: 5, label: 'Poço coletivo' },
    { value: 6, label: 'Poço semi-artesiano' },
    { value: 7, label: 'Rio/Córrego' },
    { value: 8, label: 'Cisterna/Armazenagem da chuva' },
    { value: 9, label: 'Açude/Represa' },
    { value: 10, label: 'Rede Comunitária' },
    { value: 99, label: 'Outros' },
    { value: 100, label: 'Não possui' }
  ],
  'sb_q2_7_suficiente': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'sb_descarte_residuo': [
    { value: 1, label: 'Aterro municipal (coleta prefeitura)' },
    { value: 2, label: 'Aterro municipal (disposição própria)' },
    { value: 3, label: 'Enterrado no solo' },
    { value: 4, label: 'Queimado' },
    { value: 99, label: 'Outros' }
  ],

  // Segurança Alimentar
  'san_tiveram_preocupacao': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'san_acabaram_antes': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'san_ficaram_sem': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'san_comeram_pouco': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'san_deixou_refeicao': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'san_comeu_menos_devia': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'san_sentiu_fome': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'san_uma_refeicao': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'san_refeicao_completa': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],
  'san_orientacao_profissional': [
    { value: 'sim', label: 'Sim' },
    { value: 'nao', label: 'Não' }
  ],

  // Produção Agrária
  'pa_a_vegetal': [
    { value: 7, label: 'Abacaxi' },
    { value: 8, label: 'Abóbora Moranga' },
    { value: 9, label: 'Abobrinha' },
    { value: 64, label: 'Açaí' },
    { value: 10, label: 'Acelga' },
    { value: 11, label: 'Acerola' },
    { value: 12, label: 'Agrião' },
    { value: 13, label: 'Alface' },
    { value: 14, label: 'Algodão' },
    { value: 15, label: 'Alho' },
    { value: 16, label: 'Almeirão' },
    { value: 17, label: 'Amendoim' },
    { value: 18, label: 'Arroz' },
    { value: 19, label: 'Banana' },
    { value: 20, label: 'Batata Doce' },
    { value: 21, label: 'Batata-inglesa' },
    { value: 22, label: 'Berinjela' },
    { value: 23, label: 'Beterraba' },
    { value: 24, label: 'Brócolis' },
    { value: 25, label: 'Café' },
    { value: 26, label: 'Caju' },
    { value: 27, label: 'Cana-de-açúcar' },
    { value: 28, label: 'Cebola' },
    { value: 29, label: 'Cebolinha' },
    { value: 30, label: 'Cenoura' },
    { value: 31, label: 'Chuchu' },
    { value: 32, label: 'Coco-da-baía' },
    { value: 33, label: 'Couve' },
    { value: 34, label: 'Couve-Flor' },
    { value: 35, label: 'Cupuaçu' },
    { value: 36, label: 'Feijão' },
    { value: 37, label: 'Girassol' },
    { value: 38, label: 'Goiaba' },
    { value: 39, label: 'Inhame' },
    { value: 40, label: 'Laranja' },
    { value: 41, label: 'Limão' },
    { value: 42, label: 'Mamão' },
    { value: 43, label: 'Mandioca' },
    { value: 44, label: 'Manga' },
    { value: 45, label: 'Maracujá' },
    { value: 46, label: 'Melancia' },
    { value: 47, label: 'Melão' },
    { value: 48, label: 'Milho' },
    { value: 49, label: 'Pepino' },
    { value: 50, label: 'Pequi' },
    { value: 51, label: 'Pimentão Verde' },
    { value: 52, label: 'Quiabo' },
    { value: 53, label: 'Rabanete' },
    { value: 54, label: 'Repolho' },
    { value: 55, label: 'Salsa' },
    { value: 56, label: 'Soja' },
    { value: 57, label: 'Sorgo' },
    { value: 58, label: 'Tangerina' },
    { value: 59, label: 'Tomate' },
    { value: 60, label: 'Uva' },
    { value: 61, label: 'Vagem' },
    { value: 62, label: 'Outros' },
    { value: 63, label: 'Nenhum' }
  ],
  'pa_a_animal': [
    { value: 1, label: 'Abelha' },
    { value: 12, label: 'Bovinocultura de corte' },
    { value: 13, label: 'Bovinocultura de leite' },
    { value: 2, label: 'Codorna' },
    { value: 3, label: 'Galinha' },
    { value: 4, label: 'Marreco' },
    { value: 5, label: 'Ovelha' },
    { value: 6, label: 'Cabra' },
    { value: 7, label: 'Pato' },
    { value: 8, label: 'Peixe' },
    { value: 9, label: 'Peru' },
    { value: 10, label: 'Suíno' },
    { value: 11, label: 'Faisão' },
    { value: 99, label: 'Outros' },
    { value: 100, label: 'Nenhum' }
  ],
  'pa_p_animal': [
    { value: 1, label: 'Bovinocultura de corte' },
    { value: 2, label: 'Bovinocultura de leite' },
    { value: 3, label: 'Suinocultura' },
    { value: 4, label: 'Avicultura' },
    { value: 5, label: 'Piscicultura' },
    { value: 6, label: 'Ovinocultura' },
    { value: 7, label: 'Caprinocultura' },
    { value: 8, label: 'Apicultura' },
    { value: 9, label: 'Aquicultura' },
    { value: 10, label: 'Bubalinocultura' }
  ],
  'pa_p_vegetal': [
    { value: 7, label: 'Abacaxi' },
    { value: 8, label: 'Abóbora Moranga' },
    { value: 9, label: 'Abobrinha' },
    { value: 64, label: 'Açaí' },
    { value: 10, label: 'Acelga' },
    { value: 11, label: 'Acerola' },
    { value: 12, label: 'Agrião' },
    { value: 13, label: 'Alface' },
    { value: 14, label: 'Algodão' },
    { value: 15, label: 'Alho' },
    { value: 16, label: 'Almeirão' },
    { value: 17, label: 'Amendoim' },
    { value: 18, label: 'Arroz' },
    { value: 19, label: 'Banana' },
    { value: 20, label: 'Batata Doce' },
    { value: 21, label: 'Batata-inglesa' },
    { value: 22, label: 'Berinjela' },
    { value: 23, label: 'Beterraba' },
    { value: 24, label: 'Brócolis' },
    { value: 25, label: 'Café' },
    { value: 26, label: 'Caju' },
    { value: 27, label: 'Cana-de-açúcar' },
    { value: 28, label: 'Cebola' },
    { value: 29, label: 'Cebolinha' },
    { value: 30, label: 'Cenoura' },
    { value: 31, label: 'Chuchu' },
    { value: 32, label: 'Coco-da-baía' },
    { value: 33, label: 'Couve' },
    { value: 34, label: 'Couve-Flor' },
    { value: 35, label: 'Cupuaçu' },
    { value: 36, label: 'Feijão' },
    { value: 37, label: 'Girassol' },
    { value: 38, label: 'Goiaba' },
    { value: 39, label: 'Inhame' },
    { value: 40, label: 'Laranja' },
    { value: 41, label: 'Limão' },
    { value: 42, label: 'Mamão' },
    { value: 43, label: 'Mandioca' },
    { value: 44, label: 'Manga' },
    { value: 45, label: 'Maracujá' },
    { value: 46, label: 'Melancia' },
    { value: 47, label: 'Melão' },
    { value: 48, label: 'Milho' },
    { value: 49, label: 'Pepino' },
    { value: 50, label: 'Pequi' },
    { value: 51, label: 'Pimentão Verde' },
    { value: 52, label: 'Quiabo' },
    { value: 53, label: 'Rabanete' },
    { value: 54, label: 'Repolho' },
    { value: 55, label: 'Salsa' },
    { value: 56, label: 'Soja' },
    { value: 57, label: 'Sorgo' },
    { value: 58, label: 'Tangerina' },
    { value: 59, label: 'Tomate' },
    { value: 60, label: 'Uva' },
    { value: 61, label: 'Vagem' },
    { value: 62, label: 'Outros' },
    { value: 63, label: 'Nenhum' }
  ],
  'pa_comercial': [
    { value: 1, label: 'Agricultura' },
    { value: 2, label: 'Pecuária' },
    { value: 3, label: 'Extrativismo vegetal' },
    { value: 4, label: 'Extrativismo animal' },
    { value: 5, label: 'Processamento de alimentos' },
    { value: 6, label: 'Nenhuma' }
  ],

  // Requisitos RRF - Campos "quem"
  'rrf_ed_anterior_quem': [
    { value: 1, label: 'Ocupante' },
    { value: 2, label: 'Antecessor' }
  ],
  'rrf_oc_proprietario_quem': [
    { value: 1, label: 'Ocupante' },
    { value: 2, label: 'Cônjuge' },
    { value: 3, label: 'Ambos' }
  ],
  'rrf_oc_escravo_quem': [
    { value: 1, label: 'Ocupante' },
    { value: 2, label: 'Cônjuge' },
    { value: 3, label: 'Ambos' }
  ],
  'rrf_oc_beneficiado_quem': [
    { value: 1, label: 'Ocupante' },
    { value: 2, label: 'Cônjuge' },
    { value: 3, label: 'Ambos' }
  ],
  'rrf_oc_crime_quem': [
    { value: 1, label: 'Ocupante' },
    { value: 2, label: 'Cônjuge' },
    { value: 3, label: 'Ambos' }
  ],

  // Documentação Comprobatória (múltipla escolha)
  'ii_d_comprobatoria': [
    { value: 1, label: 'Título de Domínio' },
    { value: 2, label: 'Não possui' },
    { value: 3, label: 'CCU' },
    { value: 4, label: 'Contrato de Compra e Venda' },
    { value: 5, label: 'Contrato de Doação' },
    { value: 6, label: 'GEO (planta e memorial)' },
    { value: 7, label: 'CAR' },
    { value: 8, label: 'Terra Legal' },
    { value: 9, label: 'Conta de energia' },
    { value: 10, label: 'Declaração de Sindicato ou de Associação' },
    { value: 99, label: 'Outros' }
  ]
};

/**
 * Verifica se um campo tem opções definidas
 */
export function hasFieldOptions(fieldName: string): boolean {
  return fieldName in FIELD_OPTIONS;
}

/**
 * Obtém as opções de um campo
 */
export function getFieldOptions(fieldName: string): FieldOption[] {
  return FIELD_OPTIONS[fieldName] || [];
}

/**
 * Verifica se um campo é múltiplo (select vs select1)
 */
export function isMultipleSelect(fieldName: string): boolean {
  // Campos que são select (múltipla escolha) no XML
  const multipleFields = [
    'sb_q2_10',
    'sb_q2_7',
    'ir_q2_17_1',
    'ii_d_comprobatoria',
    'pa_a_vegetal',
    'pa_a_animal',
    'pa_p_animal',
    'pa_p_vegetal'
  ];
  return multipleFields.includes(fieldName);
}
