-- ================================================================
-- Script de Permissões para Sincronização de Arquivos ODK
-- ================================================================
-- Este script deve ser executado no servidor REMOTO do ODK
-- pelo DBA com privilégios de superusuário.
--
-- Objetivo: Conceder permissões ao usuário pinovara_sync para 
--           acessar as tabelas de arquivos no schema odk_prod
--
-- Data: 12/10/2025
-- ================================================================

-- Conectar ao banco odk_prod no servidor remoto
-- \c odk_prod

-- ================================================================
-- VERIFICAR SE USUÁRIO JÁ EXISTE
-- ================================================================
-- O usuário pinovara_sync já deveria existir (criado para fotos)
-- Se não existir, criar:

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_user WHERE usename = 'pinovara_sync') THEN
    CREATE USER pinovara_sync WITH PASSWORD 'Uef9tWW28NTnzjCP';
    GRANT CONNECT ON DATABASE odk_prod TO pinovara_sync;
    GRANT USAGE ON SCHEMA odk_prod TO pinovara_sync;
    RAISE NOTICE 'Usuário pinovara_sync criado';
  ELSE
    RAISE NOTICE 'Usuário pinovara_sync já existe';
  END IF;
END
$$;

-- ================================================================
-- CONCEDER PERMISSÕES PARA TABELAS DE ARQUIVOS
-- ================================================================

-- Tabela principal de arquivos (metadados)
GRANT SELECT ON odk_prod."ORGANIZACAO_FILE" TO pinovara_sync;

-- Tabela de nomes de arquivos (binary name)
GRANT SELECT ON odk_prod."ORGANIZACAO_ARQUIVO_BN" TO pinovara_sync;

-- Tabela de referências (liga o arquivo ao blob)
GRANT SELECT ON odk_prod."ORGANIZACAO_ARQUIVO_REF" TO pinovara_sync;

-- Tabela de blobs (conteúdo binário dos arquivos)
GRANT SELECT ON odk_prod."ORGANIZACAO_ARQUIVO_BLB" TO pinovara_sync;

-- ================================================================
-- VERIFICAR PERMISSÕES CONCEDIDAS
-- ================================================================

SELECT 
  n.nspname as schema,
  c.relname as table_name,
  CASE c.relkind 
    WHEN 'r' THEN 'table'
    WHEN 'v' THEN 'view'
  END as type,
  CASE 
    WHEN has_table_privilege('pinovara_sync', c.oid, 'SELECT') 
    THEN '✅ OK' 
    ELSE '❌ SEM PERMISSÃO' 
  END as permission_status
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'odk_prod'
  AND c.relname IN (
    'ORGANIZACAO_FILE',
    'ORGANIZACAO_ARQUIVO_BN', 
    'ORGANIZACAO_ARQUIVO_REF',
    'ORGANIZACAO_ARQUIVO_BLB',
    'ORGANIZACAO_FOTO_REF',
    'ORGANIZACAO_FOTO_BLB'
  )
ORDER BY c.relname;

-- ================================================================
-- TESTAR CONEXÃO E ACESSO
-- ================================================================

-- Teste 1: Contar arquivos disponíveis
SELECT 
  'Test 1: ORGANIZACAO_FILE' as test,
  COUNT(*) as count
FROM odk_prod."ORGANIZACAO_FILE";

-- Teste 2: Contar nomes de arquivos
SELECT 
  'Test 2: ORGANIZACAO_ARQUIVO_BN' as test,
  COUNT(*) as count
FROM odk_prod."ORGANIZACAO_ARQUIVO_BN";

-- Teste 3: Contar referências
SELECT 
  'Test 3: ORGANIZACAO_ARQUIVO_REF' as test,
  COUNT(*) as count
FROM odk_prod."ORGANIZACAO_ARQUIVO_REF";

-- Teste 4: Contar blobs
SELECT 
  'Test 4: ORGANIZACAO_ARQUIVO_BLB' as test,
  COUNT(*) as count
FROM odk_prod."ORGANIZACAO_ARQUIVO_BLB"
WHERE "VALUE" IS NOT NULL;

-- ================================================================
-- QUERY COMPLETA DE TESTE (exemplo)
-- ================================================================
-- Esta query deve funcionar após as permissões serem concedidas
-- Substitua o UUID pelo de uma organização real

SELECT 
  f."_URI",
  f."_PARENT_AURI",
  f."_CREATION_DATE",
  octet_length(blb."VALUE") as tamanho_bytes,
  bn."UNROOTED_FILE_PATH" as nome_arquivo
FROM odk_prod."ORGANIZACAO_FILE" f
INNER JOIN odk_prod."ORGANIZACAO_ARQUIVO_BN" bn 
  ON bn."_PARENT_AURI" = f."_URI"
INNER JOIN odk_prod."ORGANIZACAO_ARQUIVO_REF" ref 
  ON ref."_DOM_AURI" = bn."_URI"
INNER JOIN odk_prod."ORGANIZACAO_ARQUIVO_BLB" blb 
  ON blb."_URI" = ref."_SUB_AURI"
WHERE f."_PARENT_AURI" = 'uuid:7e90ebc0-7887-456d-91c0-93113707efaf'
  AND blb."VALUE" IS NOT NULL
LIMIT 5;

-- ================================================================
-- FIM DO SCRIPT
-- ================================================================
-- Após executar este script, testar a sincronização no sistema PINOVARA
-- através do botão "Sincronizar ODK" na página de edição de organizações.
-- ================================================================

