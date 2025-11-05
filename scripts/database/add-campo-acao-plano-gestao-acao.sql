-- ==========================================
-- Migração: Adicionar campo acao em plano_gestao_acao
-- Data: 2025-11-04
-- Descrição: Adiciona campo acao (TEXT) para permitir edição do texto da ação
-- ==========================================

BEGIN;

-- Adicionar coluna acao na tabela plano_gestao_acao
ALTER TABLE pinovara.plano_gestao_acao
ADD COLUMN IF NOT EXISTS acao TEXT;

-- Comentário na coluna
COMMENT ON COLUMN pinovara.plano_gestao_acao.acao IS 'Texto da ação editável. Se não preenchido, usa o texto do modelo como padrão.';

COMMIT;

-- ==========================================
-- Verificação
-- ==========================================
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_schema = 'pinovara' 
--   AND table_name = 'plano_gestao_acao' 
--   AND column_name = 'acao';
-- ==========================================

