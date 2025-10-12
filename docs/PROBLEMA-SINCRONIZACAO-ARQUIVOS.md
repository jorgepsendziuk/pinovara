# 🚨 PROBLEMA: Sincronização de Arquivos ODK

## 📋 Resumo Executivo

**Status Atual:** ❌ **ERRO DE PERMISSÃO**

**Sintoma:**
```
Sincronização concluída!
Total no ODK: 0
Já existentes: 0
Baixados agora: 0
Erros: 1
```

**Erro Real (nos logs):**
```
ERROR: permission denied for relation ORGANIZACAO_ARQUIVO_BN
```

---

## 🔍 Análise do Problema

### O que está acontecendo?

1. ✅ O código de sincronização está **CORRETO** e **IMPLEMENTADO**
2. ✅ A conexão com o banco ODK está **FUNCIONANDO**
3. ❌ O usuário `pinovara_sync` **NÃO TEM PERMISSÃO** para ler as tabelas de arquivos

### Por que acontece?

O sistema usa `dblink` para conectar ao banco ODK remoto e ler os arquivos. Mas o usuário `pinovara_sync` precisa de permissões SELECT nas tabelas:

- ❌ `ORGANIZACAO_FILE` 
- ❌ `ORGANIZACAO_ARQUIVO_BN`
- ❌ `ORGANIZACAO_ARQUIVO_REF`
- ❌ `ORGANIZACAO_ARQUIVO_BLB`

### Situação Parecida Resolvida Anteriormente

Para **FOTOS**, o mesmo problema ocorreu e foi resolvido concedendo permissões para:
- ✅ `ORGANIZACAO_FOTO_REF` 
- ✅ `ORGANIZACAO_FOTO_BLB`

Agora precisamos fazer o mesmo para **ARQUIVOS**.

---

## 🛠️ SOLUÇÃO

### Opção 1: Script SQL Completo (RECOMENDADO)

Executar no servidor ODK remoto o script:
```
scripts/database/grant-arquivo-permissions.sql
```

**Este script faz:**
1. Verifica se usuário `pinovara_sync` existe
2. Concede permissões SELECT nas 4 tabelas de arquivos
3. Testa as permissões
4. Mostra query de exemplo funcionando

### Opção 2: Comandos Rápidos

Se preferir executar manualmente no psql:

```sql
-- Conectar ao banco
\c odk_prod

-- Conceder permissões
GRANT SELECT ON odk_prod."ORGANIZACAO_FILE" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_ARQUIVO_BN" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_ARQUIVO_REF" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_ARQUIVO_BLB" TO pinovara_sync;

-- Verificar
SELECT 
  c.relname as table_name,
  CASE 
    WHEN has_table_privilege('pinovara_sync', c.oid, 'SELECT') 
    THEN '✅ OK' 
    ELSE '❌ SEM PERMISSÃO' 
  END as status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'odk_prod'
  AND c.relname LIKE 'ORGANIZACAO_ARQUIVO%'
ORDER BY c.relname;
```

---

## ✅ Como Testar Após Conceder Permissões

### 1. Teste Manual (SQL no servidor local)

```sql
-- Testar se consegue acessar a tabela
SELECT * FROM public.dblink(
  'host=app.pinovaraufba.com.br port=5432 dbname=odk_prod user=pinovara_sync password=Uef9tWW28NTnzjCP',
  'SELECT COUNT(*) FROM odk_prod."ORGANIZACAO_ARQUIVO_BN"'
) AS t(count bigint);
```

**Resultado esperado:** Um número (não erro de permissão)

### 2. Teste via Interface Web

1. Login no sistema PINOVARA
2. Editar organização (ex: ID 15)
3. Seção "Arquivos e Documentos"
4. Clicar "🔄 Sincronizar ODK"

**Resultado esperado:**
```
Sincronização concluída!
Total no ODK: X (número > 0 se houver arquivos)
Já existentes: Y
Baixados agora: Z
Erros: 0 ✅
```

---

## 📊 Informações Técnicas

### Estrutura de Relacionamento das Tabelas ODK

```
ORGANIZACAO_FILE (metadados)
    ↓ _PARENT_AURI
ORGANIZACAO_ARQUIVO_BN (nome do arquivo)
    ↓ _DOM_AURI → _SUB_AURI
ORGANIZACAO_ARQUIVO_REF (referência)
    ↓ _SUB_AURI
ORGANIZACAO_ARQUIVO_BLB (conteúdo binário)
```

### Query Usada pelo Sistema

```sql
SELECT 
  f."_URI",
  f."_PARENT_AURI",
  f."_CREATION_DATE",
  blb."VALUE",
  octet_length(blb."VALUE"),
  bn."UNROOTED_FILE_PATH"
FROM odk_prod."ORGANIZACAO_FILE" f
INNER JOIN odk_prod."ORGANIZACAO_ARQUIVO_BN" bn 
  ON bn."_PARENT_AURI" = f."_URI"
INNER JOIN odk_prod."ORGANIZACAO_ARQUIVO_REF" ref 
  ON ref."_DOM_AURI" = bn."_URI"
INNER JOIN odk_prod."ORGANIZACAO_ARQUIVO_BLB" blb 
  ON blb."_URI" = ref."_SUB_AURI"
WHERE f."_PARENT_AURI" = 'uuid:organizacao'
  AND blb."VALUE" IS NOT NULL
```

---

## 🎯 Arquivos Criados/Modificados

### Implementação do Sistema (✅ Concluído)
- ✅ `backend/src/types/arquivoSync.ts`
- ✅ `backend/src/services/arquivoSyncService.ts`
- ✅ `backend/src/controllers/arquivoSyncController.ts`
- ✅ `backend/src/routes/arquivoSyncRoutes.ts`
- ✅ `backend/src/routes/index.ts` (rotas registradas)
- ✅ `frontend/src/components/organizacoes/UploadDocumentos.tsx` (botão)
- ✅ `frontend/src/services/api.ts` (API)

### Scripts de Banco (✅ Criados)
- ✅ `scripts/database/grant-arquivo-permissions.sql`

### Documentação (✅ Atualizada)
- ✅ `docs/SINCRONIZACAO-ARQUIVOS-ODK.md` (documentação completa)
- ✅ `docs/PROBLEMA-SINCRONIZACAO-ARQUIVOS.md` (este arquivo)

---

## 📝 Checklist de Resolução

### Para o DBA (Servidor ODK Remoto)
- [ ] Conectar ao servidor app.pinovaraufba.com.br
- [ ] Conectar ao banco odk_prod
- [ ] Executar script `grant-arquivo-permissions.sql`
- [ ] Verificar que as 4 tabelas têm permissão SELECT para pinovara_sync
- [ ] Testar query de exemplo do script

### Para o Desenvolvedor (Servidor PINOVARA)
- [x] Código implementado ✅
- [x] Backend compilado ✅
- [x] Rotas registradas ✅
- [ ] Aguardar permissões serem concedidas
- [ ] Testar sincronização
- [ ] Confirmar que arquivos são baixados
- [ ] Documentar casos de sucesso

---

## 🔗 Documentos Relacionados

- 📄 `docs/SINCRONIZACAO-ARQUIVOS-ODK.md` - Documentação técnica completa
- 📄 `docs/SINCRONIZACAO-FOTOS-ODK-FINAL.md` - Caso similar resolvido
- 📄 `scripts/database/grant-arquivo-permissions.sql` - Script de permissões

---

## 💬 Comunicação com DBA

**Mensagem sugerida:**

```
Olá,

Implementamos a sincronização de arquivos do ODK Collect no sistema PINOVARA,
mas estamos com erro de permissão ao acessar as tabelas:
- ORGANIZACAO_FILE
- ORGANIZACAO_ARQUIVO_BN
- ORGANIZACAO_ARQUIVO_REF
- ORGANIZACAO_ARQUIVO_BLB

Poderia executar o script: scripts/database/grant-arquivo-permissions.sql
no servidor ODK (app.pinovaraufba.com.br)?

Este script concede SELECT para o usuário pinovara_sync (mesmo que já usamos
para sincronizar fotos) nas tabelas de arquivos.

O script tem verificações de segurança e queries de teste incluídas.

Obrigado!
```

---

**Data:** 12 de outubro de 2025  
**Próximo Passo:** Executar `grant-arquivo-permissions.sql` no servidor ODK  
**Status:** ⏳ Aguardando ação do DBA

