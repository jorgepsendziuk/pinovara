const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function grantAdminAccess() {
  try {
    console.log('🔧 Atribuindo acesso ao módulo admin para usuário demo...\n');

    // Buscar usuário demo
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@pinovara.com.br' }
    });

    if (!demoUser) {
      console.log('❌ Usuário demo não encontrado!');
      return;
    }

    // Buscar role de administração
    const adminRole = await prisma.role.findFirst({
      where: { name: 'administracao' }
    });

    if (!adminRole) {
      console.log('❌ Role administracao não encontrado!');
      return;
    }

    // Verificar se já tem o role
    const existingRole = await prisma.userRole.findFirst({
      where: {
        userId: demoUser.id,
        roleId: adminRole.id
      }
    });

    if (existingRole) {
      console.log(`ℹ️ Usuário ${demoUser.name} já tem acesso ao módulo de administração`);
    } else {
      // Atribuir o role
      await prisma.userRole.create({
        data: {
          userId: demoUser.id,
          roleId: adminRole.id
        }
      });
      console.log(`✅ Acesso ao módulo de administração concedido para ${demoUser.name}`);
    }

    // Verificar resultado final
    const allUsers = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    console.log('\n📊 Status final dos usuários:');
    allUsers.forEach(user => {
      const roles = user.userRoles.map(ur => ur.role.name).join(', ');
      const hasAdminAccess = user.userRoles.some(ur => ur.role.name === 'administracao');
      console.log(`👤 ${user.name}: ${hasAdminAccess ? '✅' : '❌'} Admin | Roles: [${roles}]`);
    });

    console.log('\n🎯 Módulo de administração disponível em: /admin');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

grantAdminAccess();
