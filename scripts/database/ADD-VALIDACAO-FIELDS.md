# Adicionar Campos de Validação

## Objetivo
Adicionar campos de validação de cadastros na tabela `organizacao`.

## Campos Adicionados

| Campo | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `validacao_status` | INTEGER | 1 | Status da validação |
| `validacao_usuario` | INTEGER | NULL | ID do usuário validador (FK para users) |
| `validacao_data` | TIMESTAMP | NULL | Data/hora da validação |
| `validacao_obs` | TEXT | NULL | Observações sobre a validação |

## Status de Validação

| Código | Status | Cor | Descrição |
|--------|--------|-----|-----------|
| 1 | NÃO VALIDADO | Cinza | Cadastro ainda não foi validado (padrão) |
| 2 | VALIDADO | Verde | Cadastro aprovado e validado |
| 3 | PENDÊNCIA | Amarelo | Cadastro com pendências a corrigir |
| 4 | REPROVADO | Vermelho | Cadastro reprovado |

## Como Executar

### 1. Execute o script SQL no banco de dados:
```bash
psql -h localhost -U postgres -d pinovara -f add-validacao-fields.sql
```

### 2. Sincronize o schema do Prisma:
```bash
cd backend
npx prisma db pull
```

### 3. Gere o cliente Prisma:
```bash
npx prisma generate
```

## Verificação

Após executar, verifique se os campos foram criados:
```sql
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'pinovara' 
  AND table_name = 'organizacao'
  AND column_name LIKE 'validacao%'
ORDER BY column_name;
```

## Próximos Passos

1. Atualizar types TypeScript
2. Criar componente de validação no frontend
3. Adicionar badges de status nas listas/dashboards
4. Implementar endpoints de validação no backend

---

**Data:** 14 de outubro de 2025  
**Arquivo SQL:** `add-validacao-fields.sql`

