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

async function gerarRelatorioOrganizacao13() {
  try {
    console.log('🔍 RELATÓRIO DETALHADO - ORGANIZAÇÃO ID 13\n');
    console.log('=' .repeat(100));
    
    // Buscar dados da organização ID 13
    const organizacao = await prisma.organizacao.findUnique({
      where: { id: 13 }
    });

    if (!organizacao) {
      console.log('❌ Organização ID 13 não encontrada.');
      return;
    }

    console.log(`🏢 Organização: ${organizacao.nome}`);
    console.log(`📅 Status de Validação: ${organizacao.validacao_status === 3 ? 'Validada' : 'Não Validada'}`);
    console.log(`📅 Data de Validação: ${organizacao.validacao_data ? new Date(organizacao.validacao_data).toLocaleDateString('pt-BR') : 'N/A'}`);
    
    console.log('\n' + '=' .repeat(100));
    console.log('📋 MAPEAMENTO ANTES vs DEPOIS DO REMAPEAMENTO');
    console.log('=' .repeat(100));

    // Mostrar mapeamento antes e depois
    for (const [campoAntigo, campoNovo] of Object.entries(mapeamentoCorrecoes)) {
      const valorAntigo = organizacao[`${campoAntigo}_resposta`];
      const valorNovo = organizacao[`${campoNovo}_resposta`];
      const comentarioAntigo = organizacao[`${campoAntigo}_comentario`];
      const comentarioNovo = organizacao[`${campoNovo}_comentario`];
      const propostaAntiga = organizacao[`${campoAntigo}_proposta`];
      const propostaNova = organizacao[`${campoNovo}_proposta`];
      
      if (valorAntigo !== null && valorAntigo !== undefined) {
        const perguntaAntiga = textosPerguntas[campoNovo];
        const perguntaNova = textosPerguntas[campoNovo];
        
        console.log(`\n🔄 Campo: ${campoAntigo} → ${campoNovo}`);
        console.log(`   📝 Pergunta: ${perguntaAntiga}`);
        
        console.log('\n   📊 ANTES (Mapeamento Incorreto):');
        console.log(`      💾 Campo: ${campoAntigo}_resposta`);
        console.log(`      📈 Valor: ${valorAntigo}`);
        console.log(`      💬 Comentário: ${comentarioAntigo || 'N/A'}`);
        console.log(`      💡 Proposta: ${propostaAntiga || 'N/A'}`);
        
        console.log('\n   📊 DEPOIS (Mapeamento Correto):');
        console.log(`      💾 Campo: ${campoNovo}_resposta`);
        console.log(`      📈 Valor: ${valorNovo || 'N/A'}`);
        console.log(`      💬 Comentário: ${comentarioNovo || 'N/A'}`);
        console.log(`      💡 Proposta: ${propostaNova || 'N/A'}`);
        
        // Verificar se houve mudança
        if (valorAntigo !== valorNovo) {
          console.log(`\n   ⚠️  MUDANÇA DETECTADA: Valor ${valorAntigo} → ${valorNovo}`);
        }
        
        if (comentarioAntigo !== comentarioNovo) {
          console.log(`   ⚠️  COMENTÁRIO MUDOU: "${comentarioAntigo}" → "${comentarioNovo}"`);
        }
        
        if (propostaAntiga !== propostaNova) {
          console.log(`   ⚠️  PROPOSTA MUDOU: "${propostaAntiga}" → "${propostaNova}"`);
        }
        
        console.log('\n   ' + '-'.repeat(80));
      }
    }

    console.log('\n' + '=' .repeat(100));
    console.log('📋 RESUMO DAS MUDANÇAS');
    console.log('=' .repeat(100));
    
    let totalCampos = 0;
    let camposComMudanca = 0;
    
    for (const [campoAntigo, campoNovo] of Object.entries(mapeamentoCorrecoes)) {
      const valorAntigo = organizacao[`${campoAntigo}_resposta`];
      const valorNovo = organizacao[`${campoNovo}_resposta`];
      
      if (valorAntigo !== null && valorAntigo !== undefined) {
        totalCampos++;
        
        if (valorAntigo !== valorNovo) {
          camposComMudanca++;
        }
      }
    }
    
    console.log(`📊 Total de campos com dados: ${totalCampos}`);
    console.log(`🔄 Campos com mudanças: ${camposComMudanca}`);
    console.log(`✅ Campos sem mudanças: ${totalCampos - camposComMudanca}`);
    
    if (camposComMudanca > 0) {
      console.log('\n⚠️  ATENÇÃO: Esta organização tem dados que mudaram de posição!');
      console.log('É necessário verificar se as validações ainda fazem sentido para as perguntas atuais.');
    } else {
      console.log('\n✅ Esta organização não teve mudanças significativas nos dados.');
    }

  } catch (error) {
    console.error('❌ Erro durante a análise:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

gerarRelatorioOrganizacao13();
