const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createSimpleData() {
  try {
    console.log('Creating simple demo data using Prisma...');
    
    // Create sistema module
    const sistemaModule = await prisma.module.upsert({
      where: { name: 'sistema' },
      update: {},
      create: {
        name: 'sistema',
        description: 'Módulo de administração do sistema',
        active: true
      }
    });
    console.log('✅ Sistema module created:', sistemaModule.id);
    
    // Create admin role
    const adminRole = await prisma.role.upsert({
      where: { 
        name_moduleId: {
          name: 'admin',
          moduleId: sistemaModule.id
        }
      },
      update: {},
      create: {
        name: 'admin',
        description: 'Administrador do sistema com acesso completo',
        moduleId: sistemaModule.id,
        active: true
      }
    });
    console.log('✅ Admin role created:', adminRole.id);
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@pinovara.com' },
      update: {},
      create: {
        email: 'admin@pinovara.com',
        name: 'Administrador PINOVARA',
        password: hashedPassword,
        active: true
      }
    });
    console.log('✅ Admin user created:', adminUser.id);
    
    // Assign admin role to admin user
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id
        }
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id
      }
    });
    console.log('✅ Admin role assigned to admin user');
    
    // Create regular user
    const userPassword = await bcrypt.hash('user123', 12);
    const regularUser = await prisma.user.upsert({
      where: { email: 'user@pinovara.com' },
      update: {},
      create: {
        email: 'user@pinovara.com',
        name: 'Usuário Demo',
        password: userPassword,
        active: true
      }
    });
    console.log('✅ Regular user created:', regularUser.id);
    
    console.log('\n🎉 Demo data created successfully!');
    console.log('\nDemo credentials:');
    console.log('Admin: admin@pinovara.com / admin123');
    console.log('User:  user@pinovara.com / user123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSimpleData();