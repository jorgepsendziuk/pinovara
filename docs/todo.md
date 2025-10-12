## 🚀 TAREFAS PRIORITÁRIAS

### ✅ SINCRONIZAÇÃO DE FOTOS ODK - CONCLUÍDO!
**Status:** 🎉 100% Funcional e Testado

**Funcionalidade:** Botão "🔄 Sincronizar ODK" na edição de organizações extrai fotos (BLOBs) do banco ODK e salva no servidor.

**Testado com sucesso:**
- Organização AZURP (ID 17): 5 fotos baixadas (2.5 MB)
- Fotos salvas em: `/var/pinovara/shared/uploads/fotos/{timestamp}.jpg`
- Deduplicação funcionando (não baixa 2x)

**Estrutura ODK:**
- `ORGANIZACAO_FOTO_REF` (_TOP_LEVEL_AURI → organização)
- `ORGANIZACAO_FOTO_BLB` (_SUB_AURI → VALUE bytea)

**Arquivos implementados:**
- Backend: `types/fotoSync.ts`, `services/fotoSyncService.ts`, `controllers/fotoSyncController.ts`, `routes/fotoSyncRoutes.ts`
- Frontend: `UploadFotos.tsx` (botão), `api.ts` (endpoints)
- SQL: `setup-dblink-pinovara.sql`, `fix-foto-paths.sql`

**Endpoints:**
- POST `/api/organizacoes/:id/fotos/sync`
- GET `/api/organizacoes/:id/fotos/odk-disponiveis`

**Nomenclatura:**
- Fotos ODK: `{timestamp}.jpg`
- Upload manual: `{timestamp}.{ext}`

**Doc completa:** `docs/SINCRONIZACAO-FOTOS-ODK-FINAL.md`

**Deploy:** Testar no servidor remoto após deploy

---

## 📋 OUTRAS TAREFAS

continuar a implementação de gestao de roles e papeis

usar datagrid mais robusta nas listagens de:
usuarios
grid
roles
organizacoes etc

documentar as ultimas modificacoes, verificar documentacao se esta refletindo o estado atual do sistema, caso necessário, olhe nos extratos do git...

no relatorio, ta tudo muito quebrado.
vamos simplificar primeiro pra depois melhorar.
-tire todas as caixas, cores de fundo, rodapé, numero de paginas etc.. esse cabeçalho que esta la nao precisa ter em todas as paginas, so na primeira no comeco do documento.
-mantenha as formatacoes de texto, organize os textos em tabelas simples com linhas finas.
-qual a engine de pdf ta sendo usava, quais libs, me mostre resumido o procedimento que é pra gerar um relatorio em pdf nesse sistema


baseado na premissa e nos dados das tabelas do projeto, elabore uma politica de privacidade e disponibilize no rodapé do website um link para ela
contratante: UFBA
desenvolvedor do software: LGRDC Servicos de Informatica de CNPJ 37.287.587/0001-71
DPO: Jorge Psendziuk

elabore um termos de uso que o usuario deve aceitar ao entrar no sistema, nao precisa salvar esse aceite para o usuario, mas sera necessario aceitar os termos para entrar na area logada. mantenha um cookie desse aceite.

botao Sincronizar ODK: mudar para Baixar Arquivos, no accordion de Arquivos. no de fotos Baixar Fotos

aviso de cookies

contador de visitas sem salvar nada no banco é possivel?

toda vez que uma versao modifica coisas no prisma e ou no backend o deploy automatico pelo github actions nao da certo e tenho que pedir pra ajustar e tentar de novo.
me diga ai o que voce fez agora pro deploy funcionar, qual foi o erro no deploy automatico, e o que tenho que ajustar no deploy. me explique de uma maneira que possa passar pra inteligencia artificial ajustar no projeto pela minha IDE.

baseado nos scripts de deploy do github actions, queria um script pra fazer o deploy somente do frontend, caso eu faça alguma mudanca no visual de alguma pagina por exemplo e nao queira um deploy completo tao longo...

usuario sincronizar com odk

usuario manter aceite dos termos, data do aceite

rastreabilidade das acoes

editar fotos

http://localhost:5173/organizacoes/lista
- adicionar filtros nos cabecalhos da datagrid, é possivel?



design system:
vamos criar um design system desse sistema, um padrao onde todas as novas paginas devem se inspirar, e atualizar as paginas existentes com esses padroes.

app.css esta gigantesco

temos 3 abas na edicao de organizacao (Organização
Diagnóstico
Plano de Gestão)
vamos precisar criar outras para nao ficar tao baguncado, entao:
organizar de acordo com as secoes que voce identificou... a secao Características dos Associados que voce ja tinha criado como acordion, tire o accordion e coloque numa nova aba, depois da  SEÇÃO 1: Identificação e Caracterização (mudar o nome da aba Organização para isso), e depois ja crie as demais secoes, como ja tinha identificado antes:
### 2.2 SEÇÃO 2: Caracterização dos Associados 
### 2.3 SEÇÃO 3: Abrangência Geográfica 
e etc..
**Tabela Relacionada**: `organizacao_abrangencia_socio`

Lista de municípios com número de sócios

- UF, Município, Código IBGE, Número de sócios
- **Status**: ❌ NÃO Implementado
- **Tabela**: `organizacao_abrangencia_socio` (linhas 923-942)

### 2.4 SEÇÃO 4: Associados Jurídicos (Planilha 5)

**Tabela Relacionada**: `organizacao_abrangencia_pj`

Para organizações de segundo grau (centrais, federações)

- CNPJ, Razão Social, Sigla, UF, Município, Número de sócios
- **Status**: ❌ NÃO Implementado
- **Tabela**: `organizacao_abrangencia_pj` (linhas 898-921)

### 2.5 SEÇÃO 5: Dados de Produção (Relacionado à planilha 6)

**Tabela Relacionada**: `organizacao_producao`

- Cultura, Volume Anual, Volume Mensal
- **Status**: ❌ NÃO Implementado
- **Tabela**: `organizacao_producao` (linhas 982-999)

### 2.6 SEÇÃO 6: Práticas Gerenciais - DIAGNÓSTICO

Cada prática segue o padrão: Resposta (SIM/NÃO/Parcial/NA) + Comentário + Proposta

#### 6.1 Governança Organizacional (Planilha 7)

**28 práticas organizadas em 6 subáreas:**

1. Estrutura Organizacional (4 práticas)
2. Estratégia Organizacional (2 práticas)
3. Organização dos Associados (7 práticas)
4. Direção e Participação (9 práticas)
5. Controles Internos e Avaliação (6 práticas)
6. Educação e Formação (3 práticas)

- **Status**: ⚠️ Parcialmente Implementado (interface existe, mas incompleta)
- **Campos DB**: `go_*_resposta`, `go_*_comentario`, `go_*_proposta`

#### 6.2 Gestão de Pessoas (Planilha 8)

**20 práticas organizadas em 4 subáreas:**

1. Organização das Pessoas no Trabalho (10 práticas)
2. Desenvolvimento das Pessoas (4 práticas)
3. Qualidade de Vida no Trabalho (4 práticas)
4. Gênero e Geração (3 práticas)

- **Status**: ⚠️ Parcialmente Implementado
- **Campos DB**: `gp_*_resposta`, `gp_*_comentario`, `gp_*_proposta`

#### 6.3 Gestão Financeira (Planilha 9)

**26 práticas organizadas em 6 subáreas:**

1. Balanço Patrimonial (4 práticas)
2. Controle de Contas a Receber e a Pagar (9 práticas)
3. Fluxo de Caixa (3 práticas)
4. Controle de Estoques (3 práticas)
5. Demonstração de Resultados (2 práticas)
6. Análise de Viabilidade Econômica (3 práticas)
7. Obrigações Fiscais Legais (2 práticas)

- **Status**: ⚠️ Parcialmente Implementado
- **Campos DB**: `gf_*_resposta`, `gf_*_comentario`, `gf_*_proposta`

#### 6.4 Gestão Comercial (Planilha 10)

**27 práticas organizadas em 4 subáreas:**

1. Estrutura Comercial (9 práticas)
2. Mercados Verdes, Sociais e Diferenciados (6 práticas)
3. Estratégia Comercial e Marketing (7 práticas)
4. Sustentabilidade e Modelo do Negócio (7 práticas)

- **Status**: ❌ NÃO Implementado
- **Campos DB**: `gc_*_resposta`, `gc_*_comentario`, `gc_*_proposta`

#### 6.5 Gestão de Processos Produtivos (Planilha 11)

**29 práticas organizadas em 6 subáreas:**

1. Regularidade Sanitária (3 práticas)
2. Planejamento Produtivo (3 práticas)
3. Logística da Produção e Beneficiamento (6 práticas)
4. Cadeia de Valor (3 práticas)
5. Leiaute e Fluxos (7 práticas)
6. Controle de Qualidade, Padronização e Rotulagem (6 práticas)
7. Bens de Produção (1 prática)

- **Status**: ❌ NÃO Implementado
- **Campos DB**: `gpp_*_resposta`, `gpp_*_comentario`, `gpp_*_proposta`

#### 6.6 Gestão da Inovação (Planilha 12)

**14 práticas organizadas em 3 subáreas:**

1. Adoção da Inovação, Informações e Conhecimento (5 práticas)
2. Monitoramento, Aprendizagem e Reconhecimento (5 práticas)
3. Time, Stakeholders, Tipos de Inovação (4 práticas)

- **Status**: ❌ NÃO Implementado
- **Campos DB**: `gi_*_resposta`, `gi_*_comentario`, `gi_*_proposta`

#### 6.7 Gestão Socioambiental (Planilha 13)

**22 práticas organizadas em 4 subáreas:**

1. Política Socioambiental (5 práticas)
2. Valoração Ambiental (4 práticas)
3. Regularidade Ambiental (5 práticas)
4. Impactos Ambientais (8 práticas)

- **Status**: ❌ NÃO Implementado
- **Campos DB**: `gs_*_resposta`, `gs_*_comentario`, `gs_*_proposta`

#### 6.8 Infraestrutura Sustentável (Planilha 14)

**18 práticas organizadas em 5 subáreas:**

1. Eficiência Energética (4 práticas)
2. Uso de Recursos Naturais (4 práticas)
3. Consumo de Água (2 práticas)
4. Conforto Ambiental (4 práticas)
5. Gestão de Resíduos (4 práticas)

- **Status**: ❌ NÃO Implementado
- **Campos DB**: `is_*_resposta`, `is_*_comentario`, `is_*_proposta`

### 2.7 SEÇÃO 7: Nível de Maturidade (Planilha 15)

Consolida automaticamente as respostas das práticas e permite ao técnico avaliar o nível de maturidade em cada área (escala 0-5).

- **Status**: ❌ NÃO Implementado
- **Lógica**: Calcular automaticamente com base nas respostas + permitir ajuste manual

### 2.8 SEÇÃO 8: Arquivos e Fotos

- Upload de documentos diversos
- Upload de fotos organizadas por grupos
- **Status**: ✅ Implementado
- **Tabelas**: `organizacao_arquivo`, `organizacao_foto`

### 2.9 SEÇÃO 9: Participantes (para eventos/atividades)

**Tabela Relacionada**: `organizacao_participante`

Lista de pessoas que participaram da atividade de diagnóstico

- **Status**: ❌ NÃO Implementado
- **Tabela**: `organizacao_participante` (linhas 1332-1353)

### 2.10 SEÇÃO 10: Indicadores

**Tabela Relacionada**: `organizacao_indicador`

Registro de indicadores específicos da organização

- **Status**: ❌ NÃO Implementado
- **Tabela**: `organizacao_indicador` (linhas 1309-1325)

## 3. Estratégia de Implementação Proposta

### Fase 1: Documentação Completa (ATUAL)

✅ Criar documento de mapeamento completo
✅ Identificar campos implementados vs. faltantes
⏱️ Criar guia de referência rápida para desenvolvedores

### Fase 2: Características dos Associados

Implementar seção completa de características:

- Componente `CaracteristicasAssociados.tsx`
- Formulários para totais, gênero, categorias, produção
- Validações e cálculos automáticos

### Fase 3: Abrangência Geográfica

Implementar gestão de municípios:

- Componente `AbrangenciaGeografica.tsx`
- CRUD de municípios com busca
- Validação de totais vs. características

### Fase 4: Associados Jurídicos

Para organizações de segundo grau:

- Componente `AssociadosJuridicos.tsx`
- CRUD de organizações filiadas

### Fase 5: Dados de Produção

Implementar gestão de culturas:

- Componente `ProducaoOrganizacao.tsx`
- CRUD de produtos com volumes

### Fase 6: Completar Diagnósticos de Práticas

Implementar áreas faltantes (uma por vez):

1. Gestão Comercial
2. Gestão de Processos Produtivos
3. Gestão da Inovação
4. Gestão Socioambiental
5. Infraestrutura Sustentável

### Fase 7: Nível de Maturidade

- Componente `NivelMaturidade.tsx`
- Cálculo automático + ajuste manual
- Visualização em gráfico radar

### Fase 8: Seções Complementares

- Participantes
- Indicadores
- Observações gerais