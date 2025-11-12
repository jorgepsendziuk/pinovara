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

CREATE TABLE IF NOT EXISTS pinovara.organizacao_tecnico (
    id SERIAL PRIMARY KEY,
    id_organizacao INT NOT NULL REFERENCES pinovara.organizacao(id) ON DELETE CASCADE,
    id_tecnico INT NOT NULL REFERENCES pinovara.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ(6) DEFAULT NOW(),
    created_by INT REFERENCES pinovara.users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_organizacao_tecnico_unique
    ON pinovara.organizacao_tecnico (id_organizacao, id_tecnico);

CREATE INDEX IF NOT EXISTS idx_organizacao_tecnico_tecnico
    ON pinovara.organizacao_tecnico (id_tecnico);

