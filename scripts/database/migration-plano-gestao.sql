-- ==========================================
-- MIGRATION: Plano de Gestão
-- Data: 2025-11-03
-- Descrição: Criação das tabelas para o sistema de Plano de Gestão
-- ==========================================
-- 
-- Esta migration cria duas novas tabelas:
-- 1. plano_gestao_acao_modelo: Armazena as ações template (dados fixos)
-- 2. plano_gestao_acao: Armazena as respostas editáveis por organização (lazy creation)
--
-- IMPORTANTE: Este script deve ser executado manualmente pelo DBA
-- NÃO usar prisma migrate ou prisma db push
-- ==========================================

-- Verificar se o schema pinovara existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'pinovara') THEN
        RAISE EXCEPTION 'Schema pinovara não existe. Verifique a configuração do banco.';
    END IF;
END $$;

-- ==========================================
-- TABELA: plano_gestao_acao_modelo
-- Descrição: Armazena as ações template do Plano de Gestão
-- ==========================================

CREATE TABLE IF NOT EXISTS pinovara.plano_gestao_acao_modelo (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(100) NOT NULL,
    titulo VARCHAR(300) NOT NULL,
    grupo VARCHAR(300),
    acao VARCHAR(500) NOT NULL,
    hint_como_sera_feito TEXT,
    hint_responsavel VARCHAR(200),
    hint_recursos VARCHAR(200),
    ordem INTEGER NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true
);

-- Comentários da tabela
COMMENT ON TABLE pinovara.plano_gestao_acao_modelo IS 'Armazena as ações template (modelo) do Plano de Gestão';
COMMENT ON COLUMN pinovara.plano_gestao_acao_modelo.tipo IS 'Tipo do plano (ex: gestao-estrategias, comercializacao, comunicacao-marketing)';
COMMENT ON COLUMN pinovara.plano_gestao_acao_modelo.titulo IS 'Título do plano temático';
COMMENT ON COLUMN pinovara.plano_gestao_acao_modelo.grupo IS 'Grupo/categoria dentro do plano';
COMMENT ON COLUMN pinovara.plano_gestao_acao_modelo.acao IS 'Nome/título da ação';
COMMENT ON COLUMN pinovara.plano_gestao_acao_modelo.hint_como_sera_feito IS 'Texto hint/sugestão para o campo "Como será feito?"';
COMMENT ON COLUMN pinovara.plano_gestao_acao_modelo.hint_responsavel IS 'Texto hint/sugestão para o responsável';
COMMENT ON COLUMN pinovara.plano_gestao_acao_modelo.hint_recursos IS 'Texto hint/sugestão para recursos necessários';
COMMENT ON COLUMN pinovara.plano_gestao_acao_modelo.ordem IS 'Ordem de exibição da ação';
COMMENT ON COLUMN pinovara.plano_gestao_acao_modelo.ativo IS 'Se a ação está ativa no sistema';

-- Índices para plano_gestao_acao_modelo
CREATE INDEX IF NOT EXISTS idx_plano_gestao_acao_modelo_tipo ON pinovara.plano_gestao_acao_modelo(tipo);
CREATE INDEX IF NOT EXISTS idx_plano_gestao_acao_modelo_ativo ON pinovara.plano_gestao_acao_modelo(ativo);
CREATE INDEX IF NOT EXISTS idx_plano_gestao_acao_modelo_ordem ON pinovara.plano_gestao_acao_modelo(ordem);

-- ==========================================
-- TABELA: plano_gestao_acao
-- Descrição: Armazena as respostas editáveis por organização (lazy creation)
-- ==========================================

CREATE TABLE IF NOT EXISTS pinovara.plano_gestao_acao (
    id SERIAL PRIMARY KEY,
    id_organizacao INTEGER NOT NULL,
    id_acao_modelo INTEGER NOT NULL,
    responsavel VARCHAR(300),
    data_inicio DATE,
    data_termino DATE,
    como_sera_feito TEXT,
    recursos VARCHAR(300),
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT fk_plano_gestao_acao_organizacao 
        FOREIGN KEY (id_organizacao) 
        REFERENCES pinovara.organizacao(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_plano_gestao_acao_modelo 
        FOREIGN KEY (id_acao_modelo) 
        REFERENCES pinovara.plano_gestao_acao_modelo(id)
        ON DELETE RESTRICT,
    
    -- Garantir que cada organização tenha apenas uma resposta por ação
    CONSTRAINT uk_plano_gestao_acao_org_modelo 
        UNIQUE (id_organizacao, id_acao_modelo)
);

-- Comentários da tabela
COMMENT ON TABLE pinovara.plano_gestao_acao IS 'Armazena as respostas editáveis do Plano de Gestão por organização (lazy creation - só cria quando editar)';
COMMENT ON COLUMN pinovara.plano_gestao_acao.id_organizacao IS 'ID da organização';
COMMENT ON COLUMN pinovara.plano_gestao_acao.id_acao_modelo IS 'ID da ação modelo (template)';
COMMENT ON COLUMN pinovara.plano_gestao_acao.responsavel IS 'Responsável pela ação (editável)';
COMMENT ON COLUMN pinovara.plano_gestao_acao.data_inicio IS 'Data de início prevista (editável)';
COMMENT ON COLUMN pinovara.plano_gestao_acao.data_termino IS 'Data de término prevista (editável)';
COMMENT ON COLUMN pinovara.plano_gestao_acao.como_sera_feito IS 'Descrição de como será feito (editável)';
COMMENT ON COLUMN pinovara.plano_gestao_acao.recursos IS 'Recursos necessários (editável)';
COMMENT ON COLUMN pinovara.plano_gestao_acao.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN pinovara.plano_gestao_acao.updated_at IS 'Data da última atualização';

-- Índices para plano_gestao_acao
CREATE INDEX IF NOT EXISTS idx_plano_gestao_acao_organizacao ON pinovara.plano_gestao_acao(id_organizacao);
CREATE INDEX IF NOT EXISTS idx_plano_gestao_acao_modelo ON pinovara.plano_gestao_acao(id_acao_modelo);
CREATE INDEX IF NOT EXISTS idx_plano_gestao_acao_dates ON pinovara.plano_gestao_acao(data_inicio, data_termino);

-- ==========================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ==========================================

CREATE OR REPLACE FUNCTION pinovara.update_plano_gestao_acao_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_plano_gestao_acao_updated_at
    BEFORE UPDATE ON pinovara.plano_gestao_acao
    FOR EACH ROW
    EXECUTE FUNCTION pinovara.update_plano_gestao_acao_updated_at();

-- ==========================================
-- VERIFICAÇÃO: Contar registros criados
-- ==========================================

DO $$ 
BEGIN
    RAISE NOTICE 'Tabelas criadas com sucesso!';
    RAISE NOTICE 'plano_gestao_acao_modelo: % registros', (SELECT COUNT(*) FROM pinovara.plano_gestao_acao_modelo);
    RAISE NOTICE 'plano_gestao_acao: % registros', (SELECT COUNT(*) FROM pinovara.plano_gestao_acao);
END $$;

-- ==========================================
-- PRÓXIMO PASSO:
-- Execute o script: populate-plano-gestao-template.js
-- para popular a tabela plano_gestao_acao_modelo com os dados template
-- ==========================================

