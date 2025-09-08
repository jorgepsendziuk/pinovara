const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsersAndAssignAdmin() {
  try {
    console.log('🔍 Verificando usuários existentes e estrutura de permissões...\n');

    // Verificar usuários existentes
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        active: true,
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

    console.log('=== USUÁRIOS EXISTENTES ===');
    users.forEach(user => {
      console.log(`👤 ${user.name} (${user.email}) - Status: ${user.active ? 'Ativo' : 'Inativo'}`);
      console.log(`   Papéis: ${user.userRoles.length > 0 ? user.userRoles.map(ur => `${ur.role.name} (${ur.role.module.name})`).join(', ') : 'Nenhum'}`);
      console.log('');
    });

    // Verificar módulos e papéis
    const modules = await prisma.module.findMany({
      include: {
        roles: true
      }
    });

    console.log('=== MÓDULOS E PAPÉIS ===');
    modules.forEach(module => {
      console.log(`📦 ${module.name}: ${module.roles.map(r => r.name).join(', ')}`);
    });
    console.log('');

    // Verificar se existe o módulo 'sistema' e papel 'admin'
    const sistemaModule = await prisma.module.findFirst({
      where: { name: 'sistema' },
      include: { roles: true }
    });

    if (!sistemaModule) {
      console.log('❌ ERRO: Módulo "sistema" não encontrado!');
      console.log('📝 Criando módulo sistema...\n');

      // Criar módulo sistema se não existir
      const newSistemaModule = await prisma.module.create({
        data: {
          name: 'sistema',
          description: 'Módulo principal do sistema PINOVARA'
        }
      });

      console.log('✅ Módulo sistema criado!');
      console.log('📝 Criando papel admin...\n');

      // Criar papel admin
      const adminRole = await prisma.role.create({
        data: {
          name: 'admin',
          description: 'Administrador completo do sistema',
          moduleId: newSistemaModule.id
        }
      });

      console.log(`✅ Papel admin criado (ID: ${adminRole.id})`);
      return await assignAdminToUsers(users, adminRole);
    }

    const adminRole = sistemaModule.roles.find(r => r.name === 'admin');

    if (!adminRole) {
      console.log('❌ ERRO: Papel "admin" não encontrado no módulo sistema!');
      console.log('📝 Criando papel admin...\n');

      // Criar papel admin se não existir
      const newAdminRole = await prisma.role.create({
        data: {
          name: 'admin',
          description: 'Administrador completo do sistema',
          moduleId: sistemaModule.id
        }
      });

      console.log(`✅ Papel admin criado (ID: ${newAdminRole.id})`);
      return await assignAdminToUsers(users, newAdminRole);
    }

    console.log(`✅ Módulo sistema encontrado com papel admin (ID: ${adminRole.id})`);
    return await assignAdminToUsers(users, adminRole);

  } catch (error) {
    console.error('❌ Erro durante o processo:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function assignAdminToUsers(users, adminRole) {
  try {
    console.log('\n=== ATRIBUINDO PAPEL ADMIN AOS USUÁRIOS ===');

    // Filtrar apenas usuários ativos
    const activeUsers = users.filter(u => u.active);

    if (activeUsers.length === 0) {
      console.log('⚠️  Nenhum usuário ativo encontrado!');
      return;
    }

    console.log(`📊 Processando ${activeUsers.length} usuários ativos...\n`);

    let assigned = 0;
    let skipped = 0;

    for (const user of activeUsers) {
      // Verificar se já tem o papel admin
      const hasAdminRole = user.userRoles.some(ur => ur.role.id === adminRole.id);

      if (hasAdminRole) {
        console.log(`⏭️  ${user.name} já possui papel admin`);
        skipped++;
        continue;
      }

      // Verificar se já existe uma associação (por segurança)
      const existingAssociation = await prisma.userRole.findUnique({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId: adminRole.id
          }
        }
      });

      if (existingAssociation) {
        console.log(`⏭️  ${user.name} já tem associação com papel admin`);
        skipped++;
        continue;
      }

      // Criar a associação
      await prisma.userRole.create({
        data: {
          userId: user.id,
          roleId: adminRole.id
        }
      });

      console.log(`✅ Papel admin atribuído a ${user.name}`);
      assigned++;
    }

    console.log('\n🎉 Processo concluído!');
    console.log(`📈 Estatísticas:`);
    console.log(`   • Papéis atribuídos: ${assigned}`);
    console.log(`   • Usuários pulados: ${skipped}`);
    console.log(`   • Total processado: ${activeUsers.length}`);

    // Verificar resultado final
    console.log('\n🔍 Verificação final:');
    const finalUsers = await prisma.user.findMany({
      where: { active: true },
      select: {
        id: true,
        name: true,
        email: true,
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

    finalUsers.forEach(user => {
      const hasAdmin = user.userRoles.some(ur => ur.role.name === 'admin' && ur.role.module.name === 'sistema');
      console.log(`${hasAdmin ? '✅' : '❌'} ${user.name} - ${hasAdmin ? 'Admin' : 'Sem admin'}`);
    });

  } catch (error) {
    console.error('❌ Erro ao atribuir papéis:', error);
    throw error;
  }
}

// Executar a função
checkUsersAndAssignAdmin().catch(console.error);
