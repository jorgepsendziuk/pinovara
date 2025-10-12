# 📎 Sincronização de Arquivos ODK - Documentação

## ❌ PROBLEMA ATUAL

**Status:** 🔴 **ERRO DE PERMISSÃO**

**Erro:** `ERROR: permission denied for relation ORGANIZACAO_ARQUIVO_BN`

**Descrição:** O usuário `pinovara_sync` usado pelo dblink não tem permissões para acessar as tabelas de arquivos no schema `odk_prod` do servidor remoto.

---

## 🏗️ Arquitetura

```
Banco ODK (app.pinovaraufba.com.br)
├── ORGANIZACAO_FILE (_PARENT_AURI → organização)
├── ORGANIZACAO_ARQUIVO_BN (UNROOTED_FILE_PATH → nome do arquivo)
├── ORGANIZACAO_ARQUIVO_REF (_DOM_AURI → _SUB_AURI)
└── ORGANIZACAO_ARQUIVO_BLB (_URI → VALUE bytea)
        ↓ dblink (somente leitura)
Banco PINOVARA Local
├── db_connections (credenciais ODK)
└── organizacao_arquivo (registros dos arquivos)
        ↓
Disco: /var/pinovara/shared/uploads/arquivos/
└── {nome_original}.{ext}
```

---

## 🔐 Solução: Conceder Permissões

### Script SQL a ser executado no servidor ODK remoto

O DBA deve executar o script: `scripts/database/grant-arquivo-permissions.sql`

**Resumo do script:**

```sql
-- 1. Verificar/criar usuário pinovara_sync (já existe para fotos)
CREATE USER pinovara_sync WITH PASSWORD 'Uef9tWW28NTnzjCP';

-- 2. Conceder permissões nas tabelas de arquivos
GRANT SELECT ON odk_prod."ORGANIZACAO_FILE" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_ARQUIVO_BN" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_ARQUIVO_REF" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_ARQUIVO_BLB" TO pinovara_sync;
```

---

## 📊 Query SQL Utilizada

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

## 🗂️ Arquivos da Implementação

### Backend
1. ✅ `backend/src/types/arquivoSync.ts` - Tipos TypeScript
2. ✅ `backend/src/services/arquivoSyncService.ts` - Lógica de sincronização
3. ✅ `backend/src/controllers/arquivoSyncController.ts` - Endpoints HTTP
4. ✅ `backend/src/routes/arquivoSyncRoutes.ts` - Rotas

### Frontend
1. ✅ `frontend/src/components/organizacoes/UploadDocumentos.tsx` - Botão "🔄 Sincronizar ODK"
2. ✅ `frontend/src/services/api.ts` - APIs de sincronização

### Scripts SQL
1. ✅ `scripts/database/grant-arquivo-permissions.sql` - Conceder permissões

---

## 🔐 Estrutura de Tabelas ODK

### ORGANIZACAO_FILE
Tabela principal com metadados dos arquivos:
- `_URI` - Identificador único do registro
- `_PARENT_AURI` - URI da organização (relacionamento)
- `_CREATION_DATE` - Data de criação
- `_CREATOR_URI_USER` - Usuário que criou
- Outros campos de metadados ODK

### ORGANIZACAO_ARQUIVO_BN (Binary Name)
Tabela com nomes dos arquivos:
- `_URI` - Identificador único
- `_PARENT_AURI` - URI do ORGANIZACAO_FILE (pai)
- `UNROOTED_FILE_PATH` - Nome do arquivo (ex: "documento.pdf")

### ORGANIZACAO_ARQUIVO_REF (Reference)
Tabela de referência que liga o nome ao blob:
- `_URI` - Identificador único
- `_DOM_AURI` - URI do ORGANIZACAO_ARQUIVO_BN
- `_SUB_AURI` - URI do ORGANIZACAO_ARQUIVO_BLB

### ORGANIZACAO_ARQUIVO_BLB (Blob)
Tabela com conteúdo binário dos arquivos:
- `_URI` - Identificador único
- `VALUE` - Conteúdo binário (bytea)

---

## 🎯 Como Usar (após conceder permissões)

1. Acesse edição de organização
2. Abra seção **Arquivos e Documentos**
3. Clique no botão azul **"🔄 Sincronizar ODK"**
4. Aguarde sincronização
5. Arquivos aparecem na lista automaticamente

---

## 📁 Nomenclatura de Arquivos

### Arquivos do ODK
- **Formato:** Preserva nome original do ODK
- **Exemplo:** `documento.pdf`, `estatuto.doc`, `ata_reuniao.pdf`
- **Local:** `/var/pinovara/shared/uploads/arquivos/`

### Arquivos de Upload Manual
- **Formato:** Nome original fornecido pelo usuário
- **Local:** `/var/pinovara/shared/uploads/arquivos/`

---

## 🔒 Segurança

- ✅ Acesso read-only ao banco ODK
- ✅ Deduplicação por nome de arquivo
- ✅ Validação de permissões (authenticateToken)
- ✅ Escape de SQL injection
- ✅ Validação de ID de organização
- ✅ Senha forte para usuário pinovara_sync

---

## 🚀 Checklist de Deploy

### No Servidor ODK Remoto (app.pinovaraufba.com.br)
- [ ] Executar `grant-arquivo-permissions.sql` como superusuário
- [ ] Verificar permissões com query de teste incluída no script
- [ ] Confirmar que usuário pinovara_sync consegue acessar as 4 tabelas

### No Servidor PINOVARA Local
- [ ] Verificar que tabela `db_connections` tem entrada para 'odk_prod'
- [ ] Confirmar que extensão `dblink` está instalada
- [ ] Criar pasta `/var/pinovara/shared/uploads/arquivos/` com permissões
- [ ] Testar sincronização via interface web

---

## 🧪 Como Testar

### 1. Teste Manual via SQL (no servidor local)

```sql
-- Testar conexão e permissões
SELECT * FROM public.dblink(
  'host=app.pinovaraufba.com.br port=5432 dbname=odk_prod user=pinovara_sync password=Uef9tWW28NTnzjCP',
  'SELECT COUNT(*) FROM odk_prod."ORGANIZACAO_FILE"'
) AS t(count bigint);
```

### 2. Teste via Interface Web

1. Login no sistema
2. Editar organização existente (ex: ID 15)
3. Abrir seção "Arquivos e Documentos"
4. Clicar "Sincronizar ODK"
5. Verificar resposta:
   - ✅ Sucesso: `Total no ODK: X, Baixados: Y, Erros: 0`
   - ❌ Erro: `permission denied for relation...`

---

## 📊 Endpoints da API

### POST /organizacoes/:id/arquivos/sync
Sincroniza arquivos do ODK para organização específica.

**Request:**
```bash
POST /organizacoes/15/arquivos/sync
Authorization: Bearer {token}
```

**Response (sucesso):**
```json
{
  "success": true,
  "data": {
    "total_odk": 3,
    "ja_existentes": 1,
    "baixadas": 2,
    "erros": 0,
    "detalhes": [
      {
        "uri": "uuid:abc...",
        "status": "baixada",
        "nome_arquivo": "estatuto.pdf",
        "mensagem": "Arquivo baixado (245678 bytes)"
      }
    ]
  }
}
```

### GET /organizacoes/:id/arquivos/odk-disponiveis
Lista arquivos disponíveis no ODK sem baixar.

---

## 🐛 Troubleshooting

### Erro: "permission denied for relation ORGANIZACAO_ARQUIVO_BN"

**Causa:** Usuário pinovara_sync não tem permissão SELECT na tabela.

**Solução:** Executar script `grant-arquivo-permissions.sql` no servidor ODK remoto.

### Erro: "connection to database odk_prod failed"

**Causa:** Firewall ou pg_hba.conf bloqueando conexão.

**Solução:** 
1. Verificar pg_hba.conf no servidor ODK
2. Verificar firewall permite conexões na porta 5432
3. Testar conectividade: `telnet app.pinovaraufba.com.br 5432`

### Erro: "Não foi possível criar diretório de arquivos"

**Causa:** Permissões insuficientes no sistema de arquivos.

**Solução:**
```bash
sudo mkdir -p /var/pinovara/shared/uploads/arquivos
sudo chown -R nodejs:nodejs /var/pinovara/shared/uploads
sudo chmod -R 755 /var/pinovara/shared/uploads
```

---

## 📈 Monitoramento

```sql
-- Ver arquivos sincronizados por organização
SELECT 
  id_organizacao,
  COUNT(*) as total_arquivos,
  pg_size_pretty(SUM(length(arquivo::text))) as tamanho_total
FROM pinovara.organizacao_arquivo
WHERE id_organizacao IS NOT NULL
GROUP BY id_organizacao
ORDER BY COUNT(*) DESC;

-- Ver arquivos recentes
SELECT 
  id,
  arquivo,
  obs,
  creation_date,
  id_organizacao
FROM pinovara.organizacao_arquivo
WHERE id_organizacao IS NOT NULL
ORDER BY creation_date DESC
LIMIT 10;
```

---

## 📝 Próximos Passos

1. ✅ Implementação do código (concluída)
2. ⏳ **AGUARDANDO: DBA executar grant-arquivo-permissions.sql**
3. ⏳ Testar sincronização após concessão de permissões
4. ⏳ Deploy em produção
5. ⏳ Documentar casos de uso reais
6. ⏳ Treinamento de usuários

---

**Data:** 12 de outubro de 2025  
**Status:** ⏳ Aguardando permissões no servidor ODK  
**Versão:** 1.0  
**Autor:** Sistema PINOVARA

