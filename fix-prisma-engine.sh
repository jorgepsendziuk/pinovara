#!/bin/bash

# Script para corrigir problema do query engine do Prisma
# Cria o arquivo base64 necessário quando falta

echo "🔧 Verificando e corrigindo query engine do Prisma..."

cd /Users/jorgepsendziuk/Documents/pinovara/backend

# Verificar se o arquivo base64 já existe
if [ -f "node_modules/@prisma/client/runtime/query_engine_bg.postgresql.wasm-base64.js" ]; then
    echo "✅ Arquivo base64 já existe!"
else
    echo "📦 Criando arquivo base64 do query engine..."

    # Criar o arquivo base64
    node -e "
    const fs = require('fs');
    try {
        const wasm = fs.readFileSync('node_modules/@prisma/client/runtime/query_engine_bg.postgresql.wasm');
        const base64 = wasm.toString('base64');
        fs.writeFileSync('node_modules/@prisma/client/runtime/query_engine_bg.postgresql.wasm-base64.js', \`module.exports = '\${base64}';\`);
        console.log('✅ Arquivo base64 criado com sucesso!');
    } catch (error) {
        console.error('❌ Erro ao criar arquivo base64:', error.message);
        process.exit(1);
    }
    "

    if [ $? -eq 0 ]; then
        echo "🎉 Query engine corrigido!"
    else
        echo "❌ Falha ao corrigir query engine"
        exit 1
    fi
fi

echo ""
echo "📋 Para testar se funcionou:"
echo "   cd backend && npx prisma generate"
echo "   cd backend && npx prisma db push"
