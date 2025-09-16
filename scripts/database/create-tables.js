const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTables() {
  try {
    console.log('🔧 Criando tabelas...');

    // Executar SQL raw para criar tabelas
    await prisma.$executeRaw`
      -- CreateTable
      CREATE TABLE IF NOT EXISTS "users" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "users_pkey" PRIMARY KEY ("id")
      );

      -- CreateTable
      CREATE TABLE IF NOT EXISTS "modules" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
      );

      -- CreateTable
      CREATE TABLE IF NOT EXISTS "roles" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "moduleId" TEXT NOT NULL,

          CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
      );

      -- CreateTable
      CREATE TABLE IF NOT EXISTS "user_roles" (
          "id" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          "userId" TEXT NOT NULL,
          "roleId" TEXT NOT NULL,

          CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
      );

      -- CreateTable
      CREATE TABLE IF NOT EXISTS "system_settings" (
          "id" TEXT NOT NULL,
          "key" TEXT NOT NULL,
          "value" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "description" TEXT,
          "category" TEXT NOT NULL DEFAULT 'general',
          "active" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
      );

      -- CreateTable
      CREATE TABLE IF NOT EXISTS "audit_logs" (
          "id" TEXT NOT NULL,
          "action" TEXT NOT NULL,
          "entity" TEXT NOT NULL,
          "entityId" TEXT,
          "oldData" TEXT,
          "newData" TEXT,
          "userAgent" TEXT,
          "ipAddress" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "userId" TEXT,

          CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
      );

      -- CreateIndex
      CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
      CREATE UNIQUE INDEX IF NOT EXISTS "modules_name_key" ON "modules"("name");
      CREATE UNIQUE INDEX IF NOT EXISTS "roles_name_moduleId_key" ON "roles"("name", "moduleId");
      CREATE UNIQUE INDEX IF NOT EXISTS "user_roles_userId_roleId_key" ON "user_roles"("userId", "roleId");
      CREATE UNIQUE INDEX IF NOT EXISTS "system_settings_key_key" ON "system_settings"("key");
    `;

    console.log('✅ Tabelas criadas com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTables();
