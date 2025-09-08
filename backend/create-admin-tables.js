const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdminTables() {
  try {
    console.log('Creating admin tables...');
    
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
    
    console.log('✅ Admin tables created successfully!');
    
    // Create initial system settings
    console.log('Creating initial system settings...');
    
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
    
    // Create initial audit log entry
    await prisma.$executeRaw`
      INSERT INTO "audit_logs" (id, action, entity, "entityId", "newData", "createdAt")
      VALUES ('initial-log', 'SYSTEM_INIT', 'system', null, '{"message": "Sistema inicializado com configurações padrão"}', NOW())
      ON CONFLICT (id) DO NOTHING;
    `;
    
    console.log('✅ Initial admin data created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating admin tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminTables();