import axios, { AxiosResponse } from 'axios';

// ========== CONFIGURAÇÃO DA API ==========

const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ========== INTERCEPTORS ==========

/**
 * Interceptor de resposta para tratamento de erros
 */
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    // Tratamento específico de erros de autenticação
    if (error.response?.status === 401) {
      // Token expirado ou inválido - limpar dados do localStorage
      localStorage.removeItem('@pinovara:token');
      localStorage.removeItem('@pinovara:user');
    }

    return Promise.reject(error);
  }
);

/**
 * Interceptor de requisição para adicionar token automaticamente
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@pinovara:token');

    // Não adicionar token para rotas de autenticação (login/register)
    if (config.url?.includes('/auth/')) {
      if (config.headers) {
        delete config.headers.Authorization;
      }
      return config;
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ========== TIPOS ==========

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
    code?: string;
    details?: any[];
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
}

export interface AuthUser {
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

export interface LoginResponse {
  user: AuthUser;
  token: string;
  expiresIn: number;
}

export interface RegisterResponse extends LoginResponse {}

// ========== SERVIÇOS DE AUTENTICAÇÃO ==========

export const authAPI = {
  /**
   * Registrar novo usuário
   */
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post<ApiResponse<RegisterResponse>>('/auth/register', data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro no registro');
    }

    return response.data.data!;
  },

  /**
   * Fazer login
   */
  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro no login');
    }

    return response.data.data!;
  },

  /**
   * Obter dados do usuário atual
   */
  me: async (): Promise<AuthUser> => {
    const response = await api.get<ApiResponse<{ user: AuthUser }>>('/auth/me');

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao obter dados do usuário');
    }

    return response.data.data!.user;
  },

  /**
   * Fazer logout
   */
  logout: async (): Promise<void> => {
    const response = await api.post<ApiResponse>('/auth/logout');

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro no logout');
    }
  },

  /**
   * Verificar se token é válido
   */
  verify: async (): Promise<{ authenticated: boolean; user?: AuthUser }> => {
    const response = await api.get<ApiResponse<{ user: AuthUser }>>('/auth/verify');

    if (!response.data.success) {
      return { authenticated: false };
    }

    return {
      authenticated: true,
      user: response.data.data!.user,
    };
  },
};

// ========== UTILITÁRIOS ==========

/**
 * Verificar se usuário tem uma permissão específica
 */
export const hasPermission = (user: AuthUser | null, moduleName: string, roleName?: string): boolean => {
  if (!user || !user.roles) return false;

  return user.roles.some(role => {
    const moduleMatch = role.module.name === moduleName;
    const roleMatch = !roleName || role.name === roleName;
    return moduleMatch && roleMatch;
  });
};

/**
 * Verificar se usuário tem qualquer uma das permissões
 */
export const hasAnyPermission = (user: AuthUser | null, permissions: { module: string; role?: string }[]): boolean => {
  if (!user) return false;

  return permissions.some(permission => hasPermission(user, permission.module, permission.role));
};

export default api;