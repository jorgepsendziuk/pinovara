/**
 * Script para testar salvamento completo de todos os campos de uma organização
 * Testa a organização ID 14 (cadastro de teste)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testarEdicaoCompleta() {
  console.log('🧪 INICIANDO TESTE DE EDIÇÃO COMPLETA - Organização ID 14\n');

  try {
    // 1. Buscar organização atual
    console.log('1️⃣ Buscando organização atual...');
    const orgAntes = await prisma.organizacao.findUnique({
      where: { id: 14 }
    });

    if (!orgAntes) {
      console.error('❌ Organização 14 não encontrada!');
      return;
    }

    console.log('✅ Organização encontrada:', orgAntes.nome);
    console.log('📊 Campos atuais (amostra):');
    console.log('   - Nome:', orgAntes.nome);
    console.log('   - CNPJ:', orgAntes.cnpj);
    console.log('   - Telefone:', orgAntes.telefone);
    console.log('   - Email:', orgAntes.email);
    console.log('   - Descrição:', orgAntes.descricao ? `${orgAntes.descricao.substring(0, 50)}...` : 'null');
    console.log('   - Validação Status:', orgAntes.validacao_status);
    console.log('');

    // 2. Preparar dados de teste (modificar TODOS os campos editáveis)
    console.log('2️⃣ Preparando dados de teste...');
    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_');
    
    const dadosTeste = {
      // Dados básicos - SEM FORMATAÇÃO (somente números/letras)
      nome: `TESTE Org Atualizada`,
      cnpj: '12345678000199',
      telefone: '11987654321',
      email: 'teste@pinovara.org',
      data_fundacao: new Date('2020-01-15'),
      
      // Endereço da organização - SEM FORMATAÇÃO
      organizacao_end_logradouro: 'Rua Teste',
      organizacao_end_bairro: 'Centro',
      organizacao_end_complemento: 'Sala 101',
      organizacao_end_numero: '999',
      organizacao_end_cep: '12345678',
      
      // Representante - SEM FORMATAÇÃO
      representante_nome: 'Joao Silva',
      representante_cpf: '12345678900',
      representante_rg: 'MG12345678',
      representante_telefone: '31999998888',
      representante_email: 'joao@email.com',
      representante_end_logradouro: 'Av Representante',
      representante_end_bairro: 'Centro',
      representante_end_complemento: 'Apto 201',
      representante_end_numero: '777',
      representante_end_cep: '87654321',
      representante_funcao: 2,
      
      // Características dos associados
      caracteristicas_n_total_socios: 150,
      caracteristicas_n_total_socios_caf: 100,
      caracteristicas_n_distintos_caf: 95,
      caracteristicas_n_socios_paa: 50,
      caracteristicas_n_naosocios_paa: 10,
      caracteristicas_n_socios_pnae: 60,
      caracteristicas_n_naosocios_pnae: 15,
      caracteristicas_n_ativos_total: 140,
      caracteristicas_n_ativos_caf: 90,
      caracteristicas_n_naosocio_op_total: 25,
      caracteristicas_n_naosocio_op_caf: 20,
      caracteristicas_n_ingressaram_total_12_meses: 15,
      caracteristicas_n_ingressaram_caf_12_meses: 10,
      
      // Características por tipo de agricultor
      caracteristicas_ta_a_mulher: 30,
      caracteristicas_ta_a_homem: 40,
      caracteristicas_ta_e_mulher: 10,
      caracteristicas_ta_e_homem: 15,
      caracteristicas_ta_o_mulher: 5,
      caracteristicas_ta_o_homem: 8,
      caracteristicas_ta_i_mulher: 12,
      caracteristicas_ta_i_homem: 18,
      caracteristicas_ta_p_mulher: 8,
      caracteristicas_ta_p_homem: 12,
      caracteristicas_ta_af_mulher: 6,
      caracteristicas_ta_af_homem: 10,
      caracteristicas_ta_q_mulher: 4,
      caracteristicas_ta_q_homem: 7,
      caracteristicas_ta_caf_convencional: 60,
      caracteristicas_ta_caf_agroecologico: 25,
      caracteristicas_ta_caf_transicao: 10,
      caracteristicas_ta_caf_organico: 5,
      
      // Campos de complementos
      descricao: `Descricao atualizada em ${timestamp}. Teste de salvamento completo.`,
      obs: `Obs atualizadas ${timestamp}`,
      eixos_trabalhados: 'Gestao Comercializacao Sustentabilidade',
      enfase: 1,
      enfase_outros: null,
      metodologia: 'Metodologia participativa',
      orientacoes: 'Orientacoes tecnicas',
      participantes_menos_10: 2,
      
      // Campos de controle
      sim_nao_producao: 1, // Sim
      sim_nao_file: 1,
      sim_nao_pj: 1,
      sim_nao_socio: 1,
      
      // Validação (apenas para teste - normalmente feito por coordenador)
      // validacao_status: 1, // Não vamos modificar - controlado por coordenador
      // validacao_obs: 'Teste de validação'
      
      // Alguns campos de diagnóstico (amostra)
      go_organizacao_7_resposta: 4,
      go_organizacao_7_comentario: 'Comentário de teste',
      go_organizacao_7_proposta: 'Proposta de melhoria',
      
      gf_contas_5_resposta: 3,
      gf_contas_5_comentario: 'Sistema de contas funcional',
      
      last_update_date: new Date()
    };

    console.log('✅ Dados de teste preparados');
    console.log('');

    // 3. Atualizar organização
    console.log('3️⃣ Atualizando organização no banco...');
    const orgDepois = await prisma.organizacao.update({
      where: { id: 14 },
      data: dadosTeste
    });

    console.log('✅ Organização atualizada com sucesso!');
    console.log('');

    // 4. Verificar se salvou corretamente
    console.log('4️⃣ Verificando campos salvos...');
    const orgVerificacao = await prisma.organizacao.findUnique({
      where: { id: 14 }
    });

    let erros = 0;
    let sucessos = 0;

    // Verificar cada campo
    const camposParaVerificar: [keyof typeof dadosTeste, any][] = [
      ['nome', dadosTeste.nome],
      ['cnpj', dadosTeste.cnpj],
      ['telefone', dadosTeste.telefone],
      ['email', dadosTeste.email],
      ['organizacao_end_logradouro', dadosTeste.organizacao_end_logradouro],
      ['representante_nome', dadosTeste.representante_nome],
      ['caracteristicas_n_total_socios', dadosTeste.caracteristicas_n_total_socios],
      ['descricao', dadosTeste.descricao],
      ['obs', dadosTeste.obs],
      ['eixos_trabalhados', dadosTeste.eixos_trabalhados],
      ['metodologia', dadosTeste.metodologia],
      ['orientacoes', dadosTeste.orientacoes],
      ['go_organizacao_7_resposta', dadosTeste.go_organizacao_7_resposta],
      ['gf_contas_5_resposta', dadosTeste.gf_contas_5_resposta],
    ];

    console.log('\n📋 Verificação campo a campo:');
    for (const [campo, valorEsperado] of camposParaVerificar) {
      const valorSalvo = (orgVerificacao as any)[campo];
      const match = valorSalvo === valorEsperado || 
                    (valorEsperado instanceof Date && valorSalvo && 
                     new Date(valorSalvo).getTime() === valorEsperado.getTime());
      
      if (match) {
        console.log(`   ✅ ${campo}: OK`);
        sucessos++;
      } else {
        console.log(`   ❌ ${campo}: ERRO`);
        console.log(`      Esperado: ${valorEsperado}`);
        console.log(`      Salvo: ${valorSalvo}`);
        erros++;
      }
    }

    console.log('');
    console.log('📊 RESUMO DO TESTE:');
    console.log(`   ✅ Campos corretos: ${sucessos}`);
    console.log(`   ❌ Campos com erro: ${erros}`);
    console.log(`   📈 Taxa de sucesso: ${((sucessos / (sucessos + erros)) * 100).toFixed(1)}%`);
    console.log('');

    if (erros === 0) {
      console.log('🎉 TESTE CONCLUÍDO COM SUCESSO! Todos os campos foram salvos corretamente.');
    } else {
      console.log('⚠️  ATENÇÃO: Alguns campos não foram salvos corretamente. Verifique os erros acima.');
    }

    // 5. Mostrar dados finais
    console.log('');
    console.log('📄 Dados finais salvos (amostra):');
    console.log('   - Nome:', orgVerificacao?.nome);
    console.log('   - CNPJ:', orgVerificacao?.cnpj);
    console.log('   - Email:', orgVerificacao?.email);
    console.log('   - Descrição:', orgVerificacao?.descricao ? `${orgVerificacao.descricao.substring(0, 60)}...` : 'null');
    console.log('   - Total Sócios:', orgVerificacao?.caracteristicas_n_total_socios);
    console.log('   - Metodologia:', orgVerificacao?.metodologia ? `${orgVerificacao.metodologia.substring(0, 50)}...` : 'null');
    
  } catch (error) {
    console.error('');
    console.error('💥 ERRO NO TESTE:', error);
    console.error('');
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testarEdicaoCompleta()
  .then(() => {
    console.log('\n✅ Script finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro fatal:', error);
    process.exit(1);
  });

