const fs = require('fs');

// Ler o arquivo JSON gerado
const arquivoCompleto = 'documentacao-remapeamento-2025-10-24.json';

try {
  console.log('🔍 EXTRAINDO DADOS DA ORGANIZAÇÃO ID 13\n');
  console.log('=' .repeat(80));
  
  const dadosCompletos = JSON.parse(fs.readFileSync(arquivoCompleto, 'utf8'));
  
  // Encontrar a organização ID 13
  const organizacao13 = dadosCompletos.organizacoes.find(org => org.id === 13);
  
  if (!organizacao13) {
    console.log('❌ Organização ID 13 não encontrada no arquivo JSON.');
    console.log('Organizações disponíveis:');
    dadosCompletos.organizacoes.forEach(org => {
      console.log(`   - ID ${org.id}: ${org.nome}`);
    });
    return;
  }
  
  console.log(`🏢 Organização: ${organizacao13.nome}`);
  console.log(`📅 Status de Validação: ${organizacao13.validacao_status === 3 ? 'Validada' : 'Não Validada'}`);
  console.log(`📅 Data de Validação: ${organizacao13.validacao_data ? new Date(organizacao13.validacao_data).toLocaleDateString('pt-BR') : 'N/A'}`);
  
  console.log('\n' + '=' .repeat(80));
  console.log('📋 DADOS ANTES E DEPOIS DOS CAMPOS ALTERADOS');
  console.log('=' .repeat(80));
  
  // Filtrar apenas os campos que tiveram mudanças
  const camposComMudancas = organizacao13.camposAfetados.filter(campo => campo.mudancas.temMudancas);
  
  console.log(`\n🔄 Total de campos com mudanças: ${camposComMudancas.length}`);
  
  // Criar estrutura JSON específica para a organização ID 13
  const dadosOrganizacao13 = {
    metadata: {
      organizacaoId: 13,
      nome: organizacao13.nome,
      dataExtracao: new Date().toISOString(),
      totalCamposComMudancas: camposComMudancas.length,
      descricao: "Dados antes e depois dos campos alterados na organização ID 13"
    },
    camposAlterados: camposComMudancas.map(campo => ({
      campoAntigo: campo.campoAntigo,
      campoNovo: campo.campoNovo,
      pergunta: campo.pergunta,
      antes: {
        valor: campo.antes.valor,
        valorTraduzido: campo.antes.valorTraduzido,
        comentario: campo.antes.comentario,
        proposta: campo.antes.proposta
      },
      depois: {
        valor: campo.depois.valor,
        valorTraduzido: campo.depois.valorTraduzido,
        comentario: campo.depois.comentario,
        proposta: campo.depois.proposta
      },
      tipoMudanca: {
        valorMudou: campo.mudancas.valorMudou,
        comentarioMudou: campo.mudancas.comentarioMudou,
        propostaMudou: campo.mudancas.propostaMudou
      }
    }))
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
}

