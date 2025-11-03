const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function investigarP26() {
  try {
    console.log('🔍 INVESTIGANDO P26 - CONTROLE DE QUALIDADE\n');
    console.log('=' .repeat(80));
    
    // Buscar dados da organização ID 13
    const organizacao = await prisma.organizacao.findUnique({
      where: { id: 13 }
    });

    if (!organizacao) {
      console.log('❌ Organização ID 13 não encontrada.');
      return;
    }

    console.log(`🏢 Organização: ${organizacao.nome}\n`);
    
    // Campos relacionados à P26 (Tem controle de qualidade dos produtos/serviços?)
    console.log('📋 CAMPOS RELACIONADOS À P26:');
    console.log('-' .repeat(80));
    
    // Campo NOVO (onde deveria estar agora)
    console.log('\n✅ CAMPO NOVO (gc_modelo_26_*):');
    console.log(`   gc_modelo_26_resposta: ${organizacao.gc_modelo_26_resposta}`);
    console.log(`   gc_modelo_26_comentario: "${organizacao.gc_modelo_26_comentario || 'N/A'}"`);
    console.log(`   gc_modelo_26_proposta: "${organizacao.gc_modelo_26_proposta || 'N/A'}"`);
    
    // Campo ANTIGO (onde estava antes)
    console.log('\n📌 CAMPO ANTIGO (gc_modelo_25_*):');
    console.log(`   gc_modelo_25_resposta: ${organizacao.gc_modelo_25_resposta}`);
    console.log(`   gc_modelo_25_comentario: "${organizacao.gc_modelo_25_comentario || 'N/A'}"`);
    console.log(`   gc_modelo_25_proposta: "${organizacao.gc_modelo_25_proposta || 'N/A'}"`);
    
    // Verificar TODOS os campos gc_modelo_20 até gc_modelo_30
    console.log('\n📊 TODOS OS CAMPOS gc_modelo_* DA ORGANIZAÇÃO:');
    console.log('-' .repeat(80));
    
    const camposModelo = {};
    for (let i = 20; i <= 30; i++) {
      const campo = `gc_modelo_${i}_resposta`;
      const valor = organizacao[campo];
      if (valor !== null && valor !== undefined) {
        camposModelo[`gc_modelo_${i}`] = {
          resposta: valor,
          comentario: organizacao[`gc_modelo_${i}_comentario`],
          proposta: organizacao[`gc_modelo_${i}_proposta`]
        };
      }
    }
    
    console.log('\nCampos gc_modelo preenchidos:');
    for (const [campo, dados] of Object.entries(camposModelo)) {
      const traduzir = (v) => {
        switch(v) {
          case 1: return "Não implementado";
          case 2: return "Parcialmente implementado";
          case 3: return "Implementado";
          case 4: return "Totalmente implementado";
          default: return v;
        }
      };
      
      console.log(`\n   ${campo}:`);
      console.log(`      Resposta: ${dados.resposta} (${traduzir(dados.resposta)})`);
      console.log(`      Comentário: "${dados.comentario || 'N/A'}"`);
      console.log(`      Proposta: "${dados.proposta || 'N/A'}"`);
    }
    
    // Verificar o mapeamento
    console.log('\n' + '=' .repeat(80));
    console.log('🔍 ANÁLISE DO MAPEAMENTO:');
    console.log('-' .repeat(80));
    console.log('\nDe acordo com o mapeamento aplicado:');
    console.log('   gc_modelo_25 → gc_modelo_26');
    console.log('\nIsso significa que:');
    console.log(`   - O que estava em gc_modelo_25_resposta (${organizacao.gc_modelo_25_resposta})`);
    console.log(`     deveria ser MOVIDO para gc_modelo_26_resposta`);
    console.log(`\n   - MAS o valor em gc_modelo_26_resposta é ${organizacao.gc_modelo_26_resposta}`);
    
    if (organizacao.gc_modelo_25_resposta === 4 && organizacao.gc_modelo_26_resposta === 1) {
      console.log('\n❌ PROBLEMA IDENTIFICADO:');
      console.log('   - Campo antigo (25) tem valor 4 (Totalmente implementado)');
      console.log('   - Campo novo (26) tem valor 1 (Não implementado)');
      console.log('   - O remapeamento NÃO foi executado corretamente!');
      console.log('   - Os dados não foram copiados do campo antigo para o novo');
    } else if (organizacao.gc_modelo_25_resposta === organizacao.gc_modelo_26_resposta) {
      console.log('\n✅ DADOS IGUAIS:');
      console.log('   - O valor em ambos os campos é o mesmo');
      console.log('   - Não houve regressão, apenas mudança de campo');
    }
    
    console.log('\n' + '=' .repeat(80));
    
  } catch (error) {
    console.error('❌ Erro durante a investigação:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

investigarP26();
