-- 1. Criar role SUPERVISÃO no módulo Organizações (se não existir)
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
  WHERE r.name = 'supervisao' AND r."moduleId" = pinovara.modules.id
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

-- 3. Verificar
SELECT 
  u.id,
  u.email,
  u.name,
  r.name as role,
  m.name as module
FROM pinovara.users u
JOIN pinovara.user_roles ur ON u.id = ur."userId"
JOIN pinovara.roles r ON ur."roleId" = r.id
JOIN pinovara.modules m ON r."moduleId" = m.id
WHERE u.email = 'sabrina.diniz@incra.gov.br';
