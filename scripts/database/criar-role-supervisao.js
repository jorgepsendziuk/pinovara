const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function criarRoleSupervisao() {
  try {
    console.log('🔧 Criando role Supervisão...\n');

    // 1. Buscar módulo de organizações
    const moduloOrg = await prisma.modules.findUnique({
      where: { name: 'organizacoes' }
    });

    if (!moduloOrg) {
      console.error('❌ Módulo organizacoes não encontrado!');
      return;
    }

    console.log(`✅ Módulo encontrado: ${moduloOrg.name} (ID: ${moduloOrg.id})`);

    // 2. Verificar se role supervisao já existe
    let roleSupervisao = await prisma.roles.findFirst({
      where: {
        name: 'supervisao',
        moduleId: moduloOrg.id
      }
    });

    if (!roleSupervisao) {
      // Criar role
      roleSupervisao = await prisma.roles.create({
        data: {
          name: 'supervisao',
          description: 'Supervisor - Pode visualizar todas as organizações mas não pode editar nem validar',
          moduleId: moduloOrg.id,
          active: true,
          updatedAt: new Date()
        }
      });
      console.log(`✅ Role criada: supervisao (ID: ${roleSupervisao.id})`);
    } else {
      console.log(`ℹ️  Role supervisao já existe (ID: ${roleSupervisao.id})`);
    }

    // 3. Buscar usuário Sabrina Diniz
    const usuarioSabrina = await prisma.users.findUnique({
      where: { email: 'sabrina.diniz@incra.gov.br' }
    });

    if (!usuarioSabrina) {
      console.error('❌ Usuário sabrina.diniz@incra.gov.br não encontrado!');
      console.log('💡 Crie o usuário primeiro via interface ou script.');
      return;
    }

    console.log(`✅ Usuário encontrado: ${usuarioSabrina.name} (ID: ${usuarioSabrina.id})`);

    // 4. Verificar se já tem a role
    const jaTemRole = await prisma.user_roles.findUnique({
      where: {
        userId_roleId: {
          userId: usuarioSabrina.id,
          roleId: roleSupervisao.id
        }
      }
    });

    if (!jaTemRole) {
      // Associar role ao usuário
      await prisma.user_roles.create({
        data: {
          userId: usuarioSabrina.id,
          roleId: roleSupervisao.id,
          updatedAt: new Date()
        }
      });
      console.log(`✅ Role supervisao associada ao usuário`);
    } else {
      console.log(`ℹ️  Usuário já possui a role supervisao`);
    }

    // 5. Verificar resultado final
    console.log('\n📊 Verificação final:');
    const userComRoles = await prisma.users.findUnique({
      where: { email: 'sabrina.diniz@incra.gov.br' },
      include: {
        user_roles: {
          include: {
            roles: {
              include: {
                modules: true
              }
            }
          }
        }
      }
    });

    console.log(`\nUsuário: ${userComRoles.name}`);
    console.log(`Email: ${userComRoles.email}`);
    console.log('Roles:');
    userComRoles.user_roles.forEach(ur => {
      console.log(`  - ${ur.roles.name} (${ur.roles.modules.name})`);
    });

    console.log('\n✅ Processo concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

criarRoleSupervisao();

