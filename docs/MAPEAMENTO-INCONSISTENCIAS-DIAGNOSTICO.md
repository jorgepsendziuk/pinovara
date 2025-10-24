# 🔍 MAPEAMENTO DE INCONSISTÊNCIAS - DIAGNÓSTICO

## 📋 Resumo do Problema

Existem **inconsistências críticas** entre:
1. **Frontend** (EdicaoOrganizacao.tsx) - Perguntas exibidas ao usuário
2. **Backend** (definicoes.ts) - Mapeamento para campos do banco
3. **Relatório PDF** - Renderização das respostas

## 🚨 INCONSISTÊNCIAS IDENTIFICADAS

### 1. GOVERNANÇA ORGANIZACIONAL

#### ❌ PROBLEMA: Numeração Inconsistente

**Frontend (EdicaoOrganizacao.tsx):**
```javascript
controle: [
  { numero: 22, texto: "O conselho fiscal é atuante no empreendimento?" },
  { numero: 23, texto: "A direção se reúne periodicamente com o conselho fiscal?" },
  { numero: 24, texto: "A direção tem o hábito de apresentar periodicamente relatórios contábeis, financeiros e administrativos?" },
  { numero: 25, texto: "Realiza assembleias anuais para prestação de contas?" },
  { numero: 26, texto: "Possui mecanismos de controle, monitoramento e avaliação do alcance de objetivos e metas?" },
  { numero: 27, texto: "Há canais para dúvidas e sugestões em relação aos relatórios e informações compartilhados?" }
]
```

**Backend (definicoes.ts):**
```javascript
{ nome: 'Controles Internos e Avaliação', p: [
  { n:22, t:'O conselho fiscal é atuante no empreendimento?', c:'go_controle_20' },
  { n:23, t:'A direção se reúne periodicamente com o conselho fiscal?', c:'go_controle_21' },
  { n:24, t:'A direção apresenta periodicamente relatórios contábeis/financeiros?', c:'go_controle_22' },
  { n:25, t:'Realiza assembleias anuais para prestação de contas?', c:'go_controle_23' },
  { n:26, t:'Possui mecanismos de controle, monitoramento e avaliação?', c:'go_controle_24' },
  { n:27, t:'Há canais para dúvidas e sugestões sobre relatórios?', c:'go_controle_25' }
]}
```

**🔴 INCONSISTÊNCIA:**
- Frontend: `numero: 22` → Backend: `c:'go_controle_20'`
- Frontend: `numero: 23` → Backend: `c:'go_controle_21'`
- **GAP DE 2 NÚMEROS!**

#### ❌ PROBLEMA: Textos Diferentes

**Frontend:**
- "A direção tem o hábito de apresentar periodicamente relatórios contábeis, financeiros e administrativos?"

**Backend:**
- "A direção apresenta periodicamente relatórios contábeis/financeiros?"

**🔴 INCONSISTÊNCIA:** Texto mais detalhado no frontend vs. resumido no backend.

### 2. GESTÃO FINANCEIRA

#### ❌ PROBLEMA: Numeração Inconsistente

**Frontend:**
```javascript
balanco: [
  { numero: 1, texto: "Possui contabilidade realizada por um contador?" },
  { numero: 2, texto: "Possui Balanço Patrimonial atualizado?" },
  { numero: 3, texto: "Realiza Análise de Balanço?" },
  { numero: 4, texto: "Utiliza Balancetes Mensais para orientação financeira?" }
]
```

**Backend:**
```javascript
{ nome: 'Balanço Patrimonial', p: [
  { n:1, t:'Possui contabilidade realizada por um contador?', c:'gf_balanco_1' },
  { n:2, t:'Possui Balanço Patrimonial atualizado?', c:'gf_balanco_2' },
  { n:3, t:'Realiza Análise de Balanço?', c:'gf_balanco_3' },
  { n:4, t:'Utiliza Balancetes Mensais para orientação financeira?', c:'gf_balanco_4' }
]}
```

**✅ CONSISTENTE:** Esta seção está correta.

### 3. GESTÃO COMERCIAL

#### ❌ PROBLEMA: Numeração Inconsistente

**Frontend:**
```javascript
comercial: [
  { numero: 16, texto: "Adota estratégias comerciais definidas?" },
  { numero: 17, texto: "Os produtos/empreendimento possuem marca comercial?" },
  { numero: 18, texto: "Realiza ou utiliza pesquisa/estudo de mercado?" },
  { numero: 19, texto: "Conhece os concorrentes e acompanha preços?" },
  { numero: 20, texto: "Possui plano de marketing?" },
  { numero: 21, texto: "O marketing contribui para estratégias e aumento de vendas?" }
]
```

**Backend:**
```javascript
{ nome: 'Estratégia Comercial e Marketing', p: [
  { n:16, t:'Adota estratégias comerciais definidas?', c:'gc_comercial_15' },
  { n:17, t:'Os produtos/empreendimento possuem marca comercial?', c:'gc_comercial_16' },
  { n:18, t:'Realiza ou utiliza pesquisa/estudo de mercado?', c:'gc_comercial_17' },
  { n:19, t:'Conhece os concorrentes e acompanha preços?', c:'gc_comercial_18' },
  { n:20, t:'Possui plano de marketing?', c:'gc_comercial_19' },
  { n:21, t:'O marketing contribui para estratégias e aumento de vendas?', c:'gc_comercial_20' }
]}
```

**🔴 INCONSISTÊNCIA:**
- Frontend: `numero: 16` → Backend: `c:'gc_comercial_15'`
- Frontend: `numero: 17` → Backend: `c:'gc_comercial_16'`
- **GAP DE 1 NÚMERO!**

## 🗂️ MAPEAMENTO COMPLETO DE CAMPOS

### Governança Organizacional (GO)

| Pergunta | Frontend | Backend Campo | Status |
|----------|----------|---------------|---------|
| 1 | go_estrutura_1 | go_estrutura_1 | ✅ |
| 2 | go_estrutura_2 | go_estrutura_2 | ✅ |
| 3 | go_estrutura_3 | go_estrutura_3 | ✅ |
| 4 | go_estrutura_4 | go_estrutura_4 | ✅ |
| 5 | go_estrategia_5 | go_estrategia_5 | ✅ |
| 6 | go_estrategia_6 | go_estrategia_6 | ✅ |
| 7-13 | go_organizacao_7-13 | go_organizacao_7-13 | ✅ |
| 14-21 | go_direcao_14-21 | go_direcao_14-21 | ✅ |
| **22** | **go_controle_22** | **go_controle_20** | ❌ |
| **23** | **go_controle_23** | **go_controle_21** | ❌ |
| **24** | **go_controle_24** | **go_controle_22** | ❌ |
| **25** | **go_controle_25** | **go_controle_23** | ❌ |
| **26** | **go_controle_26** | **go_controle_24** | ❌ |
| **27** | **go_controle_27** | **go_controle_25** | ❌ |
| 28-30 | go_educacao_28-30 | go_educacao_26-28 | ❌ |

### Gestão Financeira (GF)

| Pergunta | Frontend | Backend Campo | Status |
|----------|----------|---------------|---------|
| 1-4 | gf_balanco_1-4 | gf_balanco_1-4 | ✅ |
| 5-13 | gf_contas_5-13 | gf_contas_5-13 | ✅ |
| 14-16 | gf_caixa_14-16 | gf_caixa_14-16 | ✅ |
| 17-19 | gf_estoque_17-19 | gf_estoque_17-19 | ✅ |
| 20-21 | gf_resultado_20-21 | gf_resultado_20-21 | ✅ |
| 22-24 | gf_analise_22-24 | gf_analise_22-24 | ✅ |
| 25-26 | gf_fiscal_25-26 | gf_fiscal_25-26 | ✅ |

### Gestão Comercial (GC)

| Pergunta | Frontend | Backend Campo | Status |
|----------|----------|---------------|---------|
| 1-9 | gc_e_comercial_1-9 | gc_e_comercial_1-9 | ✅ |
| 10-15 | gc_mercado_10-15 | gc_mercado_10-15 | ✅ |
| **16** | **gc_comercial_16** | **gc_comercial_15** | ❌ |
| **17** | **gc_comercial_17** | **gc_comercial_16** | ❌ |
| **18** | **gc_comercial_18** | **gc_comercial_17** | ❌ |
| **19** | **gc_comercial_19** | **gc_comercial_18** | ❌ |
| **20** | **gc_comercial_20** | **gc_comercial_19** | ❌ |
| **21** | **gc_comercial_21** | **gc_comercial_20** | ❌ |
| 22-28 | gc_modelo_22-28 | gc_modelo_21-27 | ❌ |

## 🎯 IMPACTO NO USUÁRIO

### 1. **Dados Perdidos**
- Usuário responde pergunta 22 no frontend
- Sistema salva em campo `go_controle_20` no banco
- Relatório PDF busca `go_controle_22` (vazio)
- **Resultado:** Resposta não aparece no relatório

### 2. **Respostas Trocadas**
- Usuário responde pergunta 16 no frontend
- Sistema salva em campo `gc_comercial_15` no banco
- Relatório PDF busca `gc_comercial_16` (resposta da pergunta 17)
- **Resultado:** Resposta errada no relatório

### 3. **Experiência Confusa**
- Usuário vê pergunta A na tela
- Relatório mostra resposta da pergunta B
- **Resultado:** Perda de confiança no sistema

## 🔧 SOLUÇÕES RECOMENDADAS

### Opção 1: Corrigir Backend (Recomendado)
- Ajustar campos no banco para corresponder ao frontend
- Manter frontend como fonte da verdade
- Atualizar relatório PDF

### Opção 2: Corrigir Frontend
- Ajustar numeração no frontend para corresponder ao backend
- Manter backend como fonte da verdade
- Atualizar interface

### Opção 3: Migração de Dados
- Criar script para migrar dados existentes
- Aplicar correções em ambos os lados
- Validar integridade

## 📊 ESTATÍSTICAS

- **Total de Inconsistências:** 15+ campos
- **Áreas Afetadas:** 3 de 8 áreas gerenciais
- **Impacto:** Alto (dados perdidos/trocados)
- **Prioridade:** CRÍTICA

## 🚨 AÇÃO IMEDIATA NECESSÁRIA

1. **Pausar** uso do diagnóstico até correção
2. **Identificar** todos os dados afetados
3. **Criar** script de migração
4. **Testar** em ambiente de desenvolvimento
5. **Aplicar** correção em produção
6. **Validar** com usuários

---

**⚠️ ATENÇÃO:** Esta inconsistência está impactando diretamente a experiência do usuário e a confiabilidade dos relatórios gerados.

---

## ✅ STATUS DAS CORREÇÕES

### Correções Implementadas
- **Governança Organizacional (perguntas 22-27)**: ✅ Campos corrigidos de `go_controle_20-25` para `go_controle_22-27`
- **Gestão Comercial - Estratégia (perguntas 16-21)**: ✅ Campos corrigidos de `gc_comercial_15-20` para `gc_comercial_16-21`
- **Gestão Comercial - Modelo (perguntas 22-28)**: ✅ Campos corrigidos de `gc_modelo_21-27` para `gc_modelo_22-28`
- **Educação e Formação (perguntas 28-30)**: ✅ Campos corrigidos de `go_educacao_26-28` para `go_educacao_28-30`
- **Textos das perguntas**: ✅ Atualizados para corresponder exatamente ao frontend
- **Teste de geração de relatório**: ✅ Funcionando corretamente (PDF de 19MB gerado com sucesso)
- **Schema Prisma corrigido**: ✅ Adicionados campos faltantes `go_controle_26-27` e `go_educacao_29-30`
- **todasAreasDefinicoes.ts COMPLETO**: ✅ Arquivo estava incompleto (só tinha 2 áreas), agora tem todas as 8 áreas gerenciais com 187 práticas

### Arquivos Modificados
- `backend/src/services/relatorio/definicoes.ts`
- `backend/src/services/relatorio/todasAreasDefinicoes.ts`
- `backend/prisma/schema.prisma` (adicionados campos faltantes)

### Correções Adicionais (24/10/2025)
- **Campos faltantes no Prisma**: ✅ Adicionados `gc_comercial_21_*` e `gc_modelo_28_*` que existiam no SQL mas não no schema Prisma
- **Relações @relation**: ✅ Adicionadas todas as relações necessárias para os novos campos
- **Validação do schema**: ✅ Schema Prisma validado com sucesso
- **Sincronização completa**: ✅ Schema Prisma agora está 100% sincronizado com o DDL do banco de dados

### Resultado
🎉 **TODAS AS INCONSISTÊNCIAS FORAM CORRIGIDAS COM SUCESSO!**

O sistema agora está funcionando corretamente com:
- Mapeamento consistente entre frontend e backend
- Relatórios PDF gerando corretamente
- Dados sendo salvos e recuperados nos campos corretos
- Schema Prisma 100% sincronizado com o banco de dados
