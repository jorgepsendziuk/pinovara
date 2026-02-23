-- ============================================
-- Role "editor" no módulo Organizações
-- Acesso e edição a todos os cadastros de organizações, qualificações e capacitações
-- Executar após create-permissions-tables.sql e seed-permissions.sql (ou junto)
-- ============================================

-- 1) Criar o role "editor" no módulo organizacoes (se não existir)
INSERT INTO pinovara.roles (name, description, "moduleId", active, "createdAt", "updatedAt")
SELECT
  'editor',
  'Editor: acessar e editar todos os cadastros de organizações, qualificações e capacitações',
  m.id,
  true,
  NOW(),
  NOW()
FROM pinovara.modules m
WHERE m.name = 'organizacoes'
  AND NOT EXISTS (
    SELECT 1 FROM pinovara.roles r
    WHERE r.name = 'editor' AND r."moduleId" = m.id
  );

-- 2) Atribuir permissões ao role "editor" (list_all + edit para orgs, qualificações e capacitações)
DO $$
DECLARE
  r RECORD;
  perm_id INT;
BEGIN
  FOR r IN
    SELECT r2.id
    FROM pinovara.roles r2
    JOIN pinovara.modules m ON m.id = r2."moduleId"
    WHERE m.name = 'organizacoes' AND r2.name = 'editor'
  LOOP
    FOR perm_id IN
      SELECT id FROM pinovara.permissions
      WHERE code IN (
        'qualificacoes.list_all',
        'qualificacoes.edit',
        'capacitacoes.list_all',
        'capacitacoes.edit',
        'organizacoes.list_all',
        'organizacoes.edit',
        'organizacoes.plano_gestao.edit',
        'menu.organizacoes',
        'menu.qualificacoes',
        'repositorio.upload'
      )
    LOOP
      INSERT INTO pinovara.role_permissions ("roleId", "permissionId", enabled, "createdAt", "updatedAt")
      VALUES (r.id, perm_id, true, NOW(), NOW())
      ON CONFLICT ("roleId", "permissionId") DO UPDATE SET enabled = true, "updatedAt" = NOW();
    END LOOP;
  END LOOP;
END $$;
