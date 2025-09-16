# 🔧 Correções do Nginx - PINOVARA

## 📋 Problemas Resolvidos

### 1. Erro 405 Method Not Allowed no `/auth/login`
**Problema:** O endpoint `POST https://pinovaraufba.com.br/auth/login` retornava erro 405.

**Causa:** O nginx não tinha regra para redirecionar `/auth/*` para o backend.

**Solução:** Adicionada regra `location /auth/` no nginx.

### 2. Erro "Unexpected token '<'" no Frontend
**Problema:** Frontend recebia HTML em vez de JSON, causando erro de parsing.

**Causa:** Endpoints como `/admin/*`, `/users/*`, `/modules/*`, `/organizacoes/*` não tinham regras no nginx.

**Solução:** Adicionadas regras completas para todas as rotas da API.

## 🛠️ Configuração Implementada

### Rotas Configuradas no Nginx

```nginx
# Autenticação
location /auth/ {
    proxy_pass http://localhost:3001/auth/;
    # ... configurações CORS e proxy
}

# Administração
location /admin/ {
    proxy_pass http://localhost:3001/admin/;
    # ... configurações CORS e proxy
}

# Usuários
location /users/ {
    proxy_pass http://localhost:3001/users/;
    # ... configurações CORS e proxy
}

# Módulos
location /modules/ {
    proxy_pass http://localhost:3001/modules/;
    # ... configurações CORS e proxy
}

# Organizações
location /organizacoes/ {
    proxy_pass http://localhost:3001/organizacoes/;
    # ... configurações CORS e proxy
}

# API Geral
location /api/ {
    proxy_pass http://localhost:3001/;
    # ... configurações CORS e proxy
}

# Health Check
location /health {
    proxy_pass http://localhost:3001/health;
    # ... configurações CORS e proxy
}
```

### Certificados SSL
- Adicionados certificados SSL do Let's Encrypt
- Configurações SSL otimizadas para segurança

### CORS Headers
- Headers CORS configurados para todas as rotas
- Suporte a preflight requests (OPTIONS)
- Credenciais habilitadas para autenticação

## 🧪 Testes Realizados

### ✅ Endpoints Funcionando

**Autenticação:**
- `POST /auth/login` - Login de usuários
- `POST /auth/register` - Registro de usuários
- `GET /auth/me` - Dados do usuário atual
- `POST /auth/logout` - Logout

**Administração:**
- `GET /admin/system-info` - Informações do sistema
- `GET /admin/audit-logs` - Logs de auditoria
- `GET /admin/settings` - Configurações do sistema

**Usuários:**
- `GET /users` - Lista de usuários
- `GET /users/:id` - Dados de usuário específico
- `PUT /users/:id/status` - Atualizar status do usuário

**Módulos:**
- `GET /modules` - Lista de módulos
- `POST /modules` - Criar módulo
- `PUT /modules/:id` - Atualizar módulo

**Organizações:**
- `GET /organizacoes` - Lista de organizações
- `POST /organizacoes` - Criar organização
- `PUT /organizacoes/:id` - Atualizar organização

**Sistema:**
- `GET /health` - Health check do sistema

## 🚀 Como Aplicar as Correções

### Opção 1: Script Automatizado
```bash
cd /var/www/pinovara
chmod +x fix-nginx-config.sh
./fix-nginx-config.sh
```

### Opção 2: Manual
1. Fazer backup da configuração atual
2. Aplicar nova configuração do nginx
3. Testar configuração: `sudo nginx -t`
4. Recarregar nginx: `sudo systemctl reload nginx`
5. Testar endpoints

## 📊 Resultados

### Antes das Correções
- ❌ `POST /auth/login` → 405 Method Not Allowed
- ❌ `GET /admin/system-info` → HTML (404)
- ❌ Frontend → "Unexpected token '<'" errors

### Depois das Correções
- ✅ `POST /auth/login` → JSON response (200/401)
- ✅ `GET /admin/system-info` → JSON response (403 - acesso negado)
- ✅ Frontend → Todas as chamadas API funcionando

## 🔍 Monitoramento

### Logs do Nginx
```bash
# Logs de acesso
sudo tail -f /var/log/nginx/pinovaraufba_access.log

# Logs de erro
sudo tail -f /var/log/nginx/pinovaraufba_error.log
```

### Teste de Conectividade
```bash
# Health check
curl https://pinovaraufba.com.br/health

# Teste de login
curl -X POST https://pinovaraufba.com.br/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@pinovara.com.br","password":"Demo123"}'
```

## 📝 Notas Importantes

1. **Certificados SSL:** Certificados do Let's Encrypt devem estar válidos
2. **Backend:** Servidor Node.js deve estar rodando na porta 3001
3. **CORS:** Configuração permite apenas `https://pinovaraufba.com.br`
4. **Proxy:** Todas as requisições são redirecionadas para `localhost:3001`

## 🎯 Status Final

✅ **Sistema 100% Funcional**
- Todas as rotas da API funcionando
- Autenticação JWT operacional
- Frontend recebendo respostas JSON válidas
- CORS configurado corretamente
- SSL funcionando
- Health checks operacionais