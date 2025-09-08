# Sistema de Autenticação - PINOVARA

## 🔐 Visão Geral

O sistema de autenticação do PINOVARA é baseado em JWT (JSON Web Tokens) com sistema de roles e permissões baseado em módulos. A implementação atual utiliza bcrypt para hashing de senhas e inclui middleware de proteção de rotas.

## 🏗️ Arquitetura

### Componentes Principais

#### Backend
- **AuthService**: Lógica de negócio da autenticação
- **authController**: Controladores dos endpoints de auth
- **authMiddleware**: Middlewares de proteção de rotas
- **authRoutes**: Definição das rotas de autenticação

#### Frontend
- **AuthContext**: Context React para gerenciamento de estado
- **ProtectedRoute**: Componente para rotas protegidas
- **API Service**: Cliente HTTP configurado

### Fluxo de Autenticação

```
1. Registro/Login → 2. Validação → 3. Geração Token → 4. Armazenamento → 5. Uso em Requisições
```

## 🔧 Implementação Técnica

### 1. AuthService (Backend)

Localização: `backend/src/services/authService.ts`

#### Interfaces TypeScript
```typescript
export interface AuthPayload {
  userId: string;
  email: string;
  name: string;
  roles: {
    id: string;
    name: string;
    module: {
      id: string;
      name: string;
    };
  }[];
}
```

#### Métodos Principais

##### `hashPassword(password: string)`
```typescript
static async hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
```
- Utiliza bcrypt com custo 12
- Retorna hash da senha

##### `comparePassword(password: string, hash: string)`
```typescript
static async comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```
- Compara senha plain text com hash
- Retorna boolean

##### `generateToken(payload: AuthPayload)`
```typescript
static generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, this.JWT_SECRET, {
    expiresIn: this.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}
```
- Gera token JWT com payload personalizado
- Inclui roles e módulos do usuário

##### `verifyToken(token: string)`
```typescript
static verifyToken(token: string): AuthPayload {
  return jwt.verify(token, this.JWT_SECRET) as AuthPayload;
}
```
- Verifica e decodifica token JWT
- Lança erro se token inválido/expirado

#### Registro de Usuário
```typescript
static async register(data: z.infer<typeof registerSchema>) {
  // 1. Validar dados
  const validatedData = registerSchema.parse(data);

  // 2. Verificar se usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });

  if (existingUser) {
    throw new Error('Usuário já existe com este email');
  }

  // 3. Hash da senha
  const hashedPassword = await this.hashPassword(validatedData.password);

  // 4. Criar usuário
  const user = await prisma.user.create({
    data: {
      email: validatedData.email,
      password: hashedPassword,
      name: validatedData.name,
    },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              module: true,
            },
          },
        },
      },
    },
  });

  // 5. Preparar payload para token
  const tokenPayload: AuthPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    roles: user.userRoles.map((userRole) => ({
      id: userRole.role.id,
      name: userRole.role.name,
      module: {
        id: userRole.role.module.id,
        name: userRole.role.module.name,
      },
    })),
  };

  const token = this.generateToken(tokenPayload);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      active: user.active,
      roles: tokenPayload.roles,
    },
    token,
  };
}
```

#### Login de Usuário
```typescript
static async login(data: z.infer<typeof loginSchema>) {
  // 1. Validar dados
  const validatedData = loginSchema.parse(data);

  // 2. Buscar usuário
  const user = await prisma.user.findUnique({
    where: { email: validatedData.email },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              module: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('Credenciais inválidas');
  }

  if (!user.active) {
    throw new Error('Usuário desativado');
  }

  // 3. Verificar senha
  const isValidPassword = await this.comparePassword(
    validatedData.password,
    user.password
  );

  if (!isValidPassword) {
    throw new Error('Credenciais inválidas');
  }

  // 4. Preparar payload para token
  const tokenPayload: AuthPayload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    roles: user.userRoles.map((userRole) => ({
      id: userRole.role.id,
      name: userRole.role.name,
      module: {
        id: userRole.role.module.id,
        name: userRole.role.module.name,
      },
    })),
  };

  const token = this.generateToken(tokenPayload);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      active: user.active,
      roles: tokenPayload.roles,
    },
    token,
  };
}
```

### 2. AuthController (Backend)

Localização: `backend/src/controllers/authController.ts`

#### Rate Limiting
```typescript
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas por IP
  message: {
    error: {
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
```

#### Métodos do Controller

##### `register(req: Request, res: Response)`
- Recebe dados de registro
- Chama AuthService.register()
- Retorna usuário e token ou erro

##### `login(req: Request, res: Response)`
- Recebe credenciais de login
- Chama AuthService.login()
- Retorna usuário e token ou erro

##### `me(req: Request, res: Response)`
- Verifica se usuário está autenticado
- Retorna dados do usuário atual

##### `logout(req: Request, res: Response)`
- Implementação básica (não invalida token)
- Retorna mensagem de sucesso

### 3. AuthMiddleware (Backend)

Localização: `backend/src/middleware/authMiddleware.ts`

#### authenticateToken
```typescript
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: {
          message: 'Token de acesso não fornecido',
          statusCode: 401,
        },
      });
      return;
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (!token) {
      res.status(401).json({
        error: {
          message: 'Token de acesso inválido',
          statusCode: 401,
        },
      });
      return;
    }

    const decoded = AuthService.verifyToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          error: {
            message: 'Token expirado',
            statusCode: 401,
          },
        });
        return;
      }

      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
          error: {
            message: 'Token inválido',
            statusCode: 401,
          },
        });
        return;
      }
    }

    res.status(500).json({
      error: {
        message: 'Erro interno do servidor',
        statusCode: 500,
      },
    });
  }
};
```

#### requireRole
```typescript
export const requireRole = (moduleNames: string[], roleNames?: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'Usuário não autenticado',
          statusCode: 401,
        },
      });
      return;
    }

    const userRoles = req.user.roles;

    // Verificar se o usuário tem papel em pelo menos um dos módulos especificados
    const hasModuleAccess = userRoles.some(role =>
      moduleNames.includes(role.module.name)
    );

    if (!hasModuleAccess) {
      res.status(403).json({
        error: {
          message: `Acesso negado. Requer acesso aos módulos: ${moduleNames.join(', ')}`,
          statusCode: 403,
        },
      });
      return;
    }

    // Se papéis específicos foram especificados, verificar também os papéis
    if (roleNames && roleNames.length > 0) {
      const hasRoleAccess = userRoles.some(role =>
        moduleNames.includes(role.module.name) && roleNames.includes(role.name)
      );

      if (!hasRoleAccess) {
        res.status(403).json({
          error: {
            message: `Acesso negado. Requer um dos papéis: ${roleNames.join(', ')} nos módulos: ${moduleNames.join(', ')}`,
            statusCode: 403,
          },
        });
        return;
      }
    }

    next();
  };
};
```

#### requireAnyRole
```typescript
export const requireAnyRole = (roles: { module: string; role?: string }[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: {
          message: 'Usuário não autenticado',
          statusCode: 401,
        },
      });
      return;
    }

    const userRoles = req.user.roles;

    // Verificar se o usuário tem pelo menos um dos papéis especificados
    const hasRequiredRole = roles.some(requiredRole => {
      return userRoles.some(userRole => {
        const moduleMatch = userRole.module.name === requiredRole.module;
        const roleMatch = !requiredRole.role || userRole.name === requiredRole.role;
        return moduleMatch && roleMatch;
      });
    });

    if (!hasRequiredRole) {
      const roleDescriptions = roles.map(r =>
        `${r.role ? r.role + ' em ' : ''}${r.module}`
      ).join(', ');

      res.status(403).json({
        error: {
          message: `Acesso negado. Requer um dos seguintes papéis: ${roleDescriptions}`,
          statusCode: 403,
        },
      });
      return;
    }

    next();
  };
};
```

### 4. AuthContext (Frontend)

Localização: `frontend/src/contexts/AuthContext.tsx`

#### Estado Global
```typescript
const [user, setUser] = useState<User | null>(null);
const [token, setToken] = useState<string | null>(null);
const [loading, setLoading] = useState(true);
```

#### Login
```typescript
const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    const { user: userData, token: userToken } = response.data.data;

    setUser(userData);
    setToken(userToken);

    localStorage.setItem('@pinovara:token', userToken);
    localStorage.setItem('@pinovara:user', JSON.stringify(userData));

    api.defaults.headers.authorization = `Bearer ${userToken}`;
  } catch (error: any) {
    const errorMessage = error.response?.data?.error?.message || 'Erro no login';
    throw new Error(errorMessage);
  }
};
```

#### Verificação de Token
```typescript
useEffect(() => {
  if (token) {
    api.get('/auth/me')
      .then(response => {
        setUser(response.data.data.user);
      })
      .catch(() => {
        logout();
      });
  }
}, [token]);
```

#### Verificação de Roles
```typescript
const hasRole = (moduleName: string, roleName?: string) => {
  if (!user || !user.roles) return false;

  return user.roles.some(userRole => {
    const moduleMatch = userRole.module.name === moduleName;
    const roleMatch = !roleName || userRole.name === roleName;
    return moduleMatch && roleMatch;
  });
};
```

### 5. API Service (Frontend)

Localização: `frontend/src/services/api.ts`

```typescript
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

## 🔑 Sistema de Roles e Permissões

### Estrutura de Dados

#### Módulos
- `id`: Identificador único
- `name`: Nome do módulo (ex: "sistema", "vendas")
- `description`: Descrição opcional
- `active`: Status do módulo

#### Roles
- `id`: Identificador único
- `name`: Nome do papel (ex: "admin", "editor")
- `description`: Descrição opcional
- `moduleId`: Referência ao módulo
- `active`: Status do papel

#### UserRoles
- `id`: Identificador único
- `userId`: Referência ao usuário
- `roleId`: Referência ao papel

### Verificação de Permissões

#### No Backend
```typescript
// Verificar se usuário tem papel específico
requireAnyRole([{ module: 'sistema', role: 'admin' }])

// Verificar se usuário tem acesso ao módulo
requireRole(['sistema'], ['admin', 'editor'])
```

#### No Frontend
```typescript
// Verificar se usuário tem papel específico
const isAdmin = hasRole('sistema', 'admin');

// Verificar se usuário tem acesso ao módulo
const hasSystemAccess = hasRole('sistema');
```

## 🔒 Segurança

### Rate Limiting
- **Tentativas**: Máximo 5 por IP a cada 15 minutos
- **Aplicado em**: Registro e login
- **Resposta**: HTTP 429 (Too Many Requests)

### Validação de Dados
```typescript
// Schema de registro
export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
});

// Schema de login
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});
```

### Hashing de Senhas
- **Algoritmo**: bcrypt
- **Custo**: 12 (recomendado)
- **Salt**: Gerado automaticamente

### JWT
- **Biblioteca**: jsonwebtoken
- **Expiração**: Configurável (padrão: 24h)
- **Payload**: Contém userId, email, name e roles
- **Segurança**: Chave secreta obrigatória

## 🚨 Tratamento de Erros

### Tipos de Erro

#### Autenticação
- `401 Unauthorized`: Token não fornecido/inválido/expirado
- `403 Forbidden`: Permissões insuficientes
- `429 Too Many Requests`: Rate limit excedido

#### Validação
- `400 Bad Request`: Dados inválidos
- `409 Conflict`: Usuário já existe

#### Sistema
- `500 Internal Server Error`: Erro interno

### Tratamento no Frontend
```typescript
try {
  const response = await api.post('/auth/login', credentials);
  // Sucesso
} catch (error: any) {
  const errorMessage = error.response?.data?.error?.message || 'Erro desconhecido';
  // Tratar erro
}
```

## 📊 Logs de Auditoria

### Eventos Rastreados
- Login de usuários
- Tentativas de acesso não autorizado
- Mudanças em roles e permissões
- Operações administrativas

### Estrutura do Log
```json
{
  "id": "log_id",
  "action": "LOGIN",
  "entity": "users",
  "entityId": "user_id",
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Configuração

### Variáveis de Ambiente
```env
# JWT
JWT_SECRET="sua-chave-secreta-aqui"
JWT_EXPIRES_IN="24h"

# CORS
FRONTEND_URL="http://localhost:5173"
```

### Rate Limiting
```typescript
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas
});
```

## 🐛 Problemas Conhecidos

### 1. Logout Não Invalida Token
- **Problema**: Tokens não são invalidados no logout
- **Solução**: Implementar blacklist de tokens (Redis)

### 2. Refresh Tokens
- **Problema**: Não há sistema de refresh tokens
- **Solução**: Implementar tokens de refresh

### 3. Sessões Múltiplas
- **Problema**: Mesmo usuário pode ter múltiplas sessões ativas
- **Solução**: Implementar controle de sessões

### 4. Verificação de Senha Forte
- **Problema**: Não há validação de força de senha
- **Solução**: Implementar regras de senha forte

## 🚀 Melhorias Sugeridas

### Segurança
- [ ] Implementar refresh tokens
- [ ] Adicionar blacklist de tokens (Redis)
- [ ] Implementar 2FA
- [ ] Adicionar validação de senha forte
- [ ] Implementar rate limiting mais granular

### Funcionalidades
- [ ] Sistema de recuperação de senha
- [ ] Bloqueio de conta após tentativas falhidas
- [ ] Logs de auditoria mais detalhados
- [ ] Controle de sessão (logout remoto)
- [ ] OAuth integration (Google, GitHub)

### Performance
- [ ] Cache de permissões (Redis)
- [ ] Otimização de queries de roles
- [ ] Lazy loading de dados do usuário

---

**Última atualização**: Dezembro 2024
**Versão**: 1.0.0
**Status**: Implementado (será removido e refatorado)
