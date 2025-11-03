const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

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

// Função para traduzir valores numéricos
function traduzirValor(valor) {
  switch(valor) {
    case 1: return "Não implementado";
    case 2: return "Parcialmente implementado";
    case 3: return "Implementado";
    case 4: return "Totalmente implementado";
    default: return valor;
  }
}

async function documentarProcedimentoRemapeamento() {
  try {
    console.log('🔍 DOCUMENTANDO PROCEDIMENTO DE REMAPEAMENTO\n');
    console.log('=' .repeat(80));
    
    // Buscar todas as organizações validadas
    const organizacoesValidadas = await prisma.organizacao.findMany({
      where: { validacao_status: 3 },
      select: { id: true, nome: true },
      orderBy: { id: 'asc' }
    });

    console.log(`📊 Organizações validadas encontradas: ${organizacoesValidadas.length}`);
    
    const documentacaoCompleta = {
      metadata: {
        dataGeracao: new Date().toISOString(),
        totalOrganizacoes: organizacoesValidadas.length,
        camposAfetados: Object.keys(mapeamentoCorrecoes).length,
        descricao: "Documentação completa do procedimento de remapeamento dos campos do diagnóstico organizacional"
      },
      mapeamentoCampos: mapeamentoCorrecoes,
      textosPerguntas: textosPerguntas,
      organizacoes: []
    };

    for (const org of organizacoesValidadas) {
      console.log(`\n🏢 Processando Organização ID ${org.id}: ${org.nome}`);
      
      // Buscar dados completos da organização
      const orgCompleta = await prisma.organizacao.findUnique({
        where: { id: org.id }
      });

      if (!orgCompleta) {
        console.log('   ❌ Organização não encontrada');
        continue;
      }

      const dadosOrganizacao = {
        id: org.id,
        nome: org.nome,
        validacao_status: orgCompleta.validacao_status,
        validacao_data: orgCompleta.validacao_data,
        camposAfetados: []
      };

      // Analisar cada campo afetado
      for (const [campoAntigo, campoNovo] of Object.entries(mapeamentoCorrecoes)) {
        const valorAntigo = orgCompleta[`${campoAntigo}_resposta`];
        const valorNovo = orgCompleta[`${campoNovo}_resposta`];
        const comentarioAntigo = orgCompleta[`${campoAntigo}_comentario`];
        const comentarioNovo = orgCompleta[`${campoNovo}_comentario`];
        const propostaAntiga = orgCompleta[`${campoAntigo}_proposta`];
        const propostaNova = orgCompleta[`${campoNovo}_proposta`];
        
        if (valorAntigo !== null && valorAntigo !== undefined) {
          const pergunta = textosPerguntas[campoNovo];
          
          const dadosCampo = {
            campoAntigo: campoAntigo,
            campoNovo: campoNovo,
            pergunta: pergunta,
            antes: {
              valor: valorAntigo,
              valorTraduzido: traduzirValor(valorAntigo),
              comentario: comentarioAntigo,
              proposta: propostaAntiga
            },
            depois: {
              valor: valorNovo,
              valorTraduzido: traduzirValor(valorNovo),
              comentario: comentarioNovo,
              proposta: propostaNova
            },
            mudancas: {
              valorMudou: valorAntigo !== valorNovo,
              comentarioMudou: comentarioAntigo !== comentarioNovo,
              propostaMudou: propostaAntiga !== propostaNova,
              temMudancas: valorAntigo !== valorNovo || comentarioAntigo !== comentarioNovo || propostaAntiga !== propostaNova
            }
          };

          dadosOrganizacao.camposAfetados.push(dadosCampo);
        }
      }

      documentacaoCompleta.organizacoes.push(dadosOrganizacao);
      console.log(`   ✅ ${dadosOrganizacao.camposAfetados.length} campos processados`);
    }

    // Salvar documentação em arquivo JSON
    const nomeArquivo = `documentacao-remapeamento-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(nomeArquivo, JSON.stringify(documentacaoCompleta, null, 2));
    
    console.log('\n' + '=' .repeat(80));
    console.log('📋 DOCUMENTAÇÃO COMPLETA GERADA');
    console.log('=' .repeat(80));
    console.log(`📁 Arquivo salvo: ${nomeArquivo}`);
    console.log(`📊 Total de organizações documentadas: ${documentacaoCompleta.organizacoes.length}`);
    
    let totalCampos = 0;
    let totalMudancas = 0;
    
    for (const org of documentacaoCompleta.organizacoes) {
      totalCampos += org.camposAfetados.length;
      totalMudancas += org.camposAfetados.filter(campo => campo.mudancas.temMudancas).length;
    }
    
    console.log(`📊 Total de campos documentados: ${totalCampos}`);
    console.log(`🔄 Total de campos com mudanças: ${totalMudancas}`);
    console.log(`✅ Total de campos sem mudanças: ${totalCampos - totalMudancas}`);

    // Gerar resumo para a coordenadora
    const resumoCoordenadora = {
      resumo: "Documentação completa do procedimento de remapeamento dos campos do diagnóstico organizacional",
      totalOrganizacoes: documentacaoCompleta.organizacoes.length,
      totalCampos: totalCampos,
      totalMudancas: totalMudancas,
      organizacoesComMudancas: documentacaoCompleta.organizacoes.filter(org => 
        org.camposAfetados.some(campo => campo.mudancas.temMudancas)
      ).length,
      arquivoCompleto: nomeArquivo
    };

    const nomeArquivoResumo = `resumo-coordenadora-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(nomeArquivoResumo, JSON.stringify(resumoCoordenadora, null, 2));
    
    console.log(`📋 Resumo para coordenadora salvo: ${nomeArquivoResumo}`);
    console.log('\n🎯 Documentação completa gerada com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante a documentação:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

documentarProcedimentoRemapeamento();

