const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAllTables() {
  try {
    console.log('Creating all database tables...');
    
    // Create users table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Create modules table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "modules" (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        active BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Create roles table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "roles" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        "moduleId" TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("moduleId") REFERENCES "modules"(id) ON DELETE CASCADE,
        UNIQUE(name, "moduleId")
      );
    `;
    
    // Create user_roles table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "user_roles" (
        id TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "roleId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "users"(id) ON DELETE CASCADE,
        FOREIGN KEY ("roleId") REFERENCES "roles"(id) ON DELETE CASCADE,
        UNIQUE("userId", "roleId")
      );
    `;
    
    // Create system_settings table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "system_settings" (
        id TEXT PRIMARY KEY,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'string',
        description TEXT,
        category TEXT NOT NULL DEFAULT 'general',
        active BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Create audit_logs table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        id TEXT PRIMARY KEY,
        action TEXT NOT NULL,
        entity TEXT NOT NULL,
        "entityId" TEXT,
        "oldData" TEXT,
        "newData" TEXT,
        "userAgent" TEXT,
        "ipAddress" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "userId" TEXT,
        FOREIGN KEY ("userId") REFERENCES "users"(id) ON DELETE SET NULL
      );
    `;
    
    console.log('✅ All tables created successfully!');
    
    // Insert demo data
    console.log('Creating demo data...');
    
    // Insert sistema module
    const moduleResult = await prisma.$executeRaw`
      INSERT INTO "modules" (id, name, description, active, "createdAt", "updatedAt")
      VALUES ('mod-sistema', 'sistema', 'Módulo de administração do sistema', true, NOW(), NOW())
      ON CONFLICT (name) DO NOTHING;
    `;
    console.log('Sistema module inserted');
    
    // Wait a moment and verify the module exists
    const moduleCheck = await prisma.$queryRaw`SELECT id FROM "modules" WHERE name = 'sistema'`;
    console.log('Module check:', moduleCheck);
    
    // Insert admin role using the actual module ID
    const actualModuleId = moduleCheck[0].id;
    await prisma.$executeRaw`
      INSERT INTO "roles" (id, name, description, "moduleId", active, "createdAt", "updatedAt")
      VALUES ('role-admin', 'admin', 'Administrador do sistema com acesso completo', ${actualModuleId}, true, NOW(), NOW())
      ON CONFLICT (name, "moduleId") DO NOTHING;
    `;
    console.log('Admin role inserted');
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await prisma.$executeRaw`
      INSERT INTO "users" (id, email, name, password, active, "createdAt", "updatedAt")
      VALUES ('user-admin', 'admin@pinovara.com.br', 'Administrador PINOVARA', ${hashedPassword}, true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING;
    `;
    
    // Get the actual role ID
    const roleCheck = await prisma.$queryRaw`SELECT id FROM "roles" WHERE name = 'admin' AND "moduleId" = ${actualModuleId}`;
    const actualRoleId = roleCheck[0].id;
    console.log('Role ID:', actualRoleId);
    
    // Assign admin role to admin user
    await prisma.$executeRaw`
      INSERT INTO "user_roles" (id, "userId", "roleId", "createdAt")
      VALUES ('userrole-admin', 'user-admin', ${actualRoleId}, NOW())
      ON CONFLICT ("userId", "roleId") DO NOTHING;
    `;
    
    // Create regular user
    const userPassword = await bcrypt.hash('user123', 12);
    
    await prisma.$executeRaw`
      INSERT INTO "users" (id, email, name, password, active, "createdAt", "updatedAt")
      VALUES ('user-regular', 'user@pinovara.com.br', 'Usuário Demo', ${userPassword}, true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING;
    `;
    
    // Insert system settings
    await prisma.$executeRaw`
      INSERT INTO "system_settings" (id, key, value, type, description, category, active, "createdAt", "updatedAt")
      VALUES 
        ('set-app-name', 'app_name', 'PINOVARA', 'string', 'Nome da aplicação', 'general', true, NOW(), NOW()),
        ('set-app-version', 'app_version', '1.0.0', 'string', 'Versão da aplicação', 'general', true, NOW(), NOW()),
        ('set-app-description', 'app_description', 'Sistema completo de gestão com módulos e permissões', 'string', 'Descrição da aplicação', 'general', true, NOW(), NOW()),
        ('set-max-login-attempts', 'max_login_attempts', '5', 'number', 'Máximo de tentativas de login', 'security', true, NOW(), NOW()),
        ('set-session-timeout', 'session_timeout', '24', 'number', 'Tempo de sessão em horas', 'security', true, NOW(), NOW()),
        ('set-enable-audit-log', 'enable_audit_log', 'true', 'boolean', 'Habilitar logs de auditoria', 'security', true, NOW(), NOW()),
        ('set-maintenance-mode', 'maintenance_mode', 'false', 'boolean', 'Modo de manutenção', 'system', true, NOW(), NOW()),
        ('set-allow-registration', 'allow_registration', 'true', 'boolean', 'Permitir registro de novos usuários', 'security', true, NOW(), NOW())
      ON CONFLICT (key) DO NOTHING;
    `;
    
    // Insert initial audit log
    await prisma.$executeRaw`
      INSERT INTO "audit_logs" (id, action, entity, "entityId", "newData", "createdAt")
      VALUES ('initial-log', 'SYSTEM_INIT', 'system', null, '{"message": "Sistema inicializado com configurações padrão"}', NOW())
      ON CONFLICT (id) DO NOTHING;
    `;
    
    console.log('✅ Demo data created successfully!');
    console.log('\nDemo credentials:');
    console.log('Admin: admin@pinovara.com.br / admin123');
    console.log('User:  user@pinovara.com.br / user123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAllTables();