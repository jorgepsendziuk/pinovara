import axios, { AxiosResponse } from 'axios';

// ========== CONFIGURAÇÃO DA API ==========

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3001').replace('8080', '3001'),
  timeout: import.meta.env.VITE_API_TIMEOUT ? parseInt(import.meta.env.VITE_API_TIMEOUT) : 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request logging in development
if (import.meta.env.VITE_API_LOGGING === 'true' && import.meta.env.VITE_NODE_ENV !== 'production') {
  api.interceptors.request.use(
    (config) => {
      console.log(`🔵 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
      return config;
    },
    (error) => {
      console.error('🔴 API Request Error:', error);
      return Promise.reject(error);
    }
  );
}

// ========== INTERCEPTORS ==========

/**
 * Interceptor de resposta para tratamento de erros
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (import.meta.env.VITE_API_LOGGING === 'true' && import.meta.env.VITE_NODE_ENV !== 'production') {
      console.log(`🟢 API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Log errors in development
    if (import.meta.env.VITE_API_LOGGING === 'true' && import.meta.env.VITE_NODE_ENV !== 'production') {
      console.error(`🔴 API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data);
    }

    // Tratamento específico de erros de autenticação
    if (error.response?.status === 401) {
      // Token expirado ou inválido - limpar dados do localStorage
      localStorage.removeItem('@pinovara:token');
      localStorage.removeItem('@pinovara:user');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
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

    // Rotas que não precisam de token
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/verify', '/health'];
    const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));

    if (!isPublicRoute && token && config.headers) {
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

// ========== SERVIÇOS DE ORGANIZAÇÕES ==========

export interface OrganizacaoData {
  id: number;
  nome?: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  estado?: number;
  municipio?: number;
  dataFundacao?: string;
  dataVisita?: string;
}

export interface OrganizacaoCompleta extends OrganizacaoData {
  abrangenciaPj: Array<{
    id: number;
    razaoSocial?: string;
    cnpjPj?: string;
    numSociosCaf?: number;
    numSociosTotal?: number;
  }>;
  abrangenciaSocio: Array<{
    id: number;
    numSocios?: number;
    estado?: number;
    municipio?: number;
  }>;
  arquivos: Array<{
    id: number;
    arquivo?: string;
    obs?: string;
  }>;
  fotos: Array<{
    id: number;
    foto?: string;
    obs?: string;
  }>;
  producoes: Array<{
    id: number;
    cultura?: string;
    anual?: number;
    mensal?: number;
  }>;
}

export interface OrganizacaoListResponse {
  organizacoes: OrganizacaoData[];
  total: number;
  pagina: number;
  totalPaginas: number;
  limit: number;
}

export const organizacaoAPI = {
  /**
   * Listar organizações
   */
  list: async (filters: {
    nome?: string;
    cnpj?: string;
    estado?: number;
    municipio?: number;
    page?: number;
    limit?: number;
  } = {}): Promise<OrganizacaoListResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get<ApiResponse<OrganizacaoListResponse>>(`/organizacoes?${params}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar organizações');
    }

    return response.data.data!;
  },

  /**
   * Buscar organização por ID
   */
  getById: async (id: number): Promise<OrganizacaoCompleta> => {
    const response = await api.get<ApiResponse<OrganizacaoCompleta>>(`/organizacoes/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao buscar organização');
    }

    return response.data.data!;
  },

  /**
   * Criar nova organização
   */
  create: async (data: Partial<OrganizacaoData>): Promise<OrganizacaoData> => {
    const response = await api.post<ApiResponse<OrganizacaoData>>('/organizacoes', data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao criar organização');
    }

    return response.data.data!;
  },

  /**
   * Atualizar organização
   */
  update: async (id: number, data: Partial<OrganizacaoData>): Promise<OrganizacaoData> => {
    const response = await api.put<ApiResponse<OrganizacaoData>>(`/organizacoes/${id}`, data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao atualizar organização');
    }

    return response.data.data!;
  },

  /**
   * Remover organização
   */
  delete: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/organizacoes/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao remover organização');
    }
  },

  /**
   * Obter estatísticas do dashboard
   */
  getDashboard: async () => {
    const response = await api.get<ApiResponse<any>>('/organizacoes/dashboard');

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao carregar dashboard');
    }

    return response.data.data!;
  }
};

export default api;