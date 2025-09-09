const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDemoData() {
  try {
    console.log('Creating demo data...');
    
    // Create Sistema module first
    const sistemaModule = await prisma.module.upsert({
      where: { name: 'sistema' },
      update: {},
      create: {
        id: 'mod-sistema',
        name: 'sistema',
        description: 'Módulo de administração do sistema',
        active: true
      }
    });
    
    console.log('✅ Sistema module created');

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
        id: 'role-admin',
        name: 'admin',
        description: 'Administrador do sistema com acesso completo',
        moduleId: sistemaModule.id,
        active: true
      }
    });
    
    console.log('✅ Admin role created');

    // Create demo admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@pinovara.com.br' },
      update: {},
      create: {
        id: 'user-admin',
        email: 'admin@pinovara.com.br',
        name: 'Administrador PINOVARA',
        password: hashedPassword,
        active: true
      }
    });
    
    console.log('✅ Admin user created');

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
        id: 'userrole-admin',
        userId: adminUser.id,
        roleId: adminRole.id
      }
    });
    
    console.log('✅ Admin role assigned to admin user');

    // Create a regular user for demo
    const userPassword = await bcrypt.hash('user123', 12);
    
    const regularUser = await prisma.user.upsert({
      where: { email: 'user@pinovara.com.br' },
      update: {},
      create: {
        id: 'user-regular',
        email: 'user@pinovara.com.br',
        name: 'Usuário Demo',
        password: userPassword,
        active: true
      }
    });
    
    console.log('✅ Regular user created');

    console.log('\n🎉 Demo data created successfully!');
    console.log('\nDemo credentials:');
    console.log('Admin: admin@pinovara.com.br / admin123');
    console.log('User:  user@pinovara.com.br / user123');
    
  } catch (error) {
    console.error('❌ Error creating demo data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoData();