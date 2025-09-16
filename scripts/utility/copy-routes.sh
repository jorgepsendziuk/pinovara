#!/bin/bash

# ==========================================
# 📋 PINOVARA - Copiar Arquivos de Rotas
# ==========================================
# Copia arquivos de rotas diretamente para o servidor

if [ $# -lt 2 ]; then
    echo "Usage: $0 <server> <user> [port]"
    echo "Example: $0 pinovaraufba.com.br root 22"
    exit 1
fi

SERVER_HOST=$1
SERVER_USER=$2
SERVER_PORT=${3:-22}

echo "Copying route files to $SERVER_USER@$SERVER_HOST:$SERVER_PORT..."

# Create directories on server
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "sudo mkdir -p /var/www/pinovara/backend/src/routes"

# Copy route files
scp -P $SERVER_PORT backend/src/routes/*.ts $SERVER_USER@$SERVER_HOST:/tmp/

# Move to correct location
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "sudo cp /tmp/*.ts /var/www/pinovara/backend/src/routes/"

# Verify files
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "ls -la /var/www/pinovara/backend/src/routes/"

echo "Route files copied successfully!"
