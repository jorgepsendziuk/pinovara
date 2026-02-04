# Análise Profunda do Formulário de Famílias - XML ODK

## Visão Geral

Este documento apresenta uma análise completa do formulário ODK para cadastro de famílias (`docs/familias.xml`), incluindo mapeamento de grupos, campos, labels, tipos de dados, valores possíveis e estruturas de arrays/repeats.

**Versão do Formulário:** 2026012123  
**ID do Formulário:** pinovara_individual

## Estrutura de Grupos

O formulário está organizado em grupos principais que correspondem às abas da interface:

### 1. Grupo `i` - Informações Iniciais
**Ref:** `/data/i`  
**Label:** "Informações Iniciais"

| Campo XML | Campo Banco | Label | Tipo | Obrigatório | Valores Possíveis |
|-----------|-------------|-------|------|-------------|-------------------|
| `i/q1_10` | `i_q1_10` | Número do lote - GEO | string | Sim* | Texto livre |
| `i/note_numeroimovel` | `i_note_numeroimovel` | (nota) | string | Não | Calculado |
| `i/q1_10_1` | `i_q1_10_1` | (campo adicional) | string | Não | Texto livre |
| `i/quilombo` | `i_quilombo` | Quilombo | string | Não | Texto livre |
| `i/q1_17` | `i_q1_17` | Família residente aceitou a visita? | select1 | Sim* | 1=Sim, 2=Não, 3=Não encontrado, 4=Imóvel vago, 5=Litígio, 6=Sim - Entrevista Remota |

**Campo relacionado:**
- `tem_nome` - O Técnico conseguiu o nome do Ocupante/Beneficiário? (Sim/Não)

### 2. Grupo `iuf` - Identificação da Unidade Familiar (Básica)
**Ref:** `/data/iuf`  
**Label:** "Identificação da Unidade Familiar"

| Campo XML | Campo Banco | Label | Tipo | Obrigatório |
|-----------|-------------|-------|------|-------------|
| `iuf/nome_ocupante` | `iuf_nome_ocupante` | Nome do ocupante atual | string | Sim* |
| `iuf/nome_conjuge` | `iuf_nome_conjuge` | Nome do cônjuge | string | Não |
| `iuf/prop_nome` | `iuf_prop_nome` | Nome da Propriedade | string | Sim* |
| `iuf/desc_acess` | `iuf_desc_acess` | Descrição de acesso ao imóvel | textarea | Sim* |

### 3. Grupo `g00_0` - Identificação Ocupante (Detalhada)
**Ref:** `/data/g00_0`  
**Label:** "Identificação da Unidade Familiar"

| Campo XML | Campo Banco | Label | Tipo | Obrigatório | Valores Possíveis |
|-----------|-------------|-------|------|-------------|-------------------|
| `g00_0/conhecido` | `g00_0_conhecido` | Conhecido por | string | Não | Texto livre |
| `g00_0/q1_2` | `g00_0_q1_2` | CPF | string | Sim* | 11 dígitos, validação CPF |
| `g00_0/sexo` | `g00_0_sexo` | Sexo | select1 | Sim* | 1=Masculino, 2=Feminino, 3=Outros |
| `g00_0/data_nascimento` | `g00_0_data_nascimento` | Data de Nascimento | date | Sim* | Data válida < hoje |
| `g00_0/idade` | `g00_0_idade` | Idade (em anos) | int | Sim* | Calculado automaticamente |
| `g00_0/nacionalidade` | `g00_0_nacionalidade` | Nacionalidade | select1 | Sim* | 1=Brasileira, 2=Estrangeira, 3=Brasileira Naturalizada |
| `g00_0/nascimento_uf` | `g00_0_nascimento_uf` | Estado de Nascimento | select1 | Sim* | Lista de estados (1-27) |
| `nascimento_mun` | `nascimento_mun` | Município de Nascimento do Ocupante Atual | select1 | Sim* | Lista de municípios (filtrado por UF) |
| `g00_0/identidade` | `g00_0_identidade` | Número Documento de Identidade | string | Sim* | Texto livre |
| `g00_0/identidade_orgao_t_doc` | `g00_0_identidade_orgao_t_doc` | Tipo de Documento | select1 | Sim* | 1=Carteira Identidade, 2=Carteira funcional, 3=CNH, 4=Passaporte, 5=CTPS |
| `g00_0/identidade_orgao` | `g00_0_identidade_orgao` | Órgão Emissor | string | Sim* | Texto livre |
| `g00_0/identidade_orgao_uf` | `g00_0_identidade_orgao_uf` | Órgão Emissor - UF | select1 | Sim* | Lista de estados |
| `g00_0/estado_civil` | `g00_0_estado_civil` | Estado civil | select1 | Sim* | 1=Casado(a), 2=Solteiro(a), 3=Separado(a), 4=Divorciado(a), 5=Viúvo(a), 7=União Estável, 8-11=Combinações |
| `g00_0/data_casamento` | `g00_0_data_casamento` | Data de Casamento | date | Não | Data válida |
| `g00_0/regime_bens` | `g00_0_regime_bens` | Regime de Bens | select1 | Não | 1=Comunhão Parcial, 2=Comunhão Universal, 3=Separação de Bens, 4=Participação Final, 5=Comunhão total |
| `g00_0/nome_mae` | `g00_0_nome_mae` | Nome da mãe | string | Sim* | Texto livre |
| `g00_0/profissao` | `g00_0_profissao` | Profissão | select1 | Sim* | Lista extensa (1=Agricultor(a), 2=Pecuarista, etc., 99=Outros, 100=Não possui) |
| `g00_0/profissao_outros` | `g00_0_profissao_outros` | Profissão - Outros | string | Não | Texto livre (se profissao=99) |
| `g00_0/aposentado` | `g00_0_aposentado` | Aposentado | select1 | Sim* | sim=Sim, nao=Não |
| `g00_0/ec_tel1` | `g00_0_ec_tel1` | Telefone - 1 (Somente Números) | string | Não | DDXXXXXXXXX |
| `g00_0/ec_tel2` | `g00_0_ec_tel2` | Telefone - 2 (Somente Números) | string | Não | DDXXXXXXXXX |
| `g00_0/email` | `g00_0_email` | E-mail | string | Não | Email válido |

### 4. Grupo `g00_0_1` - Identificação Cônjuge
**Ref:** `/data/g00_0_1`  
**Label:** "Identificação da Unidade Familiar - Cônjuge"

Campos similares ao grupo `g00_0`, mas com prefixo `conjuge_`:
- `g00_0_1/conjuge_conhecido` → `g00_0_1_conjuge_conhecido`
- `g00_0_1/conjuge_cpf` → `g00_0_1_conjuge_cpf`
- `g00_0_1/conjuge_sexo` → `g00_0_1_conjuge_sexo`
- `g00_0_1/conjuge_data_nascimento` → `g00_0_1_conjuge_data_nascimento`
- `g00_0_1/conjuge_idade` → `g00_0_1_conjuge_idade`
- `g00_0_1/conjuge_nacionalidade` → `g00_0_1_conjuge_nacionalidade`
- `g00_0_1/conjuge_nascimento_uf` → `g00_0_1_conjuge_nascimento_uf`
- `conjuge_nascimento_mun` → `conjuge_nascimento_mun`
- `g00_0_1/conjuge_identidade` → `g00_0_1_conjuge_identidade`
- `g00_0_1/conjuge_identidade_orgao_t_doc` → `g00_0_1_conjuge_identidade_orgao_t_doc`
- `g00_0_1/conjuge_identidade_orgao` → `g00_0_1_conjuge_identidade_orgao`
- `g00_0_1/conjuge_identidade_orgao_uf` → `g00_0_1_conjuge_identidade_orgao_uf`
- `g00_0_1/conjuge_estado_civil` → `g00_0_1_conjuge_estado_civil`
- `g00_0_1/conjuge_data_casamento` → `g00_0_1_conjuge_data_casamento`
- `g00_0_1/conjuge_regime_bens` → `g00_0_1_conjuge_regime_bens`
- `g00_0_1/conjuge_nome_mae` → `g00_0_1_conjuge_nome_mae`
- `g00_0_1/conjuge_profissao` → `g00_0_1_conjuge_profissao`
- `g00_0_1/conjuge_profissao_outros` → `g00_0_1_conjuge_profissao_outros`
- `g00_0_1/conjuge_aposentado` → `g00_0_1_conjuge_aposentado`
- `g00_0_1/conjuge_ec_tel1` → `g00_0_1_conjuge_ec_tel1`
- `g00_0_1/conjuge_ec_tel2` → `g00_0_1_conjuge_ec_tel2`
- `g00_0_1/conjuge_email` → `g00_0_1_conjuge_email`

### 5. Grupo `ec` - Endereço para Correspondência
**Ref:** `/data/ec`  
**Label:** "ENDEREÇO PARA CORRESPONDÊNCIA"

| Campo XML | Campo Banco | Label | Tipo | Obrigatório | Valores Possíveis |
|-----------|-------------|-------|------|-------------|-------------------|
| `ec/zona` | `ec_zona` | Zona de localização | select1 | Sim* | 1=Zona Rural, 2=Zona Urbana |
| `ec/ec_logrado` | `ec_logrado` | Endereço/Logradouro | string | Sim* | Texto livre |
| `ec/ec_numero` | `ec_numero` | Número | string | Sim* | Texto livre |
| `ec/ec_complem` | `ec_complem` | Complemento | string | Não | Texto livre |
| `ec/ec_bairro` | `ec_bairro` | Bairro | string | Não | Texto livre |
| `ec/ec_cep` | `ec_cep` | CEP (Somente Números) | string | Sim* | 8 dígitos |
| `ec/ec_uf` | `ec_uf` | Estado(UF) | select1 | Sim* | Lista de estados |
| `g1_1_1_ec_cod_ibg` | `g1_1_1_ec_cod_ibg` | Município | select1 | Sim* | Lista de municípios (filtrado por UF) |

### 6. Grupo `ii` - Informações do Imóvel
**Ref:** `/data/ii`  
**Label:** "Informações do Imóvel"

| Campo XML | Campo Banco | Label | Tipo | Obrigatório | Valores Possíveis |
|-----------|-------------|-------|------|-------------|-------------------|
| `ii/titulo_definitivo` | `ii_titulo_definitivo` | Possui título definitivo ou CCU? | select1 | Sim* | 1=Sim, 2=Não, 3=Não soube informar |
| `ii/titulo_quitado` | `ii_titulo_quitado` | O título foi quitado? | select1 | Sim* | 1=Sim, 2=Não, 3=Não soube informar, 4=Isento |
| `ii/titulo_baixa` | `ii_titulo_baixa` | Deu baixa nas cláusulas resolutivas? | select1 | Sim* | 1=Sim, 2=Não, 3=Não soube informar |
| `ii/linha_credito` | `ii_linha_credito` | Acessou alguma linha de crédito? | select1 | Sim* | sim=Sim, nao=Não |
| `ii/linha_credito_qual` | `ii_linha_credito_qual` | Se sim, qual linha de crédito? | string | Sim* (se linha_credito=sim) | Texto livre |
| `ii/fr_regularizacao` | `ii_fr_regularizacao` | Família residente está em processo de regularização fundiária? | select1 | Sim* | sim=Sim, nao=Não |
| `ii/fr_r_doc` | `ii_fr_r_doc` | A solicitação do processo de regularização foi realizada junto: | select1 | Sim* (se fr_regularizacao=sim) | 1=PGT, 2=Terra Legal, 3=Diretamente no INCRA, 99=Outro |
| `ii/fr_r_doc_outro` | `ii_fr_r_doc_outro` | Em caso de outro, digite aqui | string | Sim* (se fr_r_doc=99) | Texto livre |
| `ii/p_principal` | `ii_p_principal` | Processo Principal | string | Não | Texto livre |
| `ii/r_st` | `ii_r_st` | Requerimento-ST | string | Não | Texto livre |
| `ii/do_originaria` | `ii_do_originaria` | Data da ocupação originária do imóvel | date | Sim* | Data válida |
| `ii/do_atual` | `ii_do_atual` | Data da ocupação atual | date | Sim* | Data válida |
| `ii/o_primitivo` | `ii_o_primitivo` | É ocupante primitivo do imóvel? | select1 | Sim* | sim=Sim, nao=Não |
| `ii/din_urbano` | `ii_din_urbano` | Distância do imóvel ao núcleo urbano mais próximo (km) | decimal | Não | Número decimal |
| `ii/c_acesso` | `ii_c_acesso` | Condições de acesso ao núcleo urbano | select1 | Sim* | 1=Terrestre rodovia asfaltada, 2=Terrestre via não pavimentada, 3=Fluvial transporte hidroviário |
| `ii/car_possui` | `ii_car_possui` | A Unidade de Produção Familiar possui o CAR? | select1 | Sim* | sim=Sim, nao=Não |
| `ii/car_protocolo` | `ii_car_protocolo` | Protocolo - CAR | string | Sim* (se car_possui=sim) | Texto livre |
| `ii/georreferenciada` | `ii_georreferenciada` | Georreferenciada | select1 | Sim* | sim=Sim, nao=Não |
| `ii/ai_matricula` | `ii_ai_matricula` | Área do imóvel (ha) | decimal | Sim* | Número > 0 |
| `ii/declarada_medida` | `ii_declarada_medida` | Declarada ou medida? | select1 | Sim* | 1=Declarada, 2=Medida |
| `ii/vm_fiscal` | `ii_vm_fiscal` | Valor do módulo fiscal | decimal | Calculado | Calculado: ai_matricula / modulo_fiscal |
| `ii/d_possui` | `ii_d_possui` | Possui algum documento expedido por Órgão Público? | select1 | Sim* | sim=Sim, nao=Não |
| `ii/d_orgaopublico` | `ii_d_orgaopublico` | Espécie de documento expedido por Órgão Público | select1 | Sim* (se d_possui=sim) | 1=CATP, 2=CPCV, 3=AO, 99=Outros |
| `ii/d_orgaopublico_outros` | `ii_d_orgaopublico_outros` | Espécie de documento - Outros | string | Não (se d_orgaopublico=99) | Texto livre |
| `ii/d_cc_td` | `ii_d_cc_td` | Possui Título de Domínio? | select1 | Sim* | sim=Sim, nao=Não |
| `ii/d_cc_ccdru` | `ii_d_cc_ccdru` | Possui Concessão de Direito Real de Uso - CDRU? | select1 | Sim* | sim=Sim, nao=Não |
| `ii/d_sncr` | `ii_d_sncr` | Código no Sistema Nacional de Cadastro Rural (SNCR) | string | Não | Texto livre |
| `ii/d_certific` | `ii_d_certific` | Certificação do Imóvel no INCRA - SIGEF | string | Não | Texto livre |
| `ii/d_comprobatoria` | `ii_d_comprobatoria` | O requerente possui alguma documentação comprobatória associada ao lote? | select (múltiplo) | Não | Lista múltipla: 1=Título Domínio, 3=CCU, 4=Contrato Compra/Venda, 5=Contrato Doação, 6=GEO, 7=CAR, 8=Terra Legal, 9=Conta energia, 10=Declaração Sindicato/Associação, 2=Não possui, 99=Outros |
| `ii/d_comprobatoria_outros` | `ii_d_comprobatoria_outros` | Documentação comprobatória - Outro | string | Não (se d_comprobatoria contém 99) | Texto livre |

### 7. Grupo `qa` - Quadro de Áreas
**Ref:** `/data/qa`  
**Label:** "QUADRO DAS ÁREAS QUE COMPÕEM A UNIDADE DE PRODUÇÃO (EM HA)"

| Campo XML | Campo Banco | Label | Tipo | Obrigatório | Valores Possíveis |
|-----------|-------------|-------|------|-------------|-------------------|
| `qa/q3_6_0` | `qa_q3_6_0` | Área da sede (ha) | decimal | Sim* | Número >= 0 |
| `qa/q3_6_1` | `qa_q3_6_1` | Área de plantio próprio(ha) | decimal | Sim* | Número >= 0 |
| `qa/q3_6_2` | `qa_q3_6_2` | Área de mata nativa (ha) | decimal | Sim* | Número >= 0 |
| `qa/q3_6_3` | `qa_q3_6_3` | Área Florestada (Floresta Plantada) (ha) | decimal | Sim* | Número >= 0 |
| `qa/q3_6_4` | `qa_q3_6_4` | Área de pousio (ha) | decimal | Sim* | Número >= 0 |
| `qa/q3_6_5` | `qa_q3_6_5` | Área de pastagem nativa (ha) | decimal | Sim* | Número >= 0 |
| `qa/q3_6_6` | `qa_q3_6_6` | Área de pastagem plantada (ha) | decimal | Sim* | Número >= 0 |
| `qa/q3_6_7` | `qa_q3_6_7` | Área degradada (ha) | decimal | Sim* | Número >= 0 |

**Validação:** A soma de todas as áreas deve ser igual a `ii/ai_matricula` (área total do imóvel).

### 8. Grupo `rrf` - Requisitos para Regularização Fundiária
**Ref:** `/data/rrf`  
**Label:** "Requisitos para Regularização Fundiária"

| Campo XML | Campo Banco | Label | Tipo | Obrigatório | Valores Possíveis |
|-----------|-------------|-------|------|-------------|-------------------|
| `rrf/p_cultura` | `rrf_p_cultura` | Possui cultura | select1 | Sim* | sim=Sim, nao=Não |
| `rrf/eo_direta` | `rrf_eo_direta` | Exploração direta | select1 | Sim* | sim=Sim, nao=Não |
| `rrf/eo_forma` | `rrf_eo_forma` | Exploração forma | select1 | Sim* | sim=Sim, nao=Não |
| `rrf/ed_anterior` | `rrf_ed_anterior` | Exploração direta anterior | select1 | Sim* | sim=Sim, nao=Não |
| `rrf/ed_anterior_quem` | `rrf_ed_anterior_quem` | Exploração direta anterior - quem | select1 | Sim* (se ed_anterior=sim) | 1=Ocupante, 2=Antecessor |
| `rrf/oc_proprietario` | `rrf_oc_proprietario` | Ocupante proprietário | select1 | Sim* | sim=Sim, nao=Não |
| `rrf/oc_proprietario_quem` | `rrf_oc_proprietario_quem` | Ocupante proprietário - quem | select1 | Sim* (se oc_proprietario=sim) | 1=Ocupante, 2=Cônjuge, 3=Ambos |
| `rrf/oc_escravo` | `rrf_oc_escravo` | Ocupante escravo | select1 | Sim* | sim=Sim, nao=Não |
| `rrf/oc_escravo_quem` | `rrf_oc_escravo_quem` | Ocupante escravo - quem | select1 | Sim* (se oc_escravo=sim) | 1=Ocupante, 2=Cônjuge, 3=Ambos |
| `rrf/oc_beneficiado` | `rrf_oc_beneficiado` | Ocupante beneficiado | select1 | Sim* | sim=Sim, nao=Não |
| `rrf/oc_beneficiado_quem` | `rrf_oc_beneficiado_quem` | Ocupante beneficiado - quem | select1 | Sim* (se oc_beneficiado=sim) | 1=Ocupante, 2=Cônjuge, 3=Ambos |
| `rrf/oc_crime` | `rrf_oc_crime` | Ocupante crime | select1 | Sim* | sim=Sim, nao=Não |
| `rrf/oc_crime_quem` | `rrf_oc_crime_quem` | Ocupante crime - quem | select1 | Sim* (se oc_crime=sim) | 1=Ocupante, 2=Cônjuge, 3=Ambos |
| `rrf/oc_cargo` | `rrf_oc_cargo` | Ocupante cargo | select1 | Sim* | sim=Sim, nao=Não |

### 9. Grupo `nucleo` - Núcleo Familiar (ARRAY/REPEAT)
**Ref:** `/data/nucleo`  
**Label:** "IDENTIFICAÇÃO DO NÚCLEO FAMILIAR"  
**Tipo:** Repeat (array de objetos)

| Campo XML | Campo Banco | Label | Tipo | Obrigatório | Valores Possíveis |
|-----------|-------------|-------|------|-------------|-------------------|
| `nucleo/q2_1_1` | `nucleo[].q2_1_1` | Nome | string | Sim* | Texto livre |
| `nucleo/q2_1_2` | `nucleo[].q2_1_2` | Grau de parentesco | select1 | Sim* | 1=Responsável pelo lote, 2=Cônjuge, 3=Filhos, 4=Netos, 5=Pais, 6=Avós, 7=Sobrinho, 8=Enteado, 9=Dependentes, 10=Sogro(a), 11=Cunhado(a), 12=Tio(a), 13=Genro, 14=Nora, 15=Outro |
| `nucleo/q2_1_2_1` | `nucleo[].q2_1_2_1` | Em caso de Outro, digite aqui | string | Não | Texto livre (se q2_1_2=15) |
| `nucleo/q2_1_3` | `nucleo[].q2_1_3` | Sexo | select1 | Sim* | 1=Masculino, 2=Feminino, 3=Outros |
| `nucleo/q2_1_4` | `nucleo[].q2_1_4` | Data de Nascimento | date | Sim* | Data válida < hoje |
| `nucleo/q2_1_4_1` | `nucleo[].q2_1_4_1` | Idade (em anos) | int | Sim* | Calculado automaticamente |

### 10. Grupo `ir` - Informações de Renda
**Ref:** `/data/ir`  
**Label:** "INFORMAÇÕES DE RENDA"

| Campo XML | Campo Banco | Label | Tipo | Obrigatório | Valores Possíveis |
|-----------|-------------|-------|------|-------------|-------------------|
| `ir/q00_23` | `ir_q00_23` | Qual a renda bruta anual total da família (fora e dentro do lote) | select1 | Sim* | Lista de faixas: 0=R$ 0, 1=R$ 1 a R$ 20.999, 2=R$ 21.000 a R$ 40.999, ..., 11=Acima de R$ 400.000 |
| `ir/q00_26` | `ir_q00_26` | Quantos % da renda é a renda extra lote (fora do lote) | int | Sim* | 0-100 |
| `ir/q2_17` | `ir_q2_17` | A família recebe algum tipo de programa social governamental | select1 | Sim* | sim=Sim, nao=Não |
| `ir/q2_17_1` | `ir_q2_17_1` | Quais programas sociais | select (múltiplo) | Sim* (se q2_17=sim) | 1=Bolsa Família, 2=Cesta Básica, 3=Bolsa Verde, 99=Outros |
| `ir/q2_17_1_outro` | `ir_q2_17_1_outro` | Em caso de outros, escreva aqui qual programa social | string | Sim* (se q2_17_1 contém 99) | Texto livre |

### 11. Grupo `sb` - Saneamento Básico
**Ref:** `/data/sb`  
**Label:** "Saneamento Básico"

| Campo XML | Campo Banco | Label | Tipo | Obrigatório | Valores Possíveis |
|-----------|-------------|-------|------|-------------|-------------------|
| `sb/q2_10` | `sb_q2_10` | Saneamento básico da moradia (esgoto sanitário) | select (múltiplo) | Sim* | 1=Rede pública de esgoto, 2=Fossa rudimentar, 3=Fossa séptica, 4=Rio/canal/vala, 5=Não possui banheiro, 99=Outro |
| `sb/q2_10_outro` | `sb_q2_10_outro` | Saneamento - Outro | string | Não (se q2_10 contém 99) | Texto livre |
| `sb/q2_7` | `sb_q2_7` | Origem da água | select (múltiplo) | Sim* | 1=Rede pública, 2=Nascente, 3=Poço artesiano, 4=Poço comum, 5=Poço coletivo, 6=Poço semi-artesiano, 7=Rio/Córrego, 8=Cisterna/Armazenagem da chuva, 9=Açude/Represa, 10=Rede Comunitária, 99=Outros, 100=Não possui |
| `sb/q2_7_outro` | `sb_q2_7_outro` | Água - Outro | string | Não (se q2_7 contém 99) | Texto livre |
| `sb/q2_7_suficiente` | `sb_q2_7_suficiente` | A água é suficiente | select1 | Não (se q2_7 não contém 100) | sim=Sim, nao=Não |
| `sb/descarte_residuo` | `sb_descarte_residuo` | Descarte de resíduos | select1 | Sim* | 1=Aterro municipal (coleta prefeitura), 2=Aterro municipal (disposição própria), 3=Enterrado no solo, 4=Queimado, 99=Outros |
| `sb/descarte_residuo_outros` | `sb_descarte_residuo_outros` | Descarte resíduos - Outros | string | Não (se descarte_residuo=99) | Texto livre |

**Arrays internos:**
- `sb/r_q2_10[]` - Array de detalhes de saneamento (calculado)
- `sb/r_q2_7[]` - Array de detalhes de água (calculado)

### 12. Grupo `san` - Segurança Alimentar
**Ref:** `/data/san`  
**Label:** "Segurança Alimentar"

| Campo XML | Campo Banco | Label | Tipo | Obrigatório | Valores Possíveis |
|-----------|-------------|-------|------|-------------|-------------------|
| `san/tiveram_preocupacao` | `san_tiveram_preocupacao` | Tiveram preocupação | select1 | Sim* | sim=Sim, nao=Não |
| `san/acabaram_antes` | `san_acabaram_antes` | Acabaram antes | select1 | Sim* | sim=Sim, nao=Não |
| `san/ficaram_sem` | `san_ficaram_sem` | Ficaram sem | select1 | Sim* | sim=Sim, nao=Não |
| `san/comeram_pouco` | `san_comeram_pouco` | Comeram pouco | select1 | Sim* | sim=Sim, nao=Não |
| `san/deixou_refeicao` | `san_deixou_refeicao` | Deixou refeição | select1 | Sim* | sim=Sim, nao=Não |
| `san/comeu_menos_devia` | `san_comeu_menos_devia` | Comeu menos do que devia | select1 | Sim* | sim=Sim, nao=Não |
| `san/sentiu_fome` | `san_sentiu_fome` | Sentiu fome | select1 | Sim* | sim=Sim, nao=Não |
| `san/uma_refeicao` | `san_uma_refeicao` | Uma refeição | select1 | Sim* | sim=Sim, nao=Não |
| `san/refeicao_completa` | `san_refeicao_completa` | Refeição completa | select1 | Sim* | sim=Sim, nao=Não |
| `san/orientacao_profissional` | `san_orientacao_profissional` | Orientação profissional | select1 | Sim* | sim=Sim, nao=Não |

### 13. Grupo `pa` - Produção Agrária
**Ref:** `/data/pa`  
**Label:** "Produção Agrária"

| Campo XML | Campo Banco | Label | Tipo | Obrigatório | Valores Possíveis |
|-----------|-------------|-------|------|-------------|-------------------|
| `pa/a_vegetal` | `pa_a_vegetal` | Atividade vegetal | select (múltiplo) | Sim* | Lista extensa de culturas (1-62), 63=Nenhum |
| `pa/a_vegetal_outros` | `pa_a_vegetal_outros` | Atividade vegetal - Outros | string | Sim* (se a_vegetal contém 62) | Texto livre |
| `pa/a_animal` | `pa_a_animal` | Atividade animal | select (múltiplo) | Sim* | 1=Abelha, 12=Bovinocultura corte, 13=Bovinocultura leite, 2=Codorna, 3=Galinha, 4=Marreco, 5=Ovelha, 6=Cabra, 7=Pato, 8=Peixe, 9=Peru, 10=Suíno, 11=Faisão, 99=Outros, 100=Nenhum |
| `pa/comercial` | `pa_comercial` | Atividade comercial | select1 | Sim* | 1=Agricultura, 2=Pecuária, 3=Extrativismo vegetal, 4=Extrativismo animal, 5=Processamento alimentos, 6=Nenhuma |
| `pa/p_animal` | `pa_p_animal` | Produção animal | select (múltiplo) | Sim* (se comercial=2) | Lista similar a a_animal |
| `pa/p_vegetal` | `pa_p_vegetal` | Produção vegetal | select (múltiplo) | Sim* (se comercial=1) | Lista similar a a_vegetal |
| `pa/p_vegetal_outros` | `pa_p_vegetal_outros` | Produção vegetal - Outros | string | Sim* (se p_vegetal contém 62) | Texto livre |

**Arrays relacionados:**
- `g3_6_r1_2[]` - Array de culturas vegetais comerciais (repeat)
- `g3_11_1` - Bovinocultura de Leite (grupo)
- `g3_11_2` - Destino Produção Leite (grupo)
- `g3_12` - Bovinocultura de Corte (grupo)
- `g3_13` - Suinocultura (grupo)
- `g3_14` - Avicultura (grupo com subgrupos)
- `r3_15_0[]` - Piscicultura (array)
- `g3_16` - Ovinocultura (grupo)
- `g3_17` - Caprinocultura (grupo)
- `g3_18` - Apicultura (grupo)
- `r3_199_0[]` - Aquicultura (array)
- `g3_11_0_9` - Bubalinocultura (grupo)
- `r33_18[]` - Extrativismo (array)
- `r3_19[]` - Processamento/Alimentos (array)
- `r2_4_2[]` - Participação Socioprodutiva (array)
- `r_q3_7_1[]` - Benfeitorias (array)

### 14. Grupo `fotos` - Fotos e Geometria (ARRAY/REPEAT)
**Ref:** `/data/fotos`  
**Label:** "Fotos e Geometria"  
**Tipo:** Repeat (array de objetos)

| Campo XML | Campo Banco | Label | Tipo | Obrigatório |
|-----------|-------------|-------|------|-------------|
| `fotos/grupo` | `fotos[].grupo` | Qual o tipo de foto? | select1 | Sim* |
| `fotos/prod_foto` | `fotos[].prod_foto` | Produção para fins comerciais | select1 | Sim* |
| `fotos/prod_vegetal` | `fotos[].prod_vegetal` | Cultura da Produção Vegetal - Comercial | select1 | Sim* |
| `fotos/foto1` | `fotos[].foto1` | Foto | binary | Não |
| `fotos/foto1_obs` | `fotos[].foto1_obs` | Observação da foto | string | Não |
| `fotos/gps_foto` | `fotos[].gps_foto` | GPS da foto | geopoint | Não |

### 15. Grupo `og` - Observações Gerais
**Ref:** `/data/og`  
**Label:** "Observações Gerais"

| Campo XML | Campo Banco | Label | Tipo | Obrigatório |
|-----------|-------------|-------|------|-------------|
| `og/texto_q8_7` | `og_texto_q8_7` | (texto calculado) | string | Calculado |
| `og/data_o_original` | `og_data_o_original` | Data ocupação original | date | Não |
| `og/data_o_lote` | `og_data_o_lote` | Data ocupação lote | date | Não |
| `og/q8_1` | `og_q8_1` | Observação 1 | textarea | Não |
| `og/q8_2` | `og_q8_2` | O requerente declarou que ocupa o lote desde | string | Não |
| `og/q8_3` | `og_q8_3` | Observação 3 | string | Não |
| `og/q8_4` | `og_q8_4` | Não possui produção para comercialização / A renda vinda do lote é proveniente | string | Não |
| `og/q8_5` | `og_q8_5` | A renda extra lote é proveniente | string | Não |
| `og/q8_6` | `og_q8_6` | Observação 6 | string | Não |
| `og/q8_7` | `og_q8_7` | (texto longo sobre água e saneamento) | string | Não |
| `og/q8_8` | `og_q8_8` | Possui como benfeitorias: moradia, cerca, curral... | string | Não |
| `og/q8_9` | `og_q8_9` | Observação 9 | string | Não |
| `og/q8_10` | `og_q8_10` | Observação 10 | string | Não |

### 16. Campo `obs_form` - Observações do Formulário
**Ref:** `/data/obs_form`  
**Label:** "Observações do Formulário"  
**Tipo:** textarea

| Campo XML | Campo Banco | Label | Tipo | Obrigatório |
|-----------|-------------|-------|------|-------------|
| `obs_form` | `obs_form` | Observações do Formulário | textarea | Não |

### 17. Assinaturas
**Ref:** `/data/q9_1`, `/data/q9_2`, `/data/q9_3`

| Campo XML | Campo Banco | Label | Tipo | Obrigatório |
|-----------|-------------|-------|------|-------------|
| `q9_1` | `q9_1` | Assinatura ocupante | binary | Não |
| `quem_assinatura` | `quem_assinatura` | Quem assinou | select1 | Não |
| `q9_2` | `q9_2` | Assinatura cônjuge | binary | Não |
| `q9_2_rogo/rogo_nome` | `q9_2_rogo_nome` | Nome rogo cônjuge | string | Não |
| `q9_2_rogo/rogo_cpf` | `q9_2_rogo_cpf` | CPF rogo cônjuge | string | Não |
| `q9_2_rogo/rogo_foto` | `q9_2_rogo_foto` | Foto rogo cônjuge | binary | Não |
| `q9_3` | `q9_3` | Assinatura técnico | binary | Não |

## Campos Calculados e Dependentes

### Campos com `relevant` (condicionais)
Muitos campos só aparecem quando outros campos têm valores específicos. Exemplos:
- `tem_nome` só aparece se `i/q1_17` != 1 e != 6
- `g00_0_1` (cônjuge) só aparece se `iuf/nome_conjuge` não está vazio
- `ii/fr_r_doc_outro` só aparece se `ii/fr_r_doc` = 99
- `nucleo` só aparece se `tem_nucleo` = 'sim'

### Campos com `calculate` (calculados)
- `g00_0/idade` - Calculado a partir de `data_nascimento`
- `ii/vm_fiscal` - Calculado: `ai_matricula / modulo_fiscal`
- `somaarea` - Soma de todas as áreas do grupo `qa`
- `sb/saneamento_todos` - Lista de opções selecionadas em `sb/q2_10`
- `sb/agua_todos` - Lista de opções selecionadas em `sb/q2_7`

## Validações e Constraints

### Validações de CPF
- `g00_0/q1_2` e `g00_0_1/conjuge_cpf` têm validação completa de CPF (dígitos verificadores)
- Não aceita CPFs com todos os dígitos iguais (11111111111, etc.)

### Validações de Data
- Datas de nascimento devem ser < hoje
- Idades são calculadas automaticamente e validadas

### Validações de Área
- A soma das áreas do grupo `qa` deve ser igual à área total do imóvel (`ii/ai_matricula`)

### Validações de CEP
- CEP deve ter exatamente 8 dígitos

## Instances (Valores Possíveis)

O formulário define várias instances com valores possíveis para selects:

- `q1_17` - Aceitação da visita (1-6)
- `sim_nao` - Sim/Não básico
- `estado` - Lista de estados brasileiros (1-27)
- `q2_1_2` - Grau de parentesco (1-15)
- `q2_1_3` - Sexo (1-3)
- `q2_7` - Origem da água (1-10, 99, 100)
- `q2_10` - Saneamento básico (1-5, 99)
- `benfeitorias` - Tipos de benfeitorias (1-8, 99, 100)
- `q3_20_1` - Culturas vegetais (7-62, 63)
- `estado_civil` - Estados civis (1-11)
- `prog_governamental` - Programas sociais (1-3, 99)
- `renda_lote` - Faixas de renda (0-11)
- `zona_localizacao` - Zona (1-2)
- `nacionalidade` - Nacionalidades (1-3)
- `quem_assinatura` - Quem assinou (1-3)
- `tp_docind` - Tipos de documento (1-5)
- `regime_bens` - Regimes de bens (1-5)
- `doc_orgaopublico` - Documentos órgão público (1-3, 99)
- `condicao_acesso` - Condições de acesso (1-3)
- `declarada_medida` - Declarada ou medida (1-2)
- `descarte_residuo` - Descarte de resíduos (1-4, 99)
- `doc_comprobatoria` - Documentação comprobatória (1-10, 2, 99)
- `ocupante_antecessor` - Ocupante ou antecessor (1-2)
| `ocupante_conjuge` - Ocupante, cônjuge ou ambos (1-3)
- `autoconsumo_animal` - Animais para autoconsumo (1-14, 99, 100)
- `atividade_comercial` - Atividades comerciais (1-6)
- `producao_animal` - Produções animais (1-10)
- `estado_assent` - Estados de assentamento (5, 8, 25)
- `grupo_foto` - Tipos de foto (1-2)
- `producao_foto` - Produções para foto (1-14)
- `fr_r_doc` - Processos de regularização (1-3, 99)
- `profissao` - Profissões (1-20, 99, 100)
- `sim_nao_sabe` - Sim/Não/Não sabe (1-3)
- `q3_20_5` - Sementes ou mudas (1-3)
- `q3_20_5_1` - Origem sementes/mudas (1-4)
- `sn_crioula` - Semente crioula (1-4)
- `canal` - Canais de comercialização (1-8)
- `q3_11_1_1_5` - Período de produção (1-2)
- `q3_11_3_1` - Reprodução (1-2)
- `q3_12_30` - Tipo bovino corte
- `q3_12_31` - Manejo bovino corte
- `q3_12_32` - Sistema pastoreio bovino corte
- `q3_12_33` - Complementação alimentar bovino corte
- `q3_12_2` - Sistema criação bovino corte
- `q3_12_3` - Reprodução bovino corte
- `q3_13_23` - Tipo suíno
- `q3_13_24` - Manejo suíno
- `q3_13_25` - Sistema pastoreio suíno
- `q3_13_26` - Complementação alimentar suíno
- `q3_13_2` - Sistema criação suíno
- `q3_14_1_18` - Tipo avicultura
- `q3_14_1_19` - Manejo avicultura
- `q3_14_1_20` - Sistema pastoreio avicultura
- `q3_14_1_21` - Complementação alimentar avicultura
- `q3_14_2_17` - Tipo avicultura 2
- `q3_14_2_18` - Manejo avicultura 2
- `q3_14_2_19` - Sistema pastoreio avicultura 2
- `q3_14_2_20` - Complementação alimentar avicultura 2
- `q3_15_18` - Tipo piscicultura
- `q3_15_19` - Manejo piscicultura
- `q3_15_20` - Sistema criação piscicultura
- `q3_15_21` - Complementação alimentar piscicultura
- `q3_15_1` - Reprodução piscicultura
- `q3_15_1_0` - Sistema reprodução piscicultura
- `q3_15_2` - Produção piscicultura
- `q3_15_3` - Autoconsumo piscicultura
- `q3_15_4` - Comercialização piscicultura
- `q3_16_20` - Tipo ovinocultura
- `q3_16_21` - Manejo ovinocultura
- `q3_16_22` - Sistema pastoreio ovinocultura
- `q3_16_23` - Complementação alimentar ovinocultura
- `q3_16_2` - Sistema criação ovinocultura
- `q3_16_3` - Reprodução ovinocultura
- `q3_16_4` - Autoconsumo ovinocultura
- `q3_16_5` - Comercialização ovinocultura
- `q3_17_20` - Tipo caprinocultura
- `q3_17_21` - Manejo caprinocultura
- `q3_17_22` - Sistema pastoreio caprinocultura
- `q3_17_23` - Complementação alimentar caprinocultura
- `q3_17_2` - Sistema criação caprinocultura
- `q3_17_3` - Reprodução caprinocultura
- `q3_17_4` - Autoconsumo caprinocultura
- `q3_17_5` - Comercialização caprinocultura
- `q3_18_20` - Tipo apicultura
- `q3_18_21` - Manejo apicultura
- `q3_18_2` - Sistema criação apicultura
- `q3_18_3` - Autoconsumo apicultura
- `q3_18_4` - Comercialização apicultura
- `q3_18_5` - Valor comercialização apicultura
- `q3_199_1_0` - Tipo aquicultura
- `q3_199_2` - Produção aquicultura
- `q3_199_3` - Autoconsumo aquicultura
- `q3_199_4` - Comercialização aquicultura
- `q33_18_1_a` - Tipo extrativismo
- `q33_18_1` - Tipo extrativismo detalhado
- `q33_18_2` - Produção extrativismo
- `q33_18_3` - Autoconsumo extrativismo
- `q33_18_4` - Comercialização extrativismo
- `q33_18_5` - Valor comercialização extrativismo
- `q33_18_6` - Unidade extrativismo
- `q3_19_1` - Tipo processamento
- `q3_19_2` - Processamento possui registro
- `q3_19_3` - Origem matéria prima processamento
- `q3_19_4` - Produção processamento
- `q3_19_5` - Autoconsumo processamento
- `q3_19_6` - Comercialização processamento
- `q3_19_7` - Valor comercialização processamento
- `q3_19_8` - Unidade processamento
- `q3_19_9` - Quantidade processamento
- `q3_19_10` - Período produção processamento
- `q3_19_11` - Observação processamento
- `q2_4_3` - Tipo participação socioprodutiva
- `q2_4_3_1` - Participação socioprodutiva - outros
- `q2_4_4` - Nome participação socioprodutiva
- `q2_4_5` - Localização participação socioprodutiva
- `rr_q3_7_1` - Tipo benfeitoria
- `unidade` - Unidades de medida (kg, l, u)
- `tipo_formulario` - Tipos de formulário (1=Comum, 2=Área Quilombola, 3=Assentamento)
- `sim_nao_informar` - Sim/Não/Não soube informar (1-3)
- `sim_nao_informar_isento` - Sim/Não/Não soube informar/Isento (1-4)
- `municipio_ibge` - Lista de municípios (CSV externo)

## Observações Importantes

1. **Campos Obrigatórios:** Campos marcados com `*` são obrigatórios (`required="true()"`)

2. **Campos Condicionais:** Muitos campos só aparecem quando condições específicas são atendidas (usando `relevant`)

3. **Arrays/Repeats:** Os grupos `nucleo`, `fotos`, `g3_6_r1_2`, `r3_15_0`, `r3_199_0`, `r33_18`, `r3_19`, `r2_4_2`, `r_q3_7_1` são arrays que podem ter múltiplos itens

4. **Selects Múltiplos:** Alguns campos permitem seleção múltipla (usando `<select>` ao invés de `<select1>`), como `sb/q2_10`, `sb/q2_7`, `pa/a_vegetal`, `pa/a_animal`, `ir/q2_17_1`, `ii/d_comprobatoria`

5. **Mapeamento Banco:** Os nomes dos campos no banco geralmente seguem o padrão `grupo_campo` (ex: `i_q1_10`, `g00_0_q1_2`), mas alguns campos podem ter nomes diferentes

6. **Validações Complexas:** O formulário possui validações complexas de CPF, datas, cálculos de idade, e validações de soma de áreas

7. **Campos Calculados:** Vários campos são calculados automaticamente e não devem ser editados diretamente pelo usuário

8. **Filtros Dinâmicos:** Alguns selects são filtrados dinamicamente baseados em outros campos (ex: municípios filtrados por estado)

## Próximos Passos

1. Verificar mapeamento completo XML → Banco de Dados
2. Criar mapeamento de labels para interface
3. Implementar renderização de arrays/repeats
4. Implementar validações de campos obrigatórios e condicionais
5. Implementar selects com valores dinâmicos
