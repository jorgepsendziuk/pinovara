-- Fix permissions for plano_gestao tables and sequences
-- Run this as the database administrator

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON pinovara.plano_gestao_acao_modelo TO pinovara;
GRANT SELECT, INSERT, UPDATE, DELETE ON pinovara.plano_gestao_acao TO pinovara;

-- Grant permissions on sequences (for auto-increment IDs)
GRANT USAGE, SELECT ON SEQUENCE pinovara.plano_gestao_acao_modelo_id_seq TO pinovara;
GRANT USAGE, SELECT ON SEQUENCE pinovara.plano_gestao_acao_id_seq TO pinovara;

-- Verify permissions
SELECT 
    schemaname, 
    tablename, 
    tableowner,
    has_table_privilege('pinovara', schemaname||'.'||tablename, 'INSERT') as can_insert,
    has_table_privilege('pinovara', schemaname||'.'||tablename, 'UPDATE') as can_update
FROM pg_tables 
WHERE schemaname = 'pinovara' 
  AND tablename LIKE 'plano_gestao%';

SELECT 
    schemaname,
    sequencename,
    sequenceowner,
    has_sequence_privilege('pinovara', schemaname||'.'||sequencename, 'USAGE') as can_use
FROM pg_sequences
WHERE schemaname = 'pinovara'
  AND sequencename LIKE 'plano_gestao%';

