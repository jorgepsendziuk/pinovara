# ================================
# PINOVARA Backend - Dockerfile Multi-Stage
# ================================
# Gera Prisma Client durante o build, evitando falhas no deploy remoto

# Stage 1: Gerar Prisma Client
FROM node:18-alpine AS prisma-generator
WORKDIR /app

# Copiar arquivos necessários para gerar Prisma Client
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências (incluindo Prisma CLI)
RUN npm ci

# Gerar Prisma Client
RUN npx prisma generate

# Stage 2: Preparar aplicação com Prisma Client
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Copiar código compilado
COPY dist ./dist/

# Copiar Prisma Client gerado do Stage 1
# Garantir que diretórios existem
RUN mkdir -p ./node_modules/@prisma ./node_modules/.prisma
COPY --from=prisma-generator /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=prisma-generator /app/node_modules/.prisma ./node_modules/.prisma

# Stage 3: Imagem de produção minimal
FROM node:18-alpine AS production
WORKDIR /app

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar arquivos do builder com permissões corretas
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3001

# Comando de inicialização
CMD ["node", "dist/server.js"]

