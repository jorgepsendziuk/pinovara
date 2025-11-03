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

async function extrairDadosOrganizacao13() {
  try {
    console.log('🔍 EXTRAINDO DADOS DA ORGANIZAÇÃO ID 13 (DIRETO DO BANCO)\n');
    console.log('=' .repeat(80));
    
    // Buscar dados da organização ID 13
    const organizacao = await prisma.organizacao.findUnique({
      where: { id: 13 }
    });

    if (!organizacao) {
      console.log('❌ Organização ID 13 não encontrada no banco de dados.');
      return;
    }

    console.log(`🏢 Organização: ${organizacao.nome}`);
    console.log(`📅 Status de Validação: ${organizacao.validacao_status === 3 ? 'Validada' : 'Não Validada'}`);
    console.log(`📅 Data de Validação: ${organizacao.validacao_data ? new Date(organizacao.validacao_data).toLocaleDateString('pt-BR') : 'N/A'}`);
    
    console.log('\n' + '=' .repeat(80));
    console.log('📋 DADOS ANTES E DEPOIS DOS CAMPOS ALTERADOS');
    console.log('=' .repeat(80));
    
    const camposAlterados = [];
    
    // Analisar cada campo afetado
    for (const [campoAntigo, campoNovo] of Object.entries(mapeamentoCorrecoes)) {
      const valorAntigo = organizacao[`${campoAntigo}_resposta`];
      const valorNovo = organizacao[`${campoNovo}_resposta`];
      const comentarioAntigo = organizacao[`${campoAntigo}_comentario`];
      const comentarioNovo = organizacao[`${campoNovo}_comentario`];
      const propostaAntiga = organizacao[`${campoAntigo}_proposta`];
      const propostaNova = organizacao[`${campoNovo}_proposta`];
      
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

        camposAlterados.push(dadosCampo);
      }
    }
    
    // Filtrar apenas os campos que tiveram mudanças
    const camposComMudancas = camposAlterados.filter(campo => campo.mudancas.temMudancas);
    
    console.log(`\n🔄 Total de campos com mudanças: ${camposComMudancas.length}`);
    
    // Criar estrutura JSON específica para a organização ID 13
    const dadosOrganizacao13 = {
      metadata: {
        organizacaoId: 13,
        nome: organizacao.nome,
        dataExtracao: new Date().toISOString(),
        totalCamposComMudancas: camposComMudancas.length,
        descricao: "Dados antes e depois dos campos alterados na organização ID 13"
      },
      camposAlterados: camposComMudancas
    };
    
    // Salvar dados específicos da organização ID 13
    const nomeArquivo = 'organizacao-13-campos-alterados.json';
    fs.writeFileSync(nomeArquivo, JSON.stringify(dadosOrganizacao13, null, 2));
    
    console.log(`\n📁 Arquivo salvo: ${nomeArquivo}`);
    
    // Mostrar resumo das mudanças
    console.log('\n📊 RESUMO DAS MUDANÇAS:');
    console.log('-' .repeat(80));
    
    camposComMudancas.forEach((campo, index) => {
      console.log(`\n${index + 1}. ${campo.pergunta}`);
      console.log(`   Campo: ${campo.campoAntigo} → ${campo.campoNovo}`);
      
      if (campo.mudancas.valorMudou) {
        console.log(`   🔄 Valor: ${campo.antes.valorTraduzido} → ${campo.depois.valorTraduzido}`);
      }
      
      if (campo.mudancas.comentarioMudou) {
        console.log(`   💬 Comentário ANTES: "${campo.antes.comentario || 'N/A'}"`);
        console.log(`   💬 Comentário DEPOIS: "${campo.depois.comentario || 'N/A'}"`);
      }
      
      if (campo.mudancas.propostaMudou) {
        console.log(`   💡 Proposta ANTES: "${campo.antes.proposta || 'N/A'}"`);
        console.log(`   💡 Proposta DEPOIS: "${campo.depois.proposta || 'N/A'}"`);
      }
    });
    
    console.log('\n' + '=' .repeat(80));
    console.log('✅ EXTRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log(`📁 Arquivo gerado: ${nomeArquivo}`);
    console.log(`📊 Total de campos com mudanças: ${camposComMudancas.length}`);
    
  } catch (error) {
    console.error('❌ Erro durante a extração:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

extrairDadosOrganizacao13();

