-- ============================================
-- Script para criar schema e tabelas de Qualificações e Capacitações
-- Schema: capacitacao
-- ============================================

-- Criar schema se não existir
CREATE SCHEMA IF NOT EXISTS capacitacao;

-- ============================================
-- 1. TABELA: qualificacao
-- ============================================
CREATE TABLE IF NOT EXISTS capacitacao.qualificacao (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(500) NOT NULL,
    objetivo_geral TEXT,
    objetivos_especificos TEXT,
    conteudo_programatico TEXT,
    metodologia TEXT,
    recursos_didaticos TEXT,
    estrategia_avaliacao TEXT,
    referencias TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP(6) DEFAULT NOW(),
    updated_at TIMESTAMP(6) DEFAULT NOW(),
    created_by INTEGER
);

CREATE INDEX IF NOT EXISTS idx_qualificacao_created_by ON capacitacao.qualificacao(created_by);
CREATE INDEX IF NOT EXISTS idx_qualificacao_ativo ON capacitacao.qualificacao(ativo);

-- ============================================
-- 2. TABELA: qualificacao_organizacao (many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS capacitacao.qualificacao_organizacao (
    id_qualificacao INTEGER NOT NULL,
    id_organizacao INTEGER NOT NULL,
    PRIMARY KEY (id_qualificacao, id_organizacao),
    CONSTRAINT fk_qualificacao_org_qualificacao 
        FOREIGN KEY (id_qualificacao) 
        REFERENCES capacitacao.qualificacao(id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_qualificacao_org_organizacao ON capacitacao.qualificacao_organizacao(id_organizacao);

-- ============================================
-- 3. TABELA: qualificacao_instrutor (many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS capacitacao.qualificacao_instrutor (
    id_qualificacao INTEGER NOT NULL,
    id_instrutor INTEGER NOT NULL,
    PRIMARY KEY (id_qualificacao, id_instrutor),
    CONSTRAINT fk_qualificacao_instr_qualificacao 
        FOREIGN KEY (id_qualificacao) 
        REFERENCES capacitacao.qualificacao(id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_qualificacao_instr_instrutor ON capacitacao.qualificacao_instrutor(id_instrutor);

-- ============================================
-- 4. TABELA: capacitacao
-- ============================================
CREATE TABLE IF NOT EXISTS capacitacao.capacitacao (
    id SERIAL PRIMARY KEY,
    id_qualificacao INTEGER NOT NULL,
    titulo VARCHAR(500),
    data_inicio TIMESTAMP(6),
    data_fim TIMESTAMP(6),
    local VARCHAR(500),
    turno VARCHAR(100),
    status VARCHAR(50) DEFAULT 'planejada',
    link_inscricao UUID UNIQUE NOT NULL,
    link_avaliacao UUID UNIQUE NOT NULL,
    created_at TIMESTAMP(6) DEFAULT NOW(),
    updated_at TIMESTAMP(6) DEFAULT NOW(),
    created_by INTEGER,
    CONSTRAINT fk_capacitacao_qualificacao 
        FOREIGN KEY (id_qualificacao) 
        REFERENCES capacitacao.qualificacao(id) 
        ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_capacitacao_qualificacao ON capacitacao.capacitacao(id_qualificacao);
CREATE INDEX IF NOT EXISTS idx_capacitacao_status ON capacitacao.capacitacao(status);
CREATE INDEX IF NOT EXISTS idx_capacitacao_created_by ON capacitacao.capacitacao(created_by);
CREATE INDEX IF NOT EXISTS idx_capacitacao_data_inicio ON capacitacao.capacitacao(data_inicio);

-- ============================================
-- 5. TABELA: capacitacao_organizacao (many-to-many)
-- ============================================
CREATE TABLE IF NOT EXISTS capacitacao.capacitacao_organizacao (
    id_capacitacao INTEGER NOT NULL,
    id_organizacao INTEGER NOT NULL,
    PRIMARY KEY (id_capacitacao, id_organizacao),
    CONSTRAINT fk_capacitacao_org_capacitacao 
        FOREIGN KEY (id_capacitacao) 
        REFERENCES capacitacao.capacitacao(id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_capacitacao_org_organizacao ON capacitacao.capacitacao_organizacao(id_organizacao);

-- ============================================
-- 6. TABELA: capacitacao_inscricao
-- ============================================
CREATE TABLE IF NOT EXISTS capacitacao.capacitacao_inscricao (
    id SERIAL PRIMARY KEY,
    id_capacitacao INTEGER NOT NULL,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(50),
    instituicao VARCHAR(255),
    cpf VARCHAR(14),
    rg VARCHAR(20),
    inscrito_por INTEGER,
    created_at TIMESTAMP(6) DEFAULT NOW(),
    CONSTRAINT fk_inscricao_capacitacao 
        FOREIGN KEY (id_capacitacao) 
        REFERENCES capacitacao.capacitacao(id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_inscricao_capacitacao ON capacitacao.capacitacao_inscricao(id_capacitacao);
CREATE INDEX IF NOT EXISTS idx_inscricao_email ON capacitacao.capacitacao_inscricao(email);
CREATE INDEX IF NOT EXISTS idx_inscricao_inscrito_por ON capacitacao.capacitacao_inscricao(inscrito_por);

-- ============================================
-- 7. TABELA: capacitacao_presenca
-- ============================================
CREATE TABLE IF NOT EXISTS capacitacao.capacitacao_presenca (
    id SERIAL PRIMARY KEY,
    id_capacitacao INTEGER NOT NULL,
    id_inscricao INTEGER,
    nome VARCHAR(255),
    presente BOOLEAN DEFAULT true,
    data DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by INTEGER,
    created_at TIMESTAMP(6) DEFAULT NOW(),
    CONSTRAINT fk_presenca_capacitacao 
        FOREIGN KEY (id_capacitacao) 
        REFERENCES capacitacao.capacitacao(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_presenca_inscricao 
        FOREIGN KEY (id_inscricao) 
        REFERENCES capacitacao.capacitacao_inscricao(id) 
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_presenca_capacitacao ON capacitacao.capacitacao_presenca(id_capacitacao);
CREATE INDEX IF NOT EXISTS idx_presenca_inscricao ON capacitacao.capacitacao_presenca(id_inscricao);
CREATE INDEX IF NOT EXISTS idx_presenca_data ON capacitacao.capacitacao_presenca(data);
CREATE INDEX IF NOT EXISTS idx_presenca_created_by ON capacitacao.capacitacao_presenca(created_by);

-- ============================================
-- 8. TABELA: avaliacao_versao
-- ============================================
CREATE TABLE IF NOT EXISTS capacitacao.avaliacao_versao (
    id SERIAL PRIMARY KEY,
    versao VARCHAR(20) UNIQUE NOT NULL,
    descricao TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP(6) DEFAULT NOW(),
    updated_at TIMESTAMP(6) DEFAULT NOW(),
    created_by INTEGER
);

CREATE INDEX IF NOT EXISTS idx_avaliacao_versao_ativo ON capacitacao.avaliacao_versao(ativo);
CREATE INDEX IF NOT EXISTS idx_avaliacao_versao_created_by ON capacitacao.avaliacao_versao(created_by);

-- ============================================
-- 9. TABELA: avaliacao_pergunta
-- ============================================
CREATE TABLE IF NOT EXISTS capacitacao.avaliacao_pergunta (
    id SERIAL PRIMARY KEY,
    id_versao INTEGER NOT NULL,
    ordem INTEGER NOT NULL,
    texto_pergunta TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    opcoes TEXT,
    obrigatoria BOOLEAN DEFAULT true,
    created_at TIMESTAMP(6) DEFAULT NOW(),
    CONSTRAINT fk_pergunta_versao 
        FOREIGN KEY (id_versao) 
        REFERENCES capacitacao.avaliacao_versao(id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pergunta_versao ON capacitacao.avaliacao_pergunta(id_versao);
CREATE INDEX IF NOT EXISTS idx_pergunta_ordem ON capacitacao.avaliacao_pergunta(ordem);

-- ============================================
-- 10. TABELA: capacitacao_avaliacao
-- ============================================
CREATE TABLE IF NOT EXISTS capacitacao.capacitacao_avaliacao (
    id SERIAL PRIMARY KEY,
    id_capacitacao INTEGER NOT NULL,
    id_versao_avaliacao INTEGER NOT NULL,
    id_inscricao INTEGER,
    nome_participante VARCHAR(255),
    email_participante VARCHAR(255),
    telefone_participante VARCHAR(50),
    comentarios TEXT,
    created_at TIMESTAMP(6) DEFAULT NOW(),
    CONSTRAINT fk_avaliacao_capacitacao 
        FOREIGN KEY (id_capacitacao) 
        REFERENCES capacitacao.capacitacao(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_avaliacao_versao 
        FOREIGN KEY (id_versao_avaliacao) 
        REFERENCES capacitacao.avaliacao_versao(id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_avaliacao_inscricao 
        FOREIGN KEY (id_inscricao) 
        REFERENCES capacitacao.capacitacao_inscricao(id) 
        ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_avaliacao_capacitacao ON capacitacao.capacitacao_avaliacao(id_capacitacao);
CREATE INDEX IF NOT EXISTS idx_avaliacao_versao ON capacitacao.capacitacao_avaliacao(id_versao_avaliacao);
CREATE INDEX IF NOT EXISTS idx_avaliacao_inscricao ON capacitacao.capacitacao_avaliacao(id_inscricao);
CREATE INDEX IF NOT EXISTS idx_avaliacao_email ON capacitacao.capacitacao_avaliacao(email_participante);

-- ============================================
-- 11. TABELA: capacitacao_avaliacao_resposta
-- ============================================
CREATE TABLE IF NOT EXISTS capacitacao.capacitacao_avaliacao_resposta (
    id SERIAL PRIMARY KEY,
    id_avaliacao INTEGER NOT NULL,
    id_pergunta INTEGER NOT NULL,
    resposta_texto TEXT,
    resposta_opcao VARCHAR(100),
    created_at TIMESTAMP(6) DEFAULT NOW(),
    CONSTRAINT fk_resposta_avaliacao 
        FOREIGN KEY (id_avaliacao) 
        REFERENCES capacitacao.capacitacao_avaliacao(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_resposta_pergunta 
        FOREIGN KEY (id_pergunta) 
        REFERENCES capacitacao.avaliacao_pergunta(id) 
        ON DELETE RESTRICT,
    CONSTRAINT uk_resposta_avaliacao_pergunta UNIQUE (id_avaliacao, id_pergunta)
);

CREATE INDEX IF NOT EXISTS idx_resposta_avaliacao ON capacitacao.capacitacao_avaliacao_resposta(id_avaliacao);
CREATE INDEX IF NOT EXISTS idx_resposta_pergunta ON capacitacao.capacitacao_avaliacao_resposta(id_pergunta);

-- ============================================
-- 12. TABELA: capacitacao_material
-- ============================================
CREATE TABLE IF NOT EXISTS capacitacao.capacitacao_material (
    id SERIAL PRIMARY KEY,
    id_qualificacao INTEGER NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    nome_original VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    tamanho_bytes INTEGER NOT NULL,
    tipo_mime VARCHAR(100) NOT NULL,
    descricao TEXT,
    uploaded_by INTEGER,
    created_at TIMESTAMP(6) DEFAULT NOW(),
    CONSTRAINT fk_material_qualificacao 
        FOREIGN KEY (id_qualificacao) 
        REFERENCES capacitacao.qualificacao(id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_material_qualificacao ON capacitacao.capacitacao_material(id_qualificacao);
CREATE INDEX IF NOT EXISTS idx_material_uploaded_by ON capacitacao.capacitacao_material(uploaded_by);

-- ============================================
-- 13. TABELA: capacitacao_evidencia
-- ============================================
CREATE TABLE IF NOT EXISTS capacitacao.capacitacao_evidencia (
    id SERIAL PRIMARY KEY,
    id_capacitacao INTEGER NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    descricao TEXT,
    data_evidencia DATE,
    local_evidencia VARCHAR(255),
    uploaded_by INTEGER,
    created_at TIMESTAMP(6) DEFAULT NOW(),
    CONSTRAINT fk_evidencia_capacitacao 
        FOREIGN KEY (id_capacitacao) 
        REFERENCES capacitacao.capacitacao(id) 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evidencia_capacitacao ON capacitacao.capacitacao_evidencia(id_capacitacao);
CREATE INDEX IF NOT EXISTS idx_evidencia_tipo ON capacitacao.capacitacao_evidencia(tipo);
CREATE INDEX IF NOT EXISTS idx_evidencia_uploaded_by ON capacitacao.capacitacao_evidencia(uploaded_by);

-- ============================================
-- COMENTÁRIOS NAS TABELAS
-- ============================================
COMMENT ON SCHEMA capacitacao IS 'Schema para módulo de Qualificações e Capacitações';
COMMENT ON TABLE capacitacao.qualificacao IS 'Template de curso/qualificação';
COMMENT ON TABLE capacitacao.capacitacao IS 'Instância de aplicação de uma qualificação (evento)';
COMMENT ON TABLE capacitacao.capacitacao_inscricao IS 'Inscrições de participantes em capacitações';
COMMENT ON TABLE capacitacao.capacitacao_presenca IS 'Controle de presença em capacitações';
COMMENT ON TABLE capacitacao.avaliacao_versao IS 'Versões do questionário de avaliação de impacto';
COMMENT ON TABLE capacitacao.avaliacao_pergunta IS 'Perguntas do questionário de avaliação (normalizado)';
COMMENT ON TABLE capacitacao.capacitacao_avaliacao IS 'Respostas de avaliação de participantes';
COMMENT ON TABLE capacitacao.capacitacao_avaliacao_resposta IS 'Respostas individuais às perguntas (normalizado)';
COMMENT ON TABLE capacitacao.capacitacao_material IS 'Repositório de materiais didáticos por qualificação';
COMMENT ON TABLE capacitacao.capacitacao_evidencia IS 'Fotos e documentos de evidência de capacitações';

-- ============================================
-- PERMISSÕES
-- ============================================
-- Conceder permissões ao usuário do aplicativo
GRANT USAGE ON SCHEMA capacitacao TO pinovara;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA capacitacao TO pinovara;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA capacitacao TO pinovara;

-- Definir permissões padrão para objetos futuros
ALTER DEFAULT PRIVILEGES IN SCHEMA capacitacao GRANT ALL PRIVILEGES ON TABLES TO pinovara;
ALTER DEFAULT PRIVILEGES IN SCHEMA capacitacao GRANT ALL PRIVILEGES ON SEQUENCES TO pinovara;

-- ============================================
-- MENSAGEM DE SUCESSO
-- ============================================
DO $$
BEGIN
    RAISE NOTICE 'Schema capacitacao e todas as tabelas criadas com sucesso!';
END $$;

