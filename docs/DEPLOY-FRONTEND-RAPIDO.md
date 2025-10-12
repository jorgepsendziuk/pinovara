# 🎨 Deploy Rápido - Apenas Frontend

## 📋 Quando Usar

Use este script quando fizer mudanças **apenas no frontend** como:
- ✅ Alterações visuais (CSS, cores, layout)
- ✅ Novos componentes React
- ✅ Mudanças em páginas
- ✅ Atualização de textos/labels
- ✅ Configurações do Google Analytics
- ✅ Adição de Política de Privacidade, Termos de Uso, etc

**NÃO use** quando alterar:
- ❌ Código do backend
- ❌ Rotas da API
- ❌ Schema do banco
- ❌ Lógica de negócio

---

## 🚀 Como Usar

### Passo 1: Fazer mudanças no código

```bash
# Exemplo: Alterar cor de um botão
vim frontend/src/components/MeuComponente.tsx
```

### Passo 2: Executar o script

```bash
# No diretório raiz do projeto
bash scripts/deploy/deploy-frontend-only.sh
```

### Passo 3: Confirmar

O script vai perguntar se deseja continuar. Digite `y` e pressione Enter.

---

## ⚡ Vantagens

- **Rápido**: ~30 segundos (vs 5+ minutos do deploy completo)
- **Seguro**: Não mexe no backend nem no banco
- **Sem downtime**: Usa `nginx reload` ao invés de `restart`
- **Backup automático**: Cria backup do frontend anterior

---

## 🔍 O Que o Script Faz

1. ✅ **Verifica diretório** - Confirma que está no lugar certo
2. ✅ **Confirma ação** - Pede confirmação antes de prosseguir
3. ✅ **Build do frontend** - Compila React/Vite
4. ✅ **Backup automático** - Salva versão anterior
5. ✅ **Copia arquivos** - Move para `/var/www/html/`
6. ✅ **Limpa lixo** - Remove arquivos desnecessários
7. ✅ **Recarrega nginx** - Sem derrubar o servidor
8. ✅ **Testa site** - Verifica se está funcionando
9. ✅ **Verifica Analytics** - Confirma Google Analytics no build

---

## 📊 Google Analytics em Produção

### Para o Google Analytics funcionar em produção:

1. **Adicionar variável de ambiente no servidor:**

```bash
# No servidor de produção
sudo nano /var/www/pinovara/frontend/.env

# Adicionar:
VITE_GA_MEASUREMENT_ID=G-WZJGKZE5DW
```

2. **Executar deploy:**

```bash
bash scripts/deploy/deploy-frontend-only.sh
```

3. **Verificar no Google Analytics:**
   - Acesse: https://analytics.google.com
   - Relatórios > Tempo real
   - Acesse: https://app.pinovaraufba.com.br
   - Deve aparecer usuário ativo!

---

## 🧪 Verificar Após Deploy

### No Navegador:

1. Acesse: https://app.pinovaraufba.com.br
2. Abra Console (F12)
3. Procure por: `Google Analytics inicializado: G-WZJGKZE5DW`

### No Servidor:

```bash
# Verificar se Analytics está no código
grep -r "G-WZJGKZE5DW" /var/www/html/assets/*.js

# Ver logs do nginx
sudo tail -f /var/log/nginx/access.log

# Verificar tamanho dos arquivos
du -sh /var/www/html/
```

---

## 🐛 Troubleshooting

### "Permission denied ao copiar arquivos"

```bash
# Ajustar permissões
sudo chown -R $USER:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

### "Nginx reload failed"

```bash
# Testar configuração do nginx
sudo nginx -t

# Se OK, forçar reload
sudo systemctl restart nginx
```

### "Google Analytics não aparece no console"

1. Verificar se `.env` tem o ID correto
2. Limpar cache do navegador (Ctrl+Shift+Delete)
3. Acessar em aba anônima
4. Verificar se build incluiu o ID:
   ```bash
   grep "G-WZJGKZE5DW" /var/www/html/assets/*.js
   ```

### "Site mostra versão antiga"

```bash
# Limpar cache do nginx
sudo rm -rf /var/cache/nginx/*

# Recarregar
sudo systemctl reload nginx

# Limpar cache do navegador também
```

---

## 📝 Diferença: Deploy Completo vs Frontend Only

| Aspecto | Deploy Completo | Frontend Only |
|---------|----------------|---------------|
| Tempo | ~5-10 minutos | ~30 segundos |
| Frontend | ✅ Atualiza | ✅ Atualiza |
| Backend | ✅ Atualiza | ❌ Não mexe |
| Banco de Dados | ⚠️ Pode alterar | ❌ Não mexe |
| Nginx | ✅ Restart | ✅ Reload |
| PM2 | ✅ Restart | ❌ Não mexe |
| Downtime | Sim (~5-10s) | Não |
| Uso | Mudanças gerais | Apenas visual |

---

## ✅ Checklist Rápido

Antes de executar o deploy frontend-only:

- [ ] Mudanças são apenas no frontend?
- [ ] Build local funcionou? (`npm run build`)
- [ ] Não há mudanças no backend?
- [ ] Não há mudanças no banco?
- [ ] `.env` de produção tem Google Analytics ID?

Se todas respostas são "Sim", execute:

```bash
bash scripts/deploy/deploy-frontend-only.sh
```

---

## 🎯 Exemplo de Uso

```bash
# Cenário: Você mudou a cor de um botão

# 1. Editar o código
vim frontend/src/components/MeuComponente.tsx

# 2. Testar localmente
cd frontend
npm run dev
# Verificar no navegador

# 3. Deploy rápido
cd ..
bash scripts/deploy/deploy-frontend-only.sh

# 4. Verificar em produção
curl https://app.pinovaraufba.com.br
```

---

**Tempo estimado:** 30 segundos  
**Downtime:** Zero  
**Risco:** Baixíssimo (apenas frontend)  
**Velocidade:** 🚀🚀🚀

