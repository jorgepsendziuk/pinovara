const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixDatabase() {
  try {
    console.log('Completing database setup...');
    
    // Create admin user with correct password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await prisma.$executeRaw`
      INSERT INTO "users" (id, email, name, password, active, "createdAt", "updatedAt")
      VALUES ('user-admin', 'admin@pinovara.com.br', 'Administrador PINOVARA', ${hashedPassword}, true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET password = ${hashedPassword};
    `;
    console.log('✅ Admin user created/updated');
    
    // Get the actual module and role IDs
    const moduleResult = await prisma.$queryRaw`SELECT id FROM "modules" WHERE name = 'sistema'`;
    const roleResult = await prisma.$queryRaw`SELECT id FROM "roles" WHERE name = 'admin'`;
    
    if (moduleResult.length > 0 && roleResult.length > 0) {
      const moduleId = moduleResult[0].id;
      const roleId = roleResult[0].id;
      
      console.log('Module ID:', moduleId);
      console.log('Role ID:', roleId);
      
      // Generate a unique ID for user_role
      const userRoleId = 'userrole-' + Date.now();
      
      // Get actual user ID  
      const userResult = await prisma.$queryRaw`SELECT id FROM "users" WHERE email = 'admin@pinovara.com.br'`;
      const actualUserId = userResult[0].id;
      console.log('User ID:', actualUserId);
      
      // Assign admin role to admin user with correct IDs
      await prisma.$executeRaw`
        INSERT INTO "user_roles" (id, "userId", "roleId", "createdAt", "updatedAt")
        VALUES (${userRoleId}, ${actualUserId}, ${roleId}, NOW(), NOW())
        ON CONFLICT ("userId", "roleId") DO NOTHING;
      `;
      console.log('✅ Admin role assigned');
    }
    
    // Create regular user
    const userPassword = await bcrypt.hash('user123', 12);
    
    await prisma.$executeRaw`
      INSERT INTO "users" (id, email, name, password, active, "createdAt", "updatedAt")
      VALUES ('user-regular', 'user@pinovara.com.br', 'Usuário Demo', ${userPassword}, true, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET password = ${userPassword};
    `;
    console.log('✅ Regular user created/updated');
    
    console.log('\n🎉 Database setup completed!');
    console.log('\nDemo credentials:');
    console.log('Admin: admin@pinovara.com.br / admin123');
    console.log('User:  user@pinovara.com.br / user123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabase();