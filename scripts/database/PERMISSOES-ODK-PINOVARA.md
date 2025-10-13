# 🔐 Permissões ODK para Tabelas PINOVARA_

## 📋 Problema

O sistema PINOVARA tem **dois formatos** de formulários no ODK:
- **Versão Nova**: Tabelas `ORGANIZACAO_*` (ORGANIZACAO_FOTO_REF, ORGANIZACAO_ARQUIVO_REF, etc)
- **Versão Antiga**: Tabelas `PINOVARA_*` (PINOVARA_FOTO_REF, PINOVARA_ARQUIVO_REF, etc)

Algumas organizações foram cadastradas com a versão antiga e suas fotos/arquivos estão nas tabelas `PINOVARA_*`.

## ✅ Solução

O sistema agora tenta **ambas as versões** (fallback):
1. Busca nas tabelas `ORGANIZACAO_*` primeiro
2. Se não encontrar, busca nas tabelas `PINOVARA_*`

Mas para isso funcionar, o usuário `pinovara_sync` precisa ter permissões nas tabelas `PINOVARA_*`.

## 🚀 Como Aplicar

### 1. Envie o script para o DBA

Arquivo: `grant-permissions-pinovara-tables.sql`

### 2. DBA deve executar no servidor ODK

```bash
# Conectar no banco ODK como superuser
psql -h app.pinovaraufba.com.br -U postgres -d odk_prod

# Executar o script
\i /caminho/para/grant-permissions-pinovara-tables.sql
```

### 3. Verificar Permissões

Execute esta query para confirmar:

```sql
SELECT 
  schemaname,
  tablename,
  has_table_privilege('pinovara_sync', schemaname||'.'||tablename, 'SELECT') as tem_select
FROM pg_tables
WHERE schemaname = 'odk_prod'
  AND (tablename LIKE 'PINOVARA_%' OR tablename LIKE 'ORGANIZACAO_%')
ORDER BY tablename;
```

Deve mostrar `tem_select = true` para todas as tabelas.

### 4. Testar Conexão

```sql
SET ROLE pinovara_sync;
SELECT count(*) FROM odk_prod."PINOVARA_FOTO_REF";
SELECT count(*) FROM odk_prod."PINOVARA_ARQUIVO_REF";
SELECT count(*) FROM odk_prod."ORGANIZACAO_FOTO_REF";
SELECT count(*) FROM odk_prod."ORGANIZACAO_ARQUIVO_REF";
RESET ROLE;
```

## 📊 Tabelas que Precisam de Permissão

### PINOVARA_ (Versão Antiga)
- `PINOVARA_CORE`
- `PINOVARA_FOTOS` / `PINOVARA_FOTO_BN` / `PINOVARA_FOTO_REF` / `PINOVARA_FOTO_BLB`
- `PINOVARA_FILE` / `PINOVARA_ARQUIVO_BN` / `PINOVARA_ARQUIVO_REF` / `PINOVARA_ARQUIVO_BLB`
- `PINOVARA_ABRANGENCIA_SOCIO` / `PINOVARA_ABRANGENCIA_PJ` / `PINOVARA_PRODUCAO`

### ORGANIZACAO_ (Versão Nova)
- `ORGANIZACAO_CORE`
- `ORGANIZACAO_FOTOS` / `ORGANIZACAO_FOTO_BN` / `ORGANIZACAO_FOTO_REF` / `ORGANIZACAO_FOTO_BLB`
- `ORGANIZACAO_FILE` / `ORGANIZACAO_ARQUIVO_BN` / `ORGANIZACAO_ARQUIVO_REF` / `ORGANIZACAO_ARQUIVO_BLB`
- `ORGANIZACAO_ABRANGENCIA_SOCIO` / `ORGANIZACAO_ABRANGENCIA_PJ` / `ORGANIZACAO_PRODUCAO`

## 🔍 Logs de Debug

Após aplicar permissões, os logs do PINOVARA mostrarão:

```
🔍 Tentando buscar fotos das tabelas ORGANIZACAO_...
   ORGANIZACAO_: 0 fotos
⚠️ Nenhuma foto encontrada em ORGANIZACAO_, tentando PINOVARA_...
   PINOVARA_: 5 fotos
📊 Total de fotos encontradas: 5
```

## ⚠️ Importante

- Execute como **superuser** do PostgreSQL
- Verifique os **nomes exatos** das tabelas no ODK
- Permissões são apenas **SELECT** (somente leitura)
- Script é **idempotente** (pode executar múltiplas vezes)

## 📞 Contato DBA

Se o DBA tiver dúvidas, pode verificar:
- Tabelas existentes: `\dt odk_prod.PINOVARA_*`
- Usuários: `\du pinovara_sync`
- Permissões: `\dp odk_prod.PINOVARA_FOTO_REF`

