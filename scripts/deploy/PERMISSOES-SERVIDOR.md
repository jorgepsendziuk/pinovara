# Permissões no servidor para o deploy (PINOVARA)

O deploy via GitHub Actions conecta no servidor pelo **SSH** usando o usuário configurado em `SERVER_USER` (secret). Esse usuário precisa conseguir:

1. **Escrever** em `/var/www/pinovara` e `/var/www/html`
2. **Rodar alguns comandos com `sudo`** (liberar porta 3001, criar diretórios, etc.)

Se o mesmo erro de permissão voltar, faça este ajuste **uma vez** no servidor.

---

## Opção A: Deploy com usuário que tem sudo (recomendado)

O usuário de deploy (ex.: `root`, `ubuntu`, `pinovara`) deve ter **sudo sem senha** para os comandos que o script usa.

### 1. Conectar no servidor

```bash
ssh SEU_USUARIO@SEU_SERVIDOR
```

### 2. Garantir que o usuário de deploy é o dono dos diretórios

Troque `DEPLOY_USER` pelo usuário que você usa no secret `SERVER_USER` (ex.: `root`, `ubuntu`):

```bash
sudo mkdir -p /var/www/pinovara /var/www/html /var/www/pinovara/backup
sudo chown -R DEPLOY_USER:DEPLOY_USER /var/www/pinovara /var/www/html
```

Exemplo se o usuário for `ubuntu`:

```bash
sudo chown -R ubuntu:ubuntu /var/www/pinovara /var/www/html
```

### 3. Permitir sudo sem senha para os comandos do deploy

```bash
sudo visudo
```

No final do arquivo, adicione **uma** das linhas abaixo (substitua `DEPLOY_USER` pelo usuário real):

**Opção 3a – só o necessário (mais seguro):**

```
DEPLOY_USER ALL=(ALL) NOPASSWD: /usr/bin/mkdir, /usr/bin/chown, /usr/bin/chmod, /usr/sbin/fuser, /usr/bin/lsof, /usr/bin/killall
```

**Opção 3b – sudo completo sem senha (só se o usuário for de deploy dedicado):**

```
DEPLOY_USER ALL=(ALL) NOPASSWD: ALL
```

Salve e saia (`:wq` no vi).

### 4. Testar

No servidor, como o usuário de deploy:

```bash
sudo mkdir -p /var/www/pinovara/teste
sudo chown $USER:$USER /var/www/pinovara/teste
rm -rf /var/www/pinovara/teste
```

Se não pedir senha e não der erro, está ok.

---

## Opção B: Deploy sempre como root

Se `SERVER_USER` for `root`:

- Não precisa de `visudo` para esse usuário.
- Só garanta que os diretórios existam e que nada esteja com dono/grupo que impeça escrita:

```bash
mkdir -p /var/www/pinovara /var/www/html /var/www/pinovara/backup
```

---

## O que o deploy usa com sudo

| Comando        | Uso no script                          |
|----------------|----------------------------------------|
| `sudo mkdir -p`| Criar `/var/www/html`, backup, **uploads**, etc. |
| `sudo chown`   | Dar dono ao usuário de deploy         |
| `sudo fuser -k 3001/tcp` | Liberar porta 3001 (zero-downtime) |
| `sudo lsof`    | Verificar quem usa a porta            |
| `sudo killall node` | Último recurso para liberar porta |

Se o usuário de deploy **já for dono** de `/var/www/pinovara` e `/var/www/html`, só precisa de sudo para `fuser`, `lsof` e `killall` (e para o primeiro `mkdir`/`chown` se os diretórios forem criados por root).

---

## Diretórios de upload (evidências, materiais, plano de gestão)

O backend salva arquivos em `/var/pinovara/shared/uploads/`. Se o **upload de evidências retornar 500** em produção, é provável que:

1. O diretório não exista
2. O usuário que roda o PM2 (backend) não tem permissão de escrita

O deploy agora cria automaticamente esses diretórios e ajusta o ownership. Se precisar corrigir manualmente:

```bash
# Criar diretórios e dar permissão ao usuário de deploy
sudo mkdir -p /var/pinovara/shared/uploads/{capacitacao/materiais,capacitacao/evidencias,plano-gestao}
sudo chown -R DEPLOY_USER:DEPLOY_USER /var/pinovara/shared/uploads
```

Ou execute o script: `bash scripts/setup-upload-directories-remote.sh` (com `sudo` se necessário).

---

## Depois de configurar

1. Rode o deploy de novo pelo GitHub Actions.
2. Se ainda falhar, confira no log do job qual comando exato deu “Permission denied” e ajuste o `visudo` para esse comando (ou use a Opção 3b com cuidado).
