const { Client } = require('pg');
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

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function createAdminUser() {
  try {
    console.log('🚀 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados!');

    console.log('🚀 Iniciando criação do usuário administrador...');

    // 1. Criar ou encontrar o módulo "Sistema"
    console.log('📦 Verificando/criando módulo "Sistema"...');
    const moduleResult = await client.query(`
      INSERT INTO pinovara.modules (name, description, active, "createdAt", "updatedAt")
      VALUES ('Sistema', 'Módulo principal do sistema com funcionalidades administrativas', true, NOW(), NOW())
      ON CONFLICT (name) DO NOTHING
      RETURNING id;
    `);

    const moduleIdResult = await client.query(`
      SELECT id FROM pinovara.modules WHERE name = 'Sistema';
    `);
    
    const systemModuleId = moduleIdResult.rows[0].id;
    console.log(`✅ Módulo "Sistema" encontrado/criado com ID: ${systemModuleId}`);

    // 2. Criar ou encontrar a role "Administrador"
    console.log('👑 Verificando/criando role "Administrador"...');
    await client.query(`
      INSERT INTO pinovara.roles (name, description, "moduleId", active, "createdAt", "updatedAt")
      VALUES ('Administrador', 'Role com acesso total ao sistema', $1, true, NOW(), NOW())
      ON CONFLICT (name, "moduleId") DO NOTHING;
    `, [systemModuleId]);

    const roleIdResult = await client.query(`
      SELECT id FROM pinovara.roles WHERE name = 'Administrador' AND "moduleId" = $1;
    `, [systemModuleId]);
    
    const adminRoleId = roleIdResult.rows[0].id;
    console.log(`✅ Role "Administrador" encontrada/criada com ID: ${adminRoleId}`);

    // 3. Verificar se o usuário já existe
    const userResult = await client.query(`
      SELECT id FROM pinovara.users WHERE email = 'olivanrabelo@gmail.com';
    `);

    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;
      console.log('⚠️  Usuário olivanrabelo@gmail.com já existe!');
      
      // Verificar se já tem a role de administrador
      const userRoleResult = await client.query(`
        SELECT id FROM pinovara.user_roles WHERE "userId" = $1 AND "roleId" = $2;
      `, [userId, adminRoleId]);

      if (userRoleResult.rows.length > 0) {
        console.log('✅ Usuário já possui role de Administrador!');
      } else {
        console.log('🔗 Atribuindo role de Administrador ao usuário existente...');
        await client.query(`
          INSERT INTO pinovara.user_roles ("userId", "roleId", "createdAt", "updatedAt")
          VALUES ($1, $2, NOW(), NOW());
        `, [userId, adminRoleId]);
        console.log('✅ Role de Administrador atribuída com sucesso!');
      }
    } else {
      // 4. Hash da senha
      console.log('🔐 Criptografando senha...');
      const hashedPassword = await bcrypt.hash('olivanrabelo@gmail.com', 10);

      // 5. Criar o usuário
      console.log('👤 Criando usuário olivanrabelo@gmail.com...');
      const newUserResult = await client.query(`
        INSERT INTO pinovara.users (email, password, name, active, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, true, NOW(), NOW())
        RETURNING id;
      `, ['olivanrabelo@gmail.com', hashedPassword, 'Olivan Rabelo']);

      const userId = newUserResult.rows[0].id;

      // 6. Atribuir role de administrador
      console.log('🔗 Atribuindo role de Administrador...');
      await client.query(`
        INSERT INTO pinovara.user_roles ("userId", "roleId", "createdAt", "updatedAt")
        VALUES ($1, $2, NOW(), NOW());
      `, [userId, adminRoleId]);

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
    await client.end();
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