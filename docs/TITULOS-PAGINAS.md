# 📄 Sistema de Títulos de Páginas

## ✅ Implementação Automática

O sistema PINOVARA agora possui títulos de página automáticos baseados nas rotas.

---

## 🏗️ Arquitetura

```
App.tsx (usa usePageTitle globalmente)
    ↓
usePageTitle hook
    ↓ monitora location.pathname
routeToTitle()
    ↓ converte rota em título amigável
document.title = "PINOVARA - Título"
```

---

## 🎯 Funcionalidades

### 1. **Títulos Automáticos**
O hook `usePageTitle` já está configurado globalmente no `App.tsx`, então **todas as páginas** têm títulos automáticos.

**Exemplos:**
- `/organizacoes/lista` → `PINOVARA - Organizações / Lista`
- `/admin/users` → `PINOVARA - Administração / Usuários`
- `/perfil` → `PINOVARA - Meu Perfil`

### 2. **Mapeamento Customizado**
Para rotas específicas, existe um mapeamento em `usePageTitle.ts`:

```typescript
const routeTitles: Record<string, string> = {
  '/organizacoes/lista': 'Organizações / Lista',
  '/admin/sync-odk': 'Administração / Sincronização ODK',
  // ...
};
```

### 3. **Geração Inteligente**
Para rotas não mapeadas, o sistema gera títulos automaticamente:

```typescript
/nova-funcionalidade/teste → "PINOVARA - Nova Funcionalidade / Teste"
/configuracoes/avancadas → "PINOVARA - Configurações / Avançadas"
```

**Recursos:**
- ✅ Remove IDs numéricos da URL (`/organizacoes/123` → ignora `123`)
- ✅ Remove UUIDs
- ✅ Converte hífens em espaços
- ✅ Capitaliza palavras especiais (ODK, GPS, CNPJ, etc.)

---

## 📖 Como Usar

### Uso Global (Já Configurado)
No `App.tsx`, o hook já está ativo:

```typescript
function AppRoutes() {
  usePageTitle(); // ✅ Já configurado!
  
  return <Routes>...</Routes>;
}
```

### Título Customizado em Página Específica
Se você quiser sobrescrever o título automático em uma página:

```typescript
import { usePageTitle } from '../hooks/usePageTitle';

function MinhaPageEspecial() {
  // Sobrescreve o título automático
  usePageTitle('Página Especial Customizada');
  
  return <div>...</div>;
}
```

### Adicionar Mapeamento Dinâmico
Para adicionar rotas dinamicamente:

```typescript
import { addRouteTitle } from '../hooks/usePageTitle';

// Em algum lugar da inicialização
addRouteTitle('/minha-rota', 'Meu Título Customizado');
```

---

## 🗺️ Rotas Mapeadas

### Principais
- `/` → Bem-vindo
- `/pinovara` → Dashboard
- `/login` → Login
- `/register` → Cadastro

### Organizações
- `/organizacoes` → Organizações
- `/organizacoes/lista` → Organizações / Lista
- `/organizacoes/dashboard` → Organizações / Dashboard
- `/organizacoes/nova` → Organizações / Nova
- `/organizacoes/edicao/:id` → Organizações / Edição

### Administração
- `/admin` → Administração
- `/admin/users` → Administração / Usuários
- `/admin/roles` → Administração / Módulos e Permissões
- `/admin/system-info` → Administração / Informações do Sistema
- `/admin/analytics` → Administração / Analytics e Métricas
- `/admin/sync-odk` → Administração / Sincronização ODK

### Perfil
- `/perfil` → Meu Perfil

### ODK
- `/configuracao-odk` → Configuração ODK
- `/formulario-enketo` → Formulário Enketo

---

## 🔧 Customização

### Adicionar Novo Mapeamento

Edite `frontend/src/hooks/usePageTitle.ts`:

```typescript
const routeTitles: Record<string, string> = {
  // ... mapeamentos existentes
  '/minha-nova-rota': 'Meu Título',
  '/outra-rota/subrota': 'Outro Título / Subrota',
};
```

### Adicionar Palavra Especial

Para palavras que devem ter capitalização especial:

```typescript
const properNouns: Record<string, string> = {
  // ... existentes
  'api': 'API',
  'pdf': 'PDF',
  'sql': 'SQL',
};
```

---

## 📊 Exemplos de Transformação

| Rota | Título Gerado |
|------|---------------|
| `/` | `PINOVARA - Bem-vindo` |
| `/organizacoes/lista` | `PINOVARA - Organizações / Lista` |
| `/organizacoes/edicao/123` | `PINOVARA - Organizações / Edição` |
| `/admin/sync-odk` | `PINOVARA - Administração / Sincronização ODK` |
| `/configuracao-odk` | `PINOVARA - Configuração ODK` |
| `/nova-pagina` | `PINOVARA - Nova Pagina` |

---

## 🚀 Benefícios

✅ **Automático** - Funciona em todas as páginas sem configuração  
✅ **SEO Friendly** - Títulos descritivos para mecanismos de busca  
✅ **UX** - Usuário sabe onde está pela aba do navegador  
✅ **Manutenível** - Um único arquivo para gerenciar todos os títulos  
✅ **Flexível** - Permite customização quando necessário  
✅ **Inteligente** - Remove IDs e UUIDs automaticamente  

---

## 📝 Notas

- O hook usa `useLocation()` do React Router para monitorar mudanças de rota
- O título é atualizado automaticamente quando a rota muda
- Não é necessário adicionar `usePageTitle()` em cada componente
- O formato padrão é sempre: `PINOVARA - [Título]`
- Para páginas sem mapeamento, o título é gerado automaticamente da URL

---

**Data:** 13 de outubro de 2025  
**Status:** ✅ Implementado e funcional  
**Versão:** 1.0

