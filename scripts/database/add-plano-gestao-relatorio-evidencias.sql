-- ==========================================
-- Migração: Relatório Sintético e Evidências do Plano de Gestão
-- ==========================================
-- Data: 2025-11-04
-- Descrição: Adiciona campos para relatório sintético e tabela para evidências (fotos e listas de presença)
--
-- Campos adicionados na tabela organizacao:
-- - plano_gestao_relatorio_sintetico (TEXT)
-- - plano_gestao_relatorio_sintetico_updated_by (INT)
-- - plano_gestao_relatorio_sintetico_updated_at (TIMESTAMP)
--
-- Nova tabela:
-- - plano_gestao_evidencia (para armazenar fotos e listas de presença)
-- ==========================================

BEGIN;

-- 1. Adicionar colunas de relatório sintético na tabela organizacao
ALTER TABLE pinovara.organizacao
ADD COLUMN IF NOT EXISTS plano_gestao_relatorio_sintetico TEXT,
ADD COLUMN IF NOT EXISTS plano_gestao_relatorio_sintetico_updated_by INT,
ADD COLUMN IF NOT EXISTS plano_gestao_relatorio_sintetico_updated_at TIMESTAMP(6);

-- 2. Criar tabela plano_gestao_evidencia
CREATE TABLE IF NOT EXISTS pinovara.plano_gestao_evidencia (
    id SERIAL PRIMARY KEY,
    id_organizacao INT NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'foto' ou 'lista_presenca'
    nome_arquivo VARCHAR(255) NOT NULL,
    caminho_arquivo VARCHAR(500) NOT NULL,
    descricao TEXT,
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plano_gestao_evidencia_organizacao 
        FOREIGN KEY (id_organizacao) 
        REFERENCES pinovara.organizacao(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_plano_gestao_evidencia_user 
        FOREIGN KEY (uploaded_by) 
        REFERENCES pinovara.users(id) 
        ON DELETE RESTRICT
);

-- 3. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_plano_gestao_evidencia_organizacao 
    ON pinovara.plano_gestao_evidencia(id_organizacao);
CREATE INDEX IF NOT EXISTS idx_plano_gestao_evidencia_tipo 
    ON pinovara.plano_gestao_evidencia(tipo);
CREATE INDEX IF NOT EXISTS idx_plano_gestao_evidencia_uploaded_by 
    ON pinovara.plano_gestao_evidencia(uploaded_by);

-- 4. Adicionar foreign key para plano_gestao_relatorio_sintetico_updated_by
ALTER TABLE pinovara.organizacao
ADD CONSTRAINT fk_organizacao_relatorio_sintetico_updated_by 
    FOREIGN KEY (plano_gestao_relatorio_sintetico_updated_by) 
    REFERENCES pinovara.users(id) 
    ON DELETE SET NULL 
    ON UPDATE NO ACTION;

-- 5. Conceder permissões ao usuário pinovara
GRANT SELECT, INSERT, UPDATE, DELETE ON pinovara.plano_gestao_evidencia TO pinovara;
GRANT USAGE, SELECT ON SEQUENCE pinovara.plano_gestao_evidencia_id_seq TO pinovara;

-- 6. Comentários nas colunas/tabelas (documentação)
COMMENT ON COLUMN pinovara.organizacao.plano_gestao_relatorio_sintetico IS 'Relatório sintético com planejamento estruturado e processo de aplicação do Plano de Gestão';
COMMENT ON COLUMN pinovara.organizacao.plano_gestao_relatorio_sintetico_updated_by IS 'ID do usuário que fez a última edição do relatório sintético';
COMMENT ON COLUMN pinovara.organizacao.plano_gestao_relatorio_sintetico_updated_at IS 'Data e hora da última edição do relatório sintético';
COMMENT ON TABLE pinovara.plano_gestao_evidencia IS 'Armazena evidências do Plano de Gestão (fotos e listas de presença)';
COMMENT ON COLUMN pinovara.plano_gestao_evidencia.tipo IS 'Tipo de evidência: foto ou lista_presenca';
COMMENT ON COLUMN pinovara.plano_gestao_evidencia.caminho_arquivo IS 'Caminho relativo do arquivo no servidor';

COMMIT;

-- ==========================================
-- Verificação
-- ==========================================
-- Execute as queries abaixo para verificar se a migração foi aplicada corretamente:
--
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_schema = 'pinovara' 
--   AND table_name = 'organizacao' 
--   AND column_name LIKE 'plano_gestao_relatorio%';
--
-- SELECT table_name, column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_schema = 'pinovara' 
--   AND table_name = 'plano_gestao_evidencia';
-- ==========================================

