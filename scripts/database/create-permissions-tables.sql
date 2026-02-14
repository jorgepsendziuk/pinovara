-- ============================================
-- Criar tabelas para gestão de permissões por role
-- Schema: pinovara
-- Aplicar via DBA
-- ============================================

-- Tabela permissions: catálogo de funcionalidades
CREATE TABLE IF NOT EXISTS pinovara.permissions (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  module_name VARCHAR(100),
  category VARCHAR(100),
  active BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(6) DEFAULT NOW(),
  "updatedAt" TIMESTAMP(6) DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_permissions_module_name ON pinovara.permissions(module_name);
CREATE INDEX IF NOT EXISTS idx_permissions_code ON pinovara.permissions(code);
CREATE INDEX IF NOT EXISTS idx_permissions_active ON pinovara.permissions(active);

-- Tabela role_permissions: associação role <-> permission (enabled)
CREATE TABLE IF NOT EXISTS pinovara.role_permissions (
  "roleId" INT NOT NULL,
  "permissionId" INT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP(6) DEFAULT NOW(),
  "updatedAt" TIMESTAMP(6) DEFAULT NOW(),
  PRIMARY KEY ("roleId", "permissionId"),
  CONSTRAINT fk_role_permissions_role FOREIGN KEY ("roleId") REFERENCES pinovara.roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_permissions_permission FOREIGN KEY ("permissionId") REFERENCES pinovara.permissions(id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON pinovara.role_permissions("roleId");
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON pinovara.role_permissions("permissionId");

-- Comentários
COMMENT ON TABLE pinovara.permissions IS 'Catálogo de permissões/funcionalidades do sistema';
COMMENT ON TABLE pinovara.role_permissions IS 'Permissões habilitadas por role (ligar/desligar por role)';
