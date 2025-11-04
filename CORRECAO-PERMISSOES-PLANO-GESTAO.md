# 🔒 Correção de Permissões - Plano de Gestão

## 🔴 Problema Identificado

Ao tentar salvar uma ação do Plano de Gestão, o sistema retorna erro **500 (Internal Server Error)**.

### Erro no Backend:
```
ConnectorError(ConnectorError { 
  user_facing_error: None, 
  kind: QueryError(PostgresError { 
    code: "42501", 
    message: "permission denied for sequence plano_gestao_acao_id_seq", 
    severity: "ERROR"
  })
})
```

### Causa:
O usuário do banco de dados (`pinovara`) **não tem permissão** para usar as sequences (auto-incremento) das tabelas do Plano de Gestão:
- `plano_gestao_acao_modelo_id_seq`
- `plano_gestao_acao_id_seq`

## ✅ Solução

### Script SQL Criado:
📄 `/scripts/database/fix-plano-gestao-permissions.sql`

### O que o script faz:
1. Concede permissões de **SELECT, INSERT, UPDATE, DELETE** nas tabelas
2. Concede permissões de **USAGE, SELECT** nas sequences (para auto-incremento)
3. Verifica se as permissões foram aplicadas corretamente

## 📋 Como Aplicar (para o DBA)

### Opção 1: Via linha de comando
```bash
# Se tiver psql instalado localmente
PGPASSWORD='pinovara2024!' psql -h localhost -U postgres -d pinovara_db \
  -f scripts/database/fix-plano-gestao-permissions.sql

# Ou via Docker (se o banco estiver em container)
docker exec -i pinovara-postgres psql -U postgres -d pinovara_db \
  < scripts/database/fix-plano-gestao-permissions.sql
```

### Opção 2: Via DBeaver, pgAdmin ou outro cliente SQL
1. Conecte-se ao banco como usuário `postgres` (ou outro superuser)
2. Execute o conteúdo do arquivo `scripts/database/fix-plano-gestao-permissions.sql`

## 🔍 Verificação

Após executar o script, a última parte do SQL mostra:

### Verificação de Permissões nas Tabelas:
```
schemaname | tablename                    | can_insert | can_update
-----------+-----------------------------+------------+-----------
pinovara   | plano_gestao_acao_modelo    | t          | t
pinovara   | plano_gestao_acao           | t          | t
```

### Verificação de Permissões nas Sequences:
```
schemaname | sequencename                       | can_use
-----------+-----------------------------------+--------
pinovara   | plano_gestao_acao_modelo_id_seq   | t
pinovara   | plano_gestao_acao_id_seq          | t
```

**`t` = true (permissão concedida) ✅**

## 🎯 Após Aplicar

1. **Não precisa reiniciar** o backend
2. **Não precisa reiniciar** o frontend
3. Apenas **tente salvar uma ação novamente** no Plano de Gestão
4. Deve funcionar imediatamente! 🚀

## 📝 Notas

- Este problema ocorreu porque as tabelas foram criadas **após** a configuração inicial do banco
- **Sempre que criar novas tabelas** no schema `pinovara`, lembre-se de conceder permissões ao `pinovara_user`
- As permissões nas sequences são essenciais para campos com `SERIAL` ou `@default(autoincrement())`

## 🔗 Arquivos Relacionados

- **Script de Permissões**: `/scripts/database/fix-plano-gestao-permissions.sql`
- **Migration Original**: `/scripts/database/create-plano-gestao-tables.sql`
- **População de Dados**: `/scripts/database/populate-plano-gestao-template-CORRETO.sql`
- **Schema Prisma**: `/backend/prisma/schema.prisma`

