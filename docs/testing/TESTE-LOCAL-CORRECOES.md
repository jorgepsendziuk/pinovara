# 🧪 Guia de Teste Local das Correções

## 📋 O que foi corrigido

1. **Sistema de Logs de Auditoria**
   - ✅ Usuário agora capturado corretamente (não mais "Sistema")
   - ✅ IP capturado via proxy/nginx headers
   - ✅ Logs só são criados quando há mudanças reais

2. **Campos Estado e Município**
   - ✅ Agora mostram os valores corretos nas listas
   - ✅ Compatibilidade com backend (campo `descricao`)

## 🚀 Como Testar Localmente

### 1. Verificar se os servidores estão rodando

```bash
# Backend
ps aux | grep "node.*server.js" | grep -v grep

# Se não estiver rodando:
cd /Users/jorgepsendziuk/Documents/pinovara/backend
node dist/server.js > ../logs/backend.log 2>&1 &

# Frontend (se necessário)
cd /Users/jorgepsendziuk/Documents/pinovara/frontend
npm run dev
```

### 2. Testar Logs de Auditoria

#### A. Fazer Login
1. Acessar http://localhost:5173
2. Login: `jimxxx@gmail.com`
3. Senha: `[SENHA_DO_USUARIO_TESTE]`

#### B. Editar uma Organização
1. Ir para "Organizações"
2. Clicar em uma organização existente
3. Modificar algum campo (ex: telefone)
4. Salvar

#### C. Verificar Logs no Console do Backend

```bash
tail -f /Users/jorgepsendziuk/Documents/pinovara/logs/backend.log | grep "AuditService"
```

**Resultado Esperado:**
```
📝 [AuditService] Creating log: {
  action: 'UPDATE',
  entity: 'organizacao',
  entityId: '14',
  userId: 2,              // ← Número do usuário, não null
  userName: 'Jim',        // ← Nome do usuário
  ipAddress: '::1',       // ← IP (pode ser ::1 em localhost)
  hasOldData: true,
  hasNewData: true
}
✅ [AuditService] Log created: UPDATE on organizacao (ID: 14) by user 2
```

### 3. Testar Campos Estado/Município

#### A. Editar Organização
1. Acessar http://localhost:5173
2. Fazer login
3. Ir para uma organização
4. Na seção "Dados Básicos da Organização"

#### B. Verificar Selects

**Estado:**
- Deve mostrar opções com nomes: "Bahia", "Minas Gerais", etc.
- NÃO deve mostrar opções vazias

**Município:**
- Selecionar um Estado primeiro
- Deve mostrar municípios daquele estado
- Nomes devem aparecer: "Salvador", "Diamantina", etc.
- NÃO deve mostrar opções vazias

### 4. Testar UPDATE sem Mudanças

#### A. Editar e Salvar sem Mudar Nada
1. Abrir uma organização
2. Clicar em "Salvar" SEM fazer mudanças

#### B. Verificar Logs

```bash
tail -f /Users/jorgepsendziuk/Documents/pinovara/logs/backend.log | grep "AuditService"
```

**Resultado Esperado:**
```
ℹ️ [AuditService] No changes detected for UPDATE on organizacao (ID: 14) - skipping log
```

## 🔍 Verificações Adicionais

### Console do Navegador

Abrir DevTools (F12) e verificar:
- ✅ Sem erros de JavaScript
- ✅ Chamadas à API retornando 200
- ✅ Dados de Estados/Municípios sendo carregados

### Network Tab

Verificar chamadas:
- `GET /organizacoes/estados` → deve retornar array com `descricao`
- `GET /organizacoes/municipios/{id}` → deve retornar array com `descricao`

Exemplo de resposta esperada:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "descricao": "Bahia"
    },
    {
      "id": 2,
      "descricao": "Minas Gerais"
    }
  ]
}
```

## ✅ Checklist de Testes

### Logs de Auditoria
- [ ] CREATE: Ao criar organização, log mostra userId correto
- [ ] UPDATE: Ao editar organização, log mostra userId e IP
- [ ] UPDATE vazio: Não cria log se não houver mudanças
- [ ] DELETE: Ao deletar, log registra corretamente
- [ ] LOGIN: Log de login mostra IP do usuário

### Campos Estado/Município
- [ ] Estado mostra lista com nomes corretos
- [ ] Município mostra lista filtrada por estado
- [ ] Município mostra nomes corretos
- [ ] Ao selecionar estado, municípios são carregados
- [ ] Valores selecionados aparecem corretamente

## 🐛 Problemas Comuns

### "Cannot read property 'descricao' of undefined"

**Solução:** Limpar cache do navegador e recarregar (Ctrl+Shift+R)

### Backend não mostra logs de auditoria

**Solução:** 
```bash
# Verificar se backend foi recompilado
cd /Users/jorgepsendziuk/Documents/pinovara/backend
npm run build

# Reiniciar
pkill -f "node.*server.js"
node dist/server.js > ../logs/backend.log 2>&1 &
```

### Estados/Municípios ainda vazios

**Solução:**
1. Verificar console do navegador para erros
2. Verificar se backend está rodando
3. Testar chamada diretamente:
```bash
curl http://localhost:3001/organizacoes/estados \
  -H "Authorization: Bearer SEU_TOKEN"
```

## 📊 Resultado Esperado

Após os testes, você deve ter:

✅ Logs de auditoria mostrando:
- Usuário correto (nome e ID)
- IP do cliente
- Apenas campos alterados no diff

✅ Interface mostrando:
- Estados com nomes corretos
- Municípios com nomes corretos
- Sem opções vazias nos selects

## 🚀 Próximo Passo

Se todos os testes passaram, o sistema está pronto para deploy:

```bash
cd /Users/jorgepsendziuk/Documents/pinovara
bash scripts/deploy/deploy-safe.sh
```

---

**Última Atualização:** 16 de outubro de 2025  
**Testado por:** ⏳ Aguardando testes

