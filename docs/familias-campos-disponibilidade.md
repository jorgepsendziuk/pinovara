# Disponibilidade de Campos - XML vs Banco de Dados vs API

Este documento compara os campos definidos no XML do formulário (`docs/familias.xml`) com os campos disponíveis no banco de dados (`familias.familias_individual`) e na API (`backend/src/services/supervisaoOcupacionalService.ts`).

## Metodologia

1. **XML:** Campos definidos no formulário ODK (`docs/familias.xml`)
2. **Banco:** Campos na tabela `familias.familias_individual` (schema SQL)
3. **API:** Campos retornados pelo método `getFamiliaById` do service

## Mapeamento XML → Banco

### Padrão de Nomenclatura

O banco de dados usa um padrão diferente do XML:
- XML: `i/q1_10` → Banco: `num_imovel` ou `i_q1_10`
- XML: `g00_0/q1_2` → Banco: `iuf_ocup_cpf` ou `g00_0_q1_2`
- XML: `iuf/nome_ocupante` → Banco: `iuf_ocup_nome`
- XML: `ec/zona` → Banco: `ec_zona`
- XML: `ii/ai_matricula` → Banco: `ii_ai_matricula`

**Observação:** Nem todos os campos seguem o mesmo padrão. Alguns campos do XML podem ter nomes diferentes no banco.

## Campos Disponíveis no Banco

### Campos Principais (Confirmados no SQL)

#### Metadados ODK
- `_uri` (uri)
- `_creator_uri_user` (creator_uri_user)
- `_creation_date` (creation_date)
- `_last_update_uri_user` (last_update_uri_user)
- `_last_update_date` (last_update_date)
- `_model_version` (model_version)
- `_ui_version` (ui_version)
- `_is_complete` (is_complete)
- `_submission_date` (submission_date)
- `_marked_as_complete_date` (marked_as_complete_date)
- `deviceid`
- `meta_instance_id`
- `meta_instance_name`
- `inicio`
- `fim`

#### Localização
- `estado` (FK para estado_familias)
- `municipio` (FK para municipio_ibge_familias)
- `cod_gleba` (FK para gleba)
- `comunidade`
- `quilombo`

#### GPS
- `gps_lat`
- `gps_lng`
- `gps_alt`
- `gps_acc`

#### Informações Iniciais
- `num_imovel` (i_q1_10)
- `aceitou_visita` (i_q1_17)
- `tem_nome`
- `existe_numimovel`
- `tipo_formulario`

#### Identificação Ocupante (iuf_ocup_*)
- `iuf_ocup_nome` (iuf/nome_ocupante)
- `iuf_ocup_cpf` (g00_0/q1_2)
- `iuf_ocup_sexo`
- `iuf_ocup_d_nascimento`
- `iuf_ocup_idade`
- `iuf_ocup_nacionalidade`
- `iuf_ocup_n_estado` (nascimento_uf)
- `iuf_ocup_n_municipio` (nascimento_mun - texto)
- `iuf_ocup_n_municipio_int` (nascimento_mun - FK)
- `iuf_ocup_nd_identidade` (identidade)
- `iuf_ocup_nd_tipo` (identidade_orgao_t_doc)
- `iuf_ocup_nd_orgao` (identidade_orgao)
- `iuf_ocup_nd_uf` (identidade_orgao_uf)
- `iuf_ocup_e_civil` (estado_civil)
- `iuf_ocup_d_casamento` (data_casamento)
- `iuf_ocup_r_bens` (regime_bens)
- `iuf_ocup_n_mae` (nome_mae)
- `iuf_ocup_profissao`
- `iuf_ocup_profissao_outros`
- `iuf_ocup_aposentado`
- `iuf_ocup_tel1` (ec_tel1)
- `iuf_ocup_tel2` (ec_tel2)
- `iuf_ocup_telefone`
- `iuf_ocup_email`
- `iuf_ocup_endereco`
- `iuf_ocup_conhecido` (g00_0/conhecido)

#### Identificação Cônjuge (iuf_conj_*)
- `iuf_conj_nome` (iuf/nome_conjuge)
- `iuf_conj_cpf` (g00_0_1/conjuge_cpf)
- `iuf_conj_sexo`
- `iuf_conj_d_nascimento`
- `iuf_conj_idade`
- `iuf_conj_nacionalidade`
- `iuf_conj_n_estado` (nascimento_uf)
- `iuf_conj_n_municipio` (nascimento_mun - texto)
- `iuf_conj_n_municipio_int` (nascimento_mun - FK)
- `iuf_conj_nd_identidade`
- `iuf_conj_nd_tipo`
- `iuf_conj_nd_orgao`
- `iuf_conj_nd_uf`
- `iuf_conj_e_civil`
- `iuf_conj_d_casamento`
- `iuf_conj_r_bens`
- `iuf_conj_n_mae`
- `iuf_conj_profissao`
- `iuf_conj_profissao_outros`
- `iuf_conj_aposentado`
- `iuf_conj_tel1`
- `iuf_conj_tel2`
- `iuf_conj_email`
- `iuf_conj_conhecido`
- `iuf_conj_d_nascimento`

#### Endereço (ec_*)
- `ec_zona`
- `ec_logrado`
- `ec_numero`
- `ec_complem`
- `ec_bairro`
- `ec_cep`
- `ec_uf`
- `ec_cod_ibg` (g1_1_1_ec_cod_ibg)

#### Informações do Imóvel (ii_*)
- `ii_titulo_definitivo`
- `ii_titulo_quitado`
- `ii_titulo_baixa`
- `ii_linha_credito`
- `ii_linha_credito_qual`
- `ii_fr_regularizacao`
- `ii_fr_r_doc`
- `ii_fr_r_doc_outro`
- `ii_p_principal`
- `ii_r_st`
- `ii_do_originaria`
- `ii_do_atual`
- `ii_o_primitivo`
- `ii_din_urbano`
- `ii_c_acesso`
- `ii_car_possui`
- `ii_car_protocolo`
- `ii_georreferenciada`
- `ii_ai_matricula`
- `ii_declarada_medida`
- `ii_vm_fiscal`
- `ii_d_possui`
- `ii_d_orgaopublico`
- `ii_d_orgaopublico_outros`
- `ii_d_cc_td`
- `ii_d_cc_ccdru`
- `ii_d_sncr`
- `ii_d_certific`
- `ii_d_comprobatoria`
- `ii_d_comprobatoria_outros`

#### Quadro de Áreas (qa_*)
- `qa_a_sede` (qa/q3_6_0)
- `qa_a_p_proprio` (qa/q3_6_1)
- `qa_a_m_nativa` (qa/q3_6_2)
- `qa_a_florestada` (qa/q3_6_3)
- `qa_a_pousio` (qa/q3_6_4)
- `qa_a_p_nativa` (qa/q3_6_5)
- `qa_a_p_plantada` (qa/q3_6_6)
- `qa_a_degradada` (qa/q3_6_7)
- `soma_area_digitada`

#### Requisitos Regularização Fundiária (rrf_*)
- `rrf_p_cultura`
- `rrf_eo_direta`
- `rrf_eo_forma`
- `rrf_ed_anterior`
- `rrf_ed_anterior_quem`
- `rrf_oc_proprietario`
- `rrf_oc_proprietario_quem`
- `rrf_oc_escravo`
- `rrf_oc_escravo_quem`
- `rrf_oc_beneficiado`
- `rrf_oc_beneficiado_quem`
- `rrf_oc_crime`
- `rrf_oc_crime_quem`
- `rrf_oc_cargo`

#### Informações de Renda (ir_*)
- `ir_r_bruta` (ir/q00_23)
- `ir_r_e_lote` (ir/q00_26)
- `ir_f_p_social` (ir/q2_17)
- `ir_f_p_social_outro` (ir/q2_17_1_outro)

#### Saneamento Básico (sb_*)
- `sb_moradia_outro` (sb/q2_10_outro)
- `sb_agua_outro` (sb/q2_7_outro)
- `sb_agua_suficiente` (sb/q2_7_suficiente)
- `sb_d_residuo` (sb/descarte_residuo)
- `sb_d_residuo_outro` (sb/descarte_residuo_outros)

#### Segurança Alimentar (san_*)
- `san_tiveram_preocupacao`
- `san_acabaram_antes`
- `san_ficaram_sem`
- `san_comeram_pouco`
- `san_deixou_refeicao`
- `san_comeu_menos_devia`
- `san_sentiu_fome`
- `san_uma_refeicao`
- `san_refeicao_completa`
- `san_orientacao_profissional`
- `san_preocupacao`
- `san_acabou`
- `san_sem_dinheiro`
- `san_diminuiu`
- `san_consome`
- `san_comeu_menos`

#### Produção Agrária (pa_*)
- `pa_a_vegetal_outros`
- `pa_p_vegetal_outros`
- `p_socioprodutiva`

#### Observações
- `obs_gerais`
- `obs_1` a `obs_10`
- `obs_form` (não encontrado no SQL, pode estar em outro campo)

#### Outros
- `iuf_prop_nome`
- `iuf_desc_acesso`
- `n_moradores`
- `modulo_fiscal`
- `n_contador`
- `benfeitorias_outros`
- `corrigido`
- `justificativa`
- `documento_entrevista_remota`

#### Validação
- `validacao`
- `obs_validacao`
- `tecnico`
- `estagiario`
- `validacao_estagiario`
- `data_hora_alterado`
- `data_hora_validado`
- `validacao_2`
- `formulario_completo`
- `removido`

#### Assinaturas (a_*)
- `a_q_ocupante` (quem_assinatura)
- `a_q_conjuge`
- `a_o_r_nome` (q9_2_rogo/rogo_nome)
- `a_o_r_cpf` (q9_2_rogo/rogo_cpf)
- `a_o_r_documento` (q9_2_rogo/rogo_foto)
- `a_c_r_nome` (q9_3_rogo/rogo_nome_conjuge)
- `a_c_r_cpf` (q9_3_rogo/rogo_cpf_conjuge)
- `a_c_r_documento` (q9_3_rogo/rogo_foto_conjuge)
- `a_entrevistador`
- `a_ocupante`
- `a_conjuge`

#### Produção Animal (c_*)
- `c_bovl_quantidade` (Bovinocultura Leite)
- `c_bovl_per_producao`
- `c_bovl_manejo`
- `c_bovl_pastoreio`
- `c_bovl_p_total`
- `c_bovl_p_autoconsumo`
- `c_bovl_p_comercial`
- `c_bovl_valor_anual`
- `c_bovc_quantidade` (Bovinocultura Corte)
- `c_bovc_tipo`
- `c_bovc_manejo`
- `c_bovc_pastoreio`
- `c_bovc_p_autoconsumo`
- `c_bovc_p_comercial`
- `c_bovc_valor_anual`
- `c_sui_quantidade` (Suinocultura)
- `c_sui_tipo`
- `c_sui_manejo`
- `c_sui_pastoreio`
- `c_sui_p_total`
- `c_sui_p_autoconsumo`
- `c_sui_p_comercial`
- `c_sui_valor_anual`
- `c_avic_quantidade` (Avicultura)
- `c_avic_tipo`
- `c_avic_manejo`
- `c_avic_pastoreio`
- `c_avic_p_total`
- `c_avic_p_autoconsumo`
- `c_avic_p_comercial`
- `c_avic_valor_anual`
- `c_avip_quantidade` (Avicultura Postura)
- `c_avip_tipo`
- `c_avip_manejo`
- `c_avip_pastoreio`
- `c_avip_p_total`
- `c_avip_p_autoconsumo`
- `c_avip_p_comercial`
- `c_avip_valor_anual`
- `c_pis_q_cultura` (Piscicultura)
- `c_ovi_quantidade` (Ovinocultura)
- `c_ovi_tipo`
- `c_ovi_manejo`
- `c_ovi_pastoreio`
- `c_ovi_p_total`
- `c_ovi_p_autoconsumo`
- `c_ovi_p_comercial`
- `c_ovi_valor_anual`
- `c_cap_quantidade` (Caprinocultura)
- `c_cap_tipo`
- `c_cap_manejo`
- `c_cap_pastoreio`
- `c_cap_p_total`
- `c_cap_p_autoconsumo`
- `c_cap_p_comercial`
- `c_cap_valor_anual`
- `c_api_quantidade` (Apicultura)
- `c_api_tipo`
- `c_api_manejo`
- `c_api_p_total`
- `c_api_p_autoconsumo`
- `c_api_p_comercial`
- `c_api_valor_anual`
- `c_aqui_q_cultura` (Aquicultura)
- `c_bub_quantidade` (Bubalinocultura)
- `c_bub_p_autoconsumo`
- `c_bub_p_comercial`
- `c_bub_valor_anual`
- `c_bub_l_p_total` (Bubalinocultura Leite)
- `c_bub_l_p_autoconsumo`
- `c_bub_l_p_comercial`
- `c_bub_l_valor_anual`

## Tabelas Relacionadas (Arrays/Repeats)

### Tabelas de Arrays Confirmadas no SQL

1. **familias_individual_progsocial** - Programas sociais (ir/q2_17_1)
   - Campo: `valor` (FK para prog_governamental)
   - Relacionamento: `id_familias` → `familias_individual.id`

2. **familias_individual_saneamento** - Saneamento básico (sb/q2_10)
   - Campo: `valor` (FK para saneamento_basico)
   - Relacionamento: `id_familias` → `familias_individual.id`

3. **familias_individual_agua** - Origem da água (sb/q2_7)
   - Campo: `valor` (FK para agua)
   - Relacionamento: `id_familias` → `familias_individual.id`

4. **familias_individual_pa_a_vegetal** - Atividade vegetal (pa/a_vegetal)
   - Campo: `valor` (FK para producao_vegetal)
   - Relacionamento: `id_familias` → `familias_individual.id`

5. **familias_individual_pa_a_animal** - Atividade animal (pa/a_animal)
   - Campo: `valor` (FK para autoconsumo_animal)
   - Relacionamento: `id_familias` → `familias_individual.id`

6. **familias_individual_pa_comercial** - Atividade comercial (pa/comercial)
   - Campo: `valor` (FK para atividade_comercial)
   - Relacionamento: `id_familias` → `familias_individual.id`

7. **familias_individual_pa_p_vegetal** - Produção vegetal (pa/p_vegetal)
   - Campo: `valor` (FK para producao_vegetal)
   - Relacionamento: `id_familias` → `familias_individual.id`

8. **familias_individual_pa_p_animal** - Produção animal (pa/p_animal)
   - Campo: `valor` (FK para autoconsumo_animal)
   - Relacionamento: `id_familias` → `familias_individual.id`

9. **familias_individual_benfeitorias** - Benfeitorias (r_q3_7_1)
   - Campo: `valor` (FK para benfeitorias)
   - Relacionamento: `id_familias` → `familias_individual.id`

10. **familias_individual_nucleo** - Núcleo familiar (nucleo)
    - Campos: `q2_1_1` (nome), `q2_1_2` (grau parentesco), `q2_1_2_1` (outro), `q2_1_3` (sexo), `q2_1_4` (data nascimento), `q2_1_4_1` (idade)
    - Relacionamento: `id_familias` → `familias_individual.id`

11. **familias_individual_fotos** - Fotos e geometria (fotos)
    - Campos: `grupo`, `prod_foto`, `prod_vegetal`, `foto1`, `foto1_obs`, `gps_foto`
    - Relacionamento: `id_familias` → `familias_individual.id`

12. **familias_individual_g3_6_r1_2** - Culturas vegetais comerciais (g3_6_r1_2)
    - Campos: `q3_6_1_8`, `q3_6_1_8_id`, `q3_6_1_9`, `formacao`, `q3_6_1_10`, `q3_6_1_12`, `q3_6_1_13`, `q3_6_1_14`, `q3_6_1_15`, `q3_6_1_16`, `q3_6_1_11`, `q3_6_1_36`
    - Relacionamento: `id_familias` → `familias_individual.id`

13. **familias_individual_r3_15_0** - Piscicultura (r3_15_0)
    - Campos: `especie`, `especie_outros`, `q3_15_18`, `q3_15_19`, `q3_15_20`, `q3_15_21`, `q3_15_1`, `q3_15_1_0`, `q3_15_2`, `q3_15_3`, `q3_15_4`, `q3_15_22`
    - Relacionamento: `id_familias` → `familias_individual.id`

14. **familias_individual_r3_199_0** - Aquicultura (r3_199_0)
    - Campos: `aqui_cultura`, `q3_199_1_0`, `q3_199_2`, `q3_199_3`, `q3_199_4`, `q3_199_22`
    - Relacionamento: `id_familias` → `familias_individual.id`

15. **familias_individual_r33_18** - Extrativismo (r33_18)
    - Campos: `extracao`, `q33_18_1_a`, `q33_18_1`, `q33_18_2`, `q33_18_3`, `q33_18_4`, `q33_18_5`, `q33_18_6`
    - Relacionamento: `id_familias` → `familias_individual.id`

16. **familias_individual_r3_19** - Processamento/Alimentos (r3_19)
    - Campos: `q3_19_1`, `q3_19_2`, `q3_19_3`, `q3_19_4`, `q3_19_5`, `q3_19_6`, `q3_19_7`, `q3_19_8`, `q3_19_9`, `q3_19_10`, `q3_19_11`, `q3_19_24`
    - Relacionamento: `id_familias` → `familias_individual.id`

17. **familias_individual_r2_4_2** - Participação Socioprodutiva (r2_4_2)
    - Campos: `q2_4_3`, `q2_4_3_1`, `q2_4_4`, `q2_4_5`
    - Relacionamento: `id_familias` → `familias_individual.id`

## Campos do XML NÃO Encontrados no Banco

### Campos que podem estar em outras tabelas ou não implementados:

1. **Grupo `og` (Observações Gerais):**
   - `og/texto_q8_7` - Pode estar em `obs_gerais`
   - `og/data_o_original` - Não encontrado
   - `og/data_o_lote` - Não encontrado
   - `og/q8_1` a `og/q8_10` - Podem estar em `obs_1` a `obs_10`

2. **Assinaturas:**
   - `q9_1`, `q9_2`, `q9_3` (binários de assinatura) - Não encontrados diretamente, podem estar em campos `a_*`

3. **Campos calculados:**
   - `somaarea` - Não encontrado (pode ser calculado)
   - `testadorsomaarea` - Não encontrado
   - `count_*` - Campos de contagem calculados não estão no banco

4. **Campos de filtro:**
   - `filter1` a `filter14` - Campos de filtro dinâmico, não armazenados
   - `filterpv*` - Campos de filtro produção vegetal, não armazenados

5. **Campos de template/instância:**
   - Campos com `jr:template=""` são templates e não são armazenados diretamente

## Campos do Banco NÃO Presentes no XML

### Campos administrativos adicionais:
- `removido` - Flag de remoção lógica
- `validacao` - Status de validação
- `obs_validacao` - Observações da validação
- `tecnico` - ID do técnico responsável
- `estagiario` - ID do estagiário responsável
- `validacao_estagiario` - Validação do estagiário
- `data_hora_alterado` - Data/hora da última alteração
- `data_hora_validado` - Data/hora da validação
- `corrigido` - Flag de correção
- `justificativa` - Justificativa de correção
- `validacao_2` - Segunda validação
- `formulario_completo` - Status de completude do formulário
- `documento_entrevista_remota` - Documento de entrevista remota

## Recomendações

### Para Visualização:
1. ✅ **Campos principais disponíveis:** A maioria dos campos principais está disponível no banco
2. ⚠️ **Arrays precisam de JOIN:** Arrays (nucleo, fotos, etc) precisam de JOINs com tabelas relacionadas
3. ⚠️ **Selects múltiplos:** Campos de select múltiplo (sb/q2_10, sb/q2_7, etc) estão em tabelas relacionadas

### Para Edição:
1. ✅ **Campos simples:** Podem ser editados diretamente
2. ⚠️ **Arrays:** Precisam de interface especial para adicionar/remover itens
3. ⚠️ **Selects múltiplos:** Precisam de interface de seleção múltipla
4. ⚠️ **Validações:** Campos calculados não devem ser editados diretamente

### Campos Faltantes:
1. **obs_form** - Não encontrado no banco, pode estar em `obs_gerais` ou não implementado
2. **Campos do grupo `og`** - Alguns podem estar em `obs_1` a `obs_10`
3. **Assinaturas binárias** - Podem não estar armazenadas ou estar em outro formato

### Próximos Passos:
1. Verificar se arrays estão sendo retornados pela API
2. Implementar JOINs para arrays nas queries
3. Criar interfaces de edição para arrays
4. Implementar seleção múltipla para campos de select múltiplo
5. Verificar se campos faltantes precisam ser adicionados ao banco

## Status de Disponibilidade por Grupo

| Grupo | Campos XML | Campos Banco | Status | Observações |
|-------|------------|--------------|--------|-------------|
| `i` (Inicial) | 5 | 5 | ✅ | Todos disponíveis |
| `iuf` (Básica) | 4 | 4 | ✅ | Todos disponíveis |
| `g00_0` (Ocupante) | 20 | 20+ | ✅ | Disponíveis com prefixo `iuf_ocup_*` |
| `g00_0_1` (Cônjuge) | 20 | 20+ | ✅ | Disponíveis com prefixo `iuf_conj_*` |
| `ec` (Endereço) | 8 | 8 | ✅ | Todos disponíveis |
| `ii` (Imóvel) | 28 | 28 | ✅ | Todos disponíveis |
| `qa` (Áreas) | 8 | 8 | ✅ | Todos disponíveis |
| `rrf` (RRF) | 13 | 13 | ✅ | Todos disponíveis |
| `nucleo` (Array) | 6 | 6 | ⚠️ | Tabela relacionada `familias_individual_nucleo` |
| `ir` (Renda) | 5 | 4 | ⚠️ | `ir/q2_17_1` em tabela relacionada |
| `sb` (Saneamento) | 7 | 4 | ⚠️ | Arrays em tabelas relacionadas |
| `san` (Segurança Alimentar) | 10 | 10+ | ✅ | Todos disponíveis |
| `pa` (Produção) | 7 | 3 | ⚠️ | Arrays em tabelas relacionadas |
| `fotos` (Array) | 6+ | 6+ | ⚠️ | Tabela relacionada `familias_individual_fotos` |
| `og` (Observações) | 10+ | 10 | ⚠️ | Alguns podem estar em `obs_1` a `obs_10` |
| Assinaturas | 6+ | 6+ | ⚠️ | Campos `a_*` podem corresponder |

**Legenda:**
- ✅ Todos os campos disponíveis
- ⚠️ Campos disponíveis mas em tabelas relacionadas ou com estrutura diferente
- ❌ Campos não disponíveis
