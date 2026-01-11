import api from './api';
import { Qualificacao, QualificacaoFilters, QualificacaoListResponse } from '../types/qualificacao';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
  };
  timestamp?: string;
}

export const qualificacaoAPI = {
  /**
   * Listar qualificações com filtros
   */
  list: async (filters: QualificacaoFilters = {}): Promise<QualificacaoListResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get<ApiResponse<QualificacaoListResponse>>(`/qualificacoes?${params}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar qualificações');
    }

    return response.data.data!;
  },

  /**
   * Buscar qualificação por ID
   */
  getById: async (id: number): Promise<Qualificacao> => {
    const response = await api.get<ApiResponse<Qualificacao>>(`/qualificacoes/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao buscar qualificação');
    }

    return response.data.data!;
  },

  /**
   * Criar nova qualificação
   */
  create: async (data: Partial<Qualificacao>): Promise<Qualificacao> => {
    const response = await api.post<ApiResponse<Qualificacao>>('/qualificacoes', data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao criar qualificação');
    }

    return response.data.data!;
  },

  /**
   * Atualizar qualificação existente
   */
  update: async (id: number, data: Partial<Qualificacao>): Promise<Qualificacao> => {
    const response = await api.put<ApiResponse<Qualificacao>>(`/qualificacoes/${id}`, data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao atualizar qualificação');
    }

    return response.data.data!;
  },

  /**
   * Excluir qualificação
   */
  delete: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/qualificacoes/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao excluir qualificação');
    }
  },

  /**
   * Listar materiais de uma qualificação
   */
  listMateriais: async (idQualificacao: number): Promise<any[]> => {
    const response = await api.get<ApiResponse<any[]>>(`/qualificacoes/${idQualificacao}/materiais`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar materiais');
    }

    return response.data.data!;
  },

  /**
   * Adicionar técnico à equipe da qualificação
   */
  adicionarTecnico: async (id: number, idTecnico: number): Promise<string> => {
    const response = await api.post<ApiResponse<unknown>>(`/qualificacoes/${id}/tecnicos`, {
      id_tecnico: idTecnico
    });

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao adicionar técnico');
    }

    return response.data.message || 'Técnico adicionado com sucesso.';
  },

  /**
   * Remover técnico da equipe da qualificação
   */
  removerTecnico: async (id: number, idTecnico: number): Promise<string> => {
    const response = await api.delete<ApiResponse<unknown>>(`/qualificacoes/${id}/tecnicos/${idTecnico}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao remover técnico');
    }

    return response.data.message || 'Técnico removido com sucesso.';
  },

  /**
   * Listar técnicos da equipe da qualificação
   */
  listTecnicos: async (id: number): Promise<Array<{ id_tecnico: number; tecnico: { id: number; name: string; email: string } }>> => {
    const response = await api.get<ApiResponse<Array<{ id_tecnico: number; tecnico: { id: number; name: string; email: string } }>>>(`/qualificacoes/${id}/tecnicos`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar técnicos');
    }

    return response.data.data!;
  },

  /**
   * Listar técnicos disponíveis para adicionar em equipes
   */
  listTecnicosDisponiveis: async (): Promise<Array<{ id: number; name: string; email: string }>> => {
    const response = await api.get<ApiResponse<Array<{ id: number; name: string; email: string }>>>('/qualificacoes/tecnicos-disponiveis');

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar técnicos disponíveis');
    }

    return response.data.data!;
  }
};

