import api from './api';
import { AvaliacaoVersao, AvaliacaoPergunta, CapacitacaoAvaliacao, CreateAvaliacaoData, AvaliacaoEstatisticas } from '../types/avaliacao';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    statusCode: number;
  };
  timestamp?: string;
}

export const avaliacaoAPI = {
  /**
   * Listar versões de avaliação
   */
  listVersoes: async (ativo?: boolean): Promise<AvaliacaoVersao[]> => {
    const params = ativo !== undefined ? `?ativo=${ativo}` : '';
    const response = await api.get<ApiResponse<AvaliacaoVersao[]>>(`/avaliacoes/versoes${params}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar versões');
    }

    return response.data.data!;
  },

  /**
   * Buscar versão ativa
   */
  getVersaoAtiva: async (): Promise<AvaliacaoVersao> => {
    const response = await api.get<ApiResponse<AvaliacaoVersao>>('/avaliacoes/versoes/ativa');

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao buscar versão ativa');
    }

    return response.data.data!;
  },

  /**
   * Buscar versão por ID
   */
  getVersaoById: async (id: number): Promise<AvaliacaoVersao> => {
    const response = await api.get<ApiResponse<AvaliacaoVersao>>(`/avaliacoes/versoes/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao buscar versão');
    }

    return response.data.data!;
  },

  /**
   * Criar nova versão
   */
  createVersao: async (data: Partial<AvaliacaoVersao>): Promise<AvaliacaoVersao> => {
    const response = await api.post<ApiResponse<AvaliacaoVersao>>('/avaliacoes/versoes', data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao criar versão');
    }

    return response.data.data!;
  },

  /**
   * Atualizar versão
   */
  updateVersao: async (id: number, data: Partial<AvaliacaoVersao>): Promise<AvaliacaoVersao> => {
    const response = await api.put<ApiResponse<AvaliacaoVersao>>(`/avaliacoes/versoes/${id}`, data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao atualizar versão');
    }

    return response.data.data!;
  },

  /**
   * Listar perguntas de uma versão
   */
  listPerguntas: async (idVersao: number): Promise<AvaliacaoPergunta[]> => {
    const response = await api.get<ApiResponse<AvaliacaoPergunta[]>>(`/avaliacoes/versoes/${idVersao}/perguntas`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar perguntas');
    }

    return response.data.data!;
  },

  /**
   * Criar pergunta
   */
  createPergunta: async (idVersao: number, data: Partial<AvaliacaoPergunta>): Promise<AvaliacaoPergunta> => {
    const response = await api.post<ApiResponse<AvaliacaoPergunta>>(`/avaliacoes/versoes/${idVersao}/perguntas`, data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao criar pergunta');
    }

    return response.data.data!;
  },

  /**
   * Atualizar pergunta
   */
  updatePergunta: async (id: number, data: Partial<AvaliacaoPergunta>): Promise<AvaliacaoPergunta> => {
    const response = await api.put<ApiResponse<AvaliacaoPergunta>>(`/avaliacoes/perguntas/${id}`, data);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao atualizar pergunta');
    }

    return response.data.data!;
  },

  /**
   * Excluir pergunta
   */
  deletePergunta: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse>(`/avaliacoes/perguntas/${id}`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao excluir pergunta');
    }
  },

  /**
   * Listar avaliações de uma capacitação
   */
  listAvaliacoes: async (idCapacitacao: number): Promise<CapacitacaoAvaliacao[]> => {
    const response = await api.get<ApiResponse<CapacitacaoAvaliacao[]>>(`/capacitacoes/${idCapacitacao}/avaliacoes`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao listar avaliações');
    }

    return response.data.data!;
  },

  /**
   * Obter estatísticas de avaliações
   */
  getEstatisticas: async (idCapacitacao: number): Promise<AvaliacaoEstatisticas[]> => {
    const response = await api.get<ApiResponse<AvaliacaoEstatisticas[]>>(`/capacitacoes/${idCapacitacao}/avaliacoes/estatisticas`);

    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Erro ao obter estatísticas');
    }

    return response.data.data!;
  },

  /**
   * Criar avaliação pública (via link/QR code)
   */
  createAvaliacaoPublica: async (linkAvaliacao: string, data: CreateAvaliacaoData): Promise<CapacitacaoAvaliacao> => {
    const apiBase = import.meta.env.VITE_API_URL || window.location.origin.replace('5173', '3001').replace('8080', '3001');
    const response = await fetch(`${apiBase}/capacitacoes/public/${linkAvaliacao}/avaliacao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Erro ao submeter avaliação: ${response.statusText}`);
    }

    const responseData: ApiResponse<CapacitacaoAvaliacao> = await response.json();

    if (!responseData.success) {
      throw new Error(responseData.error?.message || 'Erro ao submeter avaliação');
    }

    return responseData.data!;
  }
};

