-- ============================================================================
-- CORRIGIR PERMISSÕES DA TABELA db_connections
-- ============================================================================

-- Dar permissão de SELECT para todos os usuários no schema pinovara
GRANT SELECT ON pinovara.db_connections TO PUBLIC;

-- Ou se quiser ser mais específico, dê para o usuário do backend
-- (substitua 'seu_usuario_backend' pelo usuário real)
-- GRANT SELECT ON pinovara.db_connections TO seu_usuario_backend;

-- Verificar permissões
\dp pinovara.db_connections

SELECT 'Permissões concedidas com sucesso!' as status;


