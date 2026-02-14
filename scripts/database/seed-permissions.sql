-- ============================================
-- Seed: permissions e role_permissions
-- Executar APÓS create-permissions-tables.sql
-- Popula o catálogo de permissões e valores iniciais
-- ============================================

-- Inserir permissions (catálogo)
INSERT INTO pinovara.permissions (code, name, description, module_name, category, active, "createdAt", "updatedAt") VALUES
  ('qualificacoes.list_all', 'Ver todas qualificações', 'Acesso à lista completa de qualificações', 'qualificacoes', 'qualificacoes', true, NOW(), NOW()),
  ('qualificacoes.edit', 'Editar qualificações', 'Editar qualificações (criador ou equipe técnica)', 'qualificacoes', 'qualificacoes', true, NOW(), NOW()),
  ('qualificacoes.validate', 'Validar qualificações', 'Alterar status de validação de qualificações', 'qualificacoes', 'qualificacoes', true, NOW(), NOW()),
  ('capacitacoes.list_all', 'Ver todas capacitações', 'Acesso à lista completa de capacitações', 'qualificacoes', 'qualificacoes', true, NOW(), NOW()),
  ('capacitacoes.edit', 'Editar capacitações', 'Editar capacitações', 'qualificacoes', 'qualificacoes', true, NOW(), NOW()),
  ('capacitacoes.validate', 'Validar capacitações', 'Alterar status de validação de capacitações', 'qualificacoes', 'qualificacoes', true, NOW(), NOW()),
  ('organizacoes.list_all', 'Ver todas organizações', 'Acesso à lista completa de organizações', 'organizacoes', 'organizacoes', true, NOW(), NOW()),
  ('organizacoes.edit', 'Editar organizações', 'Criar e editar organizações', 'organizacoes', 'organizacoes', true, NOW(), NOW()),
  ('organizacoes.validate', 'Validar organizações', 'Validar organizações', 'organizacoes', 'organizacoes', true, NOW(), NOW()),
  ('organizacoes.plano_gestao.edit', 'Editar plano de gestão', 'Editar plano de gestão das organizações', 'organizacoes', 'organizacoes', true, NOW(), NOW()),
  ('supervisao.view_all', 'Ver todas famílias/glebas', 'Ver todas famílias e glebas do módulo', 'supervisao_ocupacional', 'supervisao', true, NOW(), NOW()),
  ('supervisao.edit', 'Editar famílias', 'Editar famílias e glebas', 'supervisao_ocupacional', 'supervisao', true, NOW(), NOW()),
  ('supervisao.validate', 'Validar famílias', 'Validar famílias do módulo', 'supervisao_ocupacional', 'supervisao', true, NOW(), NOW()),
  ('supervisao.view_own_only', 'Ver apenas próprias', 'Ver apenas registros próprios (técnico/estagiário)', 'supervisao_ocupacional', 'supervisao', true, NOW(), NOW()),
  ('sistema.admin', 'Acesso administração', 'Acesso ao painel de administração', 'sistema', 'sistema', true, NOW(), NOW()),
  ('repositorio.upload', 'Upload no repositório', 'Fazer upload de arquivos no repositório', NULL, 'repositorio', true, NOW(), NOW()),
  ('menu.organizacoes', 'Ver menu Organizações', 'Exibir menu de Organizações no sidebar', 'organizacoes', 'menu', true, NOW(), NOW()),
  ('menu.qualificacoes', 'Ver menu Qualificações', 'Exibir menu de Qualificações no sidebar', 'qualificacoes', 'menu', true, NOW(), NOW()),
  ('menu.supervisao', 'Ver menu Cadastro Famílias', 'Exibir menu de Cadastro de Famílias no sidebar', 'supervisao_ocupacional', 'menu', true, NOW(), NOW())
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  module_name = EXCLUDED.module_name,
  category = EXCLUDED.category,
  "updatedAt" = NOW();

-- Inserir role_permissions (valores iniciais baseados na lógica hardcoded atual)
-- Usa módulo+role para encontrar os IDs
DO $$
DECLARE
  r RECORD;
  perm_id INT;
  role_ids INT[];
BEGIN
  -- Admin sistema: todas as permissões
  FOR r IN SELECT r2.id, m.name as mod_name, r2.name as role_name
    FROM pinovara.roles r2
    JOIN pinovara.modules m ON m.id = r2."moduleId"
    WHERE m.name = 'sistema' AND r2.name = 'admin'
  LOOP
    FOR perm_id IN SELECT id FROM pinovara.permissions WHERE active = true
    LOOP
      INSERT INTO pinovara.role_permissions ("roleId", "permissionId", enabled, "createdAt", "updatedAt")
      VALUES (r.id, perm_id, true, NOW(), NOW())
      ON CONFLICT ("roleId", "permissionId") DO UPDATE SET enabled = true, "updatedAt" = NOW();
    END LOOP;
  END LOOP;

  -- Coordenador organizacoes: list_all, validate (qualificacoes e organizacoes)
  FOR r IN SELECT r2.id FROM pinovara.roles r2 JOIN pinovara.modules m ON m.id = r2."moduleId" WHERE m.name = 'organizacoes' AND r2.name = 'coordenador'
  LOOP
    FOR perm_id IN SELECT id FROM pinovara.permissions WHERE code IN ('qualificacoes.list_all', 'qualificacoes.validate', 'capacitacoes.list_all', 'capacitacoes.validate', 'organizacoes.list_all', 'organizacoes.validate', 'menu.organizacoes', 'menu.qualificacoes', 'repositorio.upload')
    LOOP
      INSERT INTO pinovara.role_permissions ("roleId", "permissionId", enabled, "createdAt", "updatedAt")
      VALUES (r.id, perm_id, true, NOW(), NOW())
      ON CONFLICT ("roleId", "permissionId") DO UPDATE SET enabled = true, "updatedAt" = NOW();
    END LOOP;
  END LOOP;

  -- Supervisor organizacoes: list_all (sem edit, sem validate)
  FOR r IN SELECT r2.id FROM pinovara.roles r2 JOIN pinovara.modules m ON m.id = r2."moduleId" WHERE m.name = 'organizacoes' AND r2.name = 'supervisao'
  LOOP
    FOR perm_id IN SELECT id FROM pinovara.permissions WHERE code IN ('qualificacoes.list_all', 'capacitacoes.list_all', 'organizacoes.list_all', 'menu.organizacoes', 'menu.qualificacoes', 'repositorio.upload')
    LOOP
      INSERT INTO pinovara.role_permissions ("roleId", "permissionId", enabled, "createdAt", "updatedAt")
      VALUES (r.id, perm_id, true, NOW(), NOW())
      ON CONFLICT ("roleId", "permissionId") DO UPDATE SET enabled = true, "updatedAt" = NOW();
    END LOOP;
  END LOOP;

  -- Técnico organizacoes: edit (qualificacoes e organizacoes)
  FOR r IN SELECT r2.id FROM pinovara.roles r2 JOIN pinovara.modules m ON m.id = r2."moduleId" WHERE m.name = 'organizacoes' AND r2.name = 'tecnico'
  LOOP
    FOR perm_id IN SELECT id FROM pinovara.permissions WHERE code IN ('qualificacoes.list_all', 'qualificacoes.edit', 'capacitacoes.list_all', 'capacitacoes.edit', 'organizacoes.list_all', 'organizacoes.edit', 'organizacoes.plano_gestao.edit', 'menu.organizacoes', 'menu.qualificacoes', 'repositorio.upload')
    LOOP
      INSERT INTO pinovara.role_permissions ("roleId", "permissionId", enabled, "createdAt", "updatedAt")
      VALUES (r.id, perm_id, true, NOW(), NOW())
      ON CONFLICT ("roleId", "permissionId") DO UPDATE SET enabled = true, "updatedAt" = NOW();
    END LOOP;
  END LOOP;

  -- Técnico qualificacoes (se existir)
  FOR r IN SELECT r2.id FROM pinovara.roles r2 JOIN pinovara.modules m ON m.id = r2."moduleId" WHERE m.name = 'qualificacoes' AND r2.name = 'tecnico'
  LOOP
    FOR perm_id IN SELECT id FROM pinovara.permissions WHERE code IN ('qualificacoes.list_all', 'qualificacoes.edit', 'capacitacoes.list_all', 'capacitacoes.edit', 'menu.organizacoes', 'menu.qualificacoes')
    LOOP
      INSERT INTO pinovara.role_permissions ("roleId", "permissionId", enabled, "createdAt", "updatedAt")
      VALUES (r.id, perm_id, true, NOW(), NOW())
      ON CONFLICT ("roleId", "permissionId") DO UPDATE SET enabled = true, "updatedAt" = NOW();
    END LOOP;
  END LOOP;

  -- Supervisão Ocupacional: admin, coordenador, tecnico, supervisor, estagiario
  FOR r IN SELECT r2.id, m.name as mod_name, r2.name as role_name FROM pinovara.roles r2 JOIN pinovara.modules m ON m.id = r2."moduleId" WHERE m.name = 'supervisao_ocupacional'
  LOOP
    IF r.role_name = 'admin' THEN
      FOR perm_id IN SELECT id FROM pinovara.permissions WHERE module_name = 'supervisao_ocupacional' OR code LIKE 'menu.supervisao'
      LOOP
        INSERT INTO pinovara.role_permissions ("roleId", "permissionId", enabled, "createdAt", "updatedAt")
        VALUES (r.id, perm_id, true, NOW(), NOW())
        ON CONFLICT ("roleId", "permissionId") DO UPDATE SET enabled = true, "updatedAt" = NOW();
      END LOOP;
    ELSIF r.role_name = 'coordenador' THEN
      FOR perm_id IN SELECT id FROM pinovara.permissions WHERE code IN ('supervisao.view_all', 'supervisao.validate', 'menu.supervisao')
      LOOP
        INSERT INTO pinovara.role_permissions ("roleId", "permissionId", enabled, "createdAt", "updatedAt")
        VALUES (r.id, perm_id, true, NOW(), NOW())
        ON CONFLICT ("roleId", "permissionId") DO UPDATE SET enabled = true, "updatedAt" = NOW();
      END LOOP;
    ELSIF r.role_name = 'supervisor' THEN
      FOR perm_id IN SELECT id FROM pinovara.permissions WHERE code IN ('supervisao.view_all', 'menu.supervisao')
      LOOP
        INSERT INTO pinovara.role_permissions ("roleId", "permissionId", enabled, "createdAt", "updatedAt")
        VALUES (r.id, perm_id, true, NOW(), NOW())
        ON CONFLICT ("roleId", "permissionId") DO UPDATE SET enabled = true, "updatedAt" = NOW();
      END LOOP;
    ELSIF r.role_name IN ('tecnico', 'estagiario') THEN
      FOR perm_id IN SELECT id FROM pinovara.permissions WHERE code IN ('supervisao.view_all', 'supervisao.edit', 'supervisao.view_own_only', 'menu.supervisao')
      LOOP
        INSERT INTO pinovara.role_permissions ("roleId", "permissionId", enabled, "createdAt", "updatedAt")
        VALUES (r.id, perm_id, true, NOW(), NOW())
        ON CONFLICT ("roleId", "permissionId") DO UPDATE SET enabled = true, "updatedAt" = NOW();
      END LOOP;
    END IF;
  END LOOP;
END $$;
