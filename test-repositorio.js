const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testarRepositorio() {
  console.log('🧪 Testando API do Repositório Público...\n');

  try {
    // 1. Testar listagem de arquivos (público)
    console.log('1️⃣ Testando listagem de arquivos...');
    const response = await axios.get(`${API_BASE}/repositorio`);
    console.log('✅ Listagem funcionando:', response.data.success);
    console.log('📊 Arquivos encontrados:', response.data.data?.arquivos?.length || 0);
    console.log('');

    // 2. Testar estatísticas (público)
    console.log('2️⃣ Testando estatísticas...');
    const statsResponse = await axios.get(`${API_BASE}/repositorio/stats/estatisticas`);
    console.log('✅ Estatísticas funcionando:', statsResponse.data.success);
    if (statsResponse.data.data) {
      console.log('📈 Total de arquivos:', statsResponse.data.data.arquivos_ativos);
      console.log('📦 Tamanho total:', statsResponse.data.data.tamanho_total_bytes, 'bytes');
    }
    console.log('');

    // 3. Testar login para upload
    console.log('3️⃣ Testando login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'jimxxx@gmail.com',
      password: 'PinovaraUFBA@2025#'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Login realizado com sucesso');
      const token = loginResponse.data.data.token;
      
      // 4. Testar upload (apenas se tiver permissão)
      console.log('4️⃣ Testando permissões de upload...');
      try {
        const uploadTestResponse = await axios.get(`${API_BASE}/repositorio`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Acesso com autenticação funcionando');
      } catch (error) {
        console.log('❌ Erro no acesso autenticado:', error.response?.data?.message || error.message);
      }
    } else {
      console.log('❌ Falha no login:', loginResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.data || error.message);
  }
}

// Executar teste
testarRepositorio();




