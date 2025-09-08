const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTables() {
  try {
    console.log('Creating tables...');
    
    // Create users table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        active BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
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
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `;
    
    // Create roles table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "roles" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        active BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "moduleId" TEXT NOT NULL,
        FOREIGN KEY ("moduleId") REFERENCES "modules"(id) ON DELETE CASCADE,
        UNIQUE(name, "moduleId")
      );
    `;
    
    // Create user_roles table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "user_roles" (
        id TEXT PRIMARY KEY,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        "userId" TEXT NOT NULL,
        "roleId" TEXT NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "users"(id) ON DELETE CASCADE,
        FOREIGN KEY ("roleId") REFERENCES "roles"(id) ON DELETE CASCADE,
        UNIQUE("userId", "roleId")
      );
    `;
    
    console.log('✅ Tables created successfully!');
    
    // Create initial modules and roles
    console.log('Creating initial modules and roles...');
    
    // Insert system module directly
    await prisma.$executeRaw`
      INSERT INTO "modules" (id, name, description, active, "createdAt", "updatedAt")
      VALUES ('cm3vj8k4p0001h8f8j0zqq1qx', 'sistema', 'Módulo do sistema', true, NOW(), NOW())
      ON CONFLICT (name) DO NOTHING;
    `;
    
    // Insert admin role directly
    await prisma.$executeRaw`
      INSERT INTO "roles" (id, name, description, active, "createdAt", "updatedAt", "moduleId")
      VALUES ('cm3vj8k4p0002h8f8j0zqq1qy', 'admin', 'Administrador do sistema', true, NOW(), NOW(), 'cm3vj8k4p0001h8f8j0zqq1qx')
      ON CONFLICT (name, "moduleId") DO NOTHING;
    `;
    
    console.log('✅ Initial data created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTables();