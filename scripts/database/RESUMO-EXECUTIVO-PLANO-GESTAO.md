# 📊 RESUMO EXECUTIVO - Análise do HTML Plano de Gestão

**Data**: 2025-11-04  
**Arquivo Analisado**: `docs/resources/plano de gestao empreendimentos.html`  
**Total de Linhas**: 1593

---

## ✅ O QUE FOI FEITO

1. **Leitura completa** do arquivo HTML (linhas 1-1593)
2. **Mapeamento detalhado** de TODOS os planos e ações
3. **Documentação completa** em `MAPEAMENTO-COMPLETO-HTML-PLANO-GESTAO.md`
4. **Correção do erro anterior**: Eu havia inventado planos que não existem!

---

## 📋 O QUE FOI ENCONTRADO

### Total de Planos Únicos: **7**
1. **Gestão e Estratégias** (Foco nos Empreendimentos) - 18 ações
2. **Tecnologia e Inovação** (Foco nos Empreendimentos) - 3 ações
3. **Financeiro e Orçamentário** (Foco nos Empreendimentos) - 3 ações
4. **Financeiro e Orçamentário** (Foco nos negócios) - 3 ações
5. **Qualificação da Liderança** (Foco nos Empreendimentos) - 6 ações
6. **Produção** (Foco nos Empreendimentos) - 6 ações
7. **Aprendizagem Interorganizacional** (Foco nos Empreendimentos) - 7 ações

### Total de Ações: **49**

### Total de Tabelas HTML: **10**
(Alguns planos estão divididos em múltiplas tabelas)

---

## ⚠️ OBSERVAÇÕES IMPORTANTES

### 1. **Planos com Múltiplas Tabelas**
Alguns planos aparecem em **mais de uma tabela** no HTML:
- **Gestão e Estratégias**: 3 tabelas diferentes
- **Financeiro e Orçamentário**: 2 tabelas (uma para "Empreendimentos", outra para "negócios")
- **Qualificação da Liderança**: 2 tabelas
- **Produção**: 2 tabelas
- **Aprendizagem Interorganizacional**: 2 tabelas

### 2. **Estrutura de Grupos**
Dentro das tabelas, as ações são agrupadas por **títulos em negrito** na primeira coluna (usando `rowspan`). Exemplos:
- "Definição da Proposta de Valor e Propósito do Empreendimento"
- "Organização Social"
- "Planejamento e estratégia"
- "Conhecimento ancestral e cultura"

### 3. **Campos Editáveis**
Para CADA ação, os usuários poderão editar:
- **RESPONSÁVEL** (hint: "Gestor do empreendimento", "Incubadora", "Consultores", etc.)
- **INÍCIO** (data - vazio no template)
- **TÉRMINO** (data - vazio no template)
- **COMO SERÁ FEITO?** (hint: texto descritivo com 50-300 caracteres)
- **RECURSOS** (hint: "Facilitadores", "Consultores", "Facilitadores e plataforma específica", etc.)

---

## 🎯 DECISÕES NECESSÁRIAS

### **DECISÃO CRÍTICA #1**: Estratégia para Planos com Múltiplas Tabelas

**Opção A (RECOMENDADA)**: Usar campo `grupo` para organizar
```sql
-- Exemplo: Gestão e Estratégias tem 3 grupos principais
tipo = 'gestao-estrategias'
titulo = 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)'

grupo = 'Definição da Proposta de Valor e Propósito do Empreendimento'  -- 3 ações
grupo = 'Construção do Plano de Ação para viabilização...'              -- 3 ações
grupo = 'Estabelecimento de processo avaliativo'                         -- 2 ações
grupo = 'Organização Social'                                             -- 3 ações
grupo = 'Planejamento e estratégia'                                      -- 3 ações
grupo = 'Conhecimento ancestral e cultura'                               -- 2 ações
grupo = NULL                                                             -- 2 ações (sem grupo definido)
```

**Opção B**: Criar tipos diferentes
```sql
tipo = 'gestao-estrategias-parte1'
tipo = 'gestao-estrategias-parte2'
tipo = 'gestao-estrategias-parte3'
```
❌ **NÃO RECOMENDADO**: Fragmenta o plano logicamente único

---

### **DECISÃO CRÍTICA #2**: Valores do Campo `ordem`

**Opção A (RECOMENDADA)**: Ordem sequencial simples (1, 2, 3...)
```sql
-- Gestão e Estratégias: ações de 1 a 18
-- Tecnologia e Inovação: ações de 19 a 21
-- Financeiro (Empreendimentos): ações de 22 a 24
-- etc...
```

**Opção B**: Ordem por plano (cada plano reinicia)
```sql
-- Gestão e Estratégias: ações de 1 a 18
-- Tecnologia e Inovação: ações de 1 a 3
-- Financeiro (Empreendimentos): ações de 1 a 3
-- etc...
```

---

## 📁 ARQUIVOS CRIADOS

1. **`MAPEAMENTO-COMPLETO-HTML-PLANO-GESTAO.md`** (6KB)
   - Documentação detalhada de TODOS os planos
   - Lista completa de todas as 49 ações
   - Localização exata de cada tabela no HTML
   - Textos completos dos hints

2. **`RESUMO-EXECUTIVO-PLANO-GESTAO.md`** (este arquivo)
   - Visão geral para revisão rápida
   - Decisões críticas que precisam ser tomadas

3. **`ANALISE-PLANO-GESTAO.md`** (já existia, atualizado)
   - Documento inicial de análise

---

## 🚀 PRÓXIMOS PASSOS

### Após sua aprovação:

1. **Gerar script SQL** com os 49 INSERTs
2. **Testar script** localmente (simulação)
3. **Documentar** procedimento de execução
4. **Aguardar** sua execução manual (pelo DBA)

---

## ❓ PERGUNTAS PARA VOCÊ

1. **Você aprova a Opção A (usar campo `grupo`)** para organizar planos com múltiplas tabelas?
   - [ ] Sim, usar campo `grupo`
   - [ ] Não, prefiro Opção B (tipos separados)
   - [ ] Outro (especificar)

2. **Você aprova a Opção A (ordem sequencial global)** para o campo `ordem`?
   - [ ] Sim, ordem sequencial de 1 a 49
   - [ ] Não, prefiro Opção B (ordem por plano)
   - [ ] Outro (especificar)

3. **Alguma correção** no mapeamento?
   - [ ] Está tudo correto, pode gerar o script
   - [ ] Tenho correções (especificar)

4. **Preciso ajustar algo** antes de gerar o script SQL final?

---

**AGUARDANDO SUA REVISÃO E DECISÕES** 🟡

