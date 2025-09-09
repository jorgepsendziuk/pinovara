const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAdminAccess() {
  try {
    console.log('🔍 Verificando acesso ao módulo de administração...\n');

    // Verificar roles disponíveis
    const roles = await prisma.role.findMany({
      include: { module: true }
    });

    console.log('🏷️ Roles encontrados:');
    roles.forEach(role => {
      console.log(`   ${role.id}: ${role.name} (${role.module.name})`);
    });

    // Verificar usuários
    const users = await prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true
          }
        }
      }
    });

    console.log('\n👥 Usuários e seus roles:');
    users.forEach(user => {
      console.log(`\n👤 ${user.name} (${user.email})`);
      console.log(`   🏷️ Roles: [${user.userRoles.map(ur => ur.role.name).join(', ')}]`);

      const hasAdminRole = user.userRoles.some(ur => ur.role.name === 'administracao');
      console.log(`   🔐 Acesso admin: ${hasAdminRole ? '✅ SIM' : '❌ NÃO'}`);
    });

    // Verificar se existe o módulo sistema
    const sistemaModule = await prisma.module.findFirst({
      where: { name: 'sistema' }
    });

    if (sistemaModule) {
      console.log(`\n📁 Módulo sistema encontrado: ${sistemaModule.description}`);
    } else {
      console.log('\n❌ Módulo sistema não encontrado!');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdminAccess();
