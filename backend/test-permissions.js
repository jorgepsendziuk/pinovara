const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPermissions() {
  console.log('🧪 Testando sistema de permissões...\n');

  try {
    // Buscar usuário admin
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@pinovara.com' },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                module: true
              }
            }
          }
        }
      }
    });

    if (!adminUser) {
      console.log('❌ Usuário admin não encontrado');
      return;
    }

    console.log(`👤 Usuário: ${adminUser.name} (${adminUser.email})`);

    // Atribuir role de administração ao usuário
    const adminRole = await prisma.role.findFirst({
      where: { name: 'administracao' }
    });

    if (adminRole) {
      // Verificar se já tem o role
      const existingUserRole = await prisma.userRole.findFirst({
        where: {
          userId: adminUser.id,
          roleId: adminRole.id
        }
      });

      if (!existingUserRole) {
        await prisma.userRole.create({
          data: {
            userId: adminUser.id,
            roleId: adminRole.id
          }
        });
        console.log('✅ Role "administracao" atribuído ao usuário');
      } else {
        console.log('ℹ️ Role "administracao" já atribuído ao usuário');
      }
    }

    // Testar permissões para diferentes módulos
    const modules = ['dashboard', 'tecnicos', 'pesquisa', 'associados', 'mapas', 'sistema'];

    console.log('\n🔐 Testando permissões de ADMINISTRAÇÃO:');
    console.log('Como admin, deve ter acesso a TODOS os módulos:');

    for (const moduleName of modules) {
      const hasAccess = await testUserPermission(adminUser.id, moduleName);
      console.log(`  ${hasAccess ? '✅' : '❌'} ${moduleName}: ${hasAccess ? 'ACESSO PERMITIDO' : 'ACESSO NEGADO'}`);
    }

    console.log('\n📊 Estatísticas:');
    const totalUsers = await prisma.user.count();
    const totalRoles = await prisma.role.count();
    const totalUserRoles = await prisma.userRole.count();

    console.log(`👥 Total de usuários: ${totalUsers}`);
    console.log(`🏷️ Total de tipos de usuário (roles): ${totalRoles}`);
    console.log(`🔗 Total de atribuições user-role: ${totalUserRoles}`);

  } catch (error) {
    console.error('❌ Erro ao testar permissões:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Função auxiliar para testar permissões (simulando a lógica do authService)
async function testUserPermission(userId, moduleName) {
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
    const userType = userRole.role.name;

    switch (userType) {
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

testPermissions();
