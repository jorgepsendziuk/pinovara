-- Script: Adicionar campos de validação do plano de gestão na tabela organizacao
-- Data: 2025-11-25
-- Descrição: Campos para controle de validação dos planos de gestão

-- 1. Adicionar campo plano_gestao_validacao_status (INT, padrão 1 = NÃO VALIDADO)
ALTER TABLE pinovara.organizacao 
ADD COLUMN IF NOT EXISTS plano_gestao_validacao_status INTEGER DEFAULT 1;

-- 2. Adicionar campo plano_gestao_validacao_usuario (FK para users)
ALTER TABLE pinovara.organizacao 
ADD COLUMN IF NOT EXISTS plano_gestao_validacao_usuario INTEGER;

-- 3. Adicionar campo plano_gestao_validacao_data (TIMESTAMP)
ALTER TABLE pinovara.organizacao 
ADD COLUMN IF NOT EXISTS plano_gestao_validacao_data TIMESTAMP;

-- 4. Adicionar campo plano_gestao_validacao_obs (TEXT para observações)
ALTER TABLE pinovara.organizacao 
ADD COLUMN IF NOT EXISTS plano_gestao_validacao_obs TEXT;

-- 5. Criar FK para plano_gestao_validacao_usuario
ALTER TABLE pinovara.organizacao
ADD CONSTRAINT IF NOT EXISTS fk_plano_gestao_validacao_usuario 
FOREIGN KEY (plano_gestao_validacao_usuario) REFERENCES pinovara.users(id) ON DELETE SET NULL;

-- 6. Criar índice para consultas por status
CREATE INDEX IF NOT EXISTS idx_organizacao_plano_gestao_validacao_status 
ON pinovara.organizacao(plano_gestao_validacao_status);

-- 7. Adicionar comentários para documentação
COMMENT ON COLUMN pinovara.organizacao.plano_gestao_validacao_status IS 'Status de validação do plano de gestão: 1=NÃO VALIDADO, 2=VALIDADO, 3=PENDÊNCIA, 4=REPROVADO';
COMMENT ON COLUMN pinovara.organizacao.plano_gestao_validacao_usuario IS 'ID do usuário que realizou a validação do plano de gestão';
COMMENT ON COLUMN pinovara.organizacao.plano_gestao_validacao_data IS 'Data/hora da validação do plano de gestão';
COMMENT ON COLUMN pinovara.organizacao.plano_gestao_validacao_obs IS 'Observações sobre a validação do plano de gestão';

-- 8. Verificação final
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

