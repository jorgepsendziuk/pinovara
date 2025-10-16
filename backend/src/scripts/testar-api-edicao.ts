/**
 * Script para testar a API de atualização de organização
 * Simula exatamente o que o frontend faz ao salvar
 */

import axios from 'axios';

const API_URL = 'http://localhost:3001';
const ORG_ID = 14;

async function testarAPIEdicao() {
  console.log('🧪 TESTANDO API DE EDIÇÃO - Organização ID', ORG_ID);
  console.log('');

  try {
    // 1. Fazer login para obter token
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'jimxxx@gmail.com',
      password: 'PinovaraUFBA@2025#'
    });

    const token = loginResponse.data.data.token;
    console.log('✅ Login realizado com sucesso');
    console.log('👤 Usuário:', loginResponse.data.data.user.name);
    console.log('');

    // 2. Buscar organização atual
    console.log('2️⃣ Buscando organização atual...');
    const getResponse = await axios.get(`${API_URL}/organizacoes/${ORG_ID}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const orgAtual = getResponse.data.data;
    console.log('✅ Organização encontrada:', orgAtual.nome);
    console.log('📊 Campos atuais:');
    console.log('   - CNPJ:', orgAtual.cnpj);
    console.log('   - Telefone:', orgAtual.telefone);
    console.log('   - Email:', orgAtual.email);
    console.log('   - Total Sócios:', orgAtual.caracteristicas_n_total_socios);
    console.log('   - Descrição:', orgAtual.descricao ? orgAtual.descricao.substring(0, 50) + '...' : 'null');
    console.log('   - Validação Status:', orgAtual.validacao_status);
    console.log('');

    // 3. Preparar dados para atualização (como o frontend faz)
    console.log('3️⃣ Preparando dados de atualização...');
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    
    const dadosAtualizacao = {
      ...orgAtual, // Manter todos os campos atuais
      // Modificar apenas alguns campos para teste
      nome: `TESTE API ${timestamp}`,
      telefone: '21987654321',
      email: 'api.teste@pinovara.org',
      organizacao_end_logradouro: 'Rua API Teste',
      representante_nome: 'Maria API Teste',
      caracteristicas_n_total_socios: 200,
      descricao: `Teste de API em ${timestamp}`,
      obs: `Observacoes API ${timestamp}`,
      metodologia: 'Metodologia via API',
      go_organizacao_7_resposta: 3,
      go_organizacao_7_comentario: 'Comentario via API',
      gf_contas_5_resposta: 4,
      last_update_date: new Date()
    };

    console.log('✅ Dados preparados (modificando 10+ campos)');
    console.log('');

    // 4. Enviar atualização via API (PUT)
    console.log('4️⃣ Enviando atualização via API...');
    const updateResponse = await axios.put(
      `${API_URL}/organizacoes/${ORG_ID}`, 
      dadosAtualizacao,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (updateResponse.data.success) {
      console.log('✅ API retornou sucesso!');
      console.log('📨 Mensagem:', updateResponse.data.message);
    } else {
      console.log('❌ API retornou erro:', updateResponse.data.error);
      return;
    }
    console.log('');

    // 5. Buscar novamente para verificar
    console.log('5️⃣ Verificando se salvou no banco...');
    const verificacaoResponse = await axios.get(`${API_URL}/organizacoes/${ORG_ID}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const orgDepois = verificacaoResponse.data.data;
    
    // Verificar campos específicos
    const camposVerificar = [
      { nome: 'Nome', esperado: dadosAtualizacao.nome, atual: orgDepois.nome },
      { nome: 'Telefone', esperado: dadosAtualizacao.telefone, atual: orgDepois.telefone },
      { nome: 'Email', esperado: dadosAtualizacao.email, atual: orgDepois.email },
      { nome: 'Endereço', esperado: dadosAtualizacao.organizacao_end_logradouro, atual: orgDepois.organizacao_end_logradouro },
      { nome: 'Representante', esperado: dadosAtualizacao.representante_nome, atual: orgDepois.representante_nome },
      { nome: 'Total Sócios', esperado: dadosAtualizacao.caracteristicas_n_total_socios, atual: orgDepois.caracteristicas_n_total_socios },
      { nome: 'Descrição', esperado: dadosAtualizacao.descricao, atual: orgDepois.descricao },
      { nome: 'Observações', esperado: dadosAtualizacao.obs, atual: orgDepois.obs },
      { nome: 'Metodologia', esperado: dadosAtualizacao.metodologia, atual: orgDepois.metodologia },
      { nome: 'GO 7 Resposta', esperado: dadosAtualizacao.go_organizacao_7_resposta, atual: orgDepois.go_organizacao_7_resposta },
      { nome: 'GO 7 Comentário', esperado: dadosAtualizacao.go_organizacao_7_comentario, atual: orgDepois.go_organizacao_7_comentario },
      { nome: 'GF 5 Resposta', esperado: dadosAtualizacao.gf_contas_5_resposta, atual: orgDepois.gf_contas_5_resposta },
    ];

    let sucessos = 0;
    let erros = 0;

    console.log('\n📋 Verificação campo a campo:');
    for (const campo of camposVerificar) {
      if (campo.esperado === campo.atual) {
        console.log(`   ✅ ${campo.nome}: OK`);
        sucessos++;
      } else {
        console.log(`   ❌ ${campo.nome}: ERRO`);
        console.log(`      Esperado: ${campo.esperado}`);
        console.log(`      Salvo: ${campo.atual}`);
        erros++;
      }
    }

    console.log('');
    console.log('📊 RESUMO DO TESTE VIA API:');
    console.log(`   ✅ Campos corretos: ${sucessos}`);
    console.log(`   ❌ Campos com erro: ${erros}`);
    console.log(`   📈 Taxa de sucesso: ${((sucessos / (sucessos + erros)) * 100).toFixed(1)}%`);
    console.log('');

    if (erros === 0) {
      console.log('🎉 TESTE VIA API CONCLUÍDO COM SUCESSO!');
      console.log('   Todos os campos foram salvos corretamente via PUT /organizacoes/14');
    } else {
      console.log('⚠️  ATENÇÃO: Alguns campos não foram salvos via API.');
    }

  } catch (error: any) {
    console.error('');
    console.error('💥 ERRO NO TESTE:', error.response?.data || error.message);
    console.error('');
    if (error.response) {
      console.error('📝 Detalhes da resposta:');
      console.error('   Status:', error.response.status);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Executar teste
testarAPIEdicao()
  .then(() => {
    console.log('\n✅ Script de teste API finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });

