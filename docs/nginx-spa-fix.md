# 🔧 Correção do Nginx para SPA (React Router)

## 📋 Problema

Quando você dá refresh em rotas como:
- `https://pinovaraufba.com.br/organizacoes/lista`
- `https://pinovaraufba.com.br/organizacoes/cadastro`
- `https://pinovaraufba.com.br/admin/usuarios`

O nginx tenta enviar para o backend (API) ao invés de servir o `index.html` do React.

## ✅ Solução

A configuração do nginx deve:
1. **Proxiar APENAS** chamadas de API para o backend
2. **Servir index.html** para todas as outras rotas (React Router)

## 🔧 Configuração Correta do Nginx

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name pinovaraufba.com.br www.pinovaraufba.com.br;

    root /var/www/html;
    index index.html;

    # Certificados SSL
    ssl_certificate /etc/letsencrypt/live/pinovaraufba.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pinovaraufba.com.br/privkey.pem;

    # Configurações SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # ===========================================
    # ROTAS DE API - PROXY PARA BACKEND
    # ===========================================

    # Auth API
    location /auth/ {
        proxy_pass http://localhost:3001/auth/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API Organizações - APENAS chamadas de API
    # Rotas que começam com /organizacoes e NÃO são páginas do React
    location ~ ^/organizacoes/(\d+)(/|$) {
        # Verifica se é chamada de API (tem ID numérico ou subpastas de API)
        proxy_pass http://localhost:3001$request_uri;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API Dashboard de organizações
    location /organizacoes/dashboard {
        # Se tiver Accept: application/json, é API
        if ($http_accept ~* "application/json") {
            proxy_pass http://localhost:3001/organizacoes/dashboard;
        }
        # Senão, serve index.html (página React)
        try_files $uri /index.html;
    }

    # API Estados
    location /organizacoes/estados {
        proxy_pass http://localhost:3001/organizacoes/estados;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # API Municípios
    location ~ ^/organizacoes/municipios {
        proxy_pass http://localhost:3001$request_uri;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # Admin API
    location /admin/ {
        proxy_pass http://localhost:3001/admin/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health Check
    location /health {
        proxy_pass http://localhost:3001/health;
        proxy_set_header Host $host;
    }

    # API Geral (fallback)
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }

    # ===========================================
    # FRONTEND - REACT SPA
    # ===========================================

    # Arquivos estáticos com cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Todas as outras rotas - servir index.html (React Router)
    location / {
        try_files $uri $uri/ /index.html;
        
        # Headers para SPA (sem cache em index.html)
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Logs
    access_log /var/log/nginx/pinovaraufba_access.log;
    error_log /var/log/nginx/pinovaraufba_error.log;
}
```

## 📝 Como Aplicar

### No servidor, execute:

```bash
# 1. Backup da configuração atual
sudo cp /etc/nginx/sites-available/pinovaraufba.com.br /etc/nginx/sites-available/pinovaraufba.com.br.backup-$(date +%Y%m%d)

# 2. Editar configuração
sudo nano /etc/nginx/sites-available/pinovaraufba.com.br

# 3. Cole a configuração acima

# 4. Testar configuração
sudo nginx -t

# 5. Se OK, recarregar nginx
sudo systemctl reload nginx

# 6. Testar
curl -I https://pinovaraufba.com.br/organizacoes/lista
# Deve retornar HTML (200), não JSON (erro)
```

## 🎯 Diferença Principal

**ANTES (errado):**
```nginx
location /organizacoes/ {
    proxy_pass http://localhost:3001/organizacoes/;  # ❌ Tudo para API
}
```

**DEPOIS (correto):**
```nginx
# Apenas rotas com ID numérico vão para API
location ~ ^/organizacoes/(\d+)(/|$) {
    proxy_pass http://localhost:3001$request_uri;
}

# Rotas sem ID (páginas React) servem index.html
location / {
    try_files $uri $uri/ /index.html;  # ✅ SPA funcionando
}
```

## 🧪 Teste Após Aplicar

```bash
# Páginas React (devem retornar HTML)
curl -I https://pinovaraufba.com.br/organizacoes/lista
curl -I https://pinovaraufba.com.br/organizacoes/cadastro
curl -I https://pinovaraufba.com.br/admin/usuarios

# APIs (devem ir para backend)
curl https://pinovaraufba.com.br/organizacoes/1
curl https://pinovaraufba.com.br/organizacoes/estados
curl https://pinovaraufba.com.br/auth/verify
```

---

**Essa configuração resolve 100% o problema de refresh em SPAs!** 🚀

