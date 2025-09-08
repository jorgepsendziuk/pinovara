const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function demoUserAssignments() {
  console.log('🎭 Demonstrando atribuição de tipos de usuário...\n');

  try {
    // Buscar usuários existentes
    const users = await prisma.user.findMany();
    console.log('👥 Usuários existentes:');
    users.forEach(user => console.log(`  - ${user.name} (${user.email}) - ID: ${user.id}`));

    // Buscar os tipos de usuário disponíveis
    const userTypes = await prisma.role.findMany({
      where: {
        module: {
          name: 'user_types'
        }
      }
    });

    console.log('\n🏷️ Tipos de usuário disponíveis:');
    userTypes.forEach(type => console.log(`  - ${type.name}: ${type.description}`));

    // Exemplo de atribuições
    console.log('\n📋 Exemplos de atribuição de tipos de usuário:');

    const assignments = [
      { userEmail: 'demo@pinovara.com', userType: 'tecnico', description: 'Técnico de campo' },
      { userEmail: 'test@example.com', userType: 'pesquisa', description: 'Pesquisador' }
    ];

    for (const assignment of assignments) {
      const user = users.find(u => u.email === assignment.userEmail);
      const userType = userTypes.find(t => t.name === assignment.userType);

      if (user && userType) {
        // Verificar se já tem o tipo atribuído
        const existing = await prisma.userRole.findFirst({
          where: {
            userId: user.id,
            roleId: userType.id
          }
        });

        if (!existing) {
          await prisma.userRole.create({
            data: {
              userId: user.id,
              roleId: userType.id
            }
          });
          console.log(`✅ ${assignment.description} atribuído a ${user.name}`);
        } else {
          console.log(`ℹ️ ${assignment.description} já atribuído a ${user.name}`);
        }

        // Testar permissões do usuário
        await testUserPermissions(user.id, assignment.userType, assignment.description);
      }
    }

    console.log('\n📊 Resumo final:');
    const totalUsers = await prisma.user.count();
    const totalUserRoles = await prisma.userRole.count();

    console.log(`👥 Total de usuários: ${totalUsers}`);
    console.log(`🔗 Total de atribuições user-role: ${totalUserRoles}`);
    console.log(`🏷️ Tipos de usuário disponíveis: ${userTypes.length}`);

  } catch (error) {
    console.error('❌ Erro na demonstração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function testUserPermissions(userId, userType, description) {
  const modules = ['dashboard', 'tecnicos', 'pesquisa', 'associados', 'mapas', 'sistema'];

  console.log(`\n🔍 Testando permissões de ${description.toUpperCase()}:`);

  const permissions = [];
  for (const moduleName of modules) {
    const hasAccess = await checkUserModuleAccess(userId, moduleName, userType);
    permissions.push(`${hasAccess ? '✅' : '❌'} ${moduleName}`);
  }

  console.log(`   ${permissions.join(' | ')}`);
}

async function checkUserModuleAccess(userId, moduleName, userType) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    }
  });

  if (!user || !user.userRoles.length) {
    return false;
  }

  return user.userRoles.some(userRole => {
    const currentUserType = userRole.role.name;

    switch (currentUserType) {
      case 'administracao':
        return true;
      case 'gestao':
        return true;
      case 'tecnico':
        return moduleName === 'tecnicos';
      case 'pesquisa':
        return ['pesquisa', 'dashboard', 'diagnostico', 'relatorios', 'mapas'].includes(moduleName);
      case 'associados':
        return moduleName === 'associados';
      case 'geoprocessamento':
        return ['mapas', 'dashboard', 'diagnostico', 'relatorios'].includes(moduleName);
      default:
        return false;
    }
  });
}

demoUserAssignments();
