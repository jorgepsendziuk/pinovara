-- ============================================================================
-- SCRIPT DE INSTALAÇÃO E CONFIGURAÇÃO DO DBLINK - PINOVARA ESPECÍFICO
-- Sistema PINOVARA - Integração com Banco ODK de Produção
-- ============================================================================

-- Conectar ao banco: psql -U seu_usuario -d pinovara_db
-- Executar: \i scripts/database/setup-dblink-pinovara.sql

\echo '========================================='
\echo 'INSTALAÇÃO DBLINK - PINOVARA'
\echo '========================================='
\echo ''

-- ============================================================================
-- PARTE 1: INSTALAR EXTENSÃO DBLINK
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS dblink;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'dblink') THEN
        RAISE NOTICE '✓ Extensão dblink instalada com sucesso!';
    ELSE
        RAISE EXCEPTION '✗ Falha ao instalar extensão dblink';
    END IF;
END $$;

-- ============================================================================
-- PARTE 2: CRIAR TABELA DE CONFIGURAÇÃO DE CONEXÕES
-- ============================================================================

CREATE TABLE IF NOT EXISTS pinovara.db_connections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    host VARCHAR(255) NOT NULL,
    port INTEGER DEFAULT 5432,
    database VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE pinovara.db_connections IS 'Configurações de conexões externas via dblink';

\echo '✓ Tabela db_connections criada'

-- ============================================================================
-- PARTE 3: INSERIR CONFIGURAÇÃO DO BANCO ODK PRODUÇÃO
-- ============================================================================

-- ⚠️ AJUSTE OS VALORES ABAIXO COM AS CREDENCIAIS REAIS!

INSERT INTO pinovara.db_connections (
    name, 
    host, 
    port, 
    database, 
    username, 
    password, 
    description
) VALUES (
    'odk_prod',
    'app.pinovaraufba.com.br',         -- Host do banco ODK
    5432,                               -- Porta padrão PostgreSQL
    'odk_prod',                         -- Nome do banco
    'pinovara_sync',                    -- ⚠️ AJUSTAR: Usuário com permissão de leitura
    'SENHA_AQUI',                       -- ⚠️ AJUSTAR: Senha do usuário
    'Banco de produção ODK Collect - Somente leitura'
)
ON CONFLICT (name) DO UPDATE SET
    host = EXCLUDED.host,
    port = EXCLUDED.port,
    database = EXCLUDED.database,
    username = EXCLUDED.username,
    password = EXCLUDED.password,
    description = EXCLUDED.description,
    updated_at = NOW();

\echo '✓ Configuração do banco ODK inserida'
\echo '⚠️  LEMBRE-SE DE ATUALIZAR O USUÁRIO E SENHA!'

-- ============================================================================
-- PARTE 4: FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para obter string de conexão
CREATE OR REPLACE FUNCTION pinovara.get_connection_string(conn_name VARCHAR)
RETURNS TEXT AS $$
DECLARE
    db_config RECORD;
    conn_string TEXT;
BEGIN
    SELECT * INTO db_config 
    FROM pinovara.db_connections 
    WHERE name = conn_name AND active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Configuração de conexão "%" não encontrada ou inativa', conn_name;
    END IF;
    
    conn_string := format('host=%s port=%s dbname=%s user=%s password=%s',
                          db_config.host,
                          db_config.port,
                          db_config.database,
                          db_config.username,
                          db_config.password);
    
    RETURN conn_string;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION pinovara.get_connection_string(VARCHAR) IS 
'Retorna string de conexão formatada para dblink';

\echo '✓ Função get_connection_string criada'

-- Função de teste
CREATE OR REPLACE FUNCTION pinovara.test_odk_connection()
RETURNS TABLE (
    status TEXT,
    message TEXT,
    version TEXT
) AS $$
DECLARE
    conn_string TEXT;
    db_version TEXT;
BEGIN
    BEGIN
        conn_string := pinovara.get_connection_string('odk_prod');
        
        SELECT t.version INTO db_version
        FROM dblink(
            conn_string,
            'SELECT version()'
        ) AS t(version TEXT);
        
        RETURN QUERY SELECT 
            'SUCCESS'::TEXT, 
            'Conexão ODK estabelecida com sucesso'::TEXT,
            db_version;
            
    EXCEPTION WHEN OTHERS THEN
        RETURN QUERY SELECT 
            'ERROR'::TEXT,
            format('Erro: %s', SQLERRM)::TEXT,
            NULL::TEXT;
    END;
END;
$$ LANGUAGE plpgsql;

\echo '✓ Função test_odk_connection criada'

-- ============================================================================
-- MENSAGENS FINAIS
-- ============================================================================

\echo ''
\echo '========================================='
\echo 'INSTALAÇÃO CONCLUÍDA!'
\echo '========================================='
\echo ''
\echo 'Próximos passos:'
\echo ''
\echo '1. Atualizar credenciais:'
\echo '   UPDATE pinovara.db_connections SET'
\echo '       username = ''seu_usuario'',' 
\echo '       password = ''sua_senha'''
\echo '   WHERE name = ''odk_prod'';'
\echo ''
\echo '2. Testar conexão:'
\echo '   SELECT * FROM pinovara.test_odk_connection();'
\echo ''
\echo '3. Se sucesso, executar próximo script:'
\echo '   \i scripts/database/create-view-fotos-odk.sql'
\echo ''

