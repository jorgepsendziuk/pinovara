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
        name: 'admin',
        description: 'Administrador do sistema com acesso completo',
        moduleId: sistemaModule.id,
        active: true
      }
    });
    
    console.log('✅ Admin role created');

    // Create regular role
    const regularRole = await prisma.role.upsert({
      where: { 
        name_moduleId: {
          name: 'user',
          moduleId: sistemaModule.id
        }
      },
      update: {},
      create: {
        name: 'user',
        description: 'Usuário regular',
        moduleId: sistemaModule.id,
        active: true
      }
    });
    
    console.log('✅ Regular role created');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@pinovara.com.br' },
      update: {},
      create: {
        email: 'admin@pinovara.com.br',
        name: 'Administrador PINOVARA',
        password: hashedPassword,
        active: true
      }
    });
    
    console.log('✅ Admin user created');

    // Create regular user
    const userPassword = await bcrypt.hash('user123', 12);
    
    const regularUser = await prisma.user.upsert({
      where: { email: 'user@pinovara.com.br' },
      update: {},
      create: {
        email: 'user@pinovara.com.br',
        name: 'Usuário Demo',
        password: userPassword,
        active: true
      }
    });
    
    console.log('✅ Regular user created');

    // Assign roles to users
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

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: regularUser.id,
          roleId: regularRole.id
        }
      },
      update: {},
      create: {
        userId: regularUser.id,
        roleId: regularRole.id
      }
    });
    
    console.log('✅ User roles assigned');

    // Insert system settings
    await prisma.systemSetting.upsert({
      where: { key: 'app_name' },
      update: {},
      create: {
        key: 'app_name',
        value: 'PINOVARA',
        type: 'string',
        description: 'Nome da aplicação',
        category: 'general',
        active: true
      }
    });

    await prisma.systemSetting.upsert({
      where: { key: 'app_version' },
      update: {},
      create: {
        key: 'app_version',
        value: '1.0.0',
        type: 'string',
        description: 'Versão da aplicação',
        category: 'general',
        active: true
      }
    });
    
    console.log('✅ System settings created');
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

createDemoData();
