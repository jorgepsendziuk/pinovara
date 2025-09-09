const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAdminAccess() {
  try {
    console.log('🔧 Garantindo acesso ao módulo de administração...\n');

    // Buscar usuários admin e demo
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@pinovara.com.br' }
    });

    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@pinovara.com.br' }
    });

    // Buscar role de administração
    const adminRole = await prisma.role.findFirst({
      where: { name: 'administracao' }
    });

    if (!adminRole) {
      console.log('❌ Role administracao não encontrado!');
      return;
    }

    console.log(`🏷️ Role encontrado: ${adminRole.name} (${adminRole.module.name})`);

    // Garantir que admin tenha o role
    if (adminUser) {
      const existingAdminRole = await prisma.userRole.findFirst({
        where: {
          userId: adminUser.id,
          roleId: adminRole.id
        }
      });

      if (!existingAdminRole) {
        await prisma.userRole.create({
          data: {
            userId: adminUser.id,
            roleId: adminRole.id
          }
        });
        console.log(`✅ Role administracao atribuído ao usuário ${adminUser.name}`);
      } else {
        console.log(`ℹ️ Usuário ${adminUser.name} já tem o role administracao`);
      }
    }

    // Atribuir role de administração ao usuário demo
    if (demoUser) {
      const existingDemoRole = await prisma.userRole.findFirst({
        where: {
          userId: demoUser.id,
          roleId: adminRole.id
        }
      });

      if (!existingDemoRole) {
        await prisma.userRole.create({
          data: {
            userId: demoUser.id,
            roleId: adminRole.id
          }
        });
        console.log(`✅ Role administracao atribuído ao usuário ${demoUser.name}`);
      } else {
        console.log(`ℹ️ Usuário ${demoUser.name} já tem o role administracao`);
      }
    }

    console.log('\n📊 Status final:');
    const allUsers = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    allUsers.forEach(user => {
      const hasAdminAccess = user.userRoles.some(ur => ur.role.name === 'administracao');
      console.log(`👤 ${user.name}: ${hasAdminAccess ? '✅ Tem acesso admin' : '❌ Sem acesso admin'}`);
      console.log(`   🏷️ Roles: [${user.userRoles.map(ur => ur.role.name).join(', ')}]`);
    });

    console.log('\n🎯 Agora ambos os usuários têm acesso ao módulo de administração!');
    console.log('📍 URL do módulo admin: /admin');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminAccess();
