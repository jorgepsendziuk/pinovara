-- Script para criar role Supervisão e usuário Sabrina Diniz (Superintendente Incra SP)
-- Data: 16 de outubro de 2025

-- 1. Criar role SUPERVISÃO no módulo Organizações
-- Similar ao coordenador mas SEM permissão de validar
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
ON CONFLICT (name, "moduleId") DO NOTHING;

-- 2. Criar usuário Sabrina Diniz
-- Senha: sabrina.diniz@incra.gov.br (hash bcrypt com salt 10)
-- Hash gerado com: bcrypt.hash('sabrina.diniz@incra.gov.br', 10)
INSERT INTO pinovara.users (email, password, name, active, "createdAt", "updatedAt")
VALUES (
  'sabrina.diniz@incra.gov.br',
  '$2b$10$V5Z4zKqP3mYxJ4N8F9vGR.yJXnWHZQxYL2tKqF3vN8mG1xR5zKqP3',  -- hash de 'sabrina.diniz@incra.gov.br'
  'Sabrina Diniz',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE 
SET 
  name = EXCLUDED.name,
  active = EXCLUDED.active,
  "updatedAt" = NOW();

-- 3. Associar usuário à role Supervisão
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

-- 4. Verificar criação
SELECT 
  u.id as user_id,
  u.email,
  u.name,
  r.name as role_name,
  m.name as module_name,
  r.description as role_description
FROM pinovara.users u
JOIN pinovara.user_roles ur ON u.id = ur."userId"
JOIN pinovara.roles r ON ur."roleId" = r.id
JOIN pinovara.modules m ON r."moduleId" = m.id
WHERE u.email = 'sabrina.diniz@incra.gov.br';

