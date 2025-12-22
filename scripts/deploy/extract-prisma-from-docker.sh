#!/bin/bash

# ================================
# Extract Prisma Client from Docker Image
# ================================
# Helper script to extract Prisma Client from a built Docker image
# Useful for debugging or manual extraction

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
OUTPUT_DIR="$PROJECT_ROOT/prisma-client"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Extracting Prisma Client from Docker Image${NC}"
echo ""

# Verificar se Docker está disponível
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}❌ Docker not found. Please install Docker first.${NC}"
    exit 1
fi

# Verificar se Dockerfile existe
if [ ! -f "$BACKEND_DIR/Dockerfile" ]; then
    echo -e "${YELLOW}❌ Dockerfile not found at $BACKEND_DIR/Dockerfile${NC}"
    exit 1
fi

# Build da imagem Docker
echo -e "${BLUE}📦 Building Docker image...${NC}"
cd "$BACKEND_DIR"
docker build --target builder -t pinovara-backend:builder . || {
    echo -e "${YELLOW}❌ Failed to build Docker image${NC}"
    exit 1
}

# Criar container temporário
echo -e "${BLUE}📦 Creating temporary container...${NC}"
CONTAINER_ID=$(docker create pinovara-backend:builder)

# Criar diretório de saída
echo -e "${BLUE}📁 Creating output directory...${NC}"
mkdir -p "$OUTPUT_DIR"

# Extrair Prisma Client
echo -e "${BLUE}📦 Extracting Prisma Client...${NC}"
docker cp "$CONTAINER_ID:/app/node_modules/@prisma" "$OUTPUT_DIR/@prisma" || {
    echo -e "${YELLOW}⚠️ Failed to extract @prisma, trying alternative path...${NC}"
    docker cp "$CONTAINER_ID:/app/node_modules/@prisma/client" "$OUTPUT_DIR/@prisma-client" || {
        echo -e "${YELLOW}❌ Failed to extract Prisma Client${NC}"
        docker rm "$CONTAINER_ID"
        exit 1
    }
}

# Extrair .prisma (cache) - opcional
echo -e "${BLUE}📦 Extracting .prisma cache (optional)...${NC}"
docker cp "$CONTAINER_ID:/app/node_modules/.prisma" "$OUTPUT_DIR/.prisma" 2>/dev/null || {
    echo -e "${YELLOW}ℹ️ .prisma cache not found (this is optional)${NC}"
}

# Remover container temporário
docker rm "$CONTAINER_ID"

# Verificar se extração foi bem-sucedida
if [ -d "$OUTPUT_DIR/@prisma" ] || [ -d "$OUTPUT_DIR/@prisma-client" ]; then
    echo -e "${GREEN}✅ Prisma Client extracted successfully!${NC}"
    echo -e "${BLUE}📁 Location: $OUTPUT_DIR${NC}"
    echo ""
    echo "📊 Extracted files:"
    ls -la "$OUTPUT_DIR" | head -10
    if [ -d "$OUTPUT_DIR/@prisma" ]; then
      echo ""
      echo "📦 Prisma Client structure:"
      ls -la "$OUTPUT_DIR/@prisma" | head -5
    fi
    echo ""
    echo -e "${GREEN}You can now use this Prisma Client in your deployment!${NC}"
else
    echo -e "${YELLOW}❌ Prisma Client extraction failed${NC}"
    exit 1
fi

