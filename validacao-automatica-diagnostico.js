const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Mapeamento dos campos que foram corrigidos
const camposCorrigidos = {
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

// Textos das perguntas para validação
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

// Regras de validação baseadas no contexto das perguntas
const regrasValidacao = {
  // Governança - Controles Internos
  'go_controle_22': { min: 1, max: 4, descricao: 'Conselho fiscal atuante' },
  'go_controle_23': { min: 1, max: 4, descricao: 'Reuniões com conselho fiscal' },
  'go_controle_24': { min: 1, max: 4, descricao: 'Apresentação de relatórios' },
  'go_controle_25': { min: 1, max: 4, descricao: 'Assembleias anuais' },
  'go_controle_26': { min: 1, max: 4, descricao: 'Mecanismos de controle' },
  'go_controle_27': { min: 1, max: 4, descricao: 'Canais de dúvidas e sugestões' },
  
  // Governança - Educação
  'go_educacao_28': { min: 1, max: 4, descricao: 'Formação continuada' },
  'go_educacao_29': { min: 1, max: 4, descricao: 'Capacitação em gestão' },
  'go_educacao_30': { min: 1, max: 4, descricao: 'Preparação de novos líderes' },
  
  // Gestão Comercial - Estratégia
  'gc_comercial_16': { min: 1, max: 4, descricao: 'Estratégias comerciais' },
  'gc_comercial_17': { min: 1, max: 4, descricao: 'Marca comercial' },
  'gc_comercial_18': { min: 1, max: 4, descricao: 'Pesquisa de mercado' },
  'gc_comercial_19': { min: 1, max: 4, descricao: 'Conhecimento de concorrentes' },
  'gc_comercial_20': { min: 1, max: 4, descricao: 'Plano de marketing' },
  'gc_comercial_21': { min: 1, max: 4, descricao: 'Promoções e divulgação' },
  
  // Gestão Comercial - Modelo
  'gc_modelo_22': { min: 1, max: 4, descricao: 'Regularidade nas vendas' },
  'gc_modelo_23': { min: 1, max: 4, descricao: 'Modelo de negócio' },
  'gc_modelo_24': { min: 1, max: 4, descricao: 'Público-alvo e canais' },
  'gc_modelo_25': { min: 1, max: 4, descricao: 'Estratégias de precificação' },
  'gc_modelo_26': { min: 1, max: 4, descricao: 'Controle de qualidade' },
  'gc_modelo_27': { min: 1, max: 4, descricao: 'Sistema de pós-venda' },
  'gc_modelo_28': { min: 1, max: 4, descricao: 'Diversificação de produtos' },
};

async function validarDadosAutomaticamente() {
  try {
    console.log('🔍 INICIANDO VALIDAÇÃO AUTOMÁTICA DOS DADOS DO DIAGNÓSTICO\n');
    console.log('=' .repeat(80));
    
    // Buscar organizações validadas
    const organizacoesValidadas = await prisma.organizacao.findMany({
      where: { validacao_status: 3 },
      select: { id: true, nome: true },
      orderBy: { id: 'asc' }
    });

    console.log(`📊 Organizações validadas encontradas: ${organizacoesValidadas.length}\n`);

    let totalCorrecoes = 0;
    let totalValidacoes = 0;

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

      let correcoesOrg = 0;
      let validacoesOrg = 0;

      // Validar cada campo corrigido
      for (const [campoAntigo, campoNovo] of Object.entries(camposCorrigidos)) {
        const valorAntigo = orgCompleta[`${campoAntigo}_resposta`];
        const valorNovo = orgCompleta[`${campoNovo}_resposta`];
        
        if (valorAntigo !== null && valorAntigo !== undefined) {
          validacoesOrg++;
          
          // Verificar se o valor faz sentido para a pergunta atual
          const regra = regrasValidacao[campoNovo];
          if (regra && (valorAntigo < regra.min || valorAntigo > regra.max)) {
            console.log(`   ⚠️  Campo ${campoNovo}: Valor ${valorAntigo} fora do range (${regra.min}-${regra.max})`);
            console.log(`      Pergunta: ${textosPerguntas[campoNovo]}`);
            console.log(`      Descrição: ${regra.descricao}`);
            
            // Sugerir correção baseada no contexto
            let valorSugerido = valorAntigo;
            if (valorAntigo < regra.min) {
              valorSugerido = regra.min;
            } else if (valorAntigo > regra.max) {
              valorSugerido = regra.max;
            }
            
            console.log(`      💡 Valor sugerido: ${valorSugerido}`);
            
            // Aplicar correção automaticamente
            try {
              await prisma.organizacao.update({
                where: { id: org.id },
                data: {
                  [`${campoNovo}_resposta`]: valorSugerido,
                  [`${campoNovo}_comentario`]: orgCompleta[`${campoAntigo}_comentario`] || '',
                  [`${campoNovo}_proposta`]: orgCompleta[`${campoAntigo}_proposta`] || ''
                }
              });
              
              console.log(`      ✅ Correção aplicada: ${valorAntigo} → ${valorSugerido}`);
              correcoesOrg++;
            } catch (error) {
              console.log(`      ❌ Erro ao aplicar correção: ${error.message}`);
            }
          } else {
            console.log(`   ✅ Campo ${campoNovo}: Valor ${valorAntigo} válido`);
          }
        }
      }

      console.log(`   📊 Correções aplicadas: ${correcoesOrg}/${validacoesOrg}\n`);
      totalCorrecoes += correcoesOrg;
      totalValidacoes += validacoesOrg;
    }

    console.log('=' .repeat(80));
    console.log('📋 RESUMO DA VALIDAÇÃO AUTOMÁTICA');
    console.log('=' .repeat(80));
    console.log(`📊 Total de validações: ${totalValidacoes}`);
    console.log(`🔧 Total de correções aplicadas: ${totalCorrecoes}`);
    console.log(`✅ Organizações processadas: ${organizacoesValidadas.length}`);
    
    if (totalCorrecoes > 0) {
      console.log('\n🎯 VALIDAÇÃO CONCLUÍDA COM CORREÇÕES');
      console.log('As correções foram aplicadas automaticamente no banco de dados.');
    } else {
      console.log('\n🎯 VALIDAÇÃO CONCLUÍDA SEM CORREÇÕES');
      console.log('Todos os dados estavam corretos!');
    }

  } catch (error) {
    console.error('❌ Erro durante a validação:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

validarDadosAutomaticamente();
