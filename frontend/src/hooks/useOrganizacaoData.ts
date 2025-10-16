import { useState, useCallback } from 'react';
import { Organizacao, DadosRepresentante, DadosCaracteristicas } from '../types/organizacao';
import api from '../services/api';

export const useOrganizacaoData = () => {
  const [organizacao, setOrganizacao] = useState<Organizacao | null>(null);
  const [loading, setLoading] = useState(false); // Começa false - só fica true durante carregamento
  const [error, setError] = useState<string | null>(null);

  const updateOrganizacao = useCallback(async (field: keyof Organizacao, value: any) => {
    setOrganizacao(prev => {
      if (prev) {
        return { ...prev, [field]: value };
      } else {
        // Se não tem organização ainda, criar uma nova com apenas esse campo
        return { [field]: value } as Organizacao;
      }
    });
  }, []);

  const loadOrganizacao = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/organizacoes/${id}`);

      if (response.data.success) {
        setOrganizacao(response.data.data);
      } else {
        throw new Error(response.data.error?.message || 'Erro ao carregar organização');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveOrganizacao = useCallback(async () => {
    if (!organizacao) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await api.put(`/organizacoes/${organizacao.id}`, organizacao);

      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Erro ao salvar organização');
      }

      return true;
    } catch (err: any) {
      setError(err.response?.data?.error?.message || err.message || 'Erro desconhecido');
      return false;
    } finally {
      setLoading(false);
    }
  }, [organizacao]);

  return {
    organizacao,
    loading,
    error,
    updateOrganizacao,
    loadOrganizacao,
    saveOrganizacao,
    setError
  };
};
