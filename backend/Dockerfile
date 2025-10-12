# ================================
# PINOVARA Backend - Dockerfile
# ================================
# Multi-stage build para otimizar tamanho da imagem
# Inclui cliente Prisma já gerado para evitar travamentos

# ========== STAGE 1: Dependencies (Production) ==========
FROM node:20-alpine AS deps
# Instalar dependências do sistema para Prisma
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production && npm cache clean --force

# ========== STAGE 1.5: Dev Dependencies ==========
FROM node:20-alpine AS dev-deps
# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar TODAS as dependências (incluindo dev)
RUN npm install && npm cache clean --force

# ========== STAGE 2: Builder ==========
FROM node:20-alpine AS builder

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copiar node_modules com dev dependencies
COPY --from=dev-deps /app/node_modules ./node_modules

# Copiar arquivos do projeto
COPY . .

# Garantir que o cliente Prisma está gerado
RUN npx prisma generate --schema=./prisma/schema.prisma

# Build da aplicação
RUN npm run build

# ========== STAGE 3: Runner (Produção) ==========
FROM node:20-alpine AS runner

# Instalar dependências de produção e dumb-init
RUN apk add --no-cache libc6-compat openssl ca-certificates dumb-init

WORKDIR /app

# Criar usuário não-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 pinovara

# Copiar arquivos necessários
COPY --from=builder --chown=pinovara:nodejs /app/dist ./dist
COPY --from=builder --chown=pinovara:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=pinovara:nodejs /app/prisma ./prisma
COPY --from=builder --chown=pinovara:nodejs /app/package*.json ./

# Criar diretório de logs com permissões corretas
RUN mkdir -p /app/logs && chown -R pinovara:nodejs /app/logs

# Trocar para usuário não-root
USER pinovara

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http=require('http');const req=http.request({hostname:'localhost',port:3001,path:'/health'},res=>{process.exit(res.statusCode===200?0:1)});req.on('error',()=>process.exit(1));req.end();"

# Comando de inicialização
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]
