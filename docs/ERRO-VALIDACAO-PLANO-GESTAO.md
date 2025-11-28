# Erro 500 - Validação do Plano de Gestão

## Problema

Ao tentar salvar a validação do plano de gestão, ocorre erro 500 (Internal Server Error).

## Causa

O erro ocorre porque os campos de validação do plano de gestão ainda não existem no banco de dados. O script SQL foi criado, mas precisa ser executado pelo DBA.

## Solução

Execute o script SQL no banco de dados:

```bash
psql -h bd.pinovaraufba.com.br -U pinovara -d pinovara -f scripts/database/add-plano-gestao-validacao-fields.sql
```

Ou execute manualmente no banco:

1. Conecte ao banco de dados PostgreSQL
2. Execute o conteúdo do arquivo: `scripts/database/add-plano-gestao-validacao-fields.sql`

## Campos que serão criados

- `plano_gestao_validacao_status` (INT, default 1)
- `plano_gestao_validacao_usuario` (INT, FK para users)
- `plano_gestao_validacao_data` (TIMESTAMP)
- `plano_gestao_validacao_obs` (TEXT)

## Verificação

Após executar o script, verifique se os campos foram criados:

```sql
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'pinovara' 
  AND table_name = 'organizacao'
  AND column_name LIKE 'plano_gestao_validacao%'
ORDER BY column_name;
```

## Após executar o script

1. Reinicie o servidor backend para garantir que o Prisma Client está sincronizado
2. Teste novamente a validação do plano de gestão

