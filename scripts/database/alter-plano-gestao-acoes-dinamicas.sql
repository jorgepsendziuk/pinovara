-- Adiciona suporte a ações personalizadas e supressão no plano de gestão
ALTER TABLE pinovara.plano_gestao_acao
    ALTER COLUMN id_acao_modelo DROP NOT NULL;

ALTER TABLE pinovara.plano_gestao_acao
    ADD COLUMN IF NOT EXISTS adicionada BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS suprimida BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS tipo_plano VARCHAR(100),
    ADD COLUMN IF NOT EXISTS grupo_plano VARCHAR(300);

ALTER TABLE pinovara.plano_gestao_acao
    DROP COLUMN IF EXISTS tipo_personalizado,
    DROP COLUMN IF EXISTS grupo_personalizado;

UPDATE pinovara.plano_gestao_acao
SET adicionada = COALESCE(adicionada, FALSE),
    suprimida = COALESCE(suprimida, FALSE);

