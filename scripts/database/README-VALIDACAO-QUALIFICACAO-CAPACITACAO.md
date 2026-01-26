# Scripts de Validação - Qualificações e Capacitações

## 📋 Visão Geral

Estes scripts adicionam campos de validação nas tabelas de qualificações e capacitações, seguindo o mesmo padrão já implementado para organizações e planos de gestão.

## 📁 Arquivos Disponíveis

### 1. Script Individual - Qualificações
**Arquivo**: `add-qualificacao-validacao-fields.sql`

Adiciona campos de validação na tabela `capacitacao.qualificacao`:
- `validacao_status` (INTEGER, DEFAULT 1)
- `validacao_usuario` (INTEGER, FK para pinovara.users)
- `validacao_data` (TIMESTAMP)
- `validacao_obs` (TEXT)

### 2. Script Individual - Capacitações
**Arquivo**: `add-capacitacao-validacao-fields.sql`

Adiciona campos de validação na tabela `capacitacao.capacitacao`:
- `validacao_status` (INTEGER, DEFAULT 1)
- `validacao_usuario` (INTEGER, FK para pinovara.users)
- `validacao_data` (TIMESTAMP)
- `validacao_obs` (TEXT)

### 3. Script Unificado (Recomendado)
**Arquivo**: `add-qualificacao-capacitacao-validacao-fields.sql`

Executa ambos os scripts acima em sequência. **Use este script se quiser aplicar tudo de uma vez.**

## 🎯 Status de Validação

| Código | Status | Cor | Descrição |
|--------|--------|-----|-----------|
| 1 | NÃO VALIDADO | Cinza | Registro ainda não foi validado (padrão) |
| 2 | VALIDADO | Verde | Registro aprovado e validado |
| 3 | PENDÊNCIA | Amarelo | Registro com pendências a corrigir |
| 4 | REPROVADO | Vermelho | Registro reprovado |

## 🚀 Como Executar

### Opção 1: Script Unificado (Recomendado)

```bash
psql -h bd.pinovaraufba.com.br -U pinovara -d pinovara -f scripts/database/add-qualificacao-capacitacao-validacao-fields.sql
```

### Opção 2: Scripts Individuais

```bash
# Apenas qualificações
psql -h bd.pinovaraufba.com.br -U pinovara -d pinovara -f scripts/database/add-qualificacao-validacao-fields.sql

# Apenas capacitações
psql -h bd.pinovaraufba.com.br -U pinovara -d pinovara -f scripts/database/add-capacitacao-validacao-fields.sql
```

### Opção 3: Execução Manual

1. Conecte ao banco de dados PostgreSQL
2. Execute o conteúdo do arquivo SQL desejado

## ✅ Verificação

Após executar os scripts, verifique se os campos foram criados:

```sql
-- Verificar campos na tabela qualificacao
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'capacitacao' 
  AND table_name = 'qualificacao'
  AND column_name LIKE 'validacao%'
ORDER BY column_name;

-- Verificar campos na tabela capacitacao
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'capacitacao' 
  AND table_name = 'capacitacao'
  AND column_name LIKE 'validacao%'
ORDER BY column_name;
```

## 📝 Observações Importantes

- Os scripts são **idempotentes** (podem ser executados múltiplas vezes sem erro)
- Os campos `validacao_usuario` fazem referência à tabela `pinovara.users` (schema diferente)
- A foreign key usa `ON DELETE SET NULL` para manter integridade referencial
- Os índices são criados automaticamente para otimizar consultas por status

## 🔄 Próximos Passos (Após Execução)

1. **Atualizar Schema Prisma**:
   ```bash
   cd backend
   npx prisma db pull
   ```

2. **Gerar Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Atualizar Types TypeScript**:
   - Atualizar interfaces em `frontend/src/types/qualificacao.ts`
   - Atualizar interfaces em `frontend/src/types/capacitacao.ts`

4. **Implementar Backend**:
   - Criar endpoints de validação em `backend/src/services/qualificacaoService.ts`
   - Criar endpoints de validação em `backend/src/services/capacitacaoService.ts`

5. **Implementar Frontend**:
   - Criar componentes de validação nas páginas de qualificações
   - Criar componentes de validação nas páginas de capacitações
   - Adicionar badges de status nas listas

## 📚 Arquivos Relacionados

- `scripts/database/add-validacao-fields.sql` - Validação de organizações (padrão)
- `scripts/database/add-plano-gestao-validacao-fields.sql` - Validação de plano de gestão
- `docs/SISTEMA-VALIDACAO.md` - Documentação do sistema de validação

---

**Data de Criação**: Janeiro 2025  
**Padrão Baseado Em**: Sistema de validação de organizações
