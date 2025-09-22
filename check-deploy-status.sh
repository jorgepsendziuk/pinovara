#!/bin/bash

echo "🔍 VERIFICAÇÃO STATUS DO DEPLOY"
echo "==============================="
echo ""

# Verificar GitHub Actions (se gh CLI estiver instalado)
if command -v gh &> /dev/null; then
    echo "📊 Verificando GitHub Actions..."
    gh run list --limit 5 --repo jorgepsendziuk/pinovara
    echo ""
else
    echo "ℹ️  Para verificar GitHub Actions via CLI, instale: brew install gh"
    echo "📊 Ou acesse: https://github.com/jorgepsendziuk/pinovara/actions"
    echo ""
fi

# Verificar se o deploy está ativo localmente
echo "🔧 Verificando processos locais..."
if command -v pm2 &> /dev/null; then
    echo "PM2 Status:"
    pm2 list | grep pinovara || echo "Nenhum processo PINOVARA encontrado localmente"
else
    echo "PM2 não instalado localmente"
fi
echo ""

# Instruções para verificação manual
echo "🌐 VERIFICAÇÃO MANUAL DO DEPLOY:"
echo "================================"
echo ""
echo "1. **Verificar Backend (porta 3001):**"
echo "   curl http://[SEU_SERVIDOR]:3001/health"
echo "   ou acesse http://[SEU_SERVIDOR]:3001 no browser"
echo ""
echo "2. **Verificar Frontend:**"
echo "   curl http://[SEU_SERVIDOR]/"  
echo "   ou acesse http://[SEU_SERVIDOR] no browser"
echo ""
echo "3. **Verificar logs do servidor (se tiver SSH):**"
echo "   ssh [USER]@[SERVER] 'pm2 logs pinovara-backend'"
echo "   ssh [USER]@[SERVER] 'pm2 status'"
echo ""
echo "4. **Verificar arquivos no servidor:**"
echo "   ssh [USER]@[SERVER] 'ls -la /var/www/pinovara/backend/'"
echo ""

echo "🎯 Status: Aguardando resultado do GitHub Actions..."
echo "📊 Monitore em: https://github.com/jorgepsendziuk/pinovara/actions"
