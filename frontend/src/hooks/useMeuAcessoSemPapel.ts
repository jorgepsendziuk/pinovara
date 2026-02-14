import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export interface MeuAcessoSemPapel {
  capacitacoesInscrito: number;
  organizacoesAssociadas: number;
}

/**
 * Hook para buscar o acesso disponível para usuário sem papéis
 * (inscrições em capacitações e organizações associadas ao email)
 */
export function useMeuAcessoSemPapel(enabled: boolean): {
  data: MeuAcessoSemPapel | null;
  loading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<MeuAcessoSemPapel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    authAPI
      .meuAcessoSemPapel()
      .then((acesso) => {
        if (!cancelled) {
          setData(acesso);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setData({ capacitacoesInscrito: 0, organizacoesAssociadas: 0 });
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { data, loading, error };
}
