# 🔍 Diagnóstico - Erro 502 Bad Gateway no Remoto

## 🚨 Problema

```
POST https://pinovaraufba.com.br/organizacoes/13/documentos 502 (Bad Gateway)
GET /organizacoes/13/documentos 502 (Bad Gateway)
GET /organizacoes/13/documentos/3/download 404 (Not Found)
```

## 📋 Causas Possíveis

### 1. Backend não está rodando
```bash
# Verificar se PM2 está rodando
pm2 status

# Ver logs do backend
pm2 logs pinovara-backend --lines 50
```

### 2. Nginx não consegue conectar ao backend
```bash
# Testar conexão direta ao backend
curl http://localhost:3001/health

# Ver logs do nginx
sudo tail -f /var/log/nginx/pinovaraufba_error.log
```

### 3. Rotas de documentos não estão configuradas no nginx
O nginx precisa de rotas específicas para documentos!

## ✅ Solução

### 1. Verificar Backend
```bash
# Status do PM2
pm2 status

# Se não estiver rodando
pm2 start /var/www/pinovara/backend/dist/server.js --name pinovara-backend

# Ver logs
pm2 logs pinovara-backend
```

### 2. Adicionar Rotas de Documentos no Nginx

Edite `/etc/nginx/sites-available/pinovaraufba.com.br` e adicione ANTES do `location /`:

```nginx
# API Documentos - Upload/Download/Delete
# Deve vir ANTES de location ~ ^/organizacoes/(\d+)
location ~ ^/organizacoes/(\d+)/documentos {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Importante para upload de arquivos
    client_max_body_size 10M;
}
```

### 3. Testar e Recarregar
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Verificar Pastas de Upload no Servidor
```bash
# Criar pastas se não existirem
sudo mkdir -p /var/pinovara/shared/uploads/termos-adesao
sudo mkdir -p /var/pinovara/shared/uploads/relatorios
sudo mkdir -p /var/pinovara/shared/uploads/listas-presenca
sudo mkdir -p /var/pinovara/shared/uploads/fotos
sudo mkdir -p /var/pinovara/shared/uploads/temp

# Dar permissões
sudo chown -R www-data:www-data /var/pinovara/shared/uploads
sudo chmod -R 777 /var/pinovara/shared/uploads
```

### 5. Verificar Permissões no Banco
```sql
-- Conectar no banco
psql -h bd.pinovaraufba.com.br -U pinovara -d pinovara

-- Executar
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE pinovara.organizacao_documento TO pinovara;
GRANT USAGE, SELECT ON SEQUENCE pinovara.organizacao_documento_id_seq TO pinovara;
```

## 🧪 Testes

### Teste Backend Direto
```bash
# Health check
curl http://localhost:3001/health

# Teste API documentos (com token válido)
curl -X GET http://localhost:3001/organizacoes/13/documentos \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Teste via Nginx
```bash
# Health check
curl https://pinovaraufba.com.br/health

# API documentos
curl -X GET https://pinovaraufba.com.br/organizacoes/13/documentos \
  -H "Authorization: Bearer SEU_TOKEN"
```

## 📊 Checklist

- [ ] Backend rodando no PM2
- [ ] Backend respondendo em localhost:3001
- [ ] Nginx com rotas de documentos configuradas
- [ ] client_max_body_size configurado
- [ ] Pastas de upload criadas e com permissões
- [ ] Permissões do banco concedidas
- [ ] Nginx testado e recarregado
- [ ] Testes via curl funcionando

## 🔧 Comandos Rápidos

```bash
# Ver tudo de uma vez
pm2 status
curl http://localhost:3001/health
sudo tail -n 20 /var/log/nginx/pinovaraufba_error.log
ls -la /var/pinovara/shared/uploads/
```

---

**O erro 502 indica que o backend não está respondendo ou o nginx não consegue alcançá-lo!**

