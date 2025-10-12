# Mapeamento: XML ODK ↔ Schema Prisma ↔ Frontend

**Data**: 12/10/2025  
**Objetivo**: Referência cruzada completa entre as três camadas do sistema

---

## 1. Metadados e Identificação

| XML ODK | Schema Prisma | Frontend (CamelCase) | Tipo | Tabela |
|---------|---------------|----------------------|------|--------|
| `inicio` | `inicio` | `inicio` | DateTime | organizacao |
| `fim` | `fim` | `fim` | DateTime | organizacao |
| `deviceid` | `deviceid` | `deviceId` | String | organizacao |
| `data_visita` | `data_visita` | `dataVisita` | Date | organizacao |
| `estado` | `estado` | `estado` | Int (FK) | organizacao |
| `municipio_ibge` | `municipio` | `municipio` | Int (FK) | organizacao |
| `gps` (lat) | `gps_lat` | `gpsLat` | Float | organizacao |
| `gps` (lng) | `gps_lng` | `gpsLng` | Float | organizacao |
| `gps` (alt) | `gps_alt` | `gpsAlt` | Float | organizacao |
| `gps` (acc) | `gps_acc` | `gpsAcc` | Float | organizacao |

---

## 2. Dados Básicos da Organização

| XML ODK | Schema Prisma | Frontend | Tipo | Implementado |
|---------|---------------|----------|------|--------------|
| `dados/nome` | `nome` | `nome` | String | ✅ |
| `dados/cnpj` | `cnpj` | `cnpj` | String(14) | ✅ |
| `dados/data_fundacao` | `data_fundacao` | `dataFundacao` | Date | ✅ |
| `dados/telefone` | `telefone` | `telefone` | String | ✅ |
| `dados/email` | `email` | `email` | String | ✅ |

---

## 3. Endereço da Organização

| XML ODK | Schema Prisma | Frontend | Tipo | Implementado |
|---------|---------------|----------|------|--------------|
| `end_organizacao/organizacao_logradouro` | `organizacao_end_logradouro` | `organizacaoEndLogradouro` | String | ✅ |
| `end_organizacao/organizacao_numero` | `organizacao_end_numero` | `organizacaoEndNumero` | String | ✅ |
| `end_organizacao/organizacao_cep` | `organizacao_end_cep` | `organizacaoEndCep` | String(8) | ✅ |
| `end_organizacao/organizacao_bairro` | `organizacao_end_bairro` | `organizacaoEndBairro` | String | ✅ |
| `end_organizacao/organizacao_complemento` | `organizacao_end_complemento` | `organizacaoEndComplemento` | String | ✅ |

---

## 4. Dados do Representante Legal

| XML ODK | Schema Prisma | Frontend | Tipo | Implementado |
|---------|---------------|----------|------|--------------|
| `representante/representante_nome` | `representante_nome` | `representanteNome` | String | ✅ |
| `representante/representante_cpf` | `representante_cpf` | `representanteCpf` | String(11) | ✅ |
| `representante/representante_rg` | `representante_rg` | `representanteRg` | String | ✅ |
| `representante/representante_telefone` | `representante_telefone` | `representanteTelefone` | String | ✅ |
| `representante/representante_email` | `representante_email` | `representanteEmail` | String | ✅ |
| `end_representante/representante_logradouro` | `representante_end_logradouro` | `representanteEndLogradouro` | String | ✅ |
| `end_representante/representante_numero` | `representante_end_numero` | `representanteEndNumero` | String | ✅ |
| `end_representante/representante_cep` | `representante_end_cep` | `representanteEndCep` | String(8) | ✅ |
| `end_representante/representante_bairro` | `representante_end_bairro` | `representanteEndBairro` | String | ✅ |
| `end_representante/representante_complemento` | `representante_end_complemento` | `representanteEndComplemento` | String | ✅ |
| *(não existe no XML)* | `representante_funcao` | `representanteFuncao` | Int (FK) | ✅ |

---

## 5. Características dos Associados

### 5.1 Totais Gerais

| XML ODK | Schema Prisma | Frontend | Implementado |
|---------|---------------|----------|--------------|
| `caracteristicas/n_total_socios` | `caracteristicas_n_total_socios` | `caracteristicasNTotalSocios` | ⚠️ Cadastro |
| `caracteristicas/n_total_socios_caf` | `caracteristicas_n_total_socios_caf` | `caracteristicasNTotalSociosCaf` | ⚠️ Cadastro |
| `caracteristicas/n_distintos_caf` | `caracteristicas_n_distintos_caf` | `caracteristicasNDistintosCaf` | ⚠️ Cadastro |
| `caracteristicas/n_ativos_total` | `caracteristicas_n_ativos_total` | `caracteristicasNAtivosTotal` | ⚠️ Cadastro |
| `caracteristicas/n_ativos_caf` | `caracteristicas_n_ativos_caf` | `caracteristicasNAtivosCaf` | ⚠️ Cadastro |
| `caracteristicas/n_naosocio_op_total` | `caracteristicas_n_naosocio_op_total` | `caracteristicasNNaosocioOpTotal` | ⚠️ Cadastro |
| `caracteristicas/n_naosocio_op_caf` | `caracteristicas_n_naosocio_op_caf` | `caracteristicasNNaosocioOpCaf` | ⚠️ Cadastro |
| `caracteristicas/n_ingressaram_total_12_meses` | `caracteristicas_n_ingressaram_total_12_meses` | `caracteristicasNIngressaramTotal12Meses` | ⚠️ Cadastro |
| `caracteristicas/n_ingressaram_caf_12_meses` | `caracteristicas_n_ingressaram_caf_12_meses` | `caracteristicasNIngressaramCaf12Meses` | ⚠️ Cadastro |
| `caracteristicas/n_socios_paa` | `caracteristicas_n_socios_paa` | `caracteristicasNSociosPaa` | ⚠️ Cadastro |
| `caracteristicas/n_naosocios_paa` | `caracteristicas_n_naosocios_paa` | `caracteristicasNNaosociosPaa` | ⚠️ Cadastro |
| `caracteristicas/n_socios_pnae` | `caracteristicas_n_socios_pnae` | `caracteristicasNSociosPnae` | ⚠️ Cadastro |
| `caracteristicas/n_naosocios_pnae` | `caracteristicas_n_naosocios_pnae` | `caracteristicasNNaosociosPnae` | ⚠️ Cadastro |

⚠️ = Existe no cadastro, mas não na edição

### 5.2 Por Categoria e Gênero

| XML ODK | Schema Prisma | Frontend | Implementado |
|---------|---------------|----------|--------------|
| `caracteristicas/ta_af_homem` | `caracteristicas_ta_af_homem` | `caracteristicasTaAfHomem` | ⚠️ Cadastro |
| `caracteristicas/ta_af_mulher` | `caracteristicas_ta_af_mulher` | `caracteristicasTaAfMulher` | ⚠️ Cadastro |
| `caracteristicas/ta_a_homem` | `caracteristicas_ta_a_homem` | `caracteristicasTaAHomem` | ⚠️ Cadastro |
| `caracteristicas/ta_a_mulher` | `caracteristicas_ta_a_mulher` | `caracteristicasTaAMulher` | ⚠️ Cadastro |
| `caracteristicas/ta_p_homem` | `caracteristicas_ta_p_homem` | `caracteristicasTaPHomem` | ⚠️ Cadastro |
| `caracteristicas/ta_p_mulher` | `caracteristicas_ta_p_mulher` | `caracteristicasTaPMulher` | ⚠️ Cadastro |
| `caracteristicas/ta_i_homem` | `caracteristicas_ta_i_homem` | `caracteristicasTaIHomem` | ⚠️ Cadastro |
| `caracteristicas/ta_i_mulher` | `caracteristicas_ta_i_mulher` | `caracteristicasTaIMulher` | ⚠️ Cadastro |
| `caracteristicas/ta_q_homem` | `caracteristicas_ta_q_homem` | `caracteristicasTaQHomem` | ⚠️ Cadastro |
| `caracteristicas/ta_q_mulher` | `caracteristicas_ta_q_mulher` | `caracteristicasTaQMulher` | ⚠️ Cadastro |
| `caracteristicas/ta_e_homem` | `caracteristicas_ta_e_homem` | `caracteristicasTaEHomem` | ⚠️ Cadastro |
| `caracteristicas/ta_e_mulher` | `caracteristicas_ta_e_mulher` | `caracteristicasTaEMulher` | ⚠️ Cadastro |
| `caracteristicas/ta_o_homem` | `caracteristicas_ta_o_homem` | `caracteristicasTaOHomem` | ⚠️ Cadastro |
| `caracteristicas/ta_o_mulher` | `caracteristicas_ta_o_mulher` | `caracteristicasTaOMulher` | ⚠️ Cadastro |

**Categorias**:
- `af` = Agricultura Familiar
- `a` = Assentado
- `p` = Pescador
- `i` = Indígena
- `q` = Quilombola
- `e` = Extrativista
- `o` = Outro

### 5.3 Por Tipo de Produção

| XML ODK | Schema Prisma | Frontend | Implementado |
|---------|---------------|----------|--------------|
| `caracteristicas/ta_caf_organico` | `caracteristicas_ta_caf_organico` | `caracteristicasTaCafOrganico` | ⚠️ Cadastro |
| `caracteristicas/ta_caf_agroecologico` | `caracteristicas_ta_caf_agroecologico` | `caracteristicasTaCafAgroecologico` | ⚠️ Cadastro |
| `caracteristicas/ta_caf_transicao` | `caracteristicas_ta_caf_transicao` | `caracteristicasTaCafTransicao` | ⚠️ Cadastro |
| `caracteristicas/ta_caf_convencional` | `caracteristicas_ta_caf_convencional` | `caracteristicasTaCafConvencional` | ⚠️ Cadastro |

---

## 6. Tabelas Relacionadas (Repeating Groups)

### 6.1 Arquivos

| XML ODK | Schema Prisma | Tabela | FK |
|---------|---------------|--------|-----|
| `file/arquivo` | `arquivo` | `organizacao_arquivo` | `id_organizacao` |
| `file/arquivo_obs` | `obs` | `organizacao_arquivo` | - |
| `sim_nao_file` | `sim_nao_file` | `organizacao` | - |

### 6.2 Produção

| XML ODK | Schema Prisma | Tabela | FK |
|---------|---------------|--------|-----|
| `producao/cultura` | `cultura` | `organizacao_producao` | `id_organizacao` |
| `producao/mensal` | `mensal` | `organizacao_producao` | - |
| `producao/anual` | `anual` | `organizacao_producao` | - |
| `sim_nao_producao` | `sim_nao_producao` | `organizacao` | - |

### 6.3 Abrangência Geográfica (Sócios PF)

| XML ODK | Schema Prisma | Tabela | FK |
|---------|---------------|--------|-----|
| `abrangencia_socios/estado_socio` | `estado` | `organizacao_abrangencia_socio` | `id_organizacao` |
| `abrangencia_socios/municipio_ibge_socio` | `municipio` | `organizacao_abrangencia_socio` | - |
| `abrangencia_socios/num_socios` | `num_socios` | `organizacao_abrangencia_socio` | - |
| `sim_nao_socio` | `sim_nao_socio` | `organizacao` | - |

### 6.4 Associados Pessoa Jurídica

| XML ODK | Schema Prisma | Tabela | FK |
|---------|---------------|--------|-----|
| `abrangencia_pj/estado_cnpj` | `estado` | `organizacao_abrangencia_pj` | `id_organizacao` |
| `abrangencia_pj/municipio_ibge_cnpj` | `municipio` | `organizacao_abrangencia_pj` | - |
| `abrangencia_pj/dados_cnpj/cnpj_pj` | `cnpj_pj` | `organizacao_abrangencia_pj` | - |
| `abrangencia_pj/dados_cnpj/razao_social` | `razao_social` | `organizacao_abrangencia_pj` | - |
| `abrangencia_pj/dados_cnpj/sigla` | `sigla` | `organizacao_abrangencia_pj` | - |
| `abrangencia_pj/dados_cnpj/num_socios_total` | `num_socios_total` | `organizacao_abrangencia_pj` | - |
| `abrangencia_pj/dados_cnpj/num_socios_caf` | `num_socios_caf` | `organizacao_abrangencia_pj` | - |
| `sim_nao_pj` | `sim_nao_pj` | `organizacao` | - |

### 6.5 Fotos

| XML ODK | Schema Prisma | Tabela | FK |
|---------|---------------|--------|-----|
| `fotos/grupo` | `grupo` | `organizacao_foto` | `id_organizacao` |
| `fotos/foto` | `foto` | `organizacao_foto` | - |
| `fotos/foto_obs` | `obs` | `organizacao_foto` | - |

### 6.6 Participantes

| XML ODK | Schema Prisma | Tabela | FK |
|---------|---------------|--------|-----|
| `participantes/participante_nome` | `nome` | `organizacao_participante` | `id_organizacao` |
| `participantes/participante_cpf` | `cpf` | `organizacao_participante` | - |
| `participantes/participante_telefone` | `telefone` | `organizacao_participante` | - |
| `participantes/participante_relacao` | `relacao` | `organizacao_participante` | - |
| `participantes/participante_relacao_outros` | `relacao_outros` | `organizacao_participante` | - |
| `participantes/participante_assinatura` | `assinatura` | `organizacao_participante` | - |
| `participantes_menos_10` | `participantes_menos_10` | `organizacao` | - |

---

## 7. Práticas Gerenciais - Template de Mapeamento

**Padrão para TODAS as práticas**:

```
XML: [area]/[subarea]_[numero]_[campo]
Schema: [area]_[subarea]_[numero]_[campo]
Frontend: [area][Subarea][Numero][Campo]
```

**Campos**:
- `_resposta` → `Resposta` (Int: 1=Sim, 2=Não, 3=Parcial, 4=NA)
- `_comentario` → `Comentario` (String)
- `_proposta` → `Proposta` (String)

### 7.1 Governança Organizacional (GO)

**Estrutura Organizacional** (1-4):
```
XML: go/estrutura_1_resposta → Schema: go_estrutura_1_resposta → Frontend: goEstrutura1Resposta
XML: go/estrutura_1_comentario → Schema: go_estrutura_1_comentario → Frontend: goEstrutura1Comentario
XML: go/estrutura_1_proposta → Schema: go_estrutura_1_proposta → Frontend: goEstrutura1Proposta
```

**Estratégia Organizacional** (5-6):
```
XML: go/estrategia_5_resposta → Schema: go_estrategia_5_resposta → Frontend: goEstrategia5Resposta
```

**Organização dos Associados** (7-13):
```
XML: go/organizacao_7_resposta → Schema: go_organizacao_7_resposta → Frontend: goOrganizacao7Resposta
```

**Direção e Participação** (14-21):
```
XML: go/direcao_14_resposta → Schema: go_direcao_14_resposta → Frontend: goDirecao14Resposta
```

**Controles Internos** (22-27 no XML, 20-25 no Schema ⚠️):
```
XML: go/controle_22_resposta → Schema: go_controle_20_resposta ⚠️ → Frontend: goControle20Resposta
XML: go/controle_23_resposta → Schema: go_controle_21_resposta ⚠️
XML: go/controle_24_resposta → Schema: go_controle_22_resposta ⚠️
XML: go/controle_25_resposta → Schema: go_controle_23_resposta ⚠️
XML: go/controle_26_resposta → Schema: go_controle_24_resposta ⚠️
XML: go/controle_27_resposta → Schema: go_controle_25_resposta ⚠️
```

**Educação e Formação** (28-30 no XML, 26-28 no Schema ⚠️):
```
XML: go/educacao_28_resposta → Schema: go_educacao_26_resposta ⚠️
XML: go/educacao_29_resposta → Schema: go_educacao_27_resposta ⚠️
XML: go/educacao_30_resposta → Schema: go_educacao_28_resposta ⚠️
```

### 7.2 Gestão de Pessoas (GP)

**Organização das Pessoas** (1-9):
```
XML: gp/p_organizacao_1_resposta → Schema: gp_p_organizacao_1_resposta → Frontend: gpPOrganizacao1Resposta
```

**Desenvolvimento** (10-13):
```
XML: gp/p_desenvolvimento_10_resposta → Schema: gp_p_desenvolvimento_10_resposta
```

**Trabalho** (14-17):
```
XML: gp/trabalho_14_resposta → Schema: gp_trabalho_14_resposta
```

**Geração** (18-20):
```
XML: gp/geracao_18_resposta → Schema: gp_geracao_18_resposta
```

### 7.3 Gestão Financeira (GF)

**Balanço** (1-4):
```
XML: gf/balanco_1_resposta → Schema: gf_balanco_1_resposta → Frontend: gfBalanco1Resposta
```

**Contas** (5-13):
```
XML: gf/contas_5_resposta → Schema: gf_contas_5_resposta
```

**Caixa** (14-16):
```
XML: gf/caixa_14_resposta → Schema: gf_caixa_14_resposta
```

**Estoque** (17-19):
```
XML: gf/estoque_17_resposta → Schema: gf_estoque_17_resposta
```

**Resultado** (20-21):
```
XML: gf/resultado_20_resposta → Schema: gf_resultado_20_resposta
```

**Análise** (22-24):
```
XML: gf/analise_22_resposta → Schema: gf_analise_22_resposta
```

**Fiscal** (25-26):
```
XML: gf/fiscal_25_resposta → Schema: gf_fiscal_25_resposta
```

### 7.4 Gestão Comercial (GC)

**Estrutura Comercial** (1-9):
```
XML: gc/e_comercial_1_resposta → Schema: gc_e_comercial_1_resposta → Frontend: gcEComercial1Resposta
```

**Mercado** (10-15):
```
XML: gc/mercado_10_resposta → Schema: gc_mercado_10_resposta
```

**Comercial** (16-21 no XML, 15-20 no Schema ⚠️):
```
XML: gc/comercial_16_resposta → Schema: gc_comercial_15_resposta ⚠️
XML: gc/comercial_17_resposta → Schema: gc_comercial_16_resposta ⚠️
XML: gc/comercial_18_resposta → Schema: gc_comercial_17_resposta ⚠️
XML: gc/comercial_19_resposta → Schema: gc_comercial_18_resposta ⚠️
XML: gc/comercial_20_resposta → Schema: gc_comercial_19_resposta ⚠️
XML: gc/comercial_21_resposta → Schema: gc_comercial_20_resposta ⚠️
```

**Modelo** (22-28 no XML, 21-27 no Schema ⚠️):
```
XML: gc/modelo_22_resposta → Schema: gc_modelo_21_resposta ⚠️
XML: gc/modelo_23_resposta → Schema: gc_modelo_22_resposta ⚠️
XML: gc/modelo_24_resposta → Schema: gc_modelo_23_resposta ⚠️
XML: gc/modelo_25_resposta → Schema: gc_modelo_24_resposta ⚠️
XML: gc/modelo_26_resposta → Schema: gc_modelo_25_resposta ⚠️
XML: gc/modelo_27_resposta → Schema: gc_modelo_26_resposta ⚠️
XML: gc/modelo_28_resposta → Schema: gc_modelo_27_resposta ⚠️
```

### 7.5 Processos Produtivos (GPP)

**Regularidade Sanitária** (1-3):
```
XML: gpp/reg_sanitaria_1_resposta → Schema: gpp_reg_sanitaria_1_resposta
```

**Planejamento** (4-6):
```
XML: gpp/planejamento_4_resposta → Schema: gpp_planejamento_4_resposta
```

**Logística** (7-12):
```
XML: gpp/logistica_7_resposta → Schema: gpp_logistica_7_resposta
```

**Valor** (13-15):
```
XML: gpp/valor_13_resposta → Schema: gpp_valor_13_resposta
```

**Fluxo** (16-22):
```
XML: gpp/fluxo_16_resposta → Schema: gpp_fluxo_16_resposta
```

**Qualidade** (23-28):
```
XML: gpp/qualidade_23_resposta → Schema: gpp_qualidade_23_resposta
```

**Produção/Bens** (29):
```
XML: gpp/producao_29_resposta → Schema: gpp_producao_29_resposta
```

### 7.6 Gestão da Inovação (GI)

**Inovação, Informações e Conhecimento** (1-5):
```
XML: gi/iic_1_resposta → Schema: gi_iic_1_resposta → Frontend: giIic1Resposta
```

**Monitoramento, Aprendizagem e Reconhecimento** (6-9):
```
XML: gi/mar_6_resposta → Schema: gi_mar_6_resposta
```

**Time** (10-14):
```
XML: gi/time_10_resposta → Schema: gi_time_10_resposta
```

### 7.7 Gestão Socioambiental (GS)

**Socioambiental** (1-5):
```
XML: gs/socioambiental_1_resposta → Schema: gs_socioambiental_1_resposta → Frontend: gsSocioambiental1Resposta
```

**Ambiental** (6-9):
```
XML: gs/ambiental_6_resposta → Schema: gs_ambiental_6_resposta
```

**Regularidade Ambiental** (10-14):
```
XML: gs/reg_ambiental_10_resposta → Schema: gs_reg_ambiental_10_resposta
```

**Impactos Ambientais** (15-22):
```
XML: gs/impactos_ambiental_15_resposta → Schema: gs_impactos_ambiental_15_resposta
```

### 7.8 Infraestrutura Sustentável (IS)

**Eficiência Energética** (1-4):
```
XML: is/eficiencia_energetica_1_resposta → Schema: is_eficiencia_energetica_1_resposta → Frontend: isEficienciaEnergetica1Resposta
```

**Recursos Naturais** (5-8):
```
XML: is/recursos_naturais_5_resposta → Schema: is_recursos_naturais_5_resposta
```

**Água** (9-10):
```
XML: is/agua_9_resposta → Schema: is_agua_9_resposta
```

**Conforto Ambiental** (11-14):
```
XML: is/conforto_ambiental_11_resposta → Schema: is_conforto_ambiental_11_resposta
```

**Resíduos** (15-18):
```
XML: is/residuos_15_resposta → Schema: is_residuos_15_resposta
```

---

## 8. Campos Complementares

| XML ODK | Schema Prisma | Frontend | Implementado |
|---------|---------------|----------|--------------|
| `descricao` | `descricao` | `descricao` | ❌ |
| `eixos_trabalhados` | `eixos_trabalhados` | `eixosTrabalhados` | ❌ |
| `enfase` | `enfase` | `enfase` | ❌ |
| `enfase_outros` | `enfase_outros` | `enfaseOutros` | ❌ |
| `metodologia` | `metodologia` | `metodologia` | ❌ |
| `orientacoes` | `orientacoes` | `orientacoes` | ❌ |
| `obs` | `obs` | `obs` | ❌ |
| `assinatura_resp_legal` | `assinatura_rep_legal` | `assinaturaRepLegal` | ❌ |

---

## 9. Metadados ODK

| XML ODK | Schema Prisma | Tipo |
|---------|---------------|------|
| `meta/instanceID` | `meta_instance_id` | String |
| `meta/instanceName` | `meta_instance_name` | String |
| *(calculado)* | `uri` (com prefixo `_uri`) | String(80) |
| *(calculado)* | `creator_uri_user` | String(80) |
| *(calculado)* | `creation_date` | Timestamp |
| *(calculado)* | `last_update_uri_user` | String(80) |
| *(calculado)* | `last_update_date` | Timestamp |
| *(calculado)* | `model_version` | Int |
| *(calculado)* | `ui_version` | Int |
| *(calculado)* | `is_complete` | Boolean |
| *(calculado)* | `submission_date` | Timestamp |
| *(calculado)* | `marked_as_complete_date` | Timestamp |

**Nota**: Todos os metadados com prefixo `_` são mapeados no Prisma com `@map("_campo_name")`.

---

## 10. Tabelas de Apoio (pinovara_aux)

### 10.1 Estados

| Campo Schema | Tipo | Descrição |
|--------------|------|-----------|
| `id` | Int | 1-27 |
| `descricao` | String | Nome do estado |

### 10.2 Municípios IBGE

| Campo Schema | Tipo | Descrição |
|--------------|------|-----------|
| `id` | Int | Código IBGE |
| `descricao` | String | Nome do município |
| `id_estado` | Int | FK para estado |

### 10.3 Respostas (Práticas)

| Campo Schema | Tipo | Descrição |
|--------------|------|-----------|
| `id` | Int | 1-4 |
| `descricao` | String | Sim/Não/Parcial/Não se Aplica |

### 10.4 Sim/Não

| Campo Schema | Tipo | Descrição |
|--------------|------|-----------|
| `id` | Int | 1-2 |
| `descricao` | String | Sim/Não |

### 10.5 Grupo (Fotos)

| Campo Schema | Tipo | Descrição |
|--------------|------|-----------|
| `id` | Int | 1-6, 99 |
| `descricao` | String | Categoria da foto |

### 10.6 Funcao (Representante)

| Campo Schema | Tipo | Descrição |
|--------------|------|-----------|
| `id` | Int | Código da função |
| `descricao` | String | Nome da função |

**Nota**: Este campo existe no schema mas não no XML ODK.

### 10.7 Enfase

| Campo Schema | Tipo | Descrição |
|--------------|------|-----------|
| `id` | Int | 1-5, 99 |
| `descricao` | String | PNAE, PAA Leite, etc. |

### 10.8 Relacao (Participantes)

| Campo Schema | Tipo | Descrição |
|--------------|------|-----------|
| `id` | Int | 1-4, 99 |
| `descricao` | String | Diretor, Conselheiro, Associado, etc. |

### 10.9 Indicador

| Campo Schema | Tipo | Descrição |
|--------------|------|-----------|
| `id` | Int | 1-16 |
| `descricao` | String | Nome do indicador |

**Nota**: Relacionamento many-to-many via `organizacao_indicador`

---

## 11. Divergências Críticas a Resolver

### 11.1 Numeração de Práticas

| Área | Subárea | XML ODK | Schema Prisma | Ação Recomendada |
|------|---------|---------|---------------|------------------|
| GO | Controles | 22-27 | 20-25 | **Seguir XML** - Atualizar schema ou criar alias no backend |
| GO | Educação | 28-30 | 26-28 | **Seguir XML** - Atualizar schema ou criar alias no backend |
| GC | Comercial | 16-21 | 15-20 | **Seguir XML** - Atualizar schema ou criar alias no backend |
| GC | Modelo | 22-28 | 21-27 | **Seguir XML** - Atualizar schema ou criar alias no backend |

### 11.2 Campos Extras no Schema

| Campo Schema | Existe no XML? | Uso Presumido |
|--------------|----------------|---------------|
| `representante_funcao` | ❌ | Adicionado para o sistema web |
| `removido` | ❌ | Soft delete no sistema |
| `id_tecnico` | ❌ | Técnico responsável no sistema |
| `complementado` | ❌ | Flag de dados complementados no web |

**Recomendação**: Manter estes campos no schema pois são úteis para o sistema web, mas não forçar preenchimento via ODK.

### 11.3 Campos do XML Não Mapeados

| XML ODK | Schema | Ação Necessária |
|---------|--------|-----------------|
| `paa` (modalidade) | ❌ Falta tabela | Criar tabela `organizacao_paa` ou campo `paa_modalidade` |

---

## 12. Regras de Conversão de Nomenclatura

### 12.1 Snake Case (DB) → Camel Case (Frontend)

```javascript
// Exemplo de função utilitária
function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

// Exemplos:
'caracteristicas_n_total_socios' → 'caracteristicasNTotalSocios'
'go_estrutura_1_resposta' → 'goEstrutura1Resposta'
'representante_end_logradouro' → 'representanteEndLogradouro'
```

### 12.2 Padrão de Agrupamento Frontend

**Componentes React**:
- Dados simples: Um objeto flat
- Repeating groups: Array de objetos
- Práticas: Agrupadas por área e subárea

```typescript
interface CaracteristicasAssociados {
  nTotalSocios: number;
  nTotalSociosCaf: number;
  // ... todos os campos de características
}

interface Producao {
  cultura: string;
  mensal: number;
  anual: number;
}

interface PraticaGerencial {
  resposta: number; // 1-4
  comentario?: string;
  proposta?: string;
}

interface GovernancaOrganizacional {
  estrutura1: PraticaGerencial;
  estrutura2: PraticaGerencial;
  // ... todas as práticas
}
```

---

## 13. Componentes Frontend a Criar

### 13.1 Mapeamento de Responsabilidades

| Componente | Campos XML | Tabelas DB | Status |
|------------|-----------|------------|--------|
| `DadosBasicos.tsx` | `dados/*` | `organizacao` (campos diretos) | ✅ Existe |
| `EnderecoLocalizacao.tsx` | `estado`, `municipio_ibge`, `gps`, `end_organizacao/*` | `organizacao` | ✅ Existe |
| `DadosRepresentante.tsx` | `representante/*`, `end_representante/*` | `organizacao` | ✅ Existe |
| `CaracteristicasAssociados.tsx` | `caracteristicas/*` | `organizacao` | ❌ CRIAR |
| `AbrangenciaGeografica.tsx` | `abrangencia_socios` | `organizacao_abrangencia_socio` | ❌ CRIAR |
| `AssociadosJuridicos.tsx` | `abrangencia_pj` | `organizacao_abrangencia_pj` | ❌ CRIAR |
| `ProducaoOrganizacao.tsx` | `producao` | `organizacao_producao` | ❌ CRIAR |
| `UploadDocumentos.tsx` | `file` | `organizacao_arquivo` | ✅ Existe |
| `UploadFotos.tsx` | `fotos` | `organizacao_foto` | ✅ Existe |
| `diagnostico/GovernancaOrganizacional.tsx` | `go/*` | `organizacao` | ⚠️ Parcial |
| `diagnostico/GestaoPessoas.tsx` | `gp/*` | `organizacao` | ⚠️ Parcial |
| `diagnostico/GestaoFinanceira.tsx` | `gf/*` | `organizacao` | ⚠️ Parcial |
| `diagnostico/GestaoComercial.tsx` | `gc/*` | `organizacao` | ❌ CRIAR |
| `diagnostico/ProcessosProdutivos.tsx` | `gpp/*` | `organizacao` | ❌ CRIAR |
| `diagnostico/GestaoInovacao.tsx` | `gi/*` | `organizacao` | ❌ CRIAR |
| `diagnostico/GestaoSocioambiental.tsx` | `gs/*` | `organizacao` | ❌ CRIAR |
| `diagnostico/InfraestruturaSustentavel.tsx` | `is/*` | `organizacao` | ❌ CRIAR |
| `OrientacoesTecnicas.tsx` | `eixos_trabalhados`, `enfase`, `metodologia`, `orientacoes` | `organizacao` | ❌ CRIAR |
| `IndicadoresAtividade.tsx` | `indicadores` | `organizacao_indicador` | ❌ CRIAR |
| `ParticipantesAtividade.tsx` | `participantes` | `organizacao_participante` | ❌ CRIAR |
| `Observacoes.tsx` | `obs`, `assinatura_resp_legal` | `organizacao` | ❌ CRIAR |
| `DadosColeta.tsx` | Metadados ODK | `organizacao` | ✅ Existe |

---

## 14. API Endpoints Necessários

### 14.1 Endpoints Principais (organizacao)

```
GET    /api/organizacoes/:id
PUT    /api/organizacoes/:id
DELETE /api/organizacoes/:id
```

### 14.2 Endpoints para Características (campos diretos)

```
PATCH  /api/organizacoes/:id/caracteristicas
```

### 14.3 Endpoints para Tabelas Relacionadas

```
# Abrangência Geográfica
GET    /api/organizacoes/:id/abrangencia-socios
POST   /api/organizacoes/:id/abrangencia-socios
PUT    /api/organizacoes/:id/abrangencia-socios/:itemId
DELETE /api/organizacoes/:id/abrangencia-socios/:itemId

# Associados PJ
GET    /api/organizacoes/:id/abrangencia-pj
POST   /api/organizacoes/:id/abrangencia-pj
PUT    /api/organizacoes/:id/abrangencia-pj/:itemId
DELETE /api/organizacoes/:id/abrangencia-pj/:itemId

# Produção
GET    /api/organizacoes/:id/producao
POST   /api/organizacoes/:id/producao
PUT    /api/organizacoes/:id/producao/:itemId
DELETE /api/organizacoes/:id/producao/:itemId

# Participantes
GET    /api/organizacoes/:id/participantes
POST   /api/organizacoes/:id/participantes
PUT    /api/organizacoes/:id/participantes/:itemId
DELETE /api/organizacoes/:id/participantes/:itemId

# Indicadores
GET    /api/organizacoes/:id/indicadores
POST   /api/organizacoes/:id/indicadores
DELETE /api/organizacoes/:id/indicadores/:indicadorId
```

### 14.4 Endpoints Auxiliares

```
GET /api/estados
GET /api/municipios?estadoId=:id
GET /api/listas/resposta
GET /api/listas/sim-nao
GET /api/listas/grupo-foto
GET /api/listas/enfase
GET /api/listas/relacao
GET /api/listas/indicador
GET /api/listas/funcao
```

---

## 15. Convenções de Código

### 15.1 TypeScript Interfaces

**Convenção de nomes**:
```typescript
// Organização principal
interface Organizacao {
  id: number;
  nome: string;
  cnpj: string;
  // ... snake_case do DB convertido para camelCase
}

// Características (embedded)
interface CaracteristicasAssociados {
  nTotalSocios: number;
  nTotalSociosCaf: number;
  // ...
}

// Prática individual
interface PraticaGerencial {
  resposta: number | null;
  comentario: string | null;
  proposta: string | null;
}

// Subárea completa
interface GovernancaEstrutura {
  pratica1: PraticaGerencial;
  pratica2: PraticaGerencial;
  pratica3: PraticaGerencial;
  pratica4: PraticaGerencial;
}

// Área completa
interface GovernancaOrganizacional {
  estrutura: GovernancaEstrutura;
  estrategia: GovernancaEstrategia;
  organizacao: GovernancaOrganizacaoAssociados;
  direcao: GovernancaDirecao;
  controle: GovernancaControles;
  educacao: GovernancaEducacao;
}

// Tabela relacionada (repeating group)
interface AbrangenciaSocio {
  id?: number;
  uri?: string;
  estado: number;
  municipio: number;
  numSocios: number;
  idOrganizacao?: number;
}
```

### 15.2 Props de Componentes

**Padrão Accordion**:
```typescript
interface AccordionComponentProps {
  organizacao: Organizacao;
  onUpdate: (campo: string, valor: any) => Promise<void>;
  accordionAberto: string | null;
  onToggleAccordion: (id: string) => void;
}
```

**Padrão Tabela Relacionada (com CRUD)**:
```typescript
interface RelatedTableComponentProps {
  organizacaoId: number;
  accordionAberto: string | null;
  onToggleAccordion: (id: string) => void;
}
```

---

## 16. Utilitários de Conversão

### 16.1 Conversão DB → Frontend

```typescript
// Converter objeto do backend para frontend
function dbToFrontend(dbData: any): any {
  const result: any = {};
  for (const [key, value] of Object.entries(dbData)) {
    const camelKey = snakeToCamel(key);
    result[camelKey] = value;
  }
  return result;
}
```

### 16.2 Conversão Frontend → DB

```typescript
// Converter objeto do frontend para backend
function frontendToDb(frontendData: any): any {
  const result: any = {};
  for (const [key, value] of Object.entries(frontendData)) {
    const snakeKey = camelToSnake(key);
    result[snakeKey] = value;
  }
  return result;
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}
```

### 16.3 Converter Práticas para Estrutura Hierárquica

```typescript
// Agrupar práticas flat em estrutura hierárquica
function organizarPraticas(organizacao: any, prefixo: string) {
  const subareas: any = {};
  
  // Extrair todas as práticas com o prefixo
  const regex = new RegExp(`^${prefixo}_([a-z_]+)_(\\d+)_(resposta|comentario|proposta)$`);
  
  for (const [key, value] of Object.entries(organizacao)) {
    const match = key.match(regex);
    if (match) {
      const [, subarea, numero, campo] = match;
      if (!subareas[subarea]) subareas[subarea] = {};
      if (!subareas[subarea][numero]) subareas[subarea][numero] = {};
      subareas[subarea][numero][campo] = value;
    }
  }
  
  return subareas;
}

// Exemplo de uso:
const governanca = organizarPraticas(organizacao, 'go');
// Retorna: { estrutura: { 1: {resposta, comentario, proposta}, 2: {...}, ... }, ... }
```

---

## 17. Mapeamento de Status de Implementação

| Seção | Leitura | Edição | CRUD Completo | Prioridade |
|-------|---------|--------|---------------|------------|
| Dados Básicos | ✅ | ✅ | ✅ | - |
| Endereço/Localização | ✅ | ✅ | ✅ | - |
| Representante | ✅ | ✅ | ✅ | - |
| Características | ⚠️ | ⚠️ | ❌ | **ALTA** |
| Abrangência Sócios | ❌ | ❌ | ❌ | **ALTA** |
| Associados PJ | ❌ | ❌ | ❌ | MÉDIA |
| Produção | ❌ | ❌ | ❌ | **ALTA** |
| Arquivos | ✅ | ✅ | ✅ | - |
| Fotos | ✅ | ✅ | ✅ | - |
| GO - Governança | ⚠️ | ⚠️ | ⚠️ | MÉDIA |
| GP - Pessoas | ⚠️ | ⚠️ | ⚠️ | MÉDIA |
| GF - Financeira | ⚠️ | ⚠️ | ⚠️ | MÉDIA |
| GC - Comercial | ❌ | ❌ | ❌ | **ALTA** |
| GPP - Processos | ❌ | ❌ | ❌ | **ALTA** |
| GI - Inovação | ❌ | ❌ | ❌ | MÉDIA |
| GS - Socioambiental | ❌ | ❌ | ❌ | **ALTA** |
| IS - Infraestrutura | ❌ | ❌ | ❌ | MÉDIA |
| Orientações Técnicas | ❌ | ❌ | ❌ | BAIXA |
| Indicadores | ❌ | ❌ | ❌ | BAIXA |
| Participantes | ❌ | ❌ | ❌ | BAIXA |
| Observações | ❌ | ❌ | ❌ | MÉDIA |

**Legenda**:
- ✅ = Completamente implementado
- ⚠️ = Parcialmente implementado
- ❌ = Não implementado

---

## 18. Checklist de Implementação por Componente

### Template para Cada Novo Componente

- [ ] Criar interface TypeScript
- [ ] Criar componente React
- [ ] Implementar validações frontend
- [ ] Criar/verificar endpoint backend
- [ ] Adicionar ao accordion principal
- [ ] Implementar auto-save com debounce
- [ ] Adicionar feedback visual (success/error)
- [ ] Testar responsividade
- [ ] Documentar no CLAUDE.md ou README
- [ ] Testar com dados reais do ODK

---

## Observações Finais

1. **Priorização**: Começar por Características e Abrangência pois são dados fundamentais que já existem no banco vindos do ODK.

2. **Divergências de Numeração**: Criar uma camada de adaptação no backend para mapear entre a numeração do schema e a do XML, OU atualizar o schema (requer migração - **não fazer sem aprovação do DBA**).

3. **Performance**: Com ~625 campos, é essencial usar técnicas de lazy loading, paginação e debounce em todos os formulários.

4. **Validação**: Manter validações síncronas no frontend e assíncronas no backend para melhor UX.

5. **Testes**: Cada componente deve ser testado com dados reais vindos do ODK para garantir compatibilidade total.
