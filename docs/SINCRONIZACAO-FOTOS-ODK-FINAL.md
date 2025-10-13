# 📸 Sincronização de Fotos ODK - Documentação Final

## ✅ Implementação Concluída

Sistema completo para sincronizar fotos do banco ODK Collect para o sistema PINOVARA.

---

## 🏗️ Arquitetura

```
Banco ODK (app.pinovaraufba.com.br)
├── {PREFIXO}_FOTOS (registro de cada grupo de fotos)
│   ├── _URI (ID único da foto)
│   └── _PARENT_AURI (UUID da organização)
├── {PREFIXO}_FOTO_BN (metadados do arquivo)
│   ├── _URI (ID único)
│   ├── _PARENT_AURI → liga com _FOTOS._URI
│   ├── UNROOTED_FILE_PATH (nome original do arquivo!)
│   └── _CREATION_DATE
├── {PREFIXO}_FOTO_REF (referência ao blob)
│   ├── _URI
│   ├── _DOM_AURI → liga com _FOTO_BN._URI
│   └── _SUB_AURI → liga com _FOTO_BLB._URI
└── {PREFIXO}_FOTO_BLB (o arquivo binário)
    ├── _URI
    └── VALUE (bytea - blob da imagem)
        ↓ dblink (somente leitura)
Banco PINOVARA Local
├── db_connections (credenciais ODK)
└── organizacao_foto (registros das fotos)
        ↓
Disco: /var/pinovara/shared/uploads/fotos/
└── {nome_original}.jpg (do UNROOTED_FILE_PATH)
```

**Nota:** {PREFIXO} pode ser `ORGANIZACAO` ou `PINOVARA` (versão antiga do formulário).

---

## 📊 Query SQL Utilizada

```sql
SELECT 
  f."_URI",
  f."_PARENT_AURI",
  bn."_CREATION_DATE",
  blb."VALUE",
  octet_length(blb."VALUE") as tamanho,
  bn."UNROOTED_FILE_PATH"
FROM odk_prod."{PREFIXO}_FOTOS" f
INNER JOIN odk_prod."{PREFIXO}_FOTO_BN" bn 
  ON bn."_PARENT_AURI" = f."_URI"
INNER JOIN odk_prod."{PREFIXO}_FOTO_REF" ref 
  ON ref."_DOM_AURI" = bn."_URI"
INNER JOIN odk_prod."{PREFIXO}_FOTO_BLB" blb 
  ON blb."_URI" = ref."_SUB_AURI"
WHERE f."_PARENT_AURI" = 'uuid:organizacao'
  AND blb."VALUE" IS NOT NULL
  AND octet_length(blb."VALUE") > 0
```

**Fallback:** O sistema primeiro tenta com `ORGANIZACAO_*`, se não encontrar, tenta com `PINOVARA_*` (formulários antigos).

---

## 🗂️ Arquivos Criados

### Backend
1. `backend/src/types/fotoSync.ts` - Tipos TypeScript
2. `backend/src/services/fotoSyncService.ts` - Lógica de sincronização
3. `backend/src/controllers/fotoSyncController.ts` - Endpoints HTTP
4. `backend/src/routes/fotoSyncRoutes.ts` - Rotas

### Frontend
1. `frontend/src/components/organizacoes/UploadFotos.tsx` - Botão "🔄 Sincronizar ODK"
2. `frontend/src/services/api.ts` - APIs de sincronização
3. `frontend/src/App.css` - Animação spin

### Scripts SQL
1. `scripts/database/setup-dblink-pinovara.sql` - Instalação dblink
2. `scripts/database/create-view-fotos-odk.sql` - Funções SQL (opcional)
3. `scripts/database/test-fotos-odk.sql` - Testes (opcional)
4. `scripts/database/fix-foto-paths.sql` - Limpar prefixos

---

## 🔐 Configuração Necessária

### 1. Instalação DBLink
```sql
CREATE EXTENSION IF NOT EXISTS dblink;
```

### 2. Tabela de Conexões
```sql
CREATE TABLE pinovara.db_connections (
  name VARCHAR(50) PRIMARY KEY,
  host VARCHAR(255),
  port INTEGER,
  database VARCHAR(100),
  username VARCHAR(100),
  password VARCHAR(255),
  active BOOLEAN DEFAULT true
);

INSERT INTO pinovara.db_connections VALUES (
  'odk_prod',
  'app.pinovaraufba.com.br',
  5432,
  'odk_prod',
  'pinovara_sync',
  'Uef9tWW28NTnzjCP',
  true
);

GRANT SELECT ON pinovara.db_connections TO PUBLIC;
```

### 3. Usuário ODK (no servidor remoto)
```sql
CREATE USER pinovara_sync WITH PASSWORD 'Uef9tWW28NTnzjCP';
GRANT CONNECT ON DATABASE odk_prod TO pinovara_sync;
GRANT USAGE ON SCHEMA odk_prod TO pinovara_sync;

-- Permissões para tabelas ORGANIZACAO (atual)
GRANT SELECT ON odk_prod."ORGANIZACAO_FOTOS" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_FOTO_BN" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_FOTO_REF" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_FOTO_BLB" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_FILE" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_ARQUIVO_BN" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_ARQUIVO_REF" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_ARQUIVO_BLB" TO pinovara_sync;

-- Permissões para tabelas PINOVARA (antiga)
GRANT SELECT ON odk_prod."PINOVARA_FOTOS" TO pinovara_sync;
GRANT SELECT ON odk_prod."PINOVARA_FOTO_BN" TO pinovara_sync;
GRANT SELECT ON odk_prod."PINOVARA_FOTO_REF" TO pinovara_sync;
GRANT SELECT ON odk_prod."PINOVARA_FOTO_BLB" TO pinovara_sync;
GRANT SELECT ON odk_prod."PINOVARA_FILE" TO pinovara_sync;
GRANT SELECT ON odk_prod."PINOVARA_ARQUIVO_BN" TO pinovara_sync;
GRANT SELECT ON odk_prod."PINOVARA_ARQUIVO_REF" TO pinovara_sync;
GRANT SELECT ON odk_prod."PINOVARA_ARQUIVO_BLB" TO pinovara_sync;
```

---

## 🎯 Como Usar

1. Acesse edição de organização
2. Abra seção **Fotos**
3. Clique no botão verde **"🔄 Sincronizar ODK"**
4. Confirme o dialog
5. Aguarde sincronização
6. Fotos aparecem na lista automaticamente

---

## 📁 Nomenclatura de Arquivos

### Fotos do ODK
- **Formato:** Nome original do arquivo (`UNROOTED_FILE_PATH`)
- **Exemplo:** `foto_organizacao.jpg`, `foto_sede.jpg`
- **Fallback:** Se não houver nome original, usa `{timestamp}.jpg`
- **Local:** `/var/pinovara/shared/uploads/fotos/`

### Documentos do ODK
- **Formato:** Nome original do arquivo (`UNROOTED_FILE_PATH`)
- **Exemplo:** `termo_adesao.pdf`, `ata_reuniao.pdf`
- **Fallback:** Se não houver nome original, usa `{timestamp}.pdf`
- **Local:** `/var/pinovara/shared/uploads/documentos/`

### Fotos/Documentos de Upload Manual
- **Formato:** `{timestamp}.{ext}`
- **Exemplo:** `1760114616011.jpg`, `1760114616012.pdf`
- **Local:** Mesmos diretórios acima

---

## 🧪 Teste Realizado

**Organização:** AZURP (ID: 17)  
**URI:** `uuid:ad6a1465-e8a6-46bb-84cf-2cfeda95d1cc`  
**Resultado:**
- ✅ 5 fotos encontradas no ODK
- ✅ 5 fotos baixadas com sucesso
- ✅ 0 erros
- ✅ Total: ~2.5 MB

**Arquivos criados:**
```
1760141617599.jpg (1.1 MB)
1760141617920.jpg (1.0 MB)
1760141618119.jpg (96 KB)
1760141618314.jpg (112 KB)
1760141618508.jpg (113 KB)
```

---

## 🔒 Segurança

- ✅ Acesso read-only ao banco ODK
- ✅ Deduplicação por URI (não baixa 2x)
- ✅ Validação de permissões (authenticateToken)
- ✅ Escape de SQL injection
- ✅ Validação de ID de organização

---

## 🚀 Deploy

Para deploy no servidor remoto:

1. Executar scripts SQL no PostgreSQL remoto
2. Criar usuário `pinovara_sync` no servidor ODK
3. Garantir conectividade entre servidores (firewall/pg_hba.conf)
4. Deploy do backend atualizado
5. Criar pasta `/var/pinovara/shared/uploads/fotos/` com permissões
6. Testar sincronização

---

## 📊 Monitoramento

```sql
-- Ver fotos sincronizadas
SELECT 
  id_organizacao,
  COUNT(*) as total_fotos
FROM pinovara.organizacao_foto
WHERE uri LIKE 'uuid:%'
GROUP BY id_organizacao
ORDER BY COUNT(*) DESC;
```

---

**Data:** 10 de outubro de 2025  
**Status:** ✅ Funcional e testado  
**Versão:** 1.0

