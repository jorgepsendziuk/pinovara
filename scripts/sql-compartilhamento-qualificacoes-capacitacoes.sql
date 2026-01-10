-- ============================================
-- SQL para criação das tabelas de compartilhamento
-- Qualificações e Capacitações com Técnicos
-- ============================================

-- Tabela: qualificacao_tecnico
-- Permite compartilhar qualificações com técnicos da equipe
CREATE TABLE IF NOT EXISTS capacitacao.qualificacao_tecnico (
    id SERIAL PRIMARY KEY,
    id_qualificacao INTEGER NOT NULL,
    id_tecnico INTEGER NOT NULL,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    
    CONSTRAINT qualificacao_tecnico_id_qualificacao_fkey 
        FOREIGN KEY (id_qualificacao) 
        REFERENCES capacitacao.qualificacao(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT qualificacao_tecnico_id_tecnico_fkey 
        FOREIGN KEY (id_tecnico) 
        REFERENCES pinovara.users(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT qualificacao_tecnico_created_by_fkey 
        FOREIGN KEY (created_by) 
        REFERENCES pinovara.users(id) 
        ON DELETE SET NULL,
    
    CONSTRAINT qualificacao_tecnico_unique 
        UNIQUE (id_qualificacao, id_tecnico)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_qualificacao_tecnico_id_tecnico 
    ON capacitacao.qualificacao_tecnico(id_tecnico);

CREATE INDEX IF NOT EXISTS idx_qualificacao_tecnico_id_qualificacao 
    ON capacitacao.qualificacao_tecnico(id_qualificacao);

-- Comentários para documentação
COMMENT ON TABLE capacitacao.qualificacao_tecnico IS 
    'Tabela de relacionamento many-to-many entre qualificações e técnicos. Permite compartilhar qualificações com técnicos da equipe.';

COMMENT ON COLUMN capacitacao.qualificacao_tecnico.id IS 
    'ID único do registro';

COMMENT ON COLUMN capacitacao.qualificacao_tecnico.id_qualificacao IS 
    'ID da qualificação compartilhada';

COMMENT ON COLUMN capacitacao.qualificacao_tecnico.id_tecnico IS 
    'ID do técnico que tem acesso à qualificação';

COMMENT ON COLUMN capacitacao.qualificacao_tecnico.created_at IS 
    'Data e hora de criação do compartilhamento';

COMMENT ON COLUMN capacitacao.qualificacao_tecnico.created_by IS 
    'ID do usuário que criou o compartilhamento';

-- ============================================

-- Tabela: capacitacao_tecnico
-- Permite compartilhar capacitações com técnicos da equipe
CREATE TABLE IF NOT EXISTS capacitacao.capacitacao_tecnico (
    id SERIAL PRIMARY KEY,
    id_capacitacao INTEGER NOT NULL,
    id_tecnico INTEGER NOT NULL,
    created_at TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    
    CONSTRAINT capacitacao_tecnico_id_capacitacao_fkey 
        FOREIGN KEY (id_capacitacao) 
        REFERENCES capacitacao.capacitacao(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT capacitacao_tecnico_id_tecnico_fkey 
        FOREIGN KEY (id_tecnico) 
        REFERENCES pinovara.users(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT capacitacao_tecnico_created_by_fkey 
        FOREIGN KEY (created_by) 
        REFERENCES pinovara.users(id) 
        ON DELETE SET NULL,
    
    CONSTRAINT capacitacao_tecnico_unique 
        UNIQUE (id_capacitacao, id_tecnico)
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_capacitacao_tecnico_id_tecnico 
    ON capacitacao.capacitacao_tecnico(id_tecnico);

CREATE INDEX IF NOT EXISTS idx_capacitacao_tecnico_id_capacitacao 
    ON capacitacao.capacitacao_tecnico(id_capacitacao);

-- Comentários para documentação
COMMENT ON TABLE capacitacao.capacitacao_tecnico IS 
    'Tabela de relacionamento many-to-many entre capacitações e técnicos. Permite compartilhar capacitações com técnicos da equipe.';

COMMENT ON COLUMN capacitacao.capacitacao_tecnico.id IS 
    'ID único do registro';

COMMENT ON COLUMN capacitacao.capacitacao_tecnico.id_capacitacao IS 
    'ID da capacitação compartilhada';

COMMENT ON COLUMN capacitacao.capacitacao_tecnico.id_tecnico IS 
    'ID do técnico que tem acesso à capacitação';

COMMENT ON COLUMN capacitacao.capacitacao_tecnico.created_at IS 
    'Data e hora de criação do compartilhamento';

COMMENT ON COLUMN capacitacao.capacitacao_tecnico.created_by IS 
    'ID do usuário que criou o compartilhamento';

-- ============================================
-- Permissões (GRANT)
-- ============================================

-- Permissões para a tabela qualificacao_tecnico
GRANT SELECT, INSERT, UPDATE, DELETE ON capacitacao.qualificacao_tecnico TO pinovara;
GRANT USAGE, SELECT ON SEQUENCE capacitacao.qualificacao_tecnico_id_seq TO pinovara;

-- Permissões para a tabela capacitacao_tecnico
GRANT SELECT, INSERT, UPDATE, DELETE ON capacitacao.capacitacao_tecnico TO pinovara;
GRANT USAGE, SELECT ON SEQUENCE capacitacao.capacitacao_tecnico_id_seq TO pinovara;

-- ============================================
-- Fim do script
-- ============================================
