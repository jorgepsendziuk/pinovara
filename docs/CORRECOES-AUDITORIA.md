# 🔧 Correções no Sistema de Logs de Auditoria

**Data:** 16 de outubro de 2025  
**Status:** ✅ Implementado

## 📋 Problemas Identificados

### 1. **Usuário sempre aparecia como "Sistema"**
- O `userId` não estava sendo capturado corretamente
- Faltava validação e conversão do tipo do userId

### 2. **Endereço IP não estava sendo capturado**
- Faltava configuração de `trust proxy` no Express
- A captura de IP não considerava proxies/nginx
- Não estava verificando headers corretos (x-forwarded-for, x-real-ip)

### 3. **Logs de UPDATE com dados vazios**
- Comparação entre `null` e `undefined` criava diffs falsos
- Logs sendo criados mesmo sem alterações reais
- Dados apareciam como `{}`

## ✅ Correções Implementadas

### 1. **Configuração de Trust Proxy** (`server.ts`)

```typescript
// Trust proxy - necessário para capturar IP real quando atrás de proxy/nginx
app.set('trust proxy', true);
```

**Por que:** Quando o backend está atrás de um proxy/nginx (como em produção), o Express precisa confiar nos headers de proxy para obter o IP real do cliente.

### 2. **Captura Robusta de IP** (`auditService.ts`)

```typescript
// Capturar IP de forma mais robusta
// Ordem de prioridade: x-forwarded-for (proxy) > x-real-ip (nginx) > req.ip > connection
let ipAddress = 'unknown';
if (req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const realIp = req.headers['x-real-ip'];
  
  if (forwardedFor) {
    // x-forwarded-for pode conter múltiplos IPs, pegar o primeiro
    ipAddress = Array.isArray(forwardedFor) 
      ? forwardedFor[0] 
      : forwardedFor.split(',')[0].trim();
  } else if (realIp) {
    ipAddress = Array.isArray(realIp) ? realIp[0] : realIp as string;
  } else if (req.ip) {
    ipAddress = req.ip;
  } else if (req.socket?.remoteAddress) {
    ipAddress = req.socket.remoteAddress;
  }
}
```

**Ordem de prioridade:**
1. `x-forwarded-for` - Header padrão de proxy (pode conter múltiplos IPs)
2. `x-real-ip` - Header do Nginx
3. `req.ip` - IP direto do Express
4. `req.socket.remoteAddress` - Socket TCP

### 3. **Captura Melhorada de User-Agent**

```typescript
// Capturar User-Agent
const userAgent = req?.headers['user-agent'] || req?.get('User-Agent') || 'unknown';
```

### 4. **Validação de userId**

```typescript
// Garantir que userId seja numérico ou null
const finalUserId = userId ? Number(userId) : null;
```

### 5. **Melhoria no Diff de Dados**

```typescript
private createDiff(oldData: any, newData: any): { oldData: any; newData: any } {
  const diff: any = { oldData: {}, newData: {} };
  
  // Se algum dos dados for vazio/null/undefined, retornar diff vazio
  if (!oldData || !newData || typeof oldData !== 'object' || typeof newData !== 'object') {
    return diff;
  }
  
  // Comparar apenas campos que existem em ambos os objetos
  const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
  
  for (const key of allKeys) {
    const oldValue = oldData[key];
    const newValue = newData[key];
    
    // Normalizar undefined e null para comparação consistente
    const normalizedOld = oldValue === undefined ? null : oldValue;
    const normalizedNew = newValue === undefined ? null : newValue;
    
    // Só incluir no diff se os valores forem realmente diferentes
    if (JSON.stringify(normalizedOld) !== JSON.stringify(normalizedNew)) {
      diff.oldData[key] = normalizedOld;
      diff.newData[key] = normalizedNew;
    }
  }
  
  return diff;
}
```

**Mudanças:**
- Normaliza `undefined` → `null` para comparação consistente
- Retorna diff vazio se dados inválidos
- Evita criar logs para campos que não mudaram realmente

### 6. **Prevenção de Logs Vazios**

```typescript
// Se não há mudanças reais, não criar log
if (Object.keys(processedOldData).length === 0 && Object.keys(processedNewData).length === 0) {
  console.log(`ℹ️ [AuditService] No changes detected for UPDATE on ${entity}${entityId ? ` (ID: ${entityId})` : ''} - skipping log`);
  return;
}
```

### 7. **Logs de Debug Melhorados**

```typescript
console.log(`📝 [AuditService] Creating log:`, {
  action,
  entity,
  entityId,
  userId: finalUserId,
  userName: req?.user?.name || 'unknown',
  ipAddress,
  hasOldData: !!processedOldData,
  hasNewData: !!processedNewData
});
```

## 🧪 Como Testar

### 1. **Testar Captura de Usuário**

```bash
# Fazer login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jimxxx@gmail.com","password":"PinovaraUFBA@2025#"}'

# Usar o token retornado para fazer uma operação
curl -X PUT http://localhost:3001/organizacoes/14 \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Teste"}'

# Verificar logs de auditoria
curl http://localhost:3001/admin/audit-logs \
  -H "Authorization: Bearer SEU_TOKEN"
```

**Resultado esperado:**
- Log deve mostrar o usuário correto, não "Sistema"
- Deve mostrar o IP do cliente
- Deve mostrar o User-Agent

### 2. **Testar Captura de IP**

Verificar nos logs:
```bash
tail -f /Users/jorgepsendziuk/Documents/pinovara/logs/backend.log | grep "Creating log"
```

**Resultado esperado:**
```
📝 [AuditService] Creating log: {
  action: 'UPDATE',
  entity: 'organizacao',
  entityId: '14',
  userId: 2,
  userName: 'Jim',
  ipAddress: '192.168.1.100',  // ← IP real, não 'unknown'
  hasOldData: true,
  hasNewData: true
}
```

### 3. **Testar Diff de Dados**

Fazer um UPDATE sem mudanças:
```bash
# Buscar organização
curl http://localhost:3001/organizacoes/14 \
  -H "Authorization: Bearer SEU_TOKEN"

# Atualizar com os mesmos dados
curl -X PUT http://localhost:3001/organizacoes/14 \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Nome Original"}'  # Mesmo nome que já existe
```

**Resultado esperado:**
- Não deve criar log de auditoria se não houver mudanças
- Nos logs: `ℹ️ [AuditService] No changes detected for UPDATE on organizacao (ID: 14) - skipping log`

## 📊 Verificação no Frontend

### Ver Logs de Auditoria

1. Acessar: http://localhost:5173/admin/audit-logs
2. Verificar que os logs mostram:
   - ✅ Nome do usuário (não "Sistema")
   - ✅ IP do cliente
   - ✅ User-Agent do navegador
   - ✅ Dados anteriores e novos apenas com campos alterados

## 🔍 Monitoramento

### Console do Backend

Ao fazer operações, verificar no console:

```
📝 [AuditService] Creating log: {
  action: 'UPDATE',
  entity: 'organizacao',
  entityId: '14',
  userId: 2,
  userName: 'Jim',
  ipAddress: '192.168.1.100',
  hasOldData: true,
  hasNewData: true
}
✅ [AuditService] Log created: UPDATE on organizacao (ID: 14) by user 2
```

### Sem Mudanças

```
ℹ️ [AuditService] No changes detected for UPDATE on organizacao (ID: 14) - skipping log
```

## 📝 Arquivos Modificados

1. `/backend/src/server.ts`
   - Adicionado `trust proxy`

2. `/backend/src/services/auditService.ts`
   - Captura robusta de IP
   - Validação de userId
   - Melhoria no diff
   - Prevenção de logs vazios
   - Logs de debug

## 🚀 Deploy

### Desenvolvimento

```bash
cd /Users/jorgepsendziuk/Documents/pinovara
bash scripts/dev/start-backend.sh
```

### Produção

As mudanças serão aplicadas automaticamente no próximo deploy:

```bash
bash scripts/deploy/deploy.sh
```

## ✅ Checklist de Verificação

- [x] Trust proxy configurado
- [x] IP sendo capturado corretamente
- [x] UserAgent sendo capturado
- [x] UserId sendo salvo corretamente
- [x] Diff só mostra campos alterados
- [x] Não cria logs para updates sem mudanças
- [x] Logs de debug implementados
- [x] Backend compilado sem erros
- [x] Backend reiniciado com sucesso

## 🐛 Problemas Conhecidos

Nenhum problema conhecido após as correções.

## 📚 Referências

- [Express Trust Proxy](https://expressjs.com/en/guide/behind-proxies.html)
- [X-Forwarded-For Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)
- [Nginx Real IP](https://nginx.org/en/docs/http/ngx_http_realip_module.html)

