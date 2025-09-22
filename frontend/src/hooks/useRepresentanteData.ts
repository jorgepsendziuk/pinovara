import { useState, useCallback } from 'react';
import { DadosRepresentante } from '../types/organizacao';

export const useRepresentanteData = () => {
  const [dadosRepresentante, setDadosRepresentante] = useState<DadosRepresentante>({
    nome: '',
    cpf: '',
    rg: '',
    telefone: '',
    email: '',
    endLogradouro: '',
    endBairro: '',
    endComplemento: '',
    endNumero: '',
    endCep: '',
    funcao: 1
  });

  const updateRepresentante = useCallback((field: keyof DadosRepresentante, value: string | number) => {
    setDadosRepresentante(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetRepresentante = useCallback(() => {
    setDadosRepresentante({
      nome: '',
      cpf: '',
      rg: '',
      telefone: '',
      email: '',
      endLogradouro: '',
      endBairro: '',
      endComplemento: '',
      endNumero: '',
      endCep: '',
      funcao: 1
    });
  }, []);

  const loadFromOrganizacao = useCallback((organizacao: any) => {
    setDadosRepresentante({
      nome: organizacao.representante_nome || '',
      cpf: organizacao.representante_cpf || '',
      rg: organizacao.representante_rg || '',
      telefone: organizacao.representante_telefone || '',
      email: organizacao.representante_email || '',
      endLogradouro: organizacao.representante_end_logradouro || '',
      endBairro: organizacao.representante_end_bairro || '',
      endComplemento: organizacao.representante_end_complemento || '',
      endNumero: organizacao.representante_end_numero || '',
      endCep: organizacao.representante_end_cep || '',
      funcao: organizacao.representante_funcao || 1
    });
  }, []);

  return {
    dadosRepresentante,
    updateRepresentante,
    resetRepresentante,
    loadFromOrganizacao
  };
};
