import { useState, useCallback } from 'react';
import { Organizacao, DadosRepresentante, DadosCaracteristicas } from '../types/organizacao';

export const useOrganizacaoData = () => {
  const [organizacao, setOrganizacao] = useState<Organizacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateOrganizacao = useCallback(async (field: keyof Organizacao, value: any) => {
    setOrganizacao(prev => prev ? { ...prev, [field]: value } : null);
  }, []);

  const loadOrganizacao = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('@pinovara:token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');
      const response = await fetch(`${API_BASE}/organizacoes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar organização');
      }

      const result = await response.json();
      if (result.success) {
        setOrganizacao(result.data);
      } else {
        throw new Error(result.error?.message || 'Erro ao carregar organização');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveOrganizacao = useCallback(async () => {
    if (!organizacao) return false;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('@pinovara:token');
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');
      const response = await fetch(`${API_BASE}/organizacoes/${organizacao.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(organizacao)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar organização');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
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
