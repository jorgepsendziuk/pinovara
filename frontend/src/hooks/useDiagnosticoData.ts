import { useState, useCallback } from 'react';
import { GruposDiagnostico, RespostaDiagnostico } from '../types/organizacao';

export const useDiagnosticoData = () => {
  const [governancaOrganizacional, setGovernancaOrganizacional] = useState<GruposDiagnostico>({});
  const [gestaoPessoas, setGestaoPessoas] = useState<GruposDiagnostico>({});
  const [gestaoFinanceira, setGestaoFinanceira] = useState<GruposDiagnostico>({});
  
  const [diagnosticoAberto, setDiagnosticoAberto] = useState<string | null>(null);

  const updateGovernanca = useCallback((
    categoria: string, 
    pergunta: number, 
    campo: 'resposta' | 'comentario' | 'proposta', 
    valor: string | number
  ) => {
    const chave = `go_${categoria}_${pergunta}_${campo}`;
    setGovernancaOrganizacional(prev => ({
      ...prev,
      [chave]: {
        ...prev[chave],
        [campo]: valor
      }
    }));
  }, []);

  const updateGestaoPessoas = useCallback((
    categoria: string, 
    pergunta: number, 
    campo: 'resposta' | 'comentario' | 'proposta', 
    valor: string | number
  ) => {
    const chave = `gp_${categoria}_${pergunta}_${campo}`;
    setGestaoPessoas(prev => ({
      ...prev,
      [chave]: {
        ...prev[chave],
        [campo]: valor
      }
    }));
  }, []);

  const updateGestaoFinanceira = useCallback((
    categoria: string, 
    pergunta: number, 
    campo: 'resposta' | 'comentario' | 'proposta', 
    valor: string | number
  ) => {
    const chave = `gf_${categoria}_${pergunta}_${campo}`;
    setGestaoFinanceira(prev => ({
      ...prev,
      [chave]: {
        ...prev[chave],
        [campo]: valor
      }
    }));
  }, []);

  const toggleDiagnostico = useCallback((area: string) => {
    setDiagnosticoAberto(prev => prev === area ? null : area);
  }, []);

  const loadFromOrganizacao = useCallback((organizacao: any) => {
    // Carregar dados de governança organizacional
    const governancaData: GruposDiagnostico = {};
    const pessoasData: GruposDiagnostico = {};
    const financeiraData: GruposDiagnostico = {};

    Object.keys(organizacao).forEach(key => {
      if (key.startsWith('go_')) {
        const match = key.match(/go_(.+)_(\d+)_(resposta|comentario|proposta)/);
        if (match) {
          const [, categoria, pergunta, campo] = match;
          const chaveCompleta = `go_${categoria}_${pergunta}_${campo}`;
          
          if (!governancaData[chaveCompleta]) {
            governancaData[chaveCompleta] = { resposta: 0, comentario: '', proposta: '' };
          }
          governancaData[chaveCompleta][campo as keyof RespostaDiagnostico] = organizacao[key] || (campo === 'resposta' ? 0 : '');
        }
      } else if (key.startsWith('gp_')) {
        const match = key.match(/gp_(.+)_(\d+)_(resposta|comentario|proposta)/);
        if (match) {
          const [, categoria, pergunta, campo] = match;
          const chaveCompleta = `gp_${categoria}_${pergunta}_${campo}`;
          
          if (!pessoasData[chaveCompleta]) {
            pessoasData[chaveCompleta] = { resposta: 0, comentario: '', proposta: '' };
          }
          pessoasData[chaveCompleta][campo as keyof RespostaDiagnostico] = organizacao[key] || (campo === 'resposta' ? 0 : '');
        }
      } else if (key.startsWith('gf_')) {
        const match = key.match(/gf_(.+)_(\d+)_(resposta|comentario|proposta)/);
        if (match) {
          const [, categoria, pergunta, campo] = match;
          const chaveCompleta = `gf_${categoria}_${pergunta}_${campo}`;
          
          if (!financeiraData[chaveCompleta]) {
            financeiraData[chaveCompleta] = { resposta: 0, comentario: '', proposta: '' };
          }
          financeiraData[chaveCompleta][campo as keyof RespostaDiagnostico] = organizacao[key] || (campo === 'resposta' ? 0 : '');
        }
      }
    });

    setGovernancaOrganizacional(governancaData);
    setGestaoPessoas(pessoasData);
    setGestaoFinanceira(financeiraData);
  }, []);

  return {
    governancaOrganizacional,
    gestaoPessoas,
    gestaoFinanceira,
    diagnosticoAberto,
    updateGovernanca,
    updateGestaoPessoas,
    updateGestaoFinanceira,
    toggleDiagnostico,
    setDiagnosticoAberto,
    loadFromOrganizacao
  };
};
