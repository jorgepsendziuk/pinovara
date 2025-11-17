# 🔧 Correção - Role Supervisão

**Data:** 16 de outubro de 2025  
**Problema:** Supervisão não via nenhuma organização

## 🐛 Problema Identificado

A role `supervisao` foi criada mas não estava sendo verificada no código:
- Backend verificava apenas `admin` e `coordenador`
- Middleware não incluía `supervisao` nas verificações
- Resultado: usuário com role supervisão não via nada

## ✅ Solução Implementada

### 1. Backend - Verificação de Permissões

**`organizacaoService.ts`:**
```typescript
private async isUserCoordinator(userId: number): Promise<boolean> {
  const roles = await this.getUserRoles(userId);
  return roles.some(role => 
    (role.name === 'coordenador' || role.name === 'supervisao') && 
    role.module?.name === 'organizacoes'
  );
}
```

**`roleAuth.ts` (middleware):**
```typescript
const isSupervisor = req.user.roles?.some(role => 
  role.name === 'supervisao' && role.module.name === 'organizacoes'
);

(req as any).userPermissions = {
  isAdmin,
  isTechnician,
  isCoordinator,
  isSupervisor,
  canAccessAll: isAdmin || isCoordinator || isSupervisor, // ✅ Agora inclui supervisor
  canEdit: isAdmin || isTechnician, // Supervisor NÃO pode editar
  userId: req.user.id
};
```

### 2. Frontend - Verificação de Role

**`AuthContext.tsx`:**
```typescript
const isSupervisor = (): boolean => {
  return user?.roles?.some(role => 
    role.module.name === 'organizacoes' && role.name === 'supervisao'
  ) || false;
};
```

**`EdicaoOrganizacao.tsx`:**
```typescript
// Proteção: coordenador e supervisor não podem criar
if (isModoCriacao && (isCoordinator() || isSupervisor())) {
  // Mostrar mensagem de acesso restrito
}

// Coordenador e Supervisor não podem editar
if (!isModoCriacao && (isCoordinator() || isSupervisor())) {
  // Modo somente leitura
}
```

## 📊 Permissões das Roles

| Role | Ver Todas | Criar | Editar | Validar |
|------|-----------|-------|--------|---------|
| **Admin** | ✅ | ✅ | ✅ | ✅ |
| **Técnico** | ❌ (só suas) | ✅ | ✅ (só suas) | ❌ |
| **Coordenador** | ✅ | ❌ | ❌ | ✅ |
| **Supervisão** | ✅ | ❌ | ❌ | ❌ |

## 🧪 Como Testar

### 1. Execute o SQL (se ainda não executou):
```sql
-- Arquivo: SQL-ROLE-SUPERVISAO.sql
INSERT INTO pinovara.roles (name, description, "moduleId", active, "createdAt", "updatedAt")
SELECT 'supervisao', 'Supervisor - Pode visualizar todas as organizações mas não pode editar nem validar', id, true, NOW(), NOW()
FROM pinovara.modules WHERE name = 'organizacoes' 
AND NOT EXISTS (SELECT 1 FROM pinovara.roles r INNER JOIN pinovara.modules m ON r."moduleId" = m.id WHERE r.name = 'supervisao' AND m.name = 'organizacoes');

INSERT INTO pinovara.user_roles ("userId", "roleId", "createdAt", "updatedAt")
SELECT u.id, r.id, NOW(), NOW() FROM pinovara.users u CROSS JOIN pinovara.roles r INNER JOIN pinovara.modules m ON r."moduleId" = m.id 
WHERE u.email = 'sabrina.diniz@incra.gov.br' AND r.name = 'supervisao' AND m.name = 'organizacoes' 
ON CONFLICT ("userId", "roleId") DO NOTHING;
```

### 2. Testar Login com Supervisão:
1. **Recarregue a página:** F5 ou Cmd+R
2. Faça logout se estiver logado
3. Login: `sabrina.diniz@incra.gov.br`
4. Senha: `sabrina.diniz@incra.gov.br`
5. Verificar:
   - ✅ Dashboard mostra todas as organizações
   - ✅ Lista mostra todas as organizações
   - ❌ Não aparece botão "Adicionar Organização"
   - ❌ Ao abrir organização, está em modo somente leitura
   - ❌ Não aparece botão "Salvar Alterações"
   - ❌ Não pode validar organizações

## 📁 Arquivos Modificados

### Backend:
- `backend/src/services/organizacaoService.ts`
- `backend/src/middleware/roleAuth.ts`
- `backend/src/controllers/organizacaoController.ts`

### Frontend:
- `frontend/src/contexts/AuthContext.tsx`
- `frontend/src/pages/organizacoes/EdicaoOrganizacao.tsx`

## 🔄 Status do Sistema

- ✅ Backend reiniciado
- ✅ Frontend compilado
- ✅ Role supervisão reconhecida
- ⏳ Aguardando execução do SQL
- ⏳ Aguardando teste

## 💡 Diferença entre Coordenador e Supervisor

- **Coordenador:** Pode **validar** organizações (aprovar/recusar)
- **Supervisor:** Apenas **visualiza** (sem poder de validação)

Ambos:
- Veem todas as organizações
- Não podem criar novas
- Não podem editar

---

**Status:** ✅ Implementado  
**Deploy:** Pronto para recarregar página  
**SQL:** Aguardando execução

