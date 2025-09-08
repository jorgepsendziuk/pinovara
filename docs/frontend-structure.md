# Estrutura do Frontend - PINOVARA

## 📱 Visão Geral

O frontend do PINOVARA é uma aplicação React moderna construída com TypeScript, utilizando Vite como bundler e React Router para navegação. A aplicação segue uma arquitetura baseada em componentes com Context API para gerenciamento de estado global.

## 🏗️ Arquitetura Geral

### Stack Tecnológico
- **React 18** - Biblioteca principal para construção da interface
- **TypeScript** - Tipagem estática para maior robustez
- **Vite** - Build tool rápido e moderno
- **React Router v6** - Roteamento e navegação
- **Axios** - Cliente HTTP para comunicação com API
- **Context API** - Gerenciamento de estado global

### Estrutura de Pastas
```
frontend/
├── public/                 # Assets estáticos
├── src/
│   ├── components/         # Componentes reutilizáveis
│   │   └── AdminLayout.tsx # Layout do painel admin
│   ├── contexts/           # Contextos React (estado global)
│   │   └── AuthContext.tsx # Contexto de autenticação
│   ├── pages/              # Páginas/componentes de rota
│   │   ├── admin/          # Páginas do painel admin
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AuditLogs.tsx
│   │   │   ├── RoleManagement.tsx
│   │   │   ├── SystemInfo.tsx
│   │   │   ├── SystemSettings.tsx
│   │   │   └── UserManagement.tsx
│   │   ├── Dashboard.tsx   # Dashboard principal
│   │   ├── Landing.tsx     # Página inicial
│   │   ├── Login.tsx       # Página de login
│   │   └── Register.tsx    # Página de registro
│   ├── services/           # Serviços externos (API)
│   │   └── api.ts          # Configuração do cliente HTTP
│   ├── hooks/              # Hooks customizados (vazio)
│   ├── types/              # Definições de tipos (vazio)
│   ├── utils/              # Utilitários (vazio)
│   ├── App.tsx             # Componente principal
│   ├── App.css             # Estilos globais
│   ├── index.css           # CSS base
│   └── main.tsx            # Ponto de entrada
├── package.json            # Dependências e scripts
├── tsconfig.json           # Configuração TypeScript
├── tsconfig.node.json      # Config TS para Node
└── vite.config.ts          # Configuração do Vite
```

## 🔧 Configuração

### package.json
```json
{
  "name": "pinovara-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.12.0",
    "@typescript-eslint/parser": "^6.12.0",
    "eslint": "^8.54.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.4",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  }
}
```

### Vite Configuration (vite.config.ts)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

**Configurações importantes:**
- **Porta**: 5173 (desenvolvimento)
- **Proxy**: Redireciona `/api/*` para `http://localhost:3001`
- **HMR**: Hot Module Replacement habilitado

## 🎯 Sistema de Autenticação

### AuthContext
Localização: `src/contexts/AuthContext.tsx`

#### Interfaces TypeScript
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  active: boolean;
  roles: {
    id: string;
    name: string;
    module: {
      id: string;
      name: string;
    };
  }[];
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  hasRole: (moduleName: string, roleName?: string) => boolean;
}
```

#### Funcionalidades
- **Login/Register**: Comunicação com API de autenticação
- **Persistência**: Token e dados do usuário no localStorage
- **Auto-refresh**: Verificação automática de validade do token
- **Role checking**: Método `hasRole()` para verificação de permissões
- **Logout**: Limpeza de dados e redirecionamento

#### Armazenamento Local
```typescript
// Chaves utilizadas no localStorage
'@pinovara:token'  // JWT token
'@pinovara:user'   // Dados do usuário (JSON)
```

### Proteção de Rotas
```typescript
// Componente para rotas protegidas
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" />;
}

// Componente para rotas públicas (usuários logados são redirecionados)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Carregando...</div>;
  }

  return !user ? <>{children}</> : <Navigate to="/pinovara" />;
}
```

## 🌐 Cliente HTTP (API)

Localização: `src/services/api.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na API:', error);
    return Promise.reject(error);
  }
);

export default api;
```

**Configurações:**
- **Base URL**: `http://localhost:3001` (backend)
- **Timeout**: 10 segundos
- **Content-Type**: JSON automático
- **Error handling**: Interceptor global para erros

## 🧩 Componentes

### AdminLayout
Localização: `src/components/AdminLayout.tsx`

**Funcionalidades:**
- Layout responsivo com sidebar
- Verificação de permissões de admin
- Navegação organizada por seções
- Toggle da sidebar
- Header com informações do usuário

**Estrutura:**
```tsx
<div className="admin-layout">
  <header className="admin-header">...</header>
  <aside className="admin-sidebar">...</aside>
  <main className="admin-main">
    <div className="admin-content">
      <Outlet /> {/* Conteúdo das rotas filhas */}
    </div>
  </main>
</div>
```

## 📄 Páginas

### Estrutura de Roteamento (App.tsx)
```typescript
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="system-info" element={<SystemInfo />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="modules" element={<RoleManagement />} />
        <Route path="roles" element={<RoleManagement />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
```

### Páginas Implementadas

#### Públicas
- **Landing**: Página inicial com informações do sistema
- **Login**: Formulário de autenticação
- **Register**: Formulário de registro

#### Protegidas
- **Dashboard**: Dashboard principal do usuário
- **AdminDashboard**: Dashboard administrativo

#### Admin (requer permissões)
- **SystemInfo**: Informações do sistema
- **SystemSettings**: Configurações do sistema
- **AuditLogs**: Logs de auditoria
- **UserManagement**: Gestão de usuários
- **RoleManagement**: Gestão de módulos e papéis

## 🎨 Estilos

### Arquivos CSS
- **App.css**: Estilos específicos da aplicação
- **index.css**: CSS base e variáveis

### Estrutura de Classes CSS
```css
/* Layout Admin */
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e1e5e9;
}

.admin-sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  width: 250px;
  height: calc(100vh - 60px);
  background: #f8f9fa;
  border-right: 1px solid #e1e5e9;
}

.admin-main {
  margin-top: 60px;
  margin-left: 250px;
  padding: 20px;
  background: #f5f5f5;
  min-height: calc(100vh - 60px);
}
```

## 🚀 Desenvolvimento

### Comandos Disponíveis
```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento (porta 5173)

# Build
npm run build        # Build para produção
npm run preview      # Preview do build

# Qualidade de código
npm run lint         # Executa ESLint
```

### Desenvolvimento Local
1. Instalar dependências: `npm install`
2. Iniciar servidor: `npm run dev`
3. Acessar: `http://localhost:5173`

### Build para Produção
```bash
npm run build
# Arquivos gerados em: dist/
```

## 🔄 Estado da Aplicação

### Context API Structure
```
AuthProvider
├── user: User | null
├── token: string | null
├── loading: boolean
├── login()
├── register()
├── logout()
└── hasRole()
```

### Fluxo de Autenticação
1. **Login**: Usuário faz login → API retorna token → Context armazena dados
2. **Persistência**: Dados salvos no localStorage
3. **Verificação**: A cada carregamento, verifica validade do token
4. **Logout**: Limpa dados do contexto e localStorage

## 📱 Responsividade

### Breakpoints (sugeridos)
```css
/* Mobile */
@media (max-width: 768px) {
  .admin-sidebar {
    transform: translateX(-100%);
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .admin-sidebar {
    width: 200px;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .admin-sidebar {
    width: 250px;
  }
}
```

## 🔧 Melhorias Futuras

- [ ] Implementar sistema de temas (dark/light mode)
- [ ] Adicionar mais hooks customizados
- [ ] Implementar lazy loading para páginas
- [ ] Adicionar testes unitários
- [ ] Melhorar responsividade
- [ ] Adicionar notificações toast
- [ ] Implementar cache de dados
- [ ] Adicionar PWA capabilities

---

**Última atualização**: Dezembro 2024
**Versão**: 1.0.0
