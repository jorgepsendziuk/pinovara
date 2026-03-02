#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function generateVersionInfo() {
  try {
    // Captura o hash do commit atual
    const commitHash = execSync('git rev-parse HEAD').toString().trim();
    const shortCommitHash = execSync('git rev-parse --short=7 HEAD').toString().trim();
    
    // Captura a data/hora atual
    const buildTimestamp = new Date().toISOString();
    const buildDate = new Date().toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Captura informações do branch
    let branchName = 'unknown';
    try {
      branchName = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    } catch (err) {
      console.warn('Não foi possível obter o nome do branch:', err.message);
    }

    // Informações de versão
    const versionInfo = {
      commitHash,
      shortCommitHash,
      buildTimestamp,
      buildDate,
      branchName,
      generated: true
    };

    // Caminho para o arquivo de versão
    const versionFilePath = path.join(__dirname, '..', 'src', 'version.ts');
    
    // Conteúdo do arquivo TypeScript
    const fileContent = `// 🤖 Arquivo gerado automaticamente - NÃO EDITAR
// Generated at: ${buildTimestamp}

export const VERSION_INFO = {
  commitHash: '${commitHash}',
  shortCommitHash: '${shortCommitHash}',
  buildTimestamp: '${buildTimestamp}',
  buildDate: '${buildDate}',
  branchName: '${branchName}',
  generated: true
} as const;

export default VERSION_INFO;
`;

    // Criar diretório se não existir
    const srcDir = path.join(__dirname, '..', 'src');
    if (!fs.existsSync(srcDir)) {
      fs.mkdirSync(srcDir, { recursive: true });
    }

    // Escrever o arquivo
    fs.writeFileSync(versionFilePath, fileContent, 'utf8');

    // Gerar version.json para detecção de novas versões (anti-cache)
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const versionJsonPath = path.join(publicDir, 'version.json');
    fs.writeFileSync(versionJsonPath, JSON.stringify(versionInfo, null, 0), 'utf8');
    
    console.log('✅ Arquivo de versão gerado com sucesso!');
    console.log(`📁 Local: ${versionFilePath}`);
    console.log(`📝 Commit: ${shortCommitHash} (${branchName})`);
    console.log(`🕐 Build: ${buildDate}`);
    
    return versionInfo;
  } catch (error) {
    console.error('❌ Erro ao gerar informações de versão:', error.message);
    
    // Fallback - criar arquivo com informações mínimas
    const fallbackInfo = {
      commitHash: 'unknown',
      shortCommitHash: 'unknown',
      buildTimestamp: new Date().toISOString(),
      buildDate: new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      branchName: 'unknown',
      generated: false
    };

    const fallbackContent = `// ⚠️ Arquivo de fallback - informações limitadas
// Generated at: ${fallbackInfo.buildTimestamp}

export const VERSION_INFO = {
  commitHash: '${fallbackInfo.commitHash}',
  shortCommitHash: '${fallbackInfo.shortCommitHash}',
  buildTimestamp: '${fallbackInfo.buildTimestamp}',
  buildDate: '${fallbackInfo.buildDate}',
  branchName: '${fallbackInfo.branchName}',
  generated: ${fallbackInfo.generated}
} as const;

export default VERSION_INFO;
`;

    const versionFilePath = path.join(__dirname, '..', 'src', 'version.ts');
    fs.writeFileSync(versionFilePath, fallbackContent, 'utf8');

    // Gerar version.json mesmo em fallback
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(path.join(publicDir, 'version.json'), JSON.stringify(fallbackInfo, null, 0), 'utf8');
    
    console.log('⚠️ Arquivo de versão gerado em modo fallback');
    return fallbackInfo;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  generateVersionInfo();
}

module.exports = generateVersionInfo;
