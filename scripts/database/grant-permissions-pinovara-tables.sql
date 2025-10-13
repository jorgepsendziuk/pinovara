-- ============================================================
-- Script de Permissões para Tabelas PINOVARA_ no ODK
-- ============================================================
-- Este script deve ser executado pelo DBA no banco ODK
-- para permitir que o usuário pinovara_sync acesse as tabelas
-- da versão antiga do formulário (PINOVARA_ ao invés de ORGANIZACAO_)
-- ============================================================

-- Garantir que o usuário existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'pinovara_sync') THEN
    CREATE USER pinovara_sync WITH PASSWORD 'Uef9tWW28NTnzjCP';
  END IF;
END
$$;

-- Dar permissão de conexão
GRANT CONNECT ON DATABASE odk_prod TO pinovara_sync;

-- Dar permissão no schema
GRANT USAGE ON SCHEMA odk_prod TO pinovara_sync;

-- ============================================================
-- PERMISSÕES NAS TABELAS PINOVARA_ (Versão Antiga)
-- ============================================================

-- Tabela CORE (principal)
GRANT SELECT ON odk_prod."PINOVARA_CORE" TO pinovara_sync;

-- Tabelas de FOTOS
GRANT SELECT ON odk_prod."PINOVARA_FOTOS" TO pinovara_sync;
GRANT SELECT ON odk_prod."PINOVARA_FOTO_BN" TO pinovara_sync;
GRANT SELECT ON odk_prod."PINOVARA_FOTO_REF" TO pinovara_sync;
GRANT SELECT ON odk_prod."PINOVARA_FOTO_BLB" TO pinovara_sync;

-- Tabelas de ARQUIVOS
GRANT SELECT ON odk_prod."PINOVARA_FILE" TO pinovara_sync;
GRANT SELECT ON odk_prod."PINOVARA_ARQUIVO_BN" TO pinovara_sync;
GRANT SELECT ON odk_prod."PINOVARA_ARQUIVO_REF" TO pinovara_sync;
GRANT SELECT ON odk_prod."PINOVARA_ARQUIVO_BLB" TO pinovara_sync;

-- Outras tabelas relacionadas (se existirem)
GRANT SELECT ON odk_prod."PINOVARA_ABRANGENCIA_SOCIO" TO pinovara_sync;
GRANT SELECT ON odk_prod."PINOVARA_ABRANGENCIA_PJ" TO pinovara_sync;
GRANT SELECT ON odk_prod."PINOVARA_PRODUCAO" TO pinovara_sync;

-- ============================================================
-- PERMISSÕES NAS TABELAS ORGANIZACAO_ (Versão Nova)
-- ============================================================
-- Estas já devem estar concedidas, mas vamos garantir

-- Tabela CORE (principal)
GRANT SELECT ON odk_prod."ORGANIZACAO_CORE" TO pinovara_sync;

-- Tabelas de FOTOS
GRANT SELECT ON odk_prod."ORGANIZACAO_FOTOS" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_FOTO_BN" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_FOTO_REF" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_FOTO_BLB" TO pinovara_sync;

-- Tabelas de ARQUIVOS  
GRANT SELECT ON odk_prod."ORGANIZACAO_FILE" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_ARQUIVO_BN" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_ARQUIVO_REF" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_ARQUIVO_BLB" TO pinovara_sync;

-- Outras tabelas relacionadas
GRANT SELECT ON odk_prod."ORGANIZACAO_ABRANGENCIA_SOCIO" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_ABRANGENCIA_PJ" TO pinovara_sync;
GRANT SELECT ON odk_prod."ORGANIZACAO_PRODUCAO" TO pinovara_sync;

-- ============================================================
-- VERIFICAÇÃO (Execute para testar)
-- ============================================================

-- Ver tabelas que o usuário tem acesso
/*
SELECT 
  schemaname,
  tablename,
  has_table_privilege('pinovara_sync', schemaname||'.'||tablename, 'SELECT') as tem_select
FROM pg_tables
WHERE schemaname = 'odk_prod'
  AND (tablename LIKE 'PINOVARA_%' OR tablename LIKE 'ORGANIZACAO_%')
ORDER BY tablename;
*/

-- Testar conexão como pinovara_sync
/*
SET ROLE pinovara_sync;
SELECT count(*) FROM odk_prod."PINOVARA_FOTO_REF";
SELECT count(*) FROM odk_prod."ORGANIZACAO_FOTO_REF";
RESET ROLE;
*/

-- ============================================================
-- NOTAS IMPORTANTES
-- ============================================================
-- 1. Execute este script como superuser ou dono do banco ODK
-- 2. Substitua a senha se necessário
-- 3. Verifique se os nomes das tabelas estão corretos
-- 4. Use as queries de verificação para testar as permissões
-- 5. O script é idempotente (pode ser executado múltiplas vezes)
-- ============================================================

\echo '✅ Permissões concedidas com sucesso!'
\echo '📋 Execute as queries de verificação para confirmar'

