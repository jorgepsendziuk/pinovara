import { useState, useCallback } from 'react';
import { GruposDiagnostico, RespostaDiagnostico } from '../types/organizacao';

export const useDiagnosticoData = () => {
  const [governancaOrganizacional, setGovernancaOrganizacional] = useState<GruposDiagnostico>({});
  const [gestaoPessoas, setGestaoPessoas] = useState<GruposDiagnostico>({});
  const [gestaoFinanceira, setGestaoFinanceira] = useState<GruposDiagnostico>({});
  const [gestaoComercial, setGestaoComercial] = useState<GruposDiagnostico>({});
  const [gestaoProcessos, setGestaoProcessos] = useState<GruposDiagnostico>({});
  const [gestaoInovacao, setGestaoInovacao] = useState<GruposDiagnostico>({});
  const [gestaoSocioambiental, setGestaoSocioambiental] = useState<GruposDiagnostico>({});
  const [infraestruturaSustentavel, setInfraestruturaSustentavel] = useState<GruposDiagnostico>({});
  
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

  const updateGestaoComercial = useCallback((
    categoria: string, 
    pergunta: number, 
    campo: 'resposta' | 'comentario' | 'proposta', 
    valor: string | number
  ) => {
    const chave = `gc_${categoria}_${pergunta}_${campo}`;
    setGestaoComercial(prev => ({
      ...prev,
      [chave]: {
        ...prev[chave],
        [campo]: valor
      }
    }));
  }, []);

  const updateGestaoProcessos = useCallback((
    categoria: string, 
    pergunta: number, 
    campo: 'resposta' | 'comentario' | 'proposta', 
    valor: string | number
  ) => {
    const chave = `gpp_${categoria}_${pergunta}_${campo}`;
    setGestaoProcessos(prev => ({
      ...prev,
      [chave]: {
        ...prev[chave],
        [campo]: valor
      }
    }));
  }, []);

  const updateGestaoInovacao = useCallback((
    categoria: string, 
    pergunta: number, 
    campo: 'resposta' | 'comentario' | 'proposta', 
    valor: string | number
  ) => {
    const chave = `gi_${categoria}_${pergunta}_${campo}`;
    setGestaoInovacao(prev => ({
      ...prev,
      [chave]: {
        ...prev[chave],
        [campo]: valor
      }
    }));
  }, []);

  const updateGestaoSocioambiental = useCallback((
    categoria: string, 
    pergunta: number, 
    campo: 'resposta' | 'comentario' | 'proposta', 
    valor: string | number
  ) => {
    const chave = `gs_${categoria}_${pergunta}_${campo}`;
    setGestaoSocioambiental(prev => ({
      ...prev,
      [chave]: {
        ...prev[chave],
        [campo]: valor
      }
    }));
  }, []);

  const updateInfraestruturaSustentavel = useCallback((
    categoria: string, 
    pergunta: number, 
    campo: 'resposta' | 'comentario' | 'proposta', 
    valor: string | number
  ) => {
    const chave = `is_${categoria}_${pergunta}_${campo}`;
    setInfraestruturaSustentavel(prev => ({
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
    // Carregar dados de todas as áreas de diagnóstico
    const governancaData: GruposDiagnostico = {};
    const pessoasData: GruposDiagnostico = {};
    const financeiraData: GruposDiagnostico = {};
    const comercialData: GruposDiagnostico = {};
    const processosData: GruposDiagnostico = {};
    const inovacaoData: GruposDiagnostico = {};
    const socioambientalData: GruposDiagnostico = {};
    const infraestruturaData: GruposDiagnostico = {};

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
      } else if (key.startsWith('gc_')) {
        const match = key.match(/gc_(.+)_(\d+)_(resposta|comentario|proposta)/);
        if (match) {
          const [, categoria, pergunta, campo] = match;
          const chaveCompleta = `gc_${categoria}_${pergunta}_${campo}`;
          
          if (!comercialData[chaveCompleta]) {
            comercialData[chaveCompleta] = { resposta: 0, comentario: '', proposta: '' };
          }
          comercialData[chaveCompleta][campo as keyof RespostaDiagnostico] = organizacao[key] || (campo === 'resposta' ? 0 : '');
        }
      } else if (key.startsWith('gpp_')) {
        const match = key.match(/gpp_(.+)_(\d+)_(resposta|comentario|proposta)/);
        if (match) {
          const [, categoria, pergunta, campo] = match;
          const chaveCompleta = `gpp_${categoria}_${pergunta}_${campo}`;
          
          if (!processosData[chaveCompleta]) {
            processosData[chaveCompleta] = { resposta: 0, comentario: '', proposta: '' };
          }
          processosData[chaveCompleta][campo as keyof RespostaDiagnostico] = organizacao[key] || (campo === 'resposta' ? 0 : '');
        }
      } else if (key.startsWith('gi_')) {
        const match = key.match(/gi_(.+)_(\d+)_(resposta|comentario|proposta)/);
        if (match) {
          const [, categoria, pergunta, campo] = match;
          const chaveCompleta = `gi_${categoria}_${pergunta}_${campo}`;
          
          if (!inovacaoData[chaveCompleta]) {
            inovacaoData[chaveCompleta] = { resposta: 0, comentario: '', proposta: '' };
          }
          inovacaoData[chaveCompleta][campo as keyof RespostaDiagnostico] = organizacao[key] || (campo === 'resposta' ? 0 : '');
        }
      } else if (key.startsWith('gs_')) {
        const match = key.match(/gs_(.+)_(\d+)_(resposta|comentario|proposta)/);
        if (match) {
          const [, categoria, pergunta, campo] = match;
          const chaveCompleta = `gs_${categoria}_${pergunta}_${campo}`;
          
          if (!socioambientalData[chaveCompleta]) {
            socioambientalData[chaveCompleta] = { resposta: 0, comentario: '', proposta: '' };
          }
          socioambientalData[chaveCompleta][campo as keyof RespostaDiagnostico] = organizacao[key] || (campo === 'resposta' ? 0 : '');
        }
      } else if (key.startsWith('is_')) {
        const match = key.match(/is_(.+)_(\d+)_(resposta|comentario|proposta)/);
        if (match) {
          const [, categoria, pergunta, campo] = match;
          const chaveCompleta = `is_${categoria}_${pergunta}_${campo}`;
          
          if (!infraestruturaData[chaveCompleta]) {
            infraestruturaData[chaveCompleta] = { resposta: 0, comentario: '', proposta: '' };
          }
          infraestruturaData[chaveCompleta][campo as keyof RespostaDiagnostico] = organizacao[key] || (campo === 'resposta' ? 0 : '');
        }
      }
    });

    setGovernancaOrganizacional(governancaData);
    setGestaoPessoas(pessoasData);
    setGestaoFinanceira(financeiraData);
    setGestaoComercial(comercialData);
    setGestaoProcessos(processosData);
    setGestaoInovacao(inovacaoData);
    setGestaoSocioambiental(socioambientalData);
    setInfraestruturaSustentavel(infraestruturaData);
  }, []);

  return {
    governancaOrganizacional,
    gestaoPessoas,
    gestaoFinanceira,
    gestaoComercial,
    gestaoProcessos,
    gestaoInovacao,
    gestaoSocioambiental,
    infraestruturaSustentavel,
    diagnosticoAberto,
    updateGovernanca,
    updateGestaoPessoas,
    updateGestaoFinanceira,
    updateGestaoComercial,
    updateGestaoProcessos,
    updateGestaoInovacao,
    updateGestaoSocioambiental,
    updateInfraestruturaSustentavel,
    toggleDiagnostico,
    setDiagnosticoAberto,
    loadFromOrganizacao
  };
};
