#!/usr/bin/env bash
# ==========================================
# Teste de deploy LOCAL (outras portas)
# ==========================================
# Simula o pacote de deploy e sobe backend + frontend
# em portas diferentes para não conflitar com o dev (3001, 5173).
#
# Uso:
#   ./scripts/deploy/test-deploy-local.sh
#   BACKEND_PORT=3003 FRONTEND_PORT=5175 ./scripts/deploy/test-deploy-local.sh
#
# Backend: http://localhost:${BACKEND_PORT}
# Frontend: http://localhost:${FRONTEND_PORT}
# ==========================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
DEPLOY_LOCAL_DIR="$ROOT_DIR/.deploy-local"

# Portas (evitar 3001 e 5173 do ambiente de dev)
BACKEND_PORT="${BACKEND_PORT:-3002}"
FRONTEND_PORT="${FRONTEND_PORT:-5174}"

echo ""
echo "🧪 PINOVARA - Teste de deploy local"
echo "===================================="
echo "   Backend:  http://localhost:$BACKEND_PORT"
echo "   Frontend: http://localhost:$FRONTEND_PORT"
echo "   Diretório de teste: $DEPLOY_LOCAL_DIR"
echo ""

# ---------- Build backend ----------
echo "📦 [1/6] Build do backend..."
cd "$BACKEND_DIR"
npm run build
echo "   ✅ Backend compilado"

# ---------- Prisma Client (do Docker = mesmo caminho do deploy real) ----------
PRISMA_CLIENT_DIR="$ROOT_DIR/prisma-client"
echo "📦 [2/6] Prisma Client (via Docker, como no deploy remoto)..."

if command -v docker >/dev/null 2>&1; then
  echo "   🐳 Gerando Prisma no Docker (binaryTargets: native, debian-openssl-3.0.x, linux-musl)..."
  cd "$BACKEND_DIR"
  docker build --target prisma-generator -t pinovara-backend:prisma-generator . || {
    echo "   ❌ Docker build falhou. Abortando."
    exit 1
  }
  rm -rf "$PRISMA_CLIENT_DIR"
  mkdir -p "$PRISMA_CLIENT_DIR"
  CONTAINER_ID=$(docker create pinovara-backend:prisma-generator)
  docker cp "$CONTAINER_ID:/app/node_modules/@prisma" "$PRISMA_CLIENT_DIR/@prisma" || {
    docker rm $CONTAINER_ID
    echo "   ❌ Falha ao extrair @prisma do container"
    exit 1
  }
  docker cp "$CONTAINER_ID:/app/node_modules/.prisma" "$PRISMA_CLIENT_DIR/.prisma" || {
    docker rm $CONTAINER_ID
    echo "   ❌ Falha ao extrair .prisma do container"
    exit 1
  }
  docker rm $CONTAINER_ID
  echo "   ✅ Prisma Client extraído do Docker"
else
  if [ -d "$PRISMA_CLIENT_DIR/.prisma" ] && [ -d "$PRISMA_CLIENT_DIR/@prisma" ]; then
    echo "   ℹ️ Docker não disponível; usando prisma-client/ de execução anterior"
  elif [ -d "$BACKEND_DIR/node_modules/.prisma" ] && [ -d "$BACKEND_DIR/node_modules/@prisma" ]; then
    echo "   ⚠️ Docker não disponível; usando Prisma do backend/node_modules (não testa binaryTargets do deploy!)"
    mkdir -p "$PRISMA_CLIENT_DIR"
    cp -r "$BACKEND_DIR/node_modules/.prisma" "$PRISMA_CLIENT_DIR/"
    cp -r "$BACKEND_DIR/node_modules/@prisma" "$PRISMA_CLIENT_DIR/"
  else
    echo "   ❌ Docker não está rodando e não há Prisma Client. Inicie o Docker ou rode: cd backend && npx prisma generate"
    exit 1
  fi
fi

# ---------- Build frontend com API na porta do backend de teste ----------
echo "📦 [3/6] Build do frontend (VITE_API_URL=http://localhost:$BACKEND_PORT)..."
cd "$FRONTEND_DIR"
if [ -f "scripts/generate-version.cjs" ]; then
  node scripts/generate-version.cjs
fi
VITE_API_URL="http://localhost:$BACKEND_PORT" npm run build
echo "   ✅ Frontend compilado"

# ---------- Montar diretório de “deploy” local ----------
echo "📦 [4/6] Montando pacote de teste em $DEPLOY_LOCAL_DIR..."
rm -rf "$DEPLOY_LOCAL_DIR"
mkdir -p "$DEPLOY_LOCAL_DIR"

# Conteúdo igual ao que o GitHub envia (estrutura mínima para rodar)
cp "$BACKEND_DIR/package.json" "$DEPLOY_LOCAL_DIR/"
cp "$BACKEND_DIR/package-lock.json" "$DEPLOY_LOCAL_DIR/" 2>/dev/null || true
cp -r "$BACKEND_DIR/dist" "$DEPLOY_LOCAL_DIR/"
cp -r "$BACKEND_DIR/prisma" "$DEPLOY_LOCAL_DIR/"

# node_modules: instalar só produção e colar Prisma gerado
cd "$DEPLOY_LOCAL_DIR"
if [ -f "package-lock.json" ]; then
  npm ci --omit=dev 2>/dev/null || npm install --omit=dev
else
  npm install --omit=dev
fi
mkdir -p "$DEPLOY_LOCAL_DIR/node_modules/.prisma" "$DEPLOY_LOCAL_DIR/node_modules/@prisma"
rm -rf "$DEPLOY_LOCAL_DIR/node_modules/.prisma" "$DEPLOY_LOCAL_DIR/node_modules/@prisma"
# Usar Prisma que veio do Docker (prisma-client/) ou fallback do backend
if [ -d "$PRISMA_CLIENT_DIR/.prisma" ] && [ -d "$PRISMA_CLIENT_DIR/@prisma" ]; then
  cp -r "$PRISMA_CLIENT_DIR/.prisma" "$DEPLOY_LOCAL_DIR/node_modules/"
  cp -r "$PRISMA_CLIENT_DIR/@prisma" "$DEPLOY_LOCAL_DIR/node_modules/"
else
  cp -r "$BACKEND_DIR/node_modules/.prisma" "$DEPLOY_LOCAL_DIR/node_modules/"
  cp -r "$BACKEND_DIR/node_modules/@prisma" "$DEPLOY_LOCAL_DIR/node_modules/"
fi

# .env para teste (PORT = porta do backend de teste)
if [ -f "$BACKEND_DIR/.env" ]; then
  cp "$BACKEND_DIR/.env" "$DEPLOY_LOCAL_DIR/.env"
  # Garantir PORT da porta de teste (compatível macOS e Linux)
  if grep -q '^PORT=' "$DEPLOY_LOCAL_DIR/.env"; then
    sed "s/^PORT=.*/PORT=$BACKEND_PORT/" "$DEPLOY_LOCAL_DIR/.env" > "$DEPLOY_LOCAL_DIR/.env.tmp"
    mv "$DEPLOY_LOCAL_DIR/.env.tmp" "$DEPLOY_LOCAL_DIR/.env"
  else
    echo "PORT=$BACKEND_PORT" >> "$DEPLOY_LOCAL_DIR/.env"
  fi
else
  echo "PORT=$BACKEND_PORT" > "$DEPLOY_LOCAL_DIR/.env"
  echo "NODE_ENV=production" >> "$DEPLOY_LOCAL_DIR/.env"
  echo "DATABASE_URL=postgresql://pinovara:pinovara@bd.pinovaraufba.com.br:5432/pinovara?schema=pinovara" >> "$DEPLOY_LOCAL_DIR/.env"
  echo "JWT_SECRET=test-local-secret" >> "$DEPLOY_LOCAL_DIR/.env"
fi

echo "   ✅ Pacote montado"

# ---------- Subir backend (em background) ----------
# Liberar porta para evitar EADDRINUSE (teste local)
if command -v lsof >/dev/null 2>&1; then
  (lsof -ti :$BACKEND_PORT | xargs kill -9) 2>/dev/null || true
  sleep 1
fi
echo "🚀 [5/6] Iniciando backend na porta $BACKEND_PORT..."
cd "$DEPLOY_LOCAL_DIR"
# O server compilado procura .env em __dirname/../.env = .deploy-local/.env
PORT="$BACKEND_PORT" node dist/server.js &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Esperar backend responder
for i in $(seq 1 15); do
  if curl -s "http://localhost:$BACKEND_PORT/health" > /dev/null 2>&1; then
    echo "   ✅ Backend respondendo em http://localhost:$BACKEND_PORT"
    break
  fi
  if [ $i -eq 15 ]; then
    echo "   ❌ Backend não respondeu em 15s. Encerrando."
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
done

# ---------- Subir frontend (serve estático) ----------
echo "🚀 [6/6] Iniciando frontend na porta $FRONTEND_PORT..."
if command -v npx >/dev/null 2>&1; then
  npx -y serve -s "$FRONTEND_DIR/dist" -l "$FRONTEND_PORT" &
  FRONTEND_PID=$!
  echo "   Frontend PID: $FRONTEND_PID"
  sleep 2
  echo "   ✅ Frontend em http://localhost:$FRONTEND_PORT"
else
  echo "   ⚠️ npx não encontrado; frontend não iniciado. Abra $FRONTEND_DIR/dist manualmente."
  FRONTEND_PID=""
fi

echo ""
echo "=========================================="
echo "✅ Deploy local em execução"
echo "=========================================="
echo "   Backend:  http://localhost:$BACKEND_PORT"
echo "   Health:   http://localhost:$BACKEND_PORT/health"
echo "   Frontend: http://localhost:$FRONTEND_PORT"
echo ""
echo "Pressione Ctrl+C para encerrar backend e frontend."
echo ""

cleanup() {
  echo ""
  echo "Encerrando..."
  kill $BACKEND_PID 2>/dev/null || true
  [ -n "$FRONTEND_PID" ] && kill $FRONTEND_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

wait $BACKEND_PID 2>/dev/null || true
