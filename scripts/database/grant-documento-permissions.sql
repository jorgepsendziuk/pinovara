-- Script para dar permissões na tabela organizacao_documento
-- Execute este script no banco de dados remoto

-- Dar permissões completas ao usuário pinovara
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE pinovara.organizacao_documento TO pinovara;

-- Dar permissão para usar a sequence do ID
GRANT USAGE, SELECT ON SEQUENCE pinovara.organizacao_documento_id_seq TO pinovara;

-- Verificar permissões
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.table_privileges 
WHERE table_schema = 'pinovara' 
  AND table_name = 'organizacao_documento';


