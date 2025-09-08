import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, AuthUser, LoginResponse, RegisterResponse, hasPermission, hasAnyPermission } from '../services/api';
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

  // Ações
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;

  // Utilitários
  hasPermission: (moduleName: string, roleName?: string) => boolean;
  hasAnyPermission: (permissions: { module: string; role?: string }[]) => boolean;
  refreshUser: () => Promise<void>;
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

      // Salvar no localStorage
      localStorage.setItem('@pinovara:token', response.token);
      localStorage.setItem('@pinovara:user', JSON.stringify(response.user));

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

      // Salvar no localStorage
      localStorage.setItem('@pinovara:token', response.token);
      localStorage.setItem('@pinovara:user', JSON.stringify(response.user));

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
    // Limpar estado
    setUser(null);
    setToken(null);

    // Limpar localStorage
    localStorage.removeItem('@pinovara:token');
    localStorage.removeItem('@pinovara:user');

    console.log('👋 Logout realizado');
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

      console.log('🔄 Dados do usuário atualizados');
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

  // ========== CICLO DE VIDA ==========

  /**
   * Carregar dados do localStorage ao inicializar
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('@pinovara:token');
        const storedUser = localStorage.getItem('@pinovara:user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verificar se token ainda é válido
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
   * Verificar validade do token periodicamente
   */
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(async () => {
      try {
        await authAPI.verify();
      } catch (error) {
        console.warn('⚠️ Token inválido, fazendo logout');
        logout();
      }
    }, 5 * 60 * 1000); // Verificar a cada 5 minutos

    return () => clearInterval(interval);
  }, [token]);

  // ========== VALOR DO CONTEXTO ==========

  const contextValue: AuthContextData = {
    // Estado
    user,
    token,
    loading,
    isAuthenticated,

    // Ações
    login,
    register,
    logout,

    // Utilitários
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    refreshUser,
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirecionar para dashboard ou página inicial
    return (
      <div className="redirecting">
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
