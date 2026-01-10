import api from './api';
import { Capacitacao, CapacitacaoFilters, CapacitacaoListResponse, CapacitacaoInscricao, CreateInscricaoData, CapacitacaoPresenca, CreatePresencaData, CapacitacaoEvidencia, CreateEvidenciaData } from '../types/capacitacao';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
  };
  timestamp?: string;
}

export const capacitacaoAPI = {
  /**
   * Listar capacitações com filtros
   */
  list: async (filters: CapacitacaoFilters = {}): Promise<CapacitacaoListResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get<ApiResponse<CapacitacaoListResponse>>(`/capacitacoes?${params}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar capacitações');
    }

    return response.data.data!;
  },

  /**
   * Buscar capacitação por ID
   */
  getById: async (id: number): Promise<Capacitacao> => {
    const response = await api.get<ApiResponse<Capacitacao>>(`/capacitacoes/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao buscar capacitação');
    }

    return response.data.data!;
  },

  /**
   * Buscar capacitação por link de inscrição (público)
   */
  getByLinkInscricao: async (linkInscricao: string): Promise<Capacitacao> => {
    const apiBase = import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3001').replace('8080', '3001');
    const response = await fetch(`${apiBase}/capacitacoes/public/${linkInscricao}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = {};
      }
      const errorMessage = errorData.error?.message || `Erro ao buscar capacitação: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const data: ApiResponse<Capacitacao> = await response.json();

    if (!data.success || !data.data) {
      throw new Error(data.error?.message || 'Capacitação não encontrada');
    }

    return data.data;
  },

  /**
   * Buscar capacitação por link de avaliação (público)
   */
  getByLinkAvaliacao: async (linkAvaliacao: string): Promise<{ capacitacao: Capacitacao; versao_avaliacao: any }> => {
    const apiBase = import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3001').replace('8080', '3001');
    const response = await fetch(`${apiBase}/capacitacoes/public/${linkAvaliacao}/avaliacao`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Erro ao buscar capacitação: ${response.statusText}`);
    }

    const data: ApiResponse<{ capacitacao: Capacitacao; versao_avaliacao: any }> = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'Erro ao buscar capacitação');
    }

    return data.data!;
  },

  /**
   * Verificar se um email está inscrito (público)
   */
  verificarInscricao: async (linkInscricao: string, email: string): Promise<CapacitacaoInscricao> => {
    const apiBase = import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3001').replace('8080', '3001');
    const response = await fetch(`${apiBase}/capacitacoes/public/${linkInscricao}/verificar-inscricao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Erro ao verificar inscrição: ${response.statusText}`);
    }

    const data: ApiResponse<CapacitacaoInscricao> = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || 'Erro ao verificar inscrição');
    }

    return data.data!;
  },

  /**
   * Criar nova capacitação
   */
  create: async (data: Partial<Capacitacao>): Promise<Capacitacao> => {
    const response = await api.post<ApiResponse<Capacitacao>>('/capacitacoes', data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao criar capacitação');
    }

    return response.data.data!;
  },

  /**
   * Atualizar capacitação existente
   */
  update: async (id: number, data: Partial<Capacitacao>): Promise<Capacitacao> => {
    const response = await api.put<ApiResponse<Capacitacao>>(`/capacitacoes/${id}`, data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao atualizar capacitação');
    }

    return response.data.data!;
  },

  /**
   * Excluir capacitação
   */
  delete: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/capacitacoes/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao excluir capacitação');
    }
  },

  /**
   * Listar inscrições de uma capacitação
   */
  listInscricoes: async (idCapacitacao: number): Promise<CapacitacaoInscricao[]> => {
    const response = await api.get<ApiResponse<CapacitacaoInscricao[]>>(`/capacitacoes/${idCapacitacao}/inscricoes`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar inscrições');
    }

    return response.data.data!;
  },

  /**
   * Criar inscrição (manual pelo técnico)
   */
  createInscricao: async (idCapacitacao: number, data: CreateInscricaoData): Promise<CapacitacaoInscricao> => {
    const response = await api.post<ApiResponse<CapacitacaoInscricao>>(`/capacitacoes/${idCapacitacao}/inscricoes`, data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao criar inscrição');
    }

    return response.data.data!;
  },

  /**
   * Atualizar inscrição
   */
  updateInscricao: async (idCapacitacao: number, idInscricao: number, data: Partial<CreateInscricaoData>): Promise<CapacitacaoInscricao> => {
    const response = await api.put<ApiResponse<CapacitacaoInscricao>>(`/capacitacoes/${idCapacitacao}/inscricoes/${idInscricao}`, data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao atualizar inscrição');
    }

    return response.data.data!;
  },

  /**
   * Excluir inscrição
   */
  deleteInscricao: async (idCapacitacao: number, idInscricao: number): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/capacitacoes/${idCapacitacao}/inscricoes/${idInscricao}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao excluir inscrição');
    }
  },

  /**
   * Criar inscrição pública (via link/QR code)
   */
  createInscricaoPublica: async (linkInscricao: string, data: CreateInscricaoData): Promise<CapacitacaoInscricao> => {
    const apiBase = import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3001').replace('8080', '3001');
    const response = await fetch(`${apiBase}/capacitacoes/public/${linkInscricao}/inscricao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Erro ao realizar inscrição: ${response.statusText}`);
    }

    const responseData: ApiResponse<CapacitacaoInscricao> = await response.json();

    if (!responseData.success) {
      throw new Error(responseData.error?.message || 'Erro ao realizar inscrição');
    }

    return responseData.data!;
  },

  /**
   * Listar presenças de uma capacitação
   */
  listPresencas: async (idCapacitacao: number): Promise<CapacitacaoPresenca[]> => {
    const response = await api.get<ApiResponse<CapacitacaoPresenca[]>>(`/capacitacoes/${idCapacitacao}/presencas`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar presenças');
    }

    return response.data.data!;
  },

  /**
   * Criar presença
   */
  createPresenca: async (idCapacitacao: number, data: CreatePresencaData): Promise<CapacitacaoPresenca> => {
    const response = await api.post<ApiResponse<CapacitacaoPresenca>>(`/capacitacoes/${idCapacitacao}/presencas`, data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao registrar presença');
    }

    return response.data.data!;
  },

  /**
   * Atualizar presença
   */
  updatePresenca: async (idCapacitacao: number, idPresenca: number, data: Partial<CreatePresencaData>): Promise<CapacitacaoPresenca> => {
    const response = await api.put<ApiResponse<CapacitacaoPresenca>>(`/capacitacoes/${idCapacitacao}/presencas/${idPresenca}`, data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao atualizar presença');
    }

    return response.data.data!;
  },

  /**
   * Excluir presença
   */
  deletePresenca: async (idCapacitacao: number, idPresenca: number): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/capacitacoes/${idCapacitacao}/presencas/${idPresenca}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao excluir presença');
    }
  },

  /**
   * Adicionar organização à capacitação
   */
  addOrganizacao: async (idCapacitacao: number, idOrganizacao: number): Promise<void> => {
    const response = await api.post<ApiResponse>(`/capacitacoes/${idCapacitacao}/organizacoes`, {
      id_organizacao: idOrganizacao
    });

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao adicionar organização');
    }
  },

  /**
   * Remover organização da capacitação
   */
  removeOrganizacao: async (idCapacitacao: number, idOrganizacao: number): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/capacitacoes/${idCapacitacao}/organizacoes/${idOrganizacao}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao remover organização');
    }
  },

  /**
   * Listar evidências de uma capacitação
   */
  listEvidencias: async (idCapacitacao: number, tipo?: string): Promise<CapacitacaoEvidencia[]> => {
    const params = tipo ? `?tipo=${tipo}` : '';
    const response = await api.get<ApiResponse<CapacitacaoEvidencia[]>>(`/capacitacoes/${idCapacitacao}/evidencias${params}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar evidências');
    }

    return response.data.data!;
  },

  /**
   * Fazer upload de evidência
   */
  uploadEvidencia: async (idCapacitacao: number, file: File, data: CreateEvidenciaData): Promise<CapacitacaoEvidencia> => {
    const formData = new FormData();
    formData.append('arquivo', file);
    formData.append('tipo', data.tipo);
    if (data.descricao) {
      formData.append('descricao', data.descricao);
    }
    if (data.data_evidencia) {
      formData.append('data_evidencia', data.data_evidencia);
    }
    if (data.local_evidencia) {
      formData.append('local_evidencia', data.local_evidencia);
    }

    const response = await api.post<ApiResponse<CapacitacaoEvidencia>>(`/capacitacoes/${idCapacitacao}/evidencias`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao fazer upload de evidência');
    }

    return response.data.data!;
  },

  /**
   * Download de evidência
   */
  downloadEvidencia: async (idCapacitacao: number, evidenciaId: number): Promise<void> => {
    const response = await api.get(`/capacitacoes/${idCapacitacao}/evidencias/${evidenciaId}/download`, {
      responseType: 'blob'
    });

    // Criar link temporário para download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `evidencia_${evidenciaId}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Excluir evidência
   */
  deleteEvidencia: async (idCapacitacao: number, evidenciaId: number): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/capacitacoes/${idCapacitacao}/evidencias/${evidenciaId}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao excluir evidência');
    }
  },

  /**
   * Adicionar técnico à equipe da capacitação
   */
  adicionarTecnico: async (id: number, idTecnico: number): Promise<string> => {
    const response = await api.post<ApiResponse<unknown>>(`/capacitacoes/${id}/tecnicos`, {
      id_tecnico: idTecnico
    });

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao adicionar técnico');
    }

    return response.data.message || 'Técnico adicionado com sucesso.';
  },

  /**
   * Remover técnico da equipe da capacitação
   */
  removerTecnico: async (id: number, idTecnico: number): Promise<string> => {
    const response = await api.delete<ApiResponse<unknown>>(`/capacitacoes/${id}/tecnicos/${idTecnico}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao remover técnico');
    }

    return response.data.message || 'Técnico removido com sucesso.';
  },

  /**
   * Listar técnicos da equipe da capacitação
   */
  listTecnicos: async (id: number): Promise<Array<{ id_tecnico: number; tecnico: { id: number; name: string; email: string } }>> => {
    const response = await api.get<ApiResponse<Array<{ id_tecnico: number; tecnico: { id: number; name: string; email: string } }>>>(`/capacitacoes/${id}/tecnicos`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar técnicos');
    }

    return response.data.data!;
  }
};

