#!/usr/bin/env node

/**
 * Script para atualizar senhas de todos os usuários técnicos
 *
 * Este script:
 * 1. Identifica todos os usuários com role "tecnico" no módulo "organizacoes"
 * 2. Atualiza suas senhas para "PinovaraUFBA@2025#"
 * 3. Mantém log das alterações
 */

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

async function updateTecnicoPasswords() {
  const prisma = new PrismaClient();
  const novaSenha = 'PinovaraUFBA@2025#';

  try {
    console.log('🔐 Atualizando senhas dos usuários técnicos...\n');

    // 1. Buscar usuários técnicos
    console.log('👥 Buscando usuários com role "tecnico"...');
    const usuariosTecnicos = await prisma.users.findMany({
      where: {
        active: true,
        user_roles: {
          some: {
            roles: {
              name: 'tecnico',
              active: true,
              modules: {
                name: 'organizacoes',
                active: true
              }
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    console.log(`📊 Encontrados ${usuariosTecnicos.length} usuários técnicos:\n`);
    usuariosTecnicos.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
    });

    if (usuariosTecnicos.length === 0) {
      console.log('⚠️  Nenhum usuário técnico encontrado.');
      return;
    }

    // 2. Confirmar execução
    console.log(`\n⚠️  ATENÇÃO: Esta operação irá alterar as senhas de ${usuariosTecnicos.length} usuários.`);
    console.log(`Nova senha será: "${novaSenha}"`);
    console.log('\nPressione Ctrl+C para cancelar ou aguarde 5 segundos para continuar...');

    // Aguardar 5 segundos para confirmação
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 3. Gerar hash da nova senha
    console.log('\n🔒 Gerando hash da nova senha...');
    const hashedPassword = await bcrypt.hash(novaSenha, 10);
    console.log('✅ Hash gerado com sucesso');

    // 4. Atualizar senhas
    console.log('\n💾 Atualizando senhas no banco de dados...');

    const resultado = await prisma.users.updateMany({
      where: {
        id: {
          in: usuariosTecnicos.map(user => user.id)
        }
      },
      data: {
        password: hashedPassword,
        updatedAt: new Date()
      }
    });

    console.log(`✅ ${resultado.count} senhas atualizadas com sucesso!`);

    // 5. Verificação final
    console.log('\n🔍 Verificação final:');
    const verificacao = await prisma.users.findMany({
      where: {
        id: {
          in: usuariosTecnicos.map(user => user.id)
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true
      }
    });

    console.log('Usuários atualizados:');
    verificacao.forEach(user => {
      console.log(`   ✅ ${user.name} (${user.email}) - Atualizado em: ${user.updatedAt}`);
    });

    console.log('\n🎉 Processo concluído com sucesso!');
    console.log(`📝 Nova senha para todos os usuários técnicos: "${novaSenha}"`);

  } catch (error) {
    console.error('❌ Erro durante a atualização:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script se chamado diretamente
if (require.main === module) {
  updateTecnicoPasswords()
    .then(() => {
      console.log('\n✅ Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Falha na execução do script:', error);
      process.exit(1);
    });
}

module.exports = { updateTecnicoPasswords };
