const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

// Load environment variables from config.env
const envPath = path.join(__dirname, '..', 'config.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🚀 Iniciando criação do usuário administrador...');

    // 1. Criar ou encontrar o módulo "Sistema"
    let systemModule = await prisma.module.findFirst({
      where: { name: 'Sistema' }
    });

    if (!systemModule) {
      console.log('📦 Criando módulo "Sistema"...');
      systemModule = await prisma.module.create({
        data: {
          name: 'Sistema',
          description: 'Módulo principal do sistema com funcionalidades administrativas',
          active: true
        }
      });
      console.log('✅ Módulo "Sistema" criado com sucesso!');
    } else {
      console.log('✅ Módulo "Sistema" já existe.');
    }

    // 2. Criar ou encontrar a role "Administrador"
    let adminRole = await prisma.role.findFirst({
      where: { 
        name: 'Administrador',
        moduleId: systemModule.id
      }
    });

    if (!adminRole) {
      console.log('👑 Criando role "Administrador"...');
      adminRole = await prisma.role.create({
        data: {
          name: 'Administrador',
          description: 'Role com acesso total ao sistema',
          moduleId: systemModule.id,
          active: true
        }
      });
      console.log('✅ Role "Administrador" criada com sucesso!');
    } else {
      console.log('✅ Role "Administrador" já existe.');
    }

    // 3. Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'olivanrabelo@gmail.com' }
    });

    if (existingUser) {
      console.log('⚠️  Usuário olivanrabelo@gmail.com já existe!');
      
      // Verificar se já tem a role de administrador
      const existingUserRole = await prisma.userRole.findFirst({
        where: {
          userId: existingUser.id,
          roleId: adminRole.id
        }
      });

      if (existingUserRole) {
        console.log('✅ Usuário já possui role de Administrador!');
      } else {
        console.log('🔗 Atribuindo role de Administrador ao usuário existente...');
        await prisma.userRole.create({
          data: {
            userId: existingUser.id,
            roleId: adminRole.id
          }
        });
        console.log('✅ Role de Administrador atribuída com sucesso!');
      }
    } else {
      // 4. Hash da senha
      console.log('🔐 Criptografando senha...');
      const hashedPassword = await bcrypt.hash('olivanrabelo@gmail.com', 10);

      // 5. Criar o usuário
      console.log('👤 Criando usuário olivanrabelo@gmail.com...');
      const newUser = await prisma.user.create({
        data: {
          email: 'olivanrabelo@gmail.com',
          password: hashedPassword,
          name: 'Olivan Rabelo',
          active: true
        }
      });

      // 6. Atribuir role de administrador
      console.log('🔗 Atribuindo role de Administrador...');
      await prisma.userRole.create({
        data: {
          userId: newUser.id,
          roleId: adminRole.id
        }
      });

      console.log('✅ Usuário administrador criado com sucesso!');
      console.log(`📧 Email: olivanrabelo@gmail.com`);
      console.log(`🔑 Senha: olivanrabelo@gmail.com`);
      console.log(`👑 Role: Administrador`);
    }

    console.log('🎉 Processo concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('✅ Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro na execução do script:', error);
      process.exit(1);
    });
}

module.exports = { createAdminUser };