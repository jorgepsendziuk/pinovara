const { Client } = require('pg');
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

async function createOrganization() {
  try {
    console.log('🚀 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado ao banco de dados!');

    console.log('🏢 Iniciando criação de organização...');

    // Dados da organização de exemplo
    const organizationData = {
      nome: 'Cooperativa de Agricultores Familiares do Vale do Jequitinhonha',
      cnpj: '12.345.678/0001-90',
      data_fundacao: '2010-05-15',
      estado: 13, // Minas Gerais
      municipio: 3106200, // Diamantina
      gps_lat: -18.2414,
      gps_lng: -43.6014,
      gps_alt: 1200.0,
      gps_acc: 5.0,
      data_visita: new Date(),
      
      // Características básicas
      caracteristicas_n_total_socios: 45,
      caracteristicas_n_total_socios_caf: 38,
      caracteristicas_n_distintos_caf: 25,
      caracteristicas_n_socios_paa: 20,
      caracteristicas_n_naosocios_paa: 5,
      caracteristicas_n_socios_pnae: 15,
      caracteristicas_n_naosocios_pnae: 3,
      caracteristicas_n_ativos_total: 42,
      caracteristicas_n_ativos_caf: 35,
      caracteristicas_n_naosocio_op_total: 8,
      caracteristicas_n_naosocio_op_caf: 6,
      
      // Distribuição por gênero
      caracteristicas_ta_a_mulher: 20,
      caracteristicas_ta_a_homem: 25,
      caracteristicas_ta_e_mulher: 15,
      caracteristicas_ta_e_homem: 20,
      caracteristicas_ta_o_mulher: 10,
      caracteristicas_ta_o_homem: 12,
      caracteristicas_ta_i_mulher: 8,
      caracteristicas_ta_i_homem: 10,
      caracteristicas_ta_p_mulher: 5,
      caracteristicas_ta_p_homem: 7,
      caracteristicas_ta_af_mulher: 3,
      caracteristicas_ta_af_homem: 4,
      caracteristicas_ta_q_mulher: 2,
      caracteristicas_ta_q_homem: 3,
      
      // Tipos de café
      caracteristicas_ta_caf_convencional: 20,
      caracteristicas_ta_caf_agroecologico: 15,
      caracteristicas_ta_caf_transicao: 8,
      caracteristicas_ta_caf_organico: 12
    };

    // Verificar se já existe uma organização com este CNPJ
    const existingOrg = await client.query(`
      SELECT id FROM pinovara.pinovara WHERE cnpj = $1;
    `, [organizationData.cnpj]);

    if (existingOrg.rows.length > 0) {
      console.log('⚠️  Já existe uma organização com este CNPJ!');
      console.log(`🆔 ID da organização existente: ${existingOrg.rows[0].id}`);
    } else {
      // Criar a organização
      console.log('📝 Criando organização...');
      
      const insertQuery = `
        INSERT INTO pinovara.pinovara (
          nome, cnpj, data_fundacao, estado, municipio,
          gps_lat, gps_lng, gps_alt, gps_acc, data_visita,
          caracteristicas_n_total_socios, caracteristicas_n_total_socios_caf,
          caracteristicas_n_distintos_caf, caracteristicas_n_socios_paa,
          caracteristicas_n_naosocios_paa, caracteristicas_n_socios_pnae,
          caracteristicas_n_naosocios_pnae, caracteristicas_n_ativos_total,
          caracteristicas_n_ativos_caf, caracteristicas_n_naosocio_op_total,
          caracteristicas_n_naosocio_op_caf, caracteristicas_ta_a_mulher,
          caracteristicas_ta_a_homem, caracteristicas_ta_e_mulher,
          caracteristicas_ta_e_homem, caracteristicas_ta_o_mulher,
          caracteristicas_ta_o_homem, caracteristicas_ta_i_mulher,
          caracteristicas_ta_i_homem, caracteristicas_ta_p_mulher,
          caracteristicas_ta_p_homem, caracteristicas_ta_af_mulher,
          caracteristicas_ta_af_homem, caracteristicas_ta_q_mulher,
          caracteristicas_ta_q_homem, caracteristicas_ta_caf_convencional,
          caracteristicas_ta_caf_agroecologico, caracteristicas_ta_caf_transicao,
          caracteristicas_ta_caf_organico
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38, $39
        ) RETURNING id;
      `;

      const values = [
        organizationData.nome,                    // $1
        organizationData.cnpj,                     // $2
        organizationData.data_fundacao,             // $3
        organizationData.estado,                   // $4
        organizationData.municipio,                 // $5
        organizationData.gps_lat,                  // $6
        organizationData.gps_lng,                 // $7
        organizationData.gps_alt,                 // $8
        organizationData.gps_acc,                 // $9
        organizationData.data_visita,              // $10
        organizationData.caracteristicas_n_total_socios,        // $11
        organizationData.caracteristicas_n_total_socios_caf,   // $12
        organizationData.caracteristicas_n_distintos_caf,      // $13
        organizationData.caracteristicas_n_socios_paa,         // $14
        organizationData.caracteristicas_n_naosocios_paa,      // $15
        organizationData.caracteristicas_n_socios_pnae,         // $16
        organizationData.caracteristicas_n_naosocios_pnae,     // $17
        organizationData.caracteristicas_n_ativos_total,        // $18
        organizationData.caracteristicas_n_ativos_caf,          // $19
        organizationData.caracteristicas_n_naosocio_op_total,  // $20
        organizationData.caracteristicas_n_naosocio_op_caf,    // $21
        organizationData.caracteristicas_ta_a_mulher,          // $22
        organizationData.caracteristicas_ta_a_homem,           // $23
        organizationData.caracteristicas_ta_e_mulher,          // $24
        organizationData.caracteristicas_ta_e_homem,            // $25
        organizationData.caracteristicas_ta_o_mulher,          // $26
        organizationData.caracteristicas_ta_o_homem,            // $27
        organizationData.caracteristicas_ta_i_mulher,          // $28
        organizationData.caracteristicas_ta_i_homem,            // $29
        organizationData.caracteristicas_ta_p_mulher,           // $30
        organizationData.caracteristicas_ta_p_homem,           // $31
        organizationData.caracteristicas_ta_af_mulher,          // $32
        organizationData.caracteristicas_ta_af_homem,           // $33
        organizationData.caracteristicas_ta_q_mulher,           // $34
        organizationData.caracteristicas_ta_q_homem,            // $35
        organizationData.caracteristicas_ta_caf_convencional,   // $36
        organizationData.caracteristicas_ta_caf_agroecologico, // $37
        organizationData.caracteristicas_ta_caf_transicao,     // $38
        organizationData.caracteristicas_ta_caf_organico        // $39
      ];

      const result = await client.query(insertQuery, values);
      const organizationId = result.rows[0].id;

      console.log('✅ Organização criada com sucesso!');
      console.log(`🆔 ID da organização: ${organizationId}`);
      console.log(`🏢 Nome: ${organizationData.nome}`);
      console.log(`📄 CNPJ: ${organizationData.cnpj}`);
      console.log(`📍 Localização: Diamantina/MG`);
      console.log(`👥 Total de sócios: ${organizationData.caracteristicas_n_total_socios}`);
      console.log(`☕ Sócios produtores de café: ${organizationData.caracteristicas_n_total_socios_caf}`);
    }

    console.log('🎉 Processo concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar organização:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Executar o script
if (require.main === module) {
  createOrganization()
    .then(() => {
      console.log('✅ Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro na execução do script:', error);
      process.exit(1);
    });
}

module.exports = { createOrganization };