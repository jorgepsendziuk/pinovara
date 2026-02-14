import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, AuthUser, LoginResponse, RegisterResponse, hasPermission, hasAnyPermission, hasPermissionCode } from '../services/api';
import AccessDenied from '../pages/AccessDenied';

// ========== INTERFACES ==========

interface RegisterData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthContextData {
  // Estado
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isImpersonating: boolean;
  originalUser: AuthUser | null;

  // Ações
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;

  // Utilitários
  hasPermission: (moduleName: string, roleName?: string) => boolean;
  hasAnyPermission: (permissions: { module: string; role?: string }[]) => boolean;
  /** Verifica permissão por código (ex: 'qualificacoes.edit'). Usa dados de role_permissions quando disponível. */
  hasPermissionCode: (code: string) => boolean;
  isAdmin: () => boolean;
  isCoordinator: () => boolean;
  isSupervisor: () => boolean;
  refreshUser: () => Promise<void>;
  refreshToken: () => Promise<void>;
  stopImpersonation: () => void;
  expiresIn: number | null;
}

// ========== CONTEXTO ==========

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// ========== PROVIDER ==========

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [originalUser, setOriginalUser] = useState<AuthUser | null>(null);
  const [expiresIn, setExpiresIn] = useState<number | null>(null);

  // ========== UTILITÁRIOS ==========

  const isAuthenticated = !!user && !!token;

  // ========== AÇÕES ==========

  /**
   * Fazer login
   */
  const login = async (data: LoginData): Promise<void> => {
    try {
      setLoading(true);

      const response: LoginResponse = await authAPI.login(data);

      // Atualizar estado
      setUser(response.user);
      setToken(response.token);
      setExpiresIn(response.expiresIn);

      // Salvar no localStorage
      localStorage.setItem('@pinovara:token', response.token);
      localStorage.setItem('@pinovara:user', JSON.stringify(response.user));
      localStorage.setItem('@pinovara:tokenCreatedAt', Date.now().toString());
      localStorage.setItem('@pinovara:expiresIn', response.expiresIn.toString());

      console.log('✅ Login realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registrar novo usuário
   */
  const register = async (data: RegisterData): Promise<void> => {
    try {
      setLoading(true);

      const response: RegisterResponse = await authAPI.register(data);

      // Atualizar estado
      setUser(response.user);
      setToken(response.token);
      setExpiresIn(response.expiresIn);

      // Salvar no localStorage
      localStorage.setItem('@pinovara:token', response.token);
      localStorage.setItem('@pinovara:user', JSON.stringify(response.user));
      localStorage.setItem('@pinovara:tokenCreatedAt', Date.now().toString());
      localStorage.setItem('@pinovara:expiresIn', response.expiresIn.toString());

      console.log('✅ Registro realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fazer logout
   */
  const logout = (): void => {
    // Se está personificando, voltar ao usuário original
    if (isImpersonating && originalUser) {
      stopImpersonation();
      return;
    }

    // Limpar estado
    setUser(null);
    setToken(null);
    setIsImpersonating(false);
    setOriginalUser(null);

    // Limpar localStorage
    localStorage.removeItem('@pinovara:token');
    localStorage.removeItem('@pinovara:user');
    localStorage.removeItem('@pinovara:originalUser');
    localStorage.removeItem('@pinovara:tokenCreatedAt');
    localStorage.removeItem('@pinovara:expiresIn');
    setExpiresIn(null);

    console.log('👋 Logout realizado');
  };

  const stopImpersonation = (): void => {
    if (!originalUser) return;

    // Restaurar usuário original
    setUser(originalUser);
    setIsImpersonating(false);
    setOriginalUser(null);

    // Restaurar token original
    const originalToken = localStorage.getItem('@pinovara:token');
    if (originalToken) {
      setToken(originalToken);
      localStorage.setItem('@pinovara:user', JSON.stringify(originalUser));
    }

    // Limpar dados de personificação
    localStorage.removeItem('@pinovara:originalUser');

    console.log('🔄 Personificação encerrada, retornando ao usuário original');
  };

  /**
   * Atualizar dados do usuário
   */
  const refreshUser = async (): Promise<void> => {
    try {
      if (!token) return;

      const userData = await authAPI.me();
      setUser(userData);

      // Atualizar localStorage
      localStorage.setItem('@pinovara:user', JSON.stringify(userData));

      console.log('🔄 Dados do usuário atualizados:', userData.name);
    } catch (error) {
      console.error('❌ Erro ao atualizar dados do usuário:', error);

      // Se erro de autenticação, fazer logout
      if (error instanceof Error && (
        error.message.includes('Token') ||
        error.message.includes('não autenticado')
      )) {
        logout();
      }
    }
  };

  /**
   * Renovar token de autenticação
   */
  const refreshToken = async (): Promise<void> => {
    try {
      if (!token) {
        throw new Error('Token não disponível');
      }

      const response = await authAPI.refresh();

      // Atualizar estado
      setUser(response.user);
      setToken(response.token);
      setExpiresIn(response.expiresIn);

      // Atualizar localStorage
      localStorage.setItem('@pinovara:token', response.token);
      localStorage.setItem('@pinovara:user', JSON.stringify(response.user));
      localStorage.setItem('@pinovara:tokenCreatedAt', Date.now().toString());
      localStorage.setItem('@pinovara:expiresIn', response.expiresIn.toString());

      console.log('🔄 Token renovado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao renovar token:', error);
      throw error;
    }
  };

  // ========== PERMISSÕES ==========

  /**
   * Verificar se usuário tem uma permissão específica
   */
  const checkPermission = (moduleName: string, roleName?: string): boolean => {
    return hasPermission(user, moduleName, roleName);
  };

  /**
   * Verificar se usuário tem qualquer uma das permissões
   */
  const checkAnyPermission = (permissions: { module: string; role?: string }[]): boolean => {
    return hasAnyPermission(user, permissions);
  };

  /**
   * Verificar se usuário tem uma permissão por código
   */
  const checkPermissionCode = (code: string): boolean => {
    return hasPermissionCode(user, code);
  };

  /**
   * Verificar se usuário é administrador
   */
  const isAdmin = (): boolean => {
    return user?.roles?.some(role => 
      role.module.name === 'sistema' && role.name === 'admin'
    ) || false;
  };

  /**
   * Verificar se usuário é coordenador
   */
  const isCoordinator = (): boolean => {
    return user?.roles?.some(role => 
      role.module.name === 'organizacoes' && role.name === 'coordenador'
    ) || false;
  };

  /**
   * Verificar se usuário é supervisor (mesmas permissões que coordenador)
   */
  const isSupervisor = (): boolean => {
    return user?.roles?.some(role => 
      role.module.name === 'organizacoes' && role.name === 'supervisao'
    ) || false;
  };

  // ========== CICLO DE VIDA ==========

  /**
   * Carregar dados do localStorage ao inicializar
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('@pinovara:token');
        const storedUser = localStorage.getItem('@pinovara:user');
        const storedOriginalUser = localStorage.getItem('@pinovara:originalUser');

        if (storedToken && storedUser) {
          setToken(storedToken);
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);

          // Carregar expiresIn se disponível (pode não estar em sessões antigas)
          const storedExpiresIn = localStorage.getItem('@pinovara:expiresIn');
          if (storedExpiresIn) {
            setExpiresIn(parseInt(storedExpiresIn));
          } else {
            // Se não existe, usar padrão de 7 dias
            setExpiresIn(7 * 24 * 60 * 60);
          }

          // Verificar se está em modo de personificação
          if (storedOriginalUser) {
            setIsImpersonating(true);
            setOriginalUser(JSON.parse(storedOriginalUser));
            console.log('🎭 Modo de personificação ativo:', parsedUser.name);
          }

          console.log('👤 Usuário carregado do localStorage:', parsedUser.name, '(ID:', parsedUser.id, ')');
          
          // Revalidar dados do usuário com o backend
          await refreshUser();
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar autenticação:', error);
        logout(); // Limpar dados inválidos
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Verificar validade do token periodicamente (menos frequente)
   */
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(async () => {
      try {
        const response = await authAPI.verify();
        if (!response.authenticated) {
          console.warn('⚠️ Token inválido, fazendo logout');
          logout();
        }
      } catch (error) {
        // Só fazer logout se for erro específico de token expirado
        if (error instanceof Error &&
            (error.message.includes('Token expirado') ||
             error.message.includes('Token inválido'))) {
          console.warn('⚠️ Token expirado/inválido, fazendo logout');
          logout();
        } else {
          console.warn('⚠️ Erro temporário na verificação de token, mantendo sessão');
        }
      }
    }, 60 * 60 * 1000); // Verificar a cada 1 hora

    return () => clearInterval(interval);
  }, [token]);

  // ========== VALOR DO CONTEXTO ==========

  const contextValue: AuthContextData = {
    // Estado
    user,
    token,
    loading,
    isAuthenticated,
    isImpersonating,
    originalUser,
    expiresIn,

    // Ações
    login,
    register,
    logout,

    // Utilitários
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasPermissionCode: checkPermissionCode,
    isAdmin,
    isCoordinator,
    isSupervisor,
    refreshUser,
    refreshToken,
    stopImpersonation,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ========== HOOK ==========

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }

  return context;
}

// ========== COMPONENTES DE AUTENTICAÇÃO ==========

/**
 * Componente para proteger rotas que requerem autenticação
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AccessDenied
        title="Acesso Restrito"
        message="Você precisa estar logado para acessar esta página."
        showLoginButton={true}
        showDashboardButton={false}
      />
    );
  }

  return <>{children}</>;
}

/**
 * Componente para rotas públicas (usuários logados são redirecionados)
 */
export function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Redirecionar para a dashboard do usuário quando já autenticado
      navigate('/pinovara', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    // Mostrar mensagem enquanto redireciona
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Você já está logado. Redirecionando...</p>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Componente para proteger conteúdo baseado em permissões
 */
export function PermissionGuard({
  children,
  module,
  role,
  permissions,
  fallback = null
}: {
  children: ReactNode;
  module?: string;
  role?: string;
  permissions?: { module: string; role?: string }[];
  fallback?: ReactNode;
}) {
  const { hasPermission, hasAnyPermission } = useAuth();

  let hasAccess = false;

  if (permissions) {
    hasAccess = hasAnyPermission(permissions);
  } else if (module) {
    hasAccess = hasPermission(module, role);
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Mostrar página de acesso negado com detalhes específicos
    return (
      <AccessDenied
        title="Permissão Insuficiente"
        message="Você não tem as permissões necessárias para acessar este conteúdo."
        showLoginButton={false}
        showDashboardButton={true}
        moduleName={module}
        requiredRole={role}
        contactAdmin={true}
      />
    );
  }

  return <>{children}</>;
}
