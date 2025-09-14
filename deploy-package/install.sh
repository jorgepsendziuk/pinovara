#!/bin/bash
echo "🚀 Instalando PINOVARA no servidor..."

# Definir ambiente de produção
export NODE_ENV=production

# Instalar dependências do backend
cd /var/www/pinovara/backend
npm install

# Copiar arquivos compilados
cp -r /tmp/deploy-package/backend-dist/* /var/www/pinovara/backend/dist/

# Copiar configuração de produção se existir
if [ -f "/tmp/deploy-package/backend-dist/production.config.js" ]; then
    cp /tmp/deploy-package/backend-dist/production.config.js /var/www/pinovara/backend/
    echo "✅ Configuração de produção copiada"
fi

# Configurar variáveis de ambiente para produção
cat > /var/www/pinovara/backend/.env << 'EOL'
NODE_ENV=production
DATABASE_URL=postgresql://pinovara:pinovara@10.158.0.2:5432/pinovara?schema=pinovara
JWT_SECRET=pinovara-secret-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=https://pinovaraufba.com.br
EOL

# Copiar frontend
sudo cp -r /tmp/deploy-package/* /var/www/html/
sudo rm -rf /var/www/html/backend-dist
sudo rm -rf /var/www/html/backend-package.json
sudo rm -rf /var/www/html/prisma

# Reiniciar serviços
pm2 restart pinovara-backend
sudo systemctl reload nginx

echo "✅ Instalação concluída!"
echo "🌐 Site disponível em: https://pinovaraufba.com.br"
echo "🗄️  Banco configurado para: 10.158.0.2"
