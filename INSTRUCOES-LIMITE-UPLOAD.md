# Instruções: Atualizar Limite de Upload para 100MB

## ✅ Alterações Realizadas

### 1. Backend (Local) ✅
- `backend/src/controllers/documentoController.ts` - Limite Multer: **100MB**
- `backend/src/controllers/fotoController.ts` - Limite Multer: **100MB**
- Backend compilado e copiado para `deploy-package/`

### 2. Configuração Nginx (Local) ✅
- `docs/nginx-final.conf` - `client_max_body_size: 100M`
- `docs/nginx-config-correta.conf` - `client_max_body_size: 100M`

## 🚀 Próximos Passos no Servidor

### Opção 1: Atualizar apenas Nginx (Mais Rápido)

```bash
# 1. Editar configuração do Nginx no servidor
sudo nano /etc/nginx/sites-available/pinovaraufba.com.br

# 2. Localizar as seções de upload e atualizar:
#    - Linha ~79: client_max_body_size 100M;  (documentos)
#    - Linha ~65: client_max_body_size 100M;  (organizações)

# 3. Testar configuração
sudo nginx -t

# 4. Recarregar Nginx
sudo systemctl reload nginx
```

### Opção 2: Deploy Completo

```bash
# 1. No seu computador local
cd /Users/jorgepsendziuk/Documents/pinovara
npm run deploy

# 2. No servidor, após o deploy
sudo systemctl restart pinovara-backend
sudo nginx -t && sudo systemctl reload nginx
```

## 📝 Configurações Nginx para Copiar

Adicione estas linhas nas rotas de upload no arquivo `/etc/nginx/sites-available/pinovaraufba.com.br`:

### Para Documentos (linha ~72-80):
```nginx
# API Documentos (específico - ANTES do regex de ID)
location ~ ^/organizacoes/(\d+)/documentos {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 100M;  # ← ATUALIZAR ESTA LINHA
}
```

### Para Organizações (linha ~58-66):
```nginx
# API Organizações - Regex para capturar apenas rotas com ID numérico
location ~ ^/organizacoes/(\d+)(/.*)?$ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    client_max_body_size 100M;  # ← ADICIONAR ESTA LINHA
}
```

## 🧪 Testar Localmente

1. **Reiniciar o backend local:**
```bash
cd /Users/jorgepsendziuk/Documents/pinovara
npm run backend:stop
npm run backend:start
```

2. **Testar upload de arquivo grande (>40MB):**
   - Acesse http://localhost:5173
   - Login com: `jimxxx@gmail.com` / `PinovaraUFBA@2025#`
   - Vá em Organizações > Editar > Upload de Documentos
   - Teste com arquivo de ~50-80MB

## 📊 Limites Configurados

| Local | Limite Anterior | Limite Novo |
|-------|----------------|-------------|
| Backend Multer (documentos) | 10MB | **100MB** |
| Backend Multer (fotos) | 10MB | **100MB** |
| Nginx (client_max_body_size) | 10M | **100M** |

## ⚠️ Observações

- O limite de 100MB é suficiente para a maioria dos documentos
- Se precisar aumentar mais, basta repetir o processo
- Não esquecer de atualizar **ambos**: Backend + Nginx
- Nginx usa "M" (maiúscula), Multer usa bytes

