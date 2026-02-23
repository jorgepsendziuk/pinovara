-- ============================================
-- GRANT para tabelas de permissões
-- Executar se o erro for "permission denied for table"
-- Ajustar o nome do usuário se diferente de 'pinovara'
-- ============================================

GRANT SELECT, INSERT, UPDATE, DELETE ON pinovara.permissions TO pinovara;
GRANT SELECT, INSERT, UPDATE, DELETE ON pinovara.role_permissions TO pinovara;
GRANT USAGE, SELECT ON SEQUENCE pinovara.permissions_id_seq TO pinovara;
