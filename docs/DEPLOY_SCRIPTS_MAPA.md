# Mapa: Scripts de Deploy e o que o GitHub Executa

## Resumo rápido

| Quem dispara | Workflow | Script no servidor | Arquivo no repositório |
|--------------|----------|--------------------|------------------------|
| **Push em `main`** | `deploy.yml` | **deploy-zero-downtime.sh** | `scripts/deploy/deploy-zero-downtime.sh` |
| **Push em `main`** | `deploy.yml` | deploy-frontend.sh | Gerado inline no workflow (não é arquivo no repo) |
| **Manual (Actions)** | `deploy-full.yml` | deploy-full.sh | Gerado inline no workflow (não é arquivo no repo) |

O GitHub **usa sim** o `deploy-zero-downtime.sh` (o “failsafe” com limpeza da porta 3001). Esse arquivo é copiado do repositório para o pacote de deploy e executado no servidor.

---

## 1. O que o GitHub Actions executa (deploy normal)

**Arquivo:** `.github/workflows/deploy.yml`  
**Quando:** push na branch `main` ou disparo manual do workflow.

### No runner (GitHub):

1. Checkout, setup Node, build backend
2. Docker: gera Prisma Client (stage `prisma-generator`) e extrai para `prisma-client/`
3. Build frontend
4. Monta o pacote em `DEPLOY_DIR`:
   - `package.json`, `package-lock.json`, `dist/`, `prisma/`, `prisma-client/`, `frontend-dist/`, `.env`, `ecosystem.config.js`
   - **Copia** `scripts/deploy/deploy-zero-downtime.sh` → `$DEPLOY_DIR/deploy-zero-downtime.sh`
   - **Cria** `deploy-frontend.sh` (conteúdo em heredoc no workflow)
5. `scp` do `DEPLOY_DIR` para `/tmp/` no servidor
6. SSH no servidor e roda:
   - `bash $DEPLOY_TMP_DIR/deploy-zero-downtime.sh`
   - `bash $DEPLOY_TMP_DIR/deploy-frontend.sh`

Ou seja: o script que sobe no servidor e é executado é o **mesmo** `scripts/deploy/deploy-zero-downtime.sh` do repositório (com a correção da porta 3001).

---

## 2. Scripts na pasta `scripts/deploy/`

| Script | Usado pelo GitHub? | Uso |
|--------|--------------------|-----|
| **deploy-zero-downtime.sh** | Sim (deploy.yml) | Backend: backup, preparar nova versão, parar PM2, liberar porta 3001, instalar deps, copiar Prisma, iniciar, health check, trocar diretórios. |
| deploy-frontend.sh | Não (é inline no workflow) | Só existe no pacote enviado; criado pelo workflow para deploy do frontend. |
| deploy-ftp.sh | Não | Local: monta o .tar.gz para upload FTP. |
| deploy-git-push.sh | Não | Local: commit/push e opcionalmente comandos no servidor. |
| deploy-remote-easy.sh | Não | Local: deploy por rsync. |
| deploy-server.sh | Não | Deploy “robusto” antigo (outro fluxo; ver README da pasta). |
| deploy-safe.sh | Não | Variante de deploy seguro. |
| start-pm2.sh | Não (usado no comando FTP) | Servidor: sobe/restart PM2 com `--cwd` correto. |
| deploy-full (workflow) | deploy-full.yml | Script é **inline** no workflow (deploy-full.sh gerado no job), não é o deploy-zero-downtime.sh. |

Conclusão: o único script da pasta `scripts/deploy/` que o GitHub executa no deploy automático é o **deploy-zero-downtime.sh**.

---

## 3. Deploy Full (manual)

**Arquivo:** `.github/workflows/deploy-full.yml`  
**Quando:** só manual (workflow_dispatch), com confirmação "yes".

- Gera outro pacote (`deploy-full-*`) e outro script **inline** no workflow: `deploy-full.sh`.
- Esse script **não** é o `deploy-zero-downtime.sh`; é um script maior definido dentro do próprio YAML (backup, npm ci, prisma, PM2, frontend, etc.).

Ou seja: o “failsafe” com limpeza de porta é o **deploy normal** (deploy.yml + deploy-zero-downtime.sh). O Deploy Full é outro fluxo, com script próprio.

---

## 4. Conferência rápida antes de testar

1. **Qual script o GitHub usa no deploy automático?**  
   `scripts/deploy/deploy-zero-downtime.sh` (copiado para o servidor e executado).

2. **Esse script já tem a correção da porta 3001?**  
   Sim: para todos os processos PM2, libera a porta 3001 (`fuser -k`), verifica e só então inicia a nova versão.

3. **O workflow copia o arquivo do repo?**  
   Sim. Trecho em `deploy.yml`:
   ```bash
   if [ -f "scripts/deploy/deploy-zero-downtime.sh" ]; then
     cp scripts/deploy/deploy-zero-downtime.sh $DEPLOY_DIR/deploy-zero-downtime.sh
     chmod +x $DEPLOY_DIR/deploy-zero-downtime.sh
   ```
   Então o que está em `scripts/deploy/deploy-zero-downtime.sh` (incluindo a correção) é o que será executado.

4. **Posso testar o deploy com esse fluxo?**  
   Sim. Depois de dar push em `main`, o que roda no servidor é exatamente esse script com a lógica de porta e PM2 que ajustamos.

---

## 5. Fluxo visual (deploy normal – push em main)

```
[GitHub Runner]
  → build backend + Prisma (Docker) + frontend
  → monta DEPLOY_DIR
  → cp scripts/deploy/deploy-zero-downtime.sh → DEPLOY_DIR/
  → cria deploy-frontend.sh (inline)
  → scp DEPLOY_DIR → servidor:/tmp/pinovara-deploy-XXXXX/

[Servidor via SSH]
  → bash deploy-zero-downtime.sh   ← nosso script (com correção da porta)
  → bash deploy-frontend.sh
```

Resumo: o “bendito deploy” que você vai testar usa o **mesmo** script failsafe que corrigimos; não é outro script.

---

## 6. Testar o deploy localmente (antes de enviar pro remoto)

Use **`scripts/deploy/test-deploy-local.sh`** para simular o deploy na sua máquina em portas diferentes do dev (3002 e 5174).

```bash
./scripts/deploy/test-deploy-local.sh
```

- Backend: http://localhost:3002 | Frontend: http://localhost:5174
- Pacote em `.deploy-local/` (estrutura igual à do GitHub)
- Ctrl+C encerra. Portas custom: `BACKEND_PORT=3003 FRONTEND_PORT=5175 ./scripts/deploy/test-deploy-local.sh`
