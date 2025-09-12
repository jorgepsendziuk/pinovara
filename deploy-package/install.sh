#!/bin/bash
echo "🚀 Instalando PINOVARA no servidor..."

# Instalar dependências do backend
cd /var/www/pinovara/backend
npm install

# Copiar arquivos compilados
cp -r /tmp/deploy-package/backend-dist/* /var/www/pinovara/backend/dist/

# Copiar frontend
sudo cp -r /tmp/deploy-package/* /var/www/html/
sudo rm -rf /var/www/html/backend-dist
sudo rm -rf /var/www/html/backend-package.json
sudo rm -rf /var/www/html/prisma

# Reiniciar serviços
pm2 restart pinovara-backend
sudo systemctl reload nginx

echo "✅ Instalação concluída!"
