#!/bin/bash

echo "🔍 Verificando arquivos necessários para deploy..."
echo "=============================================="
echo ""

# Verificar estrutura de diretórios
echo "📁 Verificando estrutura de diretórios:"
[ -d "backend" ] && echo "✅ backend/" || echo "❌ backend/ não encontrado"
[ -d "frontend" ] && echo "✅ frontend/" || echo "❌ frontend/ não encontrado"
echo ""

# Verificar arquivos do backend
echo "🔧 Verificando arquivos do backend:"
[ -f "backend/package.json" ] && echo "✅ backend/package.json" || echo "❌ backend/package.json não encontrado"
[ -f "backend/package-lock.json" ] && echo "✅ backend/package-lock.json" || echo "❌ backend/package-lock.json não encontrado"
[ -d "backend/dist" ] && echo "✅ backend/dist/" || echo "❌ backend/dist/ não encontrado"
[ -d "backend/prisma" ] && echo "✅ backend/prisma/" || echo "❌ backend/prisma/ não encontrado"
[ -f "backend/prisma/schema.prisma" ] && echo "✅ backend/prisma/schema.prisma" || echo "❌ backend/prisma/schema.prisma não encontrado"
echo ""

# Verificar arquivos do frontend
echo "🎨 Verificando arquivos do frontend:"
[ -f "frontend/package.json" ] && echo "✅ frontend/package.json" || echo "❌ frontend/package.json não encontrado"
[ -f "frontend/package-lock.json" ] && echo "✅ frontend/package-lock.json" || echo "❌ frontend/package-lock.json não encontrado"
[ -d "frontend/dist" ] && echo "✅ frontend/dist/" || echo "❌ frontend/dist/ não encontrado"
[ -f "frontend/dist/index.html" ] && echo "✅ frontend/dist/index.html" || echo "❌ frontend/dist/index.html não encontrado"
echo ""

# Verificar se builds são necessários
echo "🔨 Verificando se builds são necessários:"
if [ -d "backend/src" ] && [ ! -d "backend/dist" ]; then
  echo "⚠️  Backend precisa ser compilado (npm run build)"
fi

if [ -d "frontend/src" ] && [ ! -d "frontend/dist" ]; then
  echo "⚠️  Frontend precisa ser compilado (npm run build)"
fi
echo ""

# Contar arquivos
if [ -d "backend/dist" ]; then
  backend_files=$(find backend/dist -type f | wc -l)
  echo "📊 Arquivos no backend/dist: $backend_files"
fi

if [ -d "frontend/dist" ]; then
  frontend_files=$(find frontend/dist -type f | wc -l)
  echo "📊 Arquivos no frontend/dist: $frontend_files"
fi

echo ""
echo "✅ Verificação concluída!"
echo "💡 Execute este script antes de fazer push para o GitHub"
