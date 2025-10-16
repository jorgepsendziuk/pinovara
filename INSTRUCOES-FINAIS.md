# 📋 Instruções Finais - Deploy 16/10/2025

## ✅ Tudo que foi Corrigido

### 1. **Sistema de Logs de Auditoria** ✅
- ✅ Captura usuário real (não mais "Sistema")
- ✅ Captura IP via proxy/nginx
- ✅ Só cria logs quando há mudanças reais
- ✅ Trust proxy configurado

### 2. **Campos Estado e Município** ✅
- ✅ Listas aparecem corretamente preenchidas
- ✅ Backend retorna `descricao`, frontend usa `descricao || nome`

### 3. **Unificação de Formulários** ✅
- ✅ Mesmo formulário para criar e editar
- ✅ `CadastroOrganizacao.tsx` não é mais usado
- ✅ Redução de ~1200 linhas de código

### 4. **Criação de Organizações** ✅
- ✅ Campos aparecem vazios para preencher
- ✅ Validação de nome obrigatório
- ✅ **ID do técnico atribuído automaticamente ao usuário logado**
- ✅ Redirecionamento automático após criar

### 5. **Role Supervisão** ✅
- ✅ Pode ver TODAS as organizações
- ❌ NÃO pode criar novas
- ❌ NÃO pode editar
- ❌ NÃO pode excluir
- ❌ NÃO pode validar

## 📜 SQL OBRIGATÓRIO

Execute este SQL no banco antes de testar:

```sql
-- 1. Criar role supervisao
INSERT INTO pinovara.roles (name, description, "moduleId", active, "createdAt", "updatedAt")
SELECT 'supervisao', 'Supervisor - Pode visualizar todas as organizações mas não pode editar nem validar', id, true, NOW(), NOW()
FROM pinovara.modules WHERE name = 'organizacoes' 
AND NOT EXISTS (SELECT 1 FROM pinovara.roles r INNER JOIN pinovara.modules m ON r."moduleId" = m.id WHERE r.name = 'supervisao' AND m.name = 'organizacoes');

-- 2. Associar Sabrina Diniz à role supervisao
INSERT INTO pinovara.user_roles ("userId", "roleId", "createdAt", "updatedAt")
SELECT u.id, r.id, NOW(), NOW() FROM pinovara.users u CROSS JOIN pinovara.roles r INNER JOIN pinovara.modules m ON r."moduleId" = m.id 
WHERE u.email = 'sabrina.diniz@incra.gov.br' AND r.name = 'supervisao' AND m.name = 'organizacoes' 
ON CONFLICT ("userId", "roleId") DO NOTHING;

-- 3. Verificar
SELECT u.id, u.email, u.name, r.name as role, m.name as module
FROM pinovara.users u
JOIN pinovara.user_roles ur ON u.id = ur."userId"
JOIN pinovara.roles r ON ur."roleId" = r.id
JOIN pinovara.modules m ON r."moduleId" = m.id
WHERE u.email = 'sabrina.diniz@incra.gov.br';
```

**Arquivo:** `SQL-ROLE-SUPERVISAO.sql` (na raiz do projeto)

## 🧪 Testes Obrigatórios

### Teste 1: Criar Organização (como Técnico/Admin)
1. Login: `jimxxx@gmail.com` / `PinovaraUFBA@2025#`
2. Recarregar página (F5 ou Cmd+R)
3. Ir em "Organizações → Adicionar Organização"
4. **Verificar que campos aparecem vazios**
5. Preencher:
   - Nome: "Teste Criação"
   - Estado: Selecionar
   - Município: Selecionar
6. Clicar "Criar Organização"
7. Verificar:
   - ✅ Mensagem de sucesso
   - ✅ Redireciona para edição
   - ✅ **Técnico atribuído ao usuário logado**

### Teste 2: Supervisão (Sabrina Diniz)
1. Fazer logout
2. Login: `sabrina.diniz@incra.gov.br` / `sabrina.diniz@incra.gov.br`
3. Verificar:
   - ✅ Dashboard mostra **TODAS** as organizações
   - ✅ Lista mostra **TODAS** as organizações
   - ❌ NÃO aparece "Adicionar Organização"
   - ❌ Ao abrir org, botão "Salvar" NÃO aparece
   - ❌ NÃO pode validar

### Teste 3: Estados e Municípios
1. Editar qualquer organização
2. Seção "Dados Básicos"
3. Verificar:
   - ✅ Estados mostram nomes corretos
   - ✅ Municípios filtram por estado
   - ✅ Sem opções vazias

### Teste 4: Logs de Auditoria
1. Editar uma organização
2. Mudar um campo e salvar
3. Ir em Admin → Logs de Auditoria
4. Verificar:
   - ✅ Mostra usuário correto
   - ✅ Mostra IP (pode ser ::1 em localhost)
   - ✅ Mostra apenas campos alterados

## 📊 Resumo de Permissões

| Role | Ver Todas | Criar | Editar | Excluir | Validar |
|------|-----------|-------|--------|---------|---------|
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Técnico** | ❌ (só suas) | ✅ | ✅ (só suas) | ✅ (só suas) | ❌ |
| **Coordenador** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Supervisão** | ✅ | ❌ | ❌ | ❌ | ❌ |

## 📁 Arquivos Modificados

### Backend:
1. `backend/src/server.ts` - Trust proxy
2. `backend/src/services/auditService.ts` - Melhorias auditoria
3. `backend/src/services/organizacaoService.ts` - Role supervisão + id_tecnico
4. `backend/src/middleware/roleAuth.ts` - Permissões supervisor
5. `backend/src/controllers/organizacaoController.ts` - Mensagens validação

### Frontend:
1. `frontend/src/hooks/useOrganizacaoData.ts` - Loading + update
2. `frontend/src/pages/organizacoes/EdicaoOrganizacao.tsx` - Modo criação
3. `frontend/src/pages/modules/OrganizacoesModule.tsx` - Rota unificada
4. `frontend/src/types/organizacao.ts` - Interfaces Estado/Município
5. `frontend/src/components/organizacoes/DadosBasicos.tsx` - Campos corrigidos
6. `frontend/src/contexts/AuthContext.tsx` - Método isSupervisor()

### SQL:
- `SQL-ROLE-SUPERVISAO.sql` - **EXECUTAR NO BANCO!**

## 🚀 Para Deploy

### Opção 1: Deploy Automático
```bash
cd /Users/jorgepsendziuk/Documents/pinovara
bash scripts/deploy/deploy-safe.sh
```

### Opção 2: Deploy Manual

#### No Servidor Local:
```bash
cd /Users/jorgepsendziuk/Documents/pinovara
tar -czf pinovara-deploy-$(date +%Y%m%d-%H%M%S).tar.gz deploy-package/
scp pinovara-deploy-*.tar.gz root@pinovaraufba.com.br:/root/
```

#### No Servidor Remoto:
```bash
# 1. Executar o SQL primeiro!
psql -U seu_usuario -d pinovara -f SQL-ROLE-SUPERVISAO.sql

# 2. Backup
cd /var/www/pinovara
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz .

# 3. Deploy
cd /root
tar -xzf pinovara-deploy-*.tar.gz
cp -r deploy-package/* /var/www/pinovara/
chown -R www-data:www-data /var/www/pinovara

# 4. Reiniciar
pm2 restart backend

# 5. Verificar
pm2 logs backend --lines 20
```

## ✅ Checklist Pré-Deploy

- [ ] SQL executado no banco
- [ ] Teste local: Criar organização funcionando
- [ ] Teste local: Estados/Municípios aparecem
- [ ] Teste local: Login Sabrina vê todas organizações
- [ ] Teste local: Logs de auditoria com usuário/IP corretos
- [ ] Backend compilado sem erros
- [ ] Frontend compilado sem erros
- [ ] Deploy package atualizado

## 📞 Credenciais de Teste

### Admin:
- Email: `jimxxx@gmail.com`
- Senha: `PinovaraUFBA@2025#`

### Supervisão (Sabrina):
- Email: `sabrina.diniz@incra.gov.br`
- Senha: `sabrina.diniz@incra.gov.br`

## 🐛 Troubleshooting

### "Supervisão não vê organizações"
- Execute o SQL
- Faça logout e login novamente
- Limpe cache do navegador

### "Erro ao criar organização"
- Preencha o campo Nome (obrigatório)
- Verifique console do navegador
- Veja logs do backend

### "Estados/Municípios vazios"
- Recarregue página (F5)
- Limpe cache (Ctrl+Shift+R)
- Verifique se backend está rodando

---

**Status:** ✅ Pronto para Deploy  
**Data:** 16 de outubro de 2025  
**Backend:** Rodando em http://localhost:3001  
**Frontend:** Compilado e pronto  

**⚠️ IMPORTANTE:** Execute o SQL antes de fazer deploy! ⚠️

