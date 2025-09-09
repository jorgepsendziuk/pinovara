const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assignUserRoles() {
  console.log('👤 Atribuindo roles aos usuários...\n');

  try {
    // Buscar usuários existentes
    const users = await prisma.user.findMany();
    console.log(`👥 Usuários encontrados: ${users.length}`);
    users.forEach(user => console.log(`  - ${user.name} (${user.email}) - ID: ${user.id}`));

    // Buscar roles disponíveis
    const roles = await prisma.role.findMany({
      include: { module: true }
    });

    console.log(`\n🏷️ Roles disponíveis: ${roles.length}`);

    // Exemplo de atribuição de roles por tipo de usuário
    const adminUser = users.find(u => u.email === 'admin@pinovara.com.br');
    if (adminUser) {
      console.log(`\n⚙️ Atribuindo roles de ADMINISTRAÇÃO para ${adminUser.name}...`);

      // Atribuir todos os roles de admin ao usuário administrador
      const adminRoles = roles.filter(r => r.name === 'admin');

      for (const role of adminRoles) {
        await prisma.userRole.upsert({
          where: {
            userId_roleId: {
              userId: adminUser.id,
              roleId: role.id,
            },
          },
          update: {},
          create: {
            userId: adminUser.id,
            roleId: role.id,
          },
        });
        console.log(`  ✅ ${role.name} no módulo ${role.module.name}`);
      }
    }

    // Exemplo: se houvesse outros usuários, poderíamos atribuir diferentes roles
    console.log('\n📋 Exemplos de atribuição de roles:');
    console.log('👷 TÉCNICO: atribuir role "tecnico" no módulo "tecnicos"');
    console.log('🔬 PESQUISA: atribuir roles "pesquisa" nos módulos pesquisa, dashboard, diagnóstico, relatórios, mapas');
    console.log('👥 ASSOCIADOS: atribuir role "associados" no módulo "associados"');
    console.log('📊 GESTÃO: atribuir roles "gestao" em todos os módulos');
    console.log('🗺️ GEOPROCESSAMENTO: atribuir role "geoprocessamento" nos módulos mapas, dashboard, diagnóstico, relatórios');

    console.log('\n🎉 Atribuições concluídas!');

  } catch (error) {
    console.error('❌ Erro ao atribuir roles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

assignUserRoles();
