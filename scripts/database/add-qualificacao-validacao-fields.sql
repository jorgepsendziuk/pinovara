-- Script: Adicionar campos de validação na tabela qualificacao
-- Data: 2025-01-XX
-- Descrição: Campos para controle de validação das qualificações

-- 1. Adicionar campo validacao_status (INT, padrão 1 = NÃO VALIDADO)
ALTER TABLE capacitacao.qualificacao 
ADD COLUMN IF NOT EXISTS validacao_status INTEGER DEFAULT 1;

-- 2. Adicionar campo validacao_usuario (FK para users)
ALTER TABLE capacitacao.qualificacao 
ADD COLUMN IF NOT EXISTS validacao_usuario INTEGER;

-- 3. Adicionar campo validacao_data (TIMESTAMP)
ALTER TABLE capacitacao.qualificacao 
ADD COLUMN IF NOT EXISTS validacao_data TIMESTAMP;

-- 4. Adicionar campo validacao_obs (TEXT para observações)
ALTER TABLE capacitacao.qualificacao 
ADD COLUMN IF NOT EXISTS validacao_obs TEXT;

-- 5. Criar FK para validacao_usuario
ALTER TABLE capacitacao.qualificacao
ADD CONSTRAINT IF NOT EXISTS fk_qualificacao_validacao_usuario 
FOREIGN KEY (validacao_usuario) REFERENCES pinovara.users(id) ON DELETE SET NULL;

-- 6. Criar índice para consultas por status
CREATE INDEX IF NOT EXISTS idx_qualificacao_validacao_status 
ON capacitacao.qualificacao(validacao_status);

-- 7. Adicionar comentários para documentação
COMMENT ON COLUMN capacitacao.qualificacao.validacao_status IS 'Status de validação: 1=NÃO VALIDADO, 2=VALIDADO, 3=PENDÊNCIA, 4=REPROVADO';
COMMENT ON COLUMN capacitacao.qualificacao.validacao_usuario IS 'ID do usuário que realizou a validação';
COMMENT ON COLUMN capacitacao.qualificacao.validacao_data IS 'Data/hora da validação';
COMMENT ON COLUMN capacitacao.qualificacao.validacao_obs IS 'Observações sobre a validação';

-- 8. Verificação final
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'capacitacao' 
  AND table_name = 'qualificacao'
  AND column_name LIKE 'validacao%'
ORDER BY column_name;
