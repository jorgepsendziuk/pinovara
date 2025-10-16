-- ========================================
-- SQL para criar role SUPERVISÃO
-- Execute no banco de dados pinovara
-- ========================================

-- 1. Criar role SUPERVISÃO no módulo Organizações
INSERT INTO pinovara.roles (name, description, "moduleId", active, "createdAt", "updatedAt")
SELECT 
  'supervisao', 
  'Supervisor - Pode visualizar todas as organizações mas não pode editar nem validar',
  id,
  true,
  NOW(),
  NOW()
FROM pinovara.modules
WHERE name = 'organizacoes'
AND NOT EXISTS (
  SELECT 1 FROM pinovara.roles r 
  INNER JOIN pinovara.modules m ON r."moduleId" = m.id
  WHERE r.name = 'supervisao' AND m.name = 'organizacoes'
);

-- 2. Associar usuário Sabrina Diniz à role Supervisão
INSERT INTO pinovara.user_roles ("userId", "roleId", "createdAt", "updatedAt")
SELECT 
  u.id,
  r.id,
  NOW(),
  NOW()
FROM pinovara.users u
CROSS JOIN pinovara.roles r
INNER JOIN pinovara.modules m ON r."moduleId" = m.id
WHERE u.email = 'sabrina.diniz@incra.gov.br'
  AND r.name = 'supervisao'
  AND m.name = 'organizacoes'
ON CONFLICT ("userId", "roleId") DO NOTHING;

-- 3. Verificar resultado
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  r.name as role_name,
  r.description as role_description,
  m.name as module_name
FROM pinovara.users u
JOIN pinovara.user_roles ur ON u.id = ur."userId"
JOIN pinovara.roles r ON ur."roleId" = r.id
JOIN pinovara.modules m ON r."moduleId" = m.id
WHERE u.email = 'sabrina.diniz@incra.gov.br'
ORDER BY m.name, r.name;

