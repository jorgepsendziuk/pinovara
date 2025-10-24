import axios, { AxiosResponse } from 'axios';
import { 
  OrganizacaoCompleta, 
  ListaOrganizacoesResponse, 
  FiltrosOrganizacao,
  CadastroOrganizacaoForm,
  DashboardStats,
  Estado,
  Municipio,
  Funcao,
  RespostaQuestionario
} from '../types/organizacao';

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
      // IGNORAR erro 401 da rota de login (senha incorreta é esperado)
      const isLoginRoute = error.config?.url?.includes('/auth/login');
      
      if (!isLoginRoute) {
        // Token expirado ou inválido - limpar dados do localStorage
        localStorage.removeItem('@pinovara:token');
        localStorage.removeItem('@pinovara:user');
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
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

    // Só adicionar token se ele existir e não for null/undefined
    if (!isPublicRoute && token && token !== 'null' && token !== 'undefined' && config.headers) {
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
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);

      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Erro no login');
      }

      return response.data.data!;
    } catch (error: any) {
      // Capturar mensagem de erro do backend
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      
      // Mensagens de erro específicas por código de status
      if (error.response?.status === 401) {
        throw new Error('Email ou senha incorretos');
      }
      
      if (error.response?.status === 403) {
        throw new Error('Acesso negado. Usuário inativo ou sem permissões');
      }
      
      if (error.response?.status === 429) {
        throw new Error('Muitas tentativas de login. Aguarde alguns minutos');
      }
      
      if (error.response?.status === 500) {
        throw new Error('Erro no servidor. Tente novamente mais tarde');
      }
      
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        throw new Error('Erro de conexão. Verifique sua internet e se o servidor está online');
      }
      
      // Erro genérico
      throw new Error(error.message || 'Erro ao fazer login');
    }
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

export const organizacaoAPI = {
  /**
   * Listar organizações com filtros avançados
   */
  list: async (filters: FiltrosOrganizacao = {}): Promise<ListaOrganizacoesResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get<ApiResponse<ListaOrganizacoesResponse>>(`/organizacoes?${params}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar organizações');
    }

    return response.data.data!;
  },

  /**
   * Buscar organização completa por ID
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
  create: async (data: Partial<CadastroOrganizacaoForm>): Promise<OrganizacaoCompleta> => {
    const response = await api.post<ApiResponse<OrganizacaoCompleta>>('/organizacoes', data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao criar organização');
    }

    return response.data.data!;
  },

  /**
   * Atualizar organização existente
   */
  update: async (id: number, data: Partial<CadastroOrganizacaoForm>): Promise<OrganizacaoCompleta> => {
    const response = await api.put<ApiResponse<OrganizacaoCompleta>>(`/organizacoes/${id}`, data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao atualizar organização');
    }

    return response.data.data!;
  },

  /**
   * Remover organização (soft delete)
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
  getDashboard: async (): Promise<DashboardStats> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/organizacoes/dashboard');

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao carregar dashboard');
    }

    return response.data.data!;
  }
};

// ========== SERVIÇOS AUXILIARES ==========

export const auxiliarAPI = {
  /**
   * Obter lista de estados
   */
  getEstados: async (): Promise<Estado[]> => {
    try {
      const response = await api.get<ApiResponse<Estado[]>>('/organizacoes/estados');

      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Erro ao carregar estados');
      }

      return response.data.data!;
    } catch (error) {
      // Fallback para dados padrão se API não estiver disponível
      console.warn('Usando dados padrão para estados:', error);

      return [
        { id: 1, nome: 'Minas Gerais', descricao: 'Minas Gerais', uf: 'MG', codigo_ibge: 31 },
        { id: 2, nome: 'Bahia', descricao: 'Bahia', uf: 'BA', codigo_ibge: 29 },
        { id: 3, nome: 'Espírito Santo', descricao: 'Espírito Santo', uf: 'ES', codigo_ibge: 32 },
        { id: 4, nome: 'São Paulo', descricao: 'São Paulo', uf: 'SP', codigo_ibge: 35 }
      ];
    }
  },

  /**
   * Obter municípios por estado
   */
  getMunicipios: async (estadoId?: number): Promise<Municipio[]> => {
    try {
      const params = estadoId ? `/${estadoId}` : '';
      const response = await api.get<ApiResponse<Municipio[]>>(`/organizacoes/municipios${params}`);

      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Erro ao carregar municípios');
      }

      return response.data.data!;
    } catch (error) {
      // Fallback para dados padrão
      console.warn('Usando dados padrão para municípios:', error);
      
      const municipiosPadrao = [
        { id: 1, nome: 'Diamantina', descricao: 'Diamantina', codigo_ibge: 3120904, estadoId: 1 },
        { id: 2, nome: 'Belo Horizonte', descricao: 'Belo Horizonte', codigo_ibge: 3106200, estadoId: 1 },
        { id: 3, nome: 'Salvador', descricao: 'Salvador', codigo_ibge: 2927408, estadoId: 2 },
        { id: 4, nome: 'Vitória', descricao: 'Vitória', codigo_ibge: 3205309, estadoId: 3 }
      ];
      
      return estadoId 
        ? municipiosPadrao.filter(m => m.estadoId === estadoId)
        : municipiosPadrao;
    }
  },

  /**
   * Obter lista de funções
   */
  getFuncoes: async (): Promise<Funcao[]> => {
    try {
      const response = await api.get<ApiResponse<Funcao[]>>('/auxiliar/funcoes');
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Erro ao carregar funções');
      }
      
      return response.data.data!;
    } catch (error) {
      // Fallback para dados padrão
      console.warn('Usando dados padrão para funções:', error);
      
      return [
        { id: 1, nome: 'Presidente', descricao: 'Presidente da organização' },
        { id: 2, nome: 'Vice-Presidente', descricao: 'Vice-Presidente da organização' },
        { id: 3, nome: 'Secretário', descricao: 'Secretário da organização' },
        { id: 4, nome: 'Tesoureiro', descricao: 'Tesoureiro da organização' },
        { id: 5, nome: 'Diretor', descricao: 'Diretor da organização' },
        { id: 6, nome: 'Coordenador', descricao: 'Coordenador da organização' },
        { id: 7, nome: 'Outro', descricao: 'Outra função' }
      ];
    }
  },

  /**
   * Obter respostas de questionário por categoria
   */
  getRespostasQuestionario: async (categoria?: string): Promise<RespostaQuestionario[]> => {
    try {
      const params = categoria ? `?categoria=${categoria}` : '';
      const response = await api.get<ApiResponse<RespostaQuestionario[]>>(`/auxiliar/respostas${params}`);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Erro ao carregar respostas');
      }
      
      return response.data.data!;
    } catch (error) {
      // Fallback para dados padrão
      console.warn('Usando dados padrão para respostas:', error);
      
      return [
        { id: 1, valor: 'Excelente', descricao: 'Totalmente implementado', categoria: 'avaliacao' },
        { id: 2, valor: 'Bom', descricao: 'Parcialmente implementado', categoria: 'avaliacao' },
        { id: 3, valor: 'Regular', descricao: 'Em desenvolvimento', categoria: 'avaliacao' },
        { id: 4, valor: 'Ruim', descricao: 'Não implementado', categoria: 'avaliacao' },
        { id: 5, valor: 'Não se aplica', descricao: 'Não aplicável', categoria: 'avaliacao' }
      ];
    }
  }
};

// ========== SERVIÇOS DE DOCUMENTOS ==========

export interface Documento {
  id: number;
  id_organizacao: number | null;
  arquivo: string | null;
  obs: string | null;
  creator_uri_user: string;
  creation_date: string;
  last_update_uri_user: string | null;
  last_update_date: string;
  uri: string;
  ordinal_number: number;
}

export const documentoAPI = {
  /**
   * Upload de documento
   */
  upload: async (organizacaoId: number, formData: FormData): Promise<Documento> => {
    const response = await api.post<ApiResponse<Documento>>(
      `/organizacoes/${organizacaoId}/documentos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao enviar documento');
    }

    return response.data.data!;
  },

  /**
   * Listar documentos de uma organização
   */
  list: async (organizacaoId: number): Promise<Documento[]> => {
    const response = await api.get<ApiResponse<Documento[]>>(
      `/organizacoes/${organizacaoId}/documentos`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar documentos');
    }

    return response.data.data!;
  },

  /**
   * Download de documento
   */
  download: async (organizacaoId: number, documentoId: number): Promise<void> => {
    const response = await api.get(
      `/organizacoes/${organizacaoId}/documentos/${documentoId}/download`,
      {
        responseType: 'blob',
      }
    );

    // Criar URL do blob e fazer download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Extrair nome do arquivo do header Content-Disposition
    const contentDisposition = response.headers['content-disposition'];
    let filename = 'documento.pdf'; // fallback
    
    if (contentDisposition) {
      // Tentar extrair o nome do arquivo do header (suporta diferentes formatos)
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
        // Decodificar se estiver em UTF-8
        if (filename.startsWith('UTF-8\'\'')) {
          filename = decodeURIComponent(filename.substring(7));
        }
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Deletar documento
   */
  delete: async (organizacaoId: number, documentoId: number): Promise<void> => {
    const response = await api.delete<ApiResponse>(
      `/organizacoes/${organizacaoId}/documentos/${documentoId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao deletar documento');
    }
  },

  /**
   * Sincronizar arquivos do ODK
   */
  syncFromODK: async (organizacaoId: number): Promise<any> => {
    const response = await api.post<ApiResponse>(
      `/organizacoes/${organizacaoId}/arquivos/sync`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao sincronizar arquivos do ODK');
    }

    return response.data.data;
  },

  /**
   * Listar arquivos disponíveis no ODK
   */
  listODKAvailable: async (organizacaoId: number): Promise<any> => {
    const response = await api.get<ApiResponse>(
      `/organizacoes/${organizacaoId}/arquivos/odk-disponiveis`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar arquivos disponíveis no ODK');
    }

    return response.data.data;
  }
};

// Interface para Foto
export interface Foto {
  id: number;
  uri: string;
  creator_uri_user: string;
  creation_date: Date;
  last_update_uri_user?: string | null;
  last_update_date: Date;
  parent_auri?: string | null;
  ordinal_number: number;
  top_level_auri?: string | null;
  grupo?: number | null;
  foto?: string | null;
  obs?: string | null;
  id_organizacao?: number | null;
}

export const fotoAPI = {
  /**
   * Upload de foto
   */
  upload: async (organizacaoId: number, formData: FormData): Promise<Foto> => {
    const response = await api.post<ApiResponse<Foto>>(
      `/organizacoes/${organizacaoId}/fotos`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao enviar foto');
    }

    return response.data.data!;
  },

  /**
   * Listar fotos de uma organização
   */
  list: async (organizacaoId: number): Promise<Foto[]> => {
    const response = await api.get<ApiResponse<Foto[]>>(
      `/organizacoes/${organizacaoId}/fotos`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar fotos');
    }

    return response.data.data || [];
  },

  /**
   * Download de foto
   */
  download: async (organizacaoId: number, fotoId: number): Promise<void> => {
    const response = await api.get(
      `/organizacoes/${organizacaoId}/fotos/${fotoId}/download`,
      { responseType: 'blob' }
    );

    // Extrair nome do arquivo do header Content-Disposition
    const contentDisposition = response.headers['content-disposition'];
    let filename = `foto_${fotoId}.jpg`; // fallback
    
    if (contentDisposition) {
      // Tentar extrair o nome do arquivo do header
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
        // Decodificar se estiver em UTF-8
        if (filename.startsWith('UTF-8\'\'')) {
          filename = decodeURIComponent(filename.substring(7));
        }
      }
    }

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Deletar foto
   */
  delete: async (organizacaoId: number, fotoId: number): Promise<void> => {
    const response = await api.delete<ApiResponse>(
      `/organizacoes/${organizacaoId}/fotos/${fotoId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao deletar foto');
    }
  },

  /**
   * Sincronizar fotos do ODK
   */
  syncFromODK: async (organizacaoId: number): Promise<any> => {
    const response = await api.post<ApiResponse>(
      `/organizacoes/${organizacaoId}/fotos/sync`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao sincronizar fotos do ODK');
    }

    return response.data.data;
  },

  /**
   * Listar fotos disponíveis no ODK
   */
  listODKAvailable: async (organizacaoId: number): Promise<any> => {
    const response = await api.get<ApiResponse>(
      `/organizacoes/${organizacaoId}/fotos/odk-disponiveis`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar fotos disponíveis no ODK');
    }

    return response.data.data;
  },
};

// ========== API DE ASSINATURAS ==========

export interface Assinatura {
  id: number;
  nome_arquivo: string;
  tipo: 'responsavel' | 'participante';
  participante_nome?: string;
  creation_date: string;
  creator_uri_user: string;
  tamanho_mb?: string;
  ja_sincronizada?: boolean;
}

export const assinaturaAPI = {
  /**
   * Listar assinaturas disponíveis no ODK
   */
  listODKAvailable: async (organizacaoId: number): Promise<{ total: number; assinaturas: Assinatura[] }> => {
    const response = await api.get<ApiResponse<{ total: number; assinaturas: Assinatura[] }>>(
      `/organizacoes/${organizacaoId}/assinaturas/odk-disponiveis`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar assinaturas disponíveis');
    }

    return response.data.data!;
  },

  /**
   * Sincronizar assinaturas do ODK
   */
  syncFromODK: async (organizacaoId: number): Promise<any> => {
    const response = await api.post<ApiResponse>(
      `/organizacoes/${organizacaoId}/assinaturas/sync`
    );

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao sincronizar assinaturas');
    }

    return response.data.data;
  },

  /**
   * Download de assinatura
   */
  download: async (organizacaoId: number, nomeArquivo: string): Promise<void> => {
    const response = await api.get(
      `/organizacoes/${organizacaoId}/assinaturas/${nomeArquivo}/view`,
      { responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', nomeArquivo);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default api;