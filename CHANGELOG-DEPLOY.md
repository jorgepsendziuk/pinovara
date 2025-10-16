# 📦 Changelog do Deploy - 16 de outubro de 2025

## 🔧 Correções Implementadas

### 1. **Sistema de Logs de Auditoria**

#### Problemas Corrigidos:
- ✅ Usuário sempre aparecia como "Sistema" → Agora captura o usuário real
- ✅ IP não estava sendo capturado → Agora captura corretamente via proxy/nginx
- ✅ Logs de UPDATE com dados vazios → Agora só registra mudanças reais

#### Mudanças Técnicas:

**Backend (`server.ts`):**
- Adicionado `app.set('trust proxy', true)` para capturar IP real quando atrás de proxy/nginx

**Backend (`auditService.ts`):**
- Captura robusta de IP com prioridade: x-forwarded-for → x-real-ip → req.ip → socket
- Validação e conversão do userId para número
- Melhoria no diff: normaliza `null` e `undefined` para comparação consistente
- Prevenção de logs vazios: não cria log quando não há mudanças reais
- Logs de debug detalhados para troubleshooting

### 2. **Campos Estado e Município na Edição de Organização**

#### Problema Corrigido:
- ✅ Campos apareciam vazios na lista → Agora mostram os valores corretos

#### Mudanças Técnicas:

**Frontend (`types/organizacao.ts`):**
- Adicionadas interfaces centralizadas para `Estado` e `Municipio`
- Suporte para campo `descricao` (usado pelo backend)
- Compatibilidade com campo `nome` (fallback)

**Frontend (`DadosBasicos.tsx`):**
- Corrigido para usar `estado.descricao || estado.nome`
- Corrigido para usar `municipio.descricao || municipio.nome`

## 📊 Impacto

### Sistema de Auditoria:
- **Antes:** Logs sempre mostravam "Sistema" como usuário, IP desconhecido, e diffs vazios
- **Depois:** Logs mostram usuário real, IP correto, e apenas campos alterados

### Campos Estado/Município:
- **Antes:** Campos apareciam vazios nas listas
- **Depois:** Campos mostram os nomes corretos

## 🧪 Como Testar

### 1. Logs de Auditoria

Após fazer login e editar uma organização:

```bash
# No servidor remoto, ver os logs
pm2 logs backend --lines 50
```

Você deve ver logs como:
```
📝 [AuditService] Creating log: {
  action: 'UPDATE',
  entity: 'organizacao',
  userId: 2,
  userName: 'Jim',
  ipAddress: '192.168.1.100',  // ← IP real
  hasOldData: true,
  hasNewData: true
}
✅ [AuditService] Log created: UPDATE on organizacao (ID: 14) by user 2
```

### 2. Campos Estado/Município

1. Acessar https://pinovaraufba.com.br
2. Fazer login
3. Editar uma organização
4. Verificar que Estado e Município mostram valores corretos nos selects

## 📁 Arquivos Modificados

### Backend:
- `/backend/src/server.ts`
- `/backend/src/services/auditService.ts`

### Frontend:
- `/frontend/src/types/organizacao.ts`
- `/frontend/src/components/organizacoes/DadosBasicos.tsx`

### Documentação:
- `/docs/CORRECOES-AUDITORIA.md` (novo)
- `/CHANGELOG-DEPLOY.md` (este arquivo)

## 🚀 Instruções de Deploy

### Opção 1: Deploy Seguro (Recomendado)

```bash
cd /Users/jorgepsendziuk/Documents/pinovara
bash scripts/deploy/deploy-safe.sh
```

### Opção 2: Deploy Manual

#### No servidor local:

```bash
# 1. Compactar pacote
cd /Users/jorgepsendziuk/Documents/pinovara
tar -czf pinovara-deploy-$(date +%Y%m%d-%H%M%S).tar.gz deploy-package/

# 2. Enviar para servidor
scp pinovara-deploy-*.tar.gz root@pinovaraufba.com.br:/root/

# 3. SSH no servidor
ssh root@pinovaraufba.com.br
```

#### No servidor remoto:

```bash
# 1. Backup
cd /var/www/pinovara
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz .

# 2. Extrair novo pacote
cd /root
tar -xzf pinovara-deploy-*.tar.gz

# 3. Copiar arquivos
cp -r deploy-package/* /var/www/pinovara/

# 4. Atualizar permissões
chown -R www-data:www-data /var/www/pinovara
chmod -R 755 /var/www/pinovara

# 5. Reiniciar backend
pm2 restart backend

# 6. Verificar
pm2 status
pm2 logs backend --lines 20
```

## ✅ Checklist de Verificação Pós-Deploy

- [ ] Backend reiniciou sem erros
- [ ] Frontend carregando corretamente
- [ ] Login funcionando
- [ ] Logs de auditoria mostram usuário correto
- [ ] Logs de auditoria mostram IP correto
- [ ] Estados aparecem corretamente nos selects
- [ ] Municípios aparecem corretamente nos selects
- [ ] Edição de organização funcionando

## 🐛 Troubleshooting

### Logs ainda mostram "Sistema"

Verificar se o backend foi reiniciado:
```bash
pm2 restart backend
pm2 logs backend
```

### Estados/Municípios ainda vazios

1. Limpar cache do navegador
2. Fazer hard refresh (Ctrl+Shift+R ou Cmd+Shift+R)
3. Verificar console do navegador para erros

### IP ainda aparece como "unknown"

Verificar configuração do nginx:
```bash
cat /etc/nginx/sites-available/pinovara.conf | grep proxy_set_header
```

Deve conter:
```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

## 📞 Suporte

Em caso de problemas, verificar:
1. Logs do backend: `pm2 logs backend`
2. Status dos serviços: `pm2 status`
3. Logs do nginx: `tail -f /var/log/nginx/error.log`

---

**Data:** 16 de outubro de 2025  
**Versão:** 1.0.0  
**Testado:** ✅ Desenvolvimento  
**Deploy:** ⏳ Aguardando

