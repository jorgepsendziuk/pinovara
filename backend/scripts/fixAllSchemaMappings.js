const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

// Ler o arquivo schema
let schemaContent = fs.readFileSync(schemaPath, 'utf8');

// Função para converter camelCase para snake_case
function camelToSnake(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Encontrar todos os campos que não têm @map e precisam ser mapeados
const fieldRegex = /^\s+([a-zA-Z][a-zA-Z0-9]*)\s+(Int\?|String\?|Boolean\?|DateTime\?|Float\?|Decimal\?)\s*$/gm;
let match;
const fieldsToMap = [];

while ((match = fieldRegex.exec(schemaContent)) !== null) {
  const fieldName = match[1];
  const fieldType = match[2];
  
  // Pular campos que já têm @map ou são campos básicos
  if (fieldName.match(/^(id|createdAt|updatedAt|active|removido)$/)) {
    continue;
  }
  
  // Verificar se o campo já tem @map
  const lineIndex = schemaContent.indexOf(match[0]);
  const nextLineIndex = schemaContent.indexOf('\n', lineIndex);
  const nextLine = schemaContent.substring(lineIndex, nextLineIndex);
  
  if (!nextLine.includes('@map')) {
    fieldsToMap.push({ fieldName, fieldType, line: match[0] });
  }
}

console.log(`Found ${fieldsToMap.length} fields to map`);

// Aplicar mapeamentos
fieldsToMap.forEach(({ fieldName, fieldType, line }) => {
  const snakeCaseName = camelToSnake(fieldName);
  
  // Substituir a linha inteira
  const newLine = line.replace(/^\s+/, '  ') + ` @map("${snakeCaseName}")`;
  schemaContent = schemaContent.replace(line, newLine);
  
  console.log(`Mapped: ${fieldName} -> ${snakeCaseName}`);
});

// Salvar o arquivo modificado
fs.writeFileSync(schemaPath, schemaContent);

console.log(`✅ Schema mappings updated successfully!`);
console.log(`📝 Updated ${fieldsToMap.length} field mappings`);