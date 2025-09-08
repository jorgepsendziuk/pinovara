const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndCreateSchema() {
  try {
    console.log('Verificando conexão com o banco...');

    // Testar conexão básica
    await prisma.$queryRaw`SELECT 1`;

    console.log('✅ Conexão estabelecida');

    // Verificar se o esquema pinovara existe
    const schemas = await prisma.$queryRaw`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name = 'pinovara'
    `;

    if (schemas.length === 0) {
      console.log('Criando esquema pinovara...');
      await prisma.$queryRaw`CREATE SCHEMA IF NOT EXISTS pinovara`;
      console.log('✅ Esquema pinovara criado');
    } else {
      console.log('✅ Esquema pinovara já existe');
    }

    // Definir o search_path para usar o esquema pinovara
    await prisma.$queryRaw`SET search_path TO pinovara, public`;

    // Verificar se as tabelas existem no esquema pinovara
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'pinovara'
    `;

    console.log('Tabelas encontradas no esquema pinovara:', tables.map(t => t.table_name));

    if (tables.length === 0) {
      console.log('Criando tabelas no esquema pinovara...');

      // Criar tabelas manualmente
      await prisma.$queryRaw`
        CREATE TABLE IF NOT EXISTS pinovara.modules (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          name TEXT UNIQUE NOT NULL,
          description TEXT,
          active BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW()
        )
      `;

      await prisma.$queryRaw`
        CREATE TABLE IF NOT EXISTS pinovara.roles (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          name TEXT NOT NULL,
          description TEXT,
          active BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW(),
          "moduleId" TEXT NOT NULL REFERENCES pinovara.modules(id) ON DELETE CASCADE,
          UNIQUE(name, "moduleId")
        )
      `;

      await prisma.$queryRaw`
        CREATE TABLE IF NOT EXISTS pinovara.users (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          active BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW()
        )
      `;

      await prisma.$queryRaw`
        CREATE TABLE IF NOT EXISTS pinovara.user_roles (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW(),
          "userId" TEXT NOT NULL REFERENCES pinovara.users(id) ON DELETE CASCADE,
          "roleId" TEXT NOT NULL REFERENCES pinovara.roles(id) ON DELETE CASCADE,
          UNIQUE("userId", "roleId")
        )
      `;

      await prisma.$queryRaw`
        CREATE TABLE IF NOT EXISTS pinovara.system_settings (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          key TEXT UNIQUE NOT NULL,
          value TEXT NOT NULL,
          type TEXT NOT NULL,
          description TEXT,
          category TEXT DEFAULT 'general',
          active BOOLEAN DEFAULT true,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "updatedAt" TIMESTAMP DEFAULT NOW()
        )
      `;

      await prisma.$queryRaw`
        CREATE TABLE IF NOT EXISTS pinovara.audit_logs (
          id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
          action TEXT NOT NULL,
          entity TEXT NOT NULL,
          "entityId" TEXT,
          "oldData" TEXT,
          "newData" TEXT,
          "userAgent" TEXT,
          "ipAddress" TEXT,
          "createdAt" TIMESTAMP DEFAULT NOW(),
          "userId" TEXT REFERENCES pinovara.users(id) ON DELETE SET NULL
        )
      `;

      console.log('✅ Tabelas criadas com sucesso');
    }

    console.log('Configuração do banco concluída!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndCreateSchema();
