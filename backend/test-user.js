const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    await prisma.$executeRaw`
      INSERT INTO "users" (id, email, password, name, active, "createdAt", "updatedAt")
      VALUES ('test-user-id', 'admin@pinovara.com', ${hashedPassword}, 'Administrador', true, NOW(), NOW())
      ON CONFLICT (email) DO NOTHING;
    `;
    
    // Assign admin role to user
    await prisma.$executeRaw`
      INSERT INTO "user_roles" (id, "userId", "roleId", "createdAt", "updatedAt")
      VALUES ('test-user-role-id', 'test-user-id', 'cm3vj8k4p0002h8f8j0zqq1qy', NOW(), NOW())
      ON CONFLICT ("userId", "roleId") DO NOTHING;
    `;
    
    console.log('✅ Test user created successfully!');
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();