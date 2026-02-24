# Admin 404 no servidor remoto (Módulos e Permissões)

Se a tela **Módulos e Permissões** funciona em local mas no remoto aparece "Endpoint não encontrado" ou "Falha ao carregar módulos", siga este checklist.

## 1. Nginx: proxy de `/admin/` para o backend

O frontend chama `GET /admin/modules` e `GET /admin/roles` na **mesma origem** do site (ex.: `https://pinovaraufba.com.br/admin/modules`). O Nginx precisa encaminhar esses pedidos para o backend.

No servidor, confira se o arquivo de configuração do Nginx contém:

```nginx
# Admin API (módulos, papéis, usuários, permissões)
location /admin/ {
    proxy_pass http://localhost:3001/admin/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

- Se **não existir**, copie o bloco de `docs/nginx-final.conf` para o config ativo do site e recarregue o Nginx:
  ```bash
  sudo nginx -t && sudo systemctl reload nginx
  ```
- Se o backend **não** estiver em `localhost:3001`, ajuste `proxy_pass` para o host/porta corretos.

## 2. Backend atualizado com rotas de admin

O backend Express registra as rotas em `backend/src/routes/index.ts` com `router.use('/admin', adminRoutes)`.

- Confirme que o deploy do backend no servidor inclui a pasta/compilado com `adminRoutes` e `adminController` (build atual).
- Reinicie o processo do backend (ex.: PM2) após o deploy:
  ```bash
  pm2 restart pinovara-backend
  pm2 save
  ```

## 3. Testar no servidor

No servidor (via SSH), teste se o backend responde em `/admin/modules` e `/admin/roles`:

```bash
# Health do backend
curl -s http://localhost:3001/health

# Lista de endpoints (deve incluir admin)
curl -s http://localhost:3001/ | head -80

# Admin (vai retornar 401 sem token; 404 = rota não existe)
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/admin/modules
# Esperado: 401. Se 404, o backend não tem a rota /admin.
```

- Se `curl http://localhost:3001/admin/modules` retornar **404**, o código do backend no servidor não tem as rotas de admin (deploy antigo ou build incorreto).
- Se retornar **401**, a rota existe; aí o problema costuma ser Nginx (pedidos do browser não chegando em `localhost:3001`) ou CORS/origem.

## 4. Build do frontend (VITE_API_URL)

O frontend usa a mesma base URL do axios (`api.defaults.baseURL`), que em produção vem de `VITE_API_URL` no build.

- Em produção, o site deve chamar a API na **mesma origem** (ex.: `https://pinovaraufba.com.br`) para que o Nginx faça o proxy.
- Se o build usar algo como `VITE_API_URL=https://outro-dominio.com`, as chamadas vão para esse outro domínio; aí é preciso ter Nginx (ou CORS) configurado nesse outro domínio também.
- Para mesma origem, não defina `VITE_API_URL` no build ou defina como a URL do próprio site (ex.: `https://pinovaraufba.com.br`).

## Resumo

| Onde verificar | O que fazer |
|----------------|-------------|
| Nginx          | Garantir `location /admin/ { proxy_pass http://localhost:3001/admin/; ... }` e `reload` |
| Backend        | Deploy atual com rotas de admin e reinício do processo (ex.: PM2) |
| Teste no host  | `curl http://localhost:3001/admin/modules` → 401 = rota existe; 404 = backend sem rota |
| Frontend       | Build com mesma origem (ou VITE_API_URL apontando para o mesmo host que o Nginx proxy) |
