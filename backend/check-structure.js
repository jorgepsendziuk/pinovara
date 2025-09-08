const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkStructure() {
  try {
    console.log('Checking database structure...');
    
    // Check user_roles table structure
    const userRolesStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'user_roles' 
      ORDER BY ordinal_position;
    `;
    
    console.log('\nuser_roles table structure:');
    console.table(userRolesStructure);
    
    // Check existing data
    const existingUserRoles = await prisma.$queryRaw`SELECT * FROM "user_roles"`;
    console.log('\nExisting user_roles data:');
    console.table(existingUserRoles);
    
    const existingUsers = await prisma.$queryRaw`SELECT id, email FROM "users"`;
    console.log('\nExisting users:');
    console.table(existingUsers);
    
    const existingRoles = await prisma.$queryRaw`SELECT id, name FROM "roles"`;
    console.log('\nExisting roles:');
    console.table(existingRoles);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStructure();