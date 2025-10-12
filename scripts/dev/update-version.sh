#!/bin/bash

# Script para atualizar a versão do frontend
# Atualiza o arquivo version.ts e força o hot reload

echo "🔄 Atualizando versão do frontend..."

# Navegar para o diretório do frontend
cd /Users/jorgepsendziuk/Documents/pinovara/frontend

# Gerar nova versão
echo "📝 Gerando nova versão..."
npm run version:generate

# Verificar se o frontend está rodando
if pgrep -f "vite" > /dev/null; then
    echo "✅ Frontend detectado - hot reload automático ativo"
    echo "🌐 Acesse: http://localhost:5173"
else
    echo "⚠️ Frontend não está rodando. Execute: ./scripts/dev/dev-start.sh"
fi

echo "✅ Versão atualizada com sucesso!"
