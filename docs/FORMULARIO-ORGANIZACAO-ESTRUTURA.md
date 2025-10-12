# Estrutura Completa do Formulário de Organizações

**Versão do Formulário ODK**: 2025100111  
**Fonte**: `docs/forms/organizacao/ORGANIZAÇÃO.xml`  
**Data de Documentação**: 12/10/2025

---

## Visão Geral

Este documento detalha a estrutura completa do formulário de diagnóstico de organizações (cooperativas e associações) da agricultura familiar, usado pelo Projeto PINOVARA. O formulário é aplicado em campo via ODK Collect e os dados são sincronizados com o sistema web.

---

## 1. Metadados de Coleta

### 1.1 Informações Automáticas (ODK)
| Campo | Tipo | Obrigatório | Descrição | Campo DB |
|-------|------|-------------|-----------|----------|
| `inicio` | datetime | Auto | Timestamp de início da coleta | `inicio` |
| `fim` | datetime | Auto | Timestamp de fim da coleta | `fim` |
| `deviceid` | string | Auto | ID do dispositivo usado | `deviceid` |
| `data_visita` | date | Sim | Data da visita (pré-preenchida com hoje) | `data_visita` |

### 1.2 Localização
| Campo | Tipo | Obrigatório | Descrição | Campo DB |
|-------|------|-------------|-----------|----------|
| `estado` | int (FK) | Sim | Estado onde está a organização | `estado` |
| `municipio_ibge` | int (FK) | Sim | Município IBGE | `municipio` |
| `gps` | geopoint | Sim | Coordenadas GPS | `gps_lat`, `gps_lng`, `gps_alt`, `gps_acc` |

**Validação**: Estado e município devem ser válidos nas tabelas auxiliares.

---

## 2. Dados da Organização

### 2.1 Grupo: `dados` - Dados Básicos

| Campo | Tipo | Obrigatório | Validação | Campo DB |
|-------|------|-------------|-----------|----------|
| `nome` | string | Sim | - | `nome` |
| `cnpj` | string(14) | Sim | Dígitos verificadores válidos | `cnpj` |
| `data_fundacao` | date | Sim | - | `data_fundacao` |
| `telefone` | string | Sim | - | `telefone` |
| `email` | string | Sim | - | `email` |

**Campos Auxiliares de Validação CNPJ** (calculados automaticamente):
- `soma_dv1` - Soma para cálculo do primeiro dígito verificador
- `dv1_calculado` - Primeiro dígito verificador calculado
- `soma_dv2` - Soma para cálculo do segundo dígito verificador  
- `dv2_calculado` - Segundo dígito verificador calculado

**Validação CNPJ**:
- Deve ter exatamente 14 dígitos
- Não pode ser sequência repetida (00000000000000, 11111111111111, etc.)
- Dígitos verificadores devem bater com o cálculo

### 2.2 Grupo: `end_organizacao` - Endereço da Organização

| Campo | Tipo | Obrigatório | Validação | Campo DB |
|-------|------|-------------|-----------|----------|
| `organizacao_logradouro` | string | Sim | - | `organizacao_end_logradouro` |
| `organizacao_numero` | string | Sim | - | `organizacao_end_numero` |
| `organizacao_cep` | string(8) | Sim | Exatamente 8 dígitos | `organizacao_end_cep` |
| `organizacao_bairro` | string | Não | - | `organizacao_end_bairro` |
| `organizacao_complemento` | string | Não | - | `organizacao_end_complemento` |

---

## 3. Dados do Representante Legal

### 3.1 Grupo: `representante` - Dados Pessoais

| Campo | Tipo | Obrigatório | Validação | Campo DB |
|-------|------|-------------|-----------|----------|
| `representante_nome` | string | Sim | - | `representante_nome` |
| `representante_cpf` | string(11) | Sim* | Dígitos verificadores válidos | `representante_cpf` |
| `representante_rg` | string | Não | - | `representante_rg` |
| `representante_telefone` | string | Sim | - | `representante_telefone` |
| `representante_email` | string | Não | - | `representante_email` |

**Validação CPF**:
- Deve ter exatamente 11 dígitos
- Não pode ser sequência repetida (11111111111, 22222222222, etc.)
- Dígitos verificadores devem bater com o cálculo

### 3.2 Grupo: `end_representante` - Endereço do Representante

| Campo | Tipo | Obrigatório | Validação | Campo DB |
|-------|------|-------------|-----------|----------|
| `representante_logradouro` | string | Sim | - | `representante_end_logradouro` |
| `representante_numero` | string | Sim | - | `representante_end_numero` |
| `representante_cep` | string(8) | Sim | Exatamente 8 dígitos | `representante_end_cep` |
| `representante_bairro` | string | Não | - | `representante_end_bairro` |
| `representante_complemento` | string | Não | - | `representante_end_complemento` |

**Nota**: O campo `representante_funcao` existe no schema Prisma mas não está no XML ODK atual.

---

## 4. Características dos Associados

### 4.1 Grupo: `caracteristicas` - Pessoa Física e Base Produtiva

#### 4.1.1 Totais Gerais

| Campo | Tipo | Obrigatório | Validação | Campo DB |
|-------|------|-------------|-----------|----------|
| `n_total_socios` | int | Sim | > 0 | `caracteristicas_n_total_socios` |
| `n_total_socios_caf` | int | Sim | <= n_total_socios | `caracteristicas_n_total_socios_caf` |
| `n_distintos_caf` | int | Sim | <= n_total_socios | `caracteristicas_n_distintos_caf` |

**Notas**: 
- CAF = Cadastro de Agricultura Familiar (antigo DAP)
- Um sócio pode ter CAF
- Número de famílias distintas pode ser menor que total de sócios com CAF (dupla titularidade)

#### 4.1.2 Por Categoria e Gênero

**Categorias**:
- `ta_af` - Agricultura Familiar
- `ta_a` - Assentado
- `ta_p` - Pescador
- `ta_i` - Indígena
- `ta_q` - Quilombola
- `ta_e` - Extrativista
- `ta_o` - Outro

**Para cada categoria**:
| Campo | Tipo | Obrigatório | Validação | Campo DB |
|-------|------|-------------|-----------|----------|
| `ta_[categoria]_note` | string | Não (readonly) | Label da categoria | (não armazenado) |
| `ta_[categoria]_homem` | int | Sim | <= n_total_socios | `caracteristicas_ta_[categoria]_homem` |
| `ta_[categoria]_mulher` | int | Sim | <= n_total_socios | `caracteristicas_ta_[categoria]_mulher` |

**Exemplo**:
```
ta_af_note: "Agricultura Familiar"
ta_af_homem: Número de homens agricultores familiares
ta_af_mulher: Número de mulheres agricultoras familiares
```

#### 4.1.3 Por Tipo de Produção

| Campo | Tipo | Obrigatório | Validação | Campo DB |
|-------|------|-------------|-----------|----------|
| `ta_caf_note` | string | Não (readonly) | Label "Total de Associados com CAF" | (não armazenado) |
| `ta_caf_organico` | int | Sim | <= n_total_socios | `caracteristicas_ta_caf_organico` |
| `ta_caf_agroecologico` | int | Sim | <= n_total_socios | `caracteristicas_ta_caf_agroecologico` |
| `ta_caf_transicao` | int | Sim | <= n_total_socios | `caracteristicas_ta_caf_transicao` |
| `ta_caf_convencional` | int | Sim | <= n_total_socios | `caracteristicas_ta_caf_convencional` |

**Definições**:
- **Orgânico**: Certificado + em conversão
- **Agroecológico**: Sem certificação
- **Transição**: Em transição para produção agroecológica
- **Convencional**: Produção convencional

#### 4.1.4 Sócios Ativos e Operações

| Campo | Tipo | Obrigatório | Validação | Campo DB |
|-------|------|-------------|-----------|----------|
| `n_ativos_total` | int | Sim | <= n_total_socios | `caracteristicas_n_ativos_total` |
| `n_ativos_caf` | int | Sim | <= n_total_socios | `caracteristicas_n_ativos_caf` |
| `n_naosocio_op_total` | int | Sim | <= n_total_socios | `caracteristicas_n_naosocio_op_total` |
| `n_naosocio_op_caf` | int | Sim | <= n_total_socios | `caracteristicas_n_naosocio_op_caf` |

**Definição de "Ativos"**: Sócios que realizaram operação comercial com o empreendimento nos últimos 12 meses.

#### 4.1.5 Novos Sócios

| Campo | Tipo | Obrigatório | Campo DB |
|-------|------|-------------|----------|
| `n_ingressaram_total_12_meses` | int | Sim | `caracteristicas_n_ingressaram_total_12_meses` |
| `n_ingressaram_caf_12_meses` | int | Sim | `caracteristicas_n_ingressaram_caf_12_meses` |

#### 4.1.6 Acesso a Políticas Públicas

| Campo | Tipo | Obrigatório | Validação | Campo DB |
|-------|------|-------------|-----------|----------|
| `n_socios_paa` | int | Sim | <= n_total_socios | `caracteristicas_n_socios_paa` |
| `n_naosocios_paa` | int | Sim | <= n_total_socios | `caracteristicas_n_naosocios_paa` |
| `n_socios_pnae` | int | Sim | <= n_total_socios | `caracteristicas_n_socios_pnae` |
| `n_naosocios_pnae` | int | Sim | <= n_total_socios | `caracteristicas_n_naosocios_pnae` |

**PAA** = Programa de Aquisição de Alimentos  
**PNAE** = Programa Nacional de Alimentação Escolar

### 4.2 Campo: `paa` - Modalidade PAA

| Campo | Tipo | Obrigatório | Opções | Campo DB |
|-------|------|-------------|---------|----------|
| `paa` | select (multiple) | Sim | Ver lista abaixo | (não armazenado - requer tabela auxiliar) |

**Opções de Modalidade PAA**:
1. Compra com Doação Simultânea (CDS)
2. Compra Direta
3. PAA Leite
4. Apoio à Formação de Estoques
5. Compra Institucional
6. Aquisição de Sementes

---

## 5. Arquivos e Documentos

### 5.1 Grupo Repetitivo: `file` - Upload de Arquivos

**Condição**: Aparece se `sim_nao_file` = 1 (Sim)

| Campo | Tipo | Obrigatório | Descrição | Campo DB |
|-------|------|-------------|-----------|----------|
| `sim_nao_file` | int | Sim | 1=Sim, 2=Não | `sim_nao_file` |
| `arquivo` | binary | Sim | Arquivo PDF/Excel/Word | Tabela `organizacao_arquivo`.`arquivo` |
| `arquivo_obs` | string | Não | Observação sobre o arquivo | Tabela `organizacao_arquivo`.`obs` |

**Tabela Relacionada**: `organizacao_arquivo`

**Metadados ODK** (gerados automaticamente para cada item do repeat):
- `_uri` - URI única do registro
- `_creator_uri_user` - Usuário criador
- `_creation_date` - Data de criação
- `_last_update_uri_user` - Último usuário que atualizou
- `_last_update_date` - Data da última atualização
- `_parent_auri` - URI do parent (organizacao)
- `_ordinal_number` - Ordem no repeat
- `_top_level_auri` - URI do registro principal

---

## 6. Dados de Produção

### 6.1 Grupo Repetitivo: `producao` - Culturas e Volumes

**Condição**: Aparece se `sim_nao_producao` = 1 (Sim)

| Campo | Tipo | Obrigatório | Validação | Campo DB |
|-------|------|-------------|-----------|----------|
| `sim_nao_producao` | int | Sim | 1=Sim, 2=Não | `sim_nao_producao` |
| `cultura` | string | Sim | - | Tabela `organizacao_producao`.`cultura` |
| `mensal` | decimal(16,2) | Sim | >= 0 | Tabela `organizacao_producao`.`mensal` |
| `anual` | decimal(16,2) | Sim | >= 0 | Tabela `organizacao_producao`.`anual` |

**Tabela Relacionada**: `organizacao_producao`

**Unidade**: kg (quilogramas)

---

## 7. Abrangência Geográfica dos Sócios

### 7.1 Grupo Repetitivo: `abrangencia_socios` - Municípios com Sócios

**Condição**: Aparece se `sim_nao_socio` = 1 (Sim)

| Campo | Tipo | Obrigatório | Validação | Campo DB |
|-------|------|-------------|-----------|----------|
| `sim_nao_socio` | int | Sim | 1=Sim, 2=Não | `sim_nao_socio` |
| `estado_socio` | int (FK) | Sim | - | Tabela `organizacao_abrangencia_socio`.`estado` |
| `municipio_ibge_socio` | int (FK) | Sim | Do estado selecionado | Tabela `organizacao_abrangencia_socio`.`municipio` |
| `num_socios` | int | Sim | >= 0 | Tabela `organizacao_abrangencia_socio`.`num_socios` |

**Tabela Relacionada**: `organizacao_abrangencia_socio`

**Funcionalidade**: Lista todos os municípios onde residem pelo menos 1 sócio da organização, com o número de sócios em cada município.

**Validação Recomendada**: A soma de todos os `num_socios` deveria ser igual a `n_total_socios`, mas pode haver discrepâncias.

---

## 8. Associados Pessoa Jurídica (Organizações de 2º Grau)

### 8.1 Grupo Repetitivo: `abrangencia_pj` - Organizações Filiadas

**Condição**: Aparece se `sim_nao_pj` = 1 (Sim)  
**Aplicável**: Apenas para cooperativas centrais, federações, confederações

| Campo | Tipo | Obrigatório | Validação | Campo DB |
|-------|------|-------------|-----------|----------|
| `sim_nao_pj` | int | Sim | 1=Sim, 2=Não | `sim_nao_pj` |
| `estado_cnpj` | int (FK) | Sim | - | Tabela `organizacao_abrangencia_pj`.`estado` |
| `municipio_ibge_cnpj` | int (FK) | Sim | Do estado selecionado | Tabela `organizacao_abrangencia_pj`.`municipio` |

### 8.2 Subgrupo: `dados_cnpj` - Dados da Organização Filiada

| Campo | Tipo | Obrigatório | Validação | Campo DB |
|-------|------|-------------|-----------|----------|
| `cnpj_pj` | string(14) | Sim | Dígitos verificadores válidos | Tabela `organizacao_abrangencia_pj`.`cnpj_pj` |
| `razao_social` | string | Sim | - | Tabela `organizacao_abrangencia_pj`.`razao_social` |
| `sigla` | string | Sim | - | Tabela `organizacao_abrangencia_pj`.`sigla` |
| `num_socios_total` | int | Sim | >= 0 | Tabela `organizacao_abrangencia_pj`.`num_socios_total` |
| `num_socios_caf` | int | Sim | <= num_socios_total | Tabela `organizacao_abrangencia_pj`.`num_socios_caf` |

**Tabela Relacionada**: `organizacao_abrangencia_pj`

---

## 9. Descrição Geral do Empreendimento

| Campo | Tipo | Obrigatório | Limite | Campo DB |
|-------|------|-------------|--------|----------|
| `descricao` | text | Sim | 8192 caracteres | `descricao` |

**Conteúdo Esperado**: Características gerais do empreendimento, ramo de atuação, produtos/serviços, perfil dos membros, perfil diretivo, estrutura organizacional, modelo de governança.

---

## 10. Práticas Gerenciais - DIAGNÓSTICO

**Padrão Geral**: Todas as áreas de diagnóstico seguem o mesmo padrão:
- Campo de resposta: `[area]_[subarea]_[numero]_resposta` (int: 1=Sim, 2=Não, 3=Parcial, 4=Não se Aplica)
- Campo de comentário: `[area]_[subarea]_[numero]_comentario` (string)
- Campo de proposta: `[area]_[subarea]_[numero]_proposta` (string)
- Campo de nota: `[area]_[subarea]_note` (string, readonly - apenas label)

### 10.1 Área: `go` - GOVERNANÇA ORGANIZACIONAL

#### 10.1.1 Subárea: Estrutura Organizacional

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 1 | O empreendimento possui um organograma geral? | `go_estrutura_1` | Sim |
| 2 | Este organograma está de acordo com a realidade do empreendimento? | `go_estrutura_2` | Sim |
| 3 | Dispõe de documentos com a descrição das atribuições, funções, responsabilidades, requisitos, direitos e deveres? | `go_estrutura_3` | Sim |
| 4 | Essas descrições correspondem à realidade da vida organizacional? | `go_estrutura_4` | Sim |

#### 10.1.2 Subárea: Estratégia Organizacional

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 5 | Possui um Planejamento Estratégico, com missão, visão, valores e objetivos estratégicos? | `go_estrategia_5` | Sim |
| 6 | Este planejamento é implementado, monitorado e avaliado periodicamente? | `go_estrategia_6` | Sim |

#### 10.1.3 Subárea: Organização dos Associados

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 7 | Aplica as normas estatutárias para admissão e exclusão dos associados? | `go_organizacao_7` | Sim |
| 8 | Na visão da diretoria, os associados confiam na diretoria? | `go_organizacao_8` | Sim |
| 9 | A diretoria confia no quadro de associados? | `go_organizacao_9` | Sim |
| 10 | O empreendimento possui uma estratégia para lidar com os conflitos? | `go_organizacao_10` | Sim |
| 11 | Os associados se organizam para discutir os problemas e ajudar na tomada de decisão? | `go_organizacao_11` | Sim |
| 12 | O empreendimento se utiliza de práticas formalizadas de integração de novos associados? | `go_organizacao_12` | Sim |
| 13 | Possui livro de matrícula dos associados atualizado? | `go_organizacao_13` | Sim |

#### 10.1.4 Subárea: Direção e Participação

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 14 | Remunera financeiramente os dirigentes? | `go_direcao_14` | Sim |
| 15 | A direção mantém periodicidade em suas reuniões? | `go_direcao_15` | Sim |
| 16 | Dispõe de outros espaços de participação além das assembleias? | `go_direcao_16` | Sim |
| 17 | Dispõe de estratégias para fortalecimento da participação das mulheres? | `go_direcao_17` | Sim |
| 18 | Dispõe de estratégias para fortalecimento da participação de jovens e idosos? | `go_direcao_18` | Sim |
| 19 | Possui instrumentos formais de estímulo da participação? | `go_direcao_19` | Sim |
| 20 | Existem comitês consultivos ou setoriais? | `go_direcao_20` | Sim |
| 21 | Existem mecanismos para mediar e resolver disputas? | `go_direcao_21` | Sim |

#### 10.1.5 Subárea: Controles Internos e Avaliação

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 22 | O conselho fiscal é atuante no empreendimento? | `go_controle_22` | Sim |
| 23 | A direção se reúne periodicamente com o conselho fiscal? | `go_controle_23` | Sim |
| 24 | A direção apresenta periodicamente relatórios contábeis/financeiros? | `go_controle_24` | Sim |
| 25 | Realiza assembleias anuais para prestação de contas? | `go_controle_25` | Sim |
| 26 | Possui mecanismos de controle, monitoramento e avaliação de objetivos? | `go_controle_26` | Sim |
| 27 | Há canais para dúvidas e sugestões sobre relatórios? | `go_controle_27` | Sim |

**NOTA IMPORTANTE**: No schema.prisma os campos de Controles Internos vão de 20 a 25, mas no XML vão de 22 a 27. Há uma divergência de numeração aqui.

#### 10.1.6 Subárea: Educação e Formação

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 28 | Os cooperados/associados são capacitados em cooperativismo/associativismo? | `go_educacao_28` | Sim |
| 29 | Os cooperados/associados são capacitados em Gestão do Empreendimento? | `go_educacao_29` | Sim |
| 30 | Há planos para identificar, capacitar e preparar novos líderes? | `go_educacao_30` | Sim |

**NOTA IMPORTANTE**: No schema.prisma os campos de Educação vão de 26 a 28, mas no XML vão de 28 a 30. Há uma divergência de numeração aqui também.

---

### 10.2 Área: `gp` - GESTÃO DE PESSOAS

#### 10.2.1 Subárea: Organização das Pessoas no Trabalho (9 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 1 | Possui descrição formalizada de cargos, funções e atividades? | `gp_p_organizacao_1` | Sim |
| 2 | As relações de trabalho encontram-se formalizadas? | `gp_p_organizacao_2` | Sim |
| 3 | Utiliza critérios padronizados de recrutamento e seleção? | `gp_p_organizacao_3` | Sim |
| 4 | Possui critérios claramente definidos para demissão? | `gp_p_organizacao_4` | Sim |
| 5 | Dispõe de horários de trabalho estabelecidos e respeitados? | `gp_p_organizacao_5` | Sim |
| 6 | Possui controle de horas voluntárias dedicadas? | `gp_p_organizacao_6` | Sim |
| 7 | Possui controle sobre ausências ou atrasos? | `gp_p_organizacao_7` | Sim |
| 8 | Realiza avaliação de desempenho dos colaboradores? | `gp_p_organizacao_8` | Sim |
| 9 | Utiliza práticas de reconhecimento e incentivo com base no desempenho? | `gp_p_organizacao_9` | Sim |

#### 10.2.2 Subárea: Desenvolvimento das Pessoas no Trabalho (4 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 10 | Possui procedimento de identificação de necessidades de capacitação? | `gp_p_desenvolvimento_10` | Sim |
| 11 | Possui um planejamento de capacitação e desenvolvimento? | `gp_p_desenvolvimento_11` | Sim |
| 12 | Realiza capacitação relacionada às atividades operacionais? | `gp_p_desenvolvimento_12` | Sim |
| 13 | Realiza capacitação relacionada a novas ou futuras atividades? | `gp_p_desenvolvimento_13` | Sim |

#### 10.2.3 Subárea: Qualidade de Vida no Trabalho (4 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 14 | Possui PCMSO e PPRA? | `gp_trabalho_14` | Sim |
| 15 | Monitora acidentes, taxas de frequência/gravidade e absenteísmo? | `gp_trabalho_15` | Sim |
| 16 | Realiza pesquisa de satisfação ou de clima organizacional? | `gp_trabalho_16` | Sim |
| 17 | Possui método para identificar necessidades e expectativas dos colaboradores? | `gp_trabalho_17` | Sim |

#### 10.2.4 Subárea: Gênero e Geração (3 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 18 | Possui estratégia para favorecer participação de mulheres e jovens? | `gp_geracao_18` | Sim |
| 19 | Existe equilíbrio no número de homens, mulheres, jovens e idosos? | `gp_geracao_19` | Sim |
| 20 | Existe equilíbrio na repartição dos benefícios? | `gp_geracao_20` | Sim |

---

### 10.3 Área: `gf` - GESTÃO FINANCEIRA

#### 10.3.1 Subárea: Balanço Patrimonial (4 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 1 | Possui contabilidade realizada por um contador? | `gf_balanco_1` | Sim |
| 2 | Possui Balanço Patrimonial atualizado? | `gf_balanco_2` | Sim |
| 3 | Realiza Análise de Balanço? | `gf_balanco_3` | Sim |
| 4 | Utiliza Balancetes Mensais para orientação financeira? | `gf_balanco_4` | Sim |

#### 10.3.2 Subárea: Controle de Contas a Receber e a Pagar (9 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 5 | Possui sistema/programa informatizado para gestão? | `gf_contas_5` | Sim |
| 6 | Possui algum tipo de Plano Orçamentário? | `gf_contas_6` | Sim |
| 7 | Possui metas financeiras? | `gf_contas_7` | Sim |
| 8 | Possui controle e registro dos valores a receber? | `gf_contas_8` | Sim |
| 9 | Possui controle de obrigações perante fornecedores? | `gf_contas_9` | Sim |
| 10 | Possui controle de obrigações perante colaboradores? | `gf_contas_10` | Sim |
| 11 | Possui controle de obrigações perante o fisco? | `gf_contas_11` | Sim |
| 12 | Possui controle de obrigações perante associados fornecedores? | `gf_contas_12` | Sim |
| 13 | Possui controle de pagamento de empréstimos e financiamentos? | `gf_contas_13` | Sim |

#### 10.3.3 Subárea: Fluxo de Caixa (3 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 14 | Possui controle de caixa (DFC)? | `gf_caixa_14` | Sim |
| 15 | Possui controle do dinheiro e caixa documental? | `gf_caixa_15` | Sim |
| 16 | Possui controle da conta no banco? | `gf_caixa_16` | Sim |

#### 10.3.4 Subárea: Controle de Estoques (3 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 17 | Possui controle periódico físico e financeiro dos estoques? | `gf_estoque_17` | Sim |
| 18 | Possui procedimentos de controle de compras? | `gf_estoque_18` | Sim |
| 19 | Possui procedimentos de pesquisa de mercado antes das compras? | `gf_estoque_19` | Sim |

#### 10.3.5 Subárea: Demonstração de Resultados (2 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 20 | Possui Demonstração de Resultado? | `gf_resultado_20` | Sim |
| 21 | Utiliza a Demonstração de Resultado para orientação financeira? | `gf_resultado_21` | Sim |

#### 10.3.6 Subárea: Análise de Viabilidade Econômica (3 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 22 | Elaborou a Análise de Viabilidade Econômica (AVE)? | `gf_analise_22` | Sim |
| 23 | Vem utilizando as orientações da AVE? | `gf_analise_23` | Sim |
| 24 | A AVE vem sendo atualizada? | `gf_analise_24` | Sim |

#### 10.3.7 Subárea: Obrigações Fiscais Legais (2 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 25 | Está cumprindo com todas as obrigações legais e fiscais? | `gf_fiscal_25` | Sim |
| 26 | Atualiza frequentemente a relação de obrigações legais e fiscais? | `gf_fiscal_26` | Sim |

---

### 10.4 Área: `gc` - GESTÃO COMERCIAL

#### 10.4.1 Subárea: Estrutura Comercial (9 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 1 | Dispõe de um setor comercial? | `gc_e_comercial_1` | Sim |
| 2 | O setor comercial possui informações técnicas dos produtos? | `gc_e_comercial_2` | Sim |
| 3 | Dispõe de profissional/equipe responsável pelas vendas? | `gc_e_comercial_3` | Sim |
| 4 | Este profissional tem orientação/treinamento específico para vendas? | `gc_e_comercial_4` | Sim |
| 5 | O representante comercial tem treinamento sobre os produtos? | `gc_e_comercial_5` | Sim |
| 6 | Possui sistema de controle das vendas? | `gc_e_comercial_6` | Sim |
| 7 | O setor comercial conhece a capacidade de oferta? | `gc_e_comercial_7` | Sim |
| 8 | Possui banco de informações sobre clientes e fornecedores? | `gc_e_comercial_8` | Sim |
| 9 | Emite ou está apto a emitir nota fiscal eletrônica? | `gc_e_comercial_9` | Sim |

#### 10.4.2 Subárea: Mercados Verdes, Sociais e Diferenciados (6 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 10 | O negócio possui diferencial em termos de sustentabilidade? | `gc_mercado_10` | Sim |
| 11 | Atua em mercados verdes ou outros mercados específicos? | `gc_mercado_11` | Sim |
| 12 | Possui produtos diferenciados do ponto de vista ambiental? | `gc_mercado_12` | Sim |
| 13 | Possui relação comercial com mercado justo e solidário? | `gc_mercado_13` | Sim |
| 14 | Os preços de produtos diferenciados são favoráveis? | `gc_mercado_14` | Sim |
| 15 | Se atualiza sobre exigências dos mercados verdes? | `gc_mercado_15` | Sim |

#### 10.4.3 Subárea: Estratégia Comercial e Marketing (6 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 16 | Adota estratégias comerciais definidas? | `gc_comercial_16` | Sim |
| 17 | Os produtos/empreendimento possuem marca comercial? | `gc_comercial_17` | Sim |
| 18 | Realiza ou utiliza pesquisa/estudo de mercado? | `gc_comercial_18` | Sim |
| 19 | Conhece os concorrentes e acompanha preços? | `gc_comercial_19` | Sim |
| 20 | Possui plano de marketing? | `gc_comercial_20` | Sim |
| 21 | O marketing contribui para estratégias e aumento de vendas? | `gc_comercial_21` | Sim |

**NOTA**: No schema.prisma, `gc_comercial_15` existe mas no XML a numeração vai de 16 a 21. Divergência!

#### 10.4.4 Subárea: Sustentabilidade e Modelo do Negócio (7 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 22 | Existe regularidade nas vendas, com contratos permanentes? | `gc_modelo_22` | Sim |
| 23 | Possui Modelo de Negócio definido? | `gc_modelo_23` | Sim |
| 24 | Vem utilizando o Modelo de Negócio para inserção no mercado? | `gc_modelo_24` | Sim |
| 25 | A direção tem clareza da proposta de valor? | `gc_modelo_25` | Sim |
| 26 | O negócio contribui para aumento da renda dos associados? | `gc_modelo_26` | Sim |
| 27 | Possui Plano de Negócios elaborado? | `gc_modelo_27` | Sim |
| 28 | O Plano de Negócios vem sendo utilizado? | `gc_modelo_28` | Sim |

**NOTA**: No schema.prisma vai até `gc_modelo_27`, mas no XML tem 28 práticas. O campo 21 (comercial) virou 28 (modelo).

---

### 10.5 Área: `gpp` - GESTÃO DE PROCESSOS PRODUTIVOS

#### 10.5.1 Subárea: Regularidade Sanitária (3 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 1 | Possui registro sanitário competente? | `gpp_reg_sanitaria_1` | Sim |
| 2 | Os produtos possuem registro? | `gpp_reg_sanitaria_2` | Sim |
| 3 | Os rótulos possuem registro? | `gpp_reg_sanitaria_3` | Sim |

#### 10.5.2 Subárea: Planejamento Produtivo (3 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 4 | Realiza planejamento da produção? | `gpp_planejamento_4` | Sim |
| 5 | Possui planilha de custos de produção? | `gpp_planejamento_5` | Sim |
| 6 | Há levantamento de demandas/exigências dos mercados? | `gpp_planejamento_6` | Sim |

#### 10.5.3 Subárea: Logística da Produção e Beneficiamento (6 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 7 | Possui local específico para armazenamento de suprimentos? | `gpp_logistica_7` | Sim |
| 8 | Essas instalações têm dimensões e condições adequadas? | `gpp_logistica_8` | Sim |
| 9 | Dispõe de controle para recebimento e estocagem? | `gpp_logistica_9` | Sim |
| 10 | Possui local específico para armazenamento de produtos finais? | `gpp_logistica_10` | Sim |
| 11 | Este local tem dimensões e condições adequadas? | `gpp_logistica_11` | Sim |
| 12 | Possui estrutura adequada para transporte e distribuição? | `gpp_logistica_12` | Sim |

#### 10.5.4 Subárea: Cadeia de Valor (3 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 13 | Utiliza o mapeamento da cadeia de valor? | `gpp_valor_13` | Sim |
| 14 | O mapeamento contempla as relações sociais? | `gpp_valor_14` | Sim |
| 15 | Há avaliação de quanto o mapeamento contribui para o desempenho? | `gpp_valor_15` | Sim |

#### 10.5.5 Subárea: Leiaute e Fluxos (7 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 16 | Possui um leiaute dos processos produtivos? | `gpp_fluxo_16` | Sim |
| 17 | O leiaute é monitorado para melhorar a produção? | `gpp_fluxo_17` | Sim |
| 18 | O leiaute é monitorado para melhorar o beneficiamento? | `gpp_fluxo_18` | Sim |
| 19 | O leiaute é monitorado para melhorar a rotulagem? | `gpp_fluxo_19` | Sim |
| 20 | O leiaute é monitorado para melhorar a embalagem? | `gpp_fluxo_20` | Sim |
| 21 | Possui fluxos de produção, beneficiamento, rotulagem e embalagem? | `gpp_fluxo_21` | Sim |
| 22 | O fluxo de produção está integrado com o leiaute? | `gpp_fluxo_22` | Sim |

#### 10.5.6 Subárea: Controle de Qualidade, Padronização e Rotulagem (6 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 23 | Realiza controle de qualidade dos produtos? | `gpp_qualidade_23` | Sim |
| 24 | Este controle atende aos padrões pré-estabelecidos? | `gpp_qualidade_24` | Sim |
| 25 | Testa os produtos antes da comercialização? | `gpp_qualidade_25` | Sim |
| 26 | Rótulos e etiquetas atendem padrões da legislação? | `gpp_qualidade_26` | Sim |
| 27 | Rótulos são coerentes com estratégia de marketing? | `gpp_qualidade_27` | Sim |
| 28 | Rótulos estão de acordo com mercados a serem atingidos? | `gpp_qualidade_28` | Sim |

#### 10.5.7 Subárea: Bens de Produção (1 prática)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 29 | Os bens de produção estão atendendo as necessidades? | `gpp_producao_29` | Sim |

---

### 10.6 Área: `gi` - GESTÃO DA INOVAÇÃO

#### 10.6.1 Subárea: Adoção da Inovação, Informações e Conhecimento (5 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 1 | O empreendimento adota algum esforço para inovar? | `gi_iic_1` | Sim |
| 2 | As informações são obtidas externamente e compartilhadas? | `gi_iic_2` | Sim |
| 3 | É promovido ambiente favorável ao surgimento de ideias criativas? | `gi_iic_3` | Sim |
| 4 | São analisadas e selecionadas as ideias de inovação? | `gi_iic_4` | Sim |
| 5 | Os dirigentes apoiam a experimentação de novas ideias? | `gi_iic_5` | Sim |

#### 10.6.2 Subárea: Monitoramento, Aprendizagem e Reconhecimento (4 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 6 | A implementação da inovação é acompanhada? | `gi_mar_6` | Sim |
| 7 | É promovida a aprendizagem sobre o processo inovativo? | `gi_mar_7` | Sim |
| 8 | São reconhecidos pelas contribuições à inovação? | `gi_mar_8` | Sim |
| 9 | São capacitados para a inovação e Gestão da Inovação? | `gi_mar_9` | Sim |

#### 10.6.3 Subárea: Equipes, Atores Relacionados e Tipos de Inovação (5 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 10 | O trabalho em equipe é estimulado para inovação? | `gi_time_10` | Sim |
| 11 | As inovações são divulgadas para as partes interessadas? | `gi_time_11` | Sim |
| 12 | São avaliados os benefícios da implementação da inovação? | `gi_time_12` | Sim |
| 13 | Existe iniciativa voltada para inovação sustentável/verde? | `gi_time_13` | Sim |
| 14 | Existe iniciativa voltada para inovação social ou frugal? | `gi_time_14` | Sim |

---

### 10.7 Área: `gs` - GESTÃO SOCIOAMBIENTAL

#### 10.7.1 Subárea: Política Socioambiental (5 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 1 | Adota alguma prática voltada às questões ambientais? | `gs_socioambiental_1` | Sim |
| 2 | Faz utilização de materiais sustentáveis? | `gs_socioambiental_2` | Sim |
| 3 | Possui incentivo para mobilidade sustentável? | `gs_socioambiental_3` | Sim |
| 4 | Adota estratégia para garantir sustentabilidade ambiental da produção? | `gs_socioambiental_4` | Sim |
| 5 | Possui estratégia para justa repartição de benefícios da biodiversidade? | `gs_socioambiental_5` | Sim |

#### 10.7.2 Subárea: Valoração Ambiental (4 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 6 | Faz valoração dos recursos naturais utilizados? | `gs_ambiental_6` | Sim |
| 7 | Possui integração promovendo bem-estar e biodiversidade? | `gs_ambiental_7` | Sim |
| 8 | Considera reconfiguração de espaços para prolongar vida útil? | `gs_ambiental_8` | Sim |
| 9 | Esta valoração é utilizada nas estratégias? | `gs_ambiental_9` | Sim |

#### 10.7.3 Subárea: Regularidade Ambiental (5 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 10 | Possui licença ou autorização ambiental? | `gs_reg_ambiental_10` | Sim |
| 11 | As áreas possuem Plano de Manejo aprovado? | `gs_reg_ambiental_11` | Sim |
| 12 | Há planos de Manejo autorizando extração de espécies? | `gs_reg_ambiental_12` | Sim |
| 13 | Existe área de preservação no entorno que possa ser afetada? | `gs_reg_ambiental_13` | Sim |
| 14 | As áreas possuem CAR? | `gs_reg_ambiental_14` | Sim |

**CAR** = Cadastro Ambiental Rural

#### 10.7.4 Subárea: Impactos Ambientais (8 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 15 | A direção identifica com clareza os impactos negativos? | `gs_impactos_ambiental_15` | Sim |
| 16 | Adota política para minimizar esses impactos? | `gs_impactos_ambiental_16` | Sim |
| 17 | A direção identifica com clareza os impactos positivos? | `gs_impactos_ambiental_17` | Sim |
| 18 | Faz correta destinação dos resíduos e efluentes? | `gs_impactos_ambiental_18` | Sim |
| 19 | Realiza práticas para reduzir, reutilizar e reciclar? | `gs_impactos_ambiental_19` | Sim |
| 20 | Possui plano de redução no consumo de energia? | `gs_impactos_ambiental_20` | Sim |
| 21 | As edificações têm planejamento de ciclo de vida? | `gs_impactos_ambiental_21` | Sim |
| 22 | As instalações físicas estão em área adequada? | `gs_impactos_ambiental_22` | Sim |

---

### 10.8 Área: `is` - INFRAESTRUTURA SUSTENTÁVEL

#### 10.8.1 Subárea: Eficiência Energética (4 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 1 | Possui/planeja painéis solares fotovoltaicos? | `is_eficiencia_energetica_1` | Sim |
| 2 | A orientação do edifício foi planejada para aproveitar luz natural? | `is_eficiencia_energetica_2` | Sim |
| 3 | Utiliza/planeja sensores de presença e automação? | `is_eficiencia_energetica_3` | Sim |
| 4 | As fachadas incorporam elementos de sombreamento? | `is_eficiencia_energetica_4` | Sim |

#### 10.8.2 Subárea: Uso de Recursos Naturais (4 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 5 | Há aproveitamento de ventilação cruzada natural? | `is_recursos_naturais_5` | Sim |
| 6 | Há valorização dos sombreamentos vegetais? | `is_recursos_naturais_6` | Sim |
| 7 | A topografia é utilizada para conforto térmico? | `is_recursos_naturais_7` | Sim |
| 8 | Há aberturas estratégicas para luz natural? | `is_recursos_naturais_8` | Sim |

#### 10.8.3 Subárea: Consumo de Água (2 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 9 | Há sistemas de captação de água da chuva? | `is_agua_9` | Sim |
| 10 | Há reutilização de águas cinzas? | `is_agua_10` | Sim |

#### 10.8.4 Subárea: Conforto Ambiental (4 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 11 | Há utilização de materiais com bom isolamento térmico? | `is_conforto_ambiental_11` | Sim |
| 12 | Há utilização de materiais com bom isolamento acústico? | `is_conforto_ambiental_12` | Sim |
| 13 | Há exploração da ventilação cruzada e exaustão natural? | `is_conforto_ambiental_13` | Sim |
| 14 | Há uso de iluminação natural e/ou vidros de controle solar? | `is_conforto_ambiental_14` | Sim |

#### 10.8.5 Subárea: Gestão de Resíduos (4 práticas)

| # | Prática | Campo Base | Obrigatório |
|---|---------|------------|-------------|
| 15 | Há espaços adequados para separação de resíduos orgânicos? | `is_residuos_15` | Sim |
| 16 | Há espaços adequados para separação de recicláveis? | `is_residuos_16` | Sim |
| 17 | A compostagem é utilizada como adubo orgânico? | `is_residuos_17` | Sim |
| 18 | Há práticas que minimizem geração de resíduos? | `is_residuos_18` | Sim |

---

## 11. Fotos

### 11.1 Grupo Repetitivo: `fotos` - Upload de Fotos

| Campo | Tipo | Obrigatório | Descrição | Campo DB |
|-------|------|-------------|-----------|----------|
| `grupo` | int | Sim | Categoria da foto | Tabela `organizacao_foto`.`grupo` |
| `foto` | binary (image) | Sim | Arquivo da foto | Tabela `organizacao_foto`.`foto` |
| `foto_obs` | string | Não | Observação sobre a foto | Tabela `organizacao_foto`.`obs` |

**Tabela Relacionada**: `organizacao_foto`

**Categorias de Grupos** (instance 'grupo'):
1. Infraestrutura produtiva
2. Estrutura predial
3. Produtos
4. Listagem de Sócios
5. Lista de Presença
99. Outros

---

## 12. Dados Complementares da Atividade

### 12.1 Campos de Orientação Técnica

| Campo | Tipo | Obrigatório | Descrição | Campo DB |
|-------|------|-------------|-----------|----------|
| `eixos_trabalhados` | string | Sim | Eixos trabalhados na atividade | `eixos_trabalhados` |
| `enfase` | int | Sim | Ênfase da atividade | `enfase` |
| `enfase_outros` | string | Condicional* | Se enfase=99 | `enfase_outros` |
| `metodologia` | text | Sim | Metodologia utilizada | `metodologia` |
| `orientacoes` | text | Sim | Orientações e soluções técnicas | `orientacoes` |

*Obrigatório apenas se `enfase` = 99 (Outros)

**Opções de Ênfase** (instance 'enfase'):
1. PNAE
2. PAA Leite
3. Crédito do INCRA
4. Governos
5. Redes de Cooperação e/ou Comercialização
99. Outros

**Eixos Possíveis**: Gestão, Mercados, Comercialização, Finanças, Liderança/Perfil Empreendedor, Tecnologia & Inovação, Produção

### 12.2 Indicadores

| Campo | Tipo | Obrigatório | Descrição | Campo DB |
|-------|------|-------------|-----------|----------|
| `indicadores` | select (multiple) | Sim | Indicadores envolvidos | Tabela `organizacao_indicador` |

**Opções de Indicadores** (instance 'indicador'):
1. Conformidade documental e regularidade do empreendimento
2. Práticas de tomada de decisão
3. Políticas públicas de apoio à produção e comercialização
4. Associados com acesso às políticas públicas
5. Participação dos associados no empreendimento
6. Participação de mulheres na gestão
7. Capacitação de gestores
8. Capacitação de associados
9. Geração de Empregos Diretos
10. Controles econômicos
11. Negócios institucionais
12. Inovação no empreendimento
13. Adoção de tecnologias referenciais
14. Práticas sustentáveis no empreendimento
15. Programa ou ações ambientais comunitárias
16. Prática de proteção de nascentes e/ou uso racional de recursos hídricos

**Tabela Relacionada**: `organizacao_indicador` (relacionamento many-to-many)

---

## 13. Participantes da Atividade

### 13.1 Grupo Repetitivo: `participantes` - Lista de Presença

**Condição**: Aparece se `participantes_menos_10` = 1 (Sim, menos de 10 participantes)  
**Se mais de 10**: Deve-se usar folha de presença física e fotografar

| Campo | Tipo | Obrigatório | Validação | Campo DB |
|-------|------|-------------|-----------|----------|
| `participantes_menos_10` | int | Sim | 1=Sim, 2=Não | `participantes_menos_10` |
| `participante_nome` | string | Sim | - | Tabela `organizacao_participante`.`nome` |
| `participante_cpf` | string(11) | Sim | Dígitos verificadores válidos | Tabela `organizacao_participante`.`cpf` |
| `participante_telefone` | string | Sim | - | Tabela `organizacao_participante`.`telefone` |
| `participante_relacao` | int | Sim | Ver lista abaixo | Tabela `organizacao_participante`.`relacao` |
| `participante_relacao_outros` | string | Não | Se relacao=99 | Tabela `organizacao_participante`.`relacao_outros` |
| `participante_assinatura` | binary (signature) | Sim | Assinatura digital | Tabela `organizacao_participante`.`assinatura` |

**Tabela Relacionada**: `organizacao_participante`

**Opções de Relação** (instance 'relacao'):
1. Diretor
2. Conselheiro Fiscal
3. Associado
4. Colaborador
99. Outro

---

## 14. Finalização

### 14.1 Campos Finais

| Campo | Tipo | Obrigatório | Limite | Campo DB |
|-------|------|-------------|--------|----------|
| `obs` | text | Sim | 8192 caracteres | `obs` |
| `assinatura_resp_legal` | binary (signature) | Sim | Assinatura digital | `assinatura_rep_legal` |

### 14.2 Metadados ODK (gerados automaticamente)

| Campo | Tipo | Descrição | Campo DB |
|-------|------|-----------|----------|
| `meta/audit` | binary | Trilha de auditoria | (não armazenado) |
| `meta/instanceID` | string (UUID) | ID único da submissão | `meta_instance_id` |
| `meta/instanceName` | string | Nome calculado: "ORGANIZAÇÃO - [nome]" | `meta_instance_name` |

---

## 15. Listas Auxiliares (Instances)

### 15.1 Estados Brasileiros

27 estados com códigos de 1 a 27:
- 1: AC - Acre
- 2: AL - Alagoas
- ... (todos os 27 estados)
- 27: TO - Tocantins

**Tabela**: `pinovara_aux.estado`

### 15.2 Respostas para Práticas Gerenciais

| Código | Label |
|--------|-------|
| 1 | Sim |
| 2 | Não |
| 3 | Parcial |
| 4 | Não se Aplica |

**Tabela**: `pinovara_aux.resposta`

### 15.3 Sim/Não Simples

| Código | Label |
|--------|-------|
| 1 | Sim |
| 2 | Não |

**Tabela**: `pinovara_aux.sim_nao`

---

## 16. Resumo de Contagem de Campos

| Seção | Campos Simples | Repeating Groups | Total Aproximado |
|-------|----------------|------------------|------------------|
| Metadados e Localização | 7 | 0 | 7 |
| Dados da Organização | 9 | 0 | 9 |
| Endereço Organização | 5 | 0 | 5 |
| Representante | 5 | 0 | 5 |
| Endereço Representante | 5 | 0 | 5 |
| Características | 32 | 0 | 32 |
| Arquivos | 1 | 1 (n itens) | variável |
| Produção | 1 | 1 (n itens) | variável |
| Abrangência Sócios | 1 | 1 (n itens) | variável |
| Abrangência PJ | 1 | 1 (n itens) | variável |
| Descrição | 1 | 0 | 1 |
| Governança (GO) | 0 | 0 | 30 práticas × 3 = 90 |
| Gestão Pessoas (GP) | 0 | 0 | 20 práticas × 3 = 60 |
| Gestão Financeira (GF) | 0 | 0 | 26 práticas × 3 = 78 |
| Gestão Comercial (GC) | 0 | 0 | 28 práticas × 3 = 84 |
| Processos Produtivos (GPP) | 0 | 0 | 29 práticas × 3 = 87 |
| Gestão Inovação (GI) | 0 | 0 | 14 práticas × 3 = 42 |
| Gestão Socioambiental (GS) | 0 | 0 | 22 práticas × 3 = 66 |
| Infraestrutura Sustentável (IS) | 0 | 0 | 18 práticas × 3 = 54 |
| Fotos | 0 | 1 (n itens) | variável |
| Orientações Técnicas | 5 | 0 | 5 |
| Indicadores | 1 | 0 | 1 (multi-select) |
| Participantes | 1 | 1 (n itens) | variável |
| Finalização | 2 | 0 | 2 |
| **TOTAL** | **~80** | **6 repeating** | **~625 campos** |

---

## 17. Divergências Identificadas

### 17.1 Schema Prisma vs. XML ODK

| Item | Schema Prisma | XML ODK | Recomendação |
|------|---------------|---------|--------------|
| Governança - Controles | go_controle_20 a 25 | go_controle_22 a 27 | **Usar numeração do XML** |
| Governança - Educação | go_educacao_26 a 28 | go_educacao_28 a 30 | **Usar numeração do XML** |
| Comercial - Estratégia | gc_comercial_15 | gc_comercial_16 a 21 | **Usar numeração do XML** |
| Comercial - Modelo | gc_modelo_21 a 27 | gc_modelo_22 a 28 | **Usar numeração do XML** |
| Representante - Função | representante_funcao existe | Não está no XML | Manter no schema (pode ser preenchido no web) |

**Observação Crítica**: O schema Prisma foi criado com base em uma versão anterior do formulário. O XML ODK é a versão atual e deve ser considerada a fonte de verdade. Ao implementar a interface web, devemos seguir a numeração e estrutura do XML.

---

## 18. Campos Adicionais no Schema (não no XML ODK)

Estes campos existem no `schema.prisma` mas não estão no formulário ODK, provavelmente foram adicionados para funcionalidades do sistema web:

| Campo DB | Descrição Presumida |
|----------|---------------------|
| `removido` | Flag de soft delete |
| `id_tecnico` | ID do técnico responsável |
| `complementado` | Flag indicando se foi complementado no web |
| Metadados `_*` | _uri, _creator_uri_user, _creation_date, etc. (padrão ODK) |

---

## Notas Importantes

1. **Campos `*_note`**: São apenas labels/títulos das subáreas, marcados como `readonly`. Não precisam ser armazenados no banco, servem apenas para organização visual no formulário.

2. **Validações de CPF/CNPJ**: São complexas e implementadas no XML com fórmulas XPath. Devem ser replicadas no frontend para validação em tempo real.

3. **Campos Obrigatórios**: Praticamente todos os campos de práticas gerenciais têm a resposta obrigatória, mas comentário e proposta são opcionais.

4. **Relacionamentos**: Todos os repeating groups geram tabelas relacionadas com FK para a organização e metadados ODK completos.

5. **Versionamento**: O formulário tem version="2025100111", o que indica a data de última modificação (01/10/2025, versão 11).
