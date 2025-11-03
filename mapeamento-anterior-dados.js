const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mapeamento dos campos que foram corrigidos (ANTES → DEPOIS)
const mapeamentoCorrecoes = {
  // Governança - Controles Internos (P22-P27)
  'go_controle_20': 'go_controle_22', // P22
  'go_controle_21': 'go_controle_23', // P23
  'go_controle_22': 'go_controle_24', // P24
  'go_controle_23': 'go_controle_25', // P25
  'go_controle_24': 'go_controle_26', // P26
  'go_controle_25': 'go_controle_27', // P27
  
  // Governança - Educação (P28-P30)
  'go_educacao_26': 'go_educacao_28', // P28
  'go_educacao_27': 'go_educacao_29', // P29
  'go_educacao_28': 'go_educacao_30', // P30
  
  // Gestão Comercial - Estratégia (P16-P21)
  'gc_comercial_15': 'gc_comercial_16', // P16
  'gc_comercial_16': 'gc_comercial_17', // P17
  'gc_comercial_17': 'gc_comercial_18', // P18
  'gc_comercial_18': 'gc_comercial_19', // P19
  'gc_comercial_19': 'gc_comercial_20', // P20
  'gc_comercial_20': 'gc_comercial_21', // P21
  
  // Gestão Comercial - Modelo (P22-P28)
  'gc_modelo_21': 'gc_modelo_22', // P22
  'gc_modelo_22': 'gc_modelo_23', // P23
  'gc_modelo_23': 'gc_modelo_24', // P24
  'gc_modelo_24': 'gc_modelo_25', // P25
  'gc_modelo_25': 'gc_modelo_26', // P26
  'gc_modelo_26': 'gc_modelo_27', // P27
  'gc_modelo_27': 'gc_modelo_28', // P28
};

// Textos das perguntas para referência
const textosPerguntas = {
  // Governança - Controles Internos
  'go_controle_22': 'O conselho fiscal é atuante no empreendimento?',
  'go_controle_23': 'A direção se reúne periodicamente com o conselho fiscal?',
  'go_controle_24': 'A direção tem o hábito de apresentar periodicamente relatórios contábeis, financeiros e administrativos?',
  'go_controle_25': 'Realiza assembleias anuais para prestação de contas?',
  'go_controle_26': 'Possui mecanismos de controle, monitoramento e avaliação do alcance de objetivos e metas?',
  'go_controle_27': 'Há canais para dúvidas e sugestões em relação aos relatórios e informações compartilhados?',
  
  // Governança - Educação
  'go_educacao_28': 'Existe processo de formação continuada dos cooperados/associados?',
  'go_educacao_29': 'Os cooperados/associados são capacitados em Gestão do Empreendimento?',
  'go_educacao_30': 'Há planos para identificar, capacitar e preparar novos líderes?',
  
  // Gestão Comercial - Estratégia
  'gc_comercial_16': 'Adota estratégias comerciais definidas?',
  'gc_comercial_17': 'Os produtos/empreendimento possuem marca comercial?',
  'gc_comercial_18': 'Realiza ou utiliza pesquisa/estudo de mercado?',
  'gc_comercial_19': 'Conhece os concorrentes e acompanha preços?',
  'gc_comercial_20': 'Possui plano de marketing?',
  'gc_comercial_21': 'Realiza promoções e divulgação dos produtos/serviços?',
  
  // Gestão Comercial - Modelo
  'gc_modelo_22': 'Existe regularidade nas vendas, com contratos permanentes?',
  'gc_modelo_23': 'Possui Modelo de Negócio definido?',
  'gc_modelo_24': 'Tem definido público-alvo e canais de comercialização?',
  'gc_modelo_25': 'Possui estratégias de precificação baseadas em custos e mercado?',
  'gc_modelo_26': 'Tem controle de qualidade dos produtos/serviços?',
  'gc_modelo_27': 'Possui sistema de pós-venda e relacionamento com clientes?',
  'gc_modelo_28': 'Tem estratégias para diversificação de produtos/serviços?',
};

async function mostrarMapeamentoAnterior() {
  try {
    console.log('🔍 MAPEAMENTO ANTERIOR DOS DADOS DO DIAGNÓSTICO\n');
    console.log('=' .repeat(100));
    console.log('📋 COMO OS DADOS ESTAVAM MAPEADOS ANTES DAS CORREÇÕES');
    console.log('=' .repeat(100));
    
    // Buscar organizações validadas
    const organizacoesValidadas = await prisma.organizacao.findMany({
      where: { validacao_status: 3 },
      select: { id: true, nome: true },
      orderBy: { id: 'asc' }
    });

    console.log(`📊 Organizações validadas encontradas: ${organizacoesValidadas.length}\n`);

    for (const org of organizacoesValidadas) {
      console.log(`🏢 Organização ID ${org.id}: ${org.nome}`);
      
      // Buscar dados completos da organização
      const orgCompleta = await prisma.organizacao.findUnique({
        where: { id: org.id }
      });

      if (!orgCompleta) {
        console.log('   ❌ Organização não encontrada\n');
        continue;
      }

      console.log('\n   📋 MAPEAMENTO ANTERIOR (COMO ESTAVA ANTES):');
      
      // Mostrar como os dados estavam mapeados antes
      for (const [campoAntigo, campoNovo] of Object.entries(mapeamentoCorrecoes)) {
        const valorAntigo = orgCompleta[`${campoAntigo}_resposta`];
        const valorNovo = orgCompleta[`${campoNovo}_resposta`];
        
        if (valorAntigo !== null && valorAntigo !== undefined) {
          const perguntaAntiga = textosPerguntas[campoNovo]; // A pergunta que aparecia na tela
          const perguntaNova = textosPerguntas[campoNovo];   // A pergunta correta agora
          
          console.log(`\n   🔄 Campo: ${campoAntigo} → ${campoNovo}`);
          console.log(`      📝 Pergunta que aparecia: ${perguntaAntiga}`);
          console.log(`      💾 Dados salvos em: ${campoAntigo}_resposta = ${valorAntigo}`);
          console.log(`      📊 Comentário: ${orgCompleta[`${campoAntigo}_comentario`] || 'N/A'}`);
          console.log(`      💡 Proposta: ${orgCompleta[`${campoAntigo}_proposta`] || 'N/A'}`);
          
          // Mostrar o problema específico
          console.log(`      ⚠️  PROBLEMA: A resposta ${valorAntigo} estava sendo salva no campo ${campoAntigo}, mas aparecia na pergunta "${perguntaAntiga}"`);
        }
      }

      console.log('\n   📋 MAPEAMENTO ATUAL (COMO ESTÁ AGORA):');
      
      // Mostrar como os dados estão mapeados agora
      for (const [campoAntigo, campoNovo] of Object.entries(mapeamentoCorrecoes)) {
        const valorNovo = orgCompleta[`${campoNovo}_resposta`];
        
        if (valorNovo !== null && valorNovo !== undefined) {
          const perguntaNova = textosPerguntas[campoNovo];
          
          console.log(`\n   ✅ Campo: ${campoNovo}`);
          console.log(`      📝 Pergunta correta: ${perguntaNova}`);
          console.log(`      💾 Dados salvos em: ${campoNovo}_resposta = ${valorNovo}`);
          console.log(`      📊 Comentário: ${orgCompleta[`${campoNovo}_comentario`] || 'N/A'}`);
          console.log(`      💡 Proposta: ${orgCompleta[`${campoNovo}_proposta`] || 'N/A'}`);
        }
      }

      console.log('\n' + '=' .repeat(100));
    }

    console.log('\n📋 RESUMO DO MAPEAMENTO ANTERIOR:');
    console.log('=' .repeat(100));
    
    console.log('\n🔧 CAMPOS QUE FORAM CORRIGIDOS:');
    console.log('\n📝 Governança Organizacional - Controles Internos:');
    console.log('   P22: go_controle_20 → go_controle_22');
    console.log('   P23: go_controle_21 → go_controle_23');
    console.log('   P24: go_controle_22 → go_controle_24');
    console.log('   P25: go_controle_23 → go_controle_25');
    console.log('   P26: go_controle_24 → go_controle_26');
    console.log('   P27: go_controle_25 → go_controle_27');
    
    console.log('\n📝 Governança Organizacional - Educação:');
    console.log('   P28: go_educacao_26 → go_educacao_28');
    console.log('   P29: go_educacao_27 → go_educacao_29');
    console.log('   P30: go_educacao_28 → go_educacao_30');
    
    console.log('\n📝 Gestão Comercial - Estratégia:');
    console.log('   P16: gc_comercial_15 → gc_comercial_16');
    console.log('   P17: gc_comercial_16 → gc_comercial_17');
    console.log('   P18: gc_comercial_17 → gc_comercial_18');
    console.log('   P19: gc_comercial_18 → gc_comercial_19');
    console.log('   P20: gc_comercial_19 → gc_comercial_20');
    console.log('   P21: gc_comercial_20 → gc_comercial_21');
    
    console.log('\n📝 Gestão Comercial - Modelo:');
    console.log('   P22: gc_modelo_21 → gc_modelo_22');
    console.log('   P23: gc_modelo_22 → gc_modelo_23');
    console.log('   P24: gc_modelo_23 → gc_modelo_24');
    console.log('   P25: gc_modelo_24 → gc_modelo_25');
    console.log('   P26: gc_modelo_25 → gc_modelo_26');
    console.log('   P27: gc_modelo_26 → gc_modelo_27');
    console.log('   P28: gc_modelo_27 → gc_modelo_28');

    console.log('\n⚠️  PROBLEMA IDENTIFICADO:');
    console.log('Os dados estavam sendo salvos em campos incorretos, mas apareciam nas perguntas certas na tela.');
    console.log('Isso causava inconsistência entre o que era exibido e o que era salvo no banco de dados.');

  } catch (error) {
    console.error('❌ Erro durante a análise:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

mostrarMapeamentoAnterior();

