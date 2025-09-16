const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

// Ler o arquivo schema
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Mapeamentos para campos goControle*
const goControleMappings = [
  ['goControle20Resposta', 'go_controle_20_resposta'],
  ['goControle20Comentario', 'go_controle_20_comentario'],
  ['goControle20Proposta', 'go_controle_20_proposta'],
  ['goControle21Resposta', 'go_controle_21_resposta'],
  ['goControle21Comentario', 'go_controle_21_comentario'],
  ['goControle21Proposta', 'go_controle_21_proposta'],
  ['goControle22Resposta', 'go_controle_22_resposta'],
  ['goControle22Comentario', 'go_controle_22_comentario'],
  ['goControle22Proposta', 'go_controle_22_proposta'],
  ['goControle23Resposta', 'go_controle_23_resposta'],
  ['goControle23Comentario', 'go_controle_23_comentario'],
  ['goControle23Proposta', 'go_controle_23_proposta'],
  ['goControle24Resposta', 'go_controle_24_resposta'],
  ['goControle24Comentario', 'go_controle_24_comentario'],
  ['goControle24Proposta', 'go_controle_24_proposta'],
  ['goControle25Resposta', 'go_controle_25_resposta'],
  ['goControle25Comentario', 'go_controle_25_comentario'],
  ['goControle25Proposta', 'go_controle_25_proposta']
];

// Mapeamentos para campos goEducacao*
const goEducacaoMappings = [
  ['goEducacao26Resposta', 'go_educacao_26_resposta'],
  ['goEducacao26Comentario', 'go_educacao_26_comentario'],
  ['goEducacao26Proposta', 'go_educacao_26_proposta'],
  ['goEducacao27Resposta', 'go_educacao_27_resposta'],
  ['goEducacao27Comentario', 'go_educacao_27_comentario'],
  ['goEducacao27Proposta', 'go_educacao_27_proposta'],
  ['goEducacao28Resposta', 'go_educacao_28_resposta'],
  ['goEducacao28Comentario', 'go_educacao_28_comentario'],
  ['goEducacao28Proposta', 'go_educacao_28_proposta']
];

// Mapeamentos para campos goEstrategia*
const goEstrategiaMappings = [
  ['goEstrategia5Resposta', 'go_estrategia_5_resposta'],
  ['goEstrategia5Comentario', 'go_estrategia_5_comentario'],
  ['goEstrategia5Proposta', 'go_estrategia_5_proposta'],
  ['goEstrategia6Resposta', 'go_estrategia_6_resposta'],
  ['goEstrategia6Comentario', 'go_estrategia_6_comentario'],
  ['goEstrategia6Proposta', 'go_estrategia_6_proposta']
];

// Mapeamentos para campos goEstrutura*
const goEstruturaMappings = [
  ['goEstrutura1Resposta', 'go_estrutura_1_resposta'],
  ['goEstrutura1Comentario', 'go_estrutura_1_comentario'],
  ['goEstrutura1Proposta', 'go_estrutura_1_proposta'],
  ['goEstrutura2Resposta', 'go_estrutura_2_resposta'],
  ['goEstrutura2Comentario', 'go_estrutura_2_comentario'],
  ['goEstrutura2Proposta', 'go_estrutura_2_proposta'],
  ['goEstrutura3Resposta', 'go_estrutura_3_resposta'],
  ['goEstrutura3Comentario', 'go_estrutura_3_comentario'],
  ['goEstrutura3Proposta', 'go_estrutura_3_proposta'],
  ['goEstrutura4Resposta', 'go_estrutura_4_resposta'],
  ['goEstrutura4Comentario', 'go_estrutura_4_comentario'],
  ['goEstrutura4Proposta', 'go_estrutura_4_proposta']
];

// Combinar todos os mapeamentos
const allMappings = [
  ...goControleMappings,
  ...goEducacaoMappings,
  ...goEstrategiaMappings,
  ...goEstruturaMappings
];

// Aplicar os mapeamentos
allMappings.forEach(([fieldName, dbColumn]) => {
  // Procurar por linhas que contêm o campo sem @map
  const regex = new RegExp(`(\\s+${fieldName}\\s+Int\\?)\\s*$`, 'gm');
  schemaContent = schemaContent.replace(regex, `$1 @map("${dbColumn}")`);
  
  const regexString = new RegExp(`(\\s+${fieldName}\\s+String\\?)\\s*$`, 'gm');
  schemaContent = schemaContent.replace(regexString, `$1 @map("${dbColumn}")`);
});

// Salvar o arquivo modificado
fs.writeFileSync(schemaPath, schemaContent);

console.log('✅ Schema mappings updated successfully!');
console.log(`📝 Updated ${allMappings.length} field mappings`);