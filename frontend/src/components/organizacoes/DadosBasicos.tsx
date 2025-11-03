import React, { useState, useEffect } from 'react';
import { Organizacao } from '../../types/organizacao';
import { Clipboard, ChevronDown } from 'lucide-react';
import { auxiliarAPI } from '../../services/api';

interface DadosBasicosProps {
  organizacao: Organizacao;
  onUpdate: (field: keyof Organizacao, value: any) => void;
  accordionAberto: string | null;
  onToggleAccordion: (accordion: string) => void;
}

export const DadosBasicos: React.FC<DadosBasicosProps> = ({
  organizacao,
  onUpdate,
  accordionAberto,
  onToggleAccordion
}) => {
  const [estados, setEstados] = useState<any[]>([]);
  const [municipios, setMunicipios] = useState<any[]>([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [loadingMunicipios, setLoadingMunicipios] = useState(false);

  // Carregar estados
  useEffect(() => {
    const carregarEstados = async () => {
      setLoadingEstados(true);
      try {
        const response = await auxiliarAPI.getEstados();
        setEstados(response || []);
      } catch (error) {
        console.error('Erro ao carregar estados:', error);
      } finally {
        setLoadingEstados(false);
      }
    };
    carregarEstados();
  }, []);

  // Carregar municípios quando estado muda
  useEffect(() => {
    if (organizacao?.estado) {
      const carregarMunicipios = async () => {
        setLoadingMunicipios(true);
        try {
          const response = await auxiliarAPI.getMunicipios(organizacao.estado || undefined);
          setMunicipios(response || []);
        } catch (error) {
          console.error('Erro ao carregar municípios:', error);
        } finally {
          setLoadingMunicipios(false);
        }
      };
      carregarMunicipios();
    } else {
      // Limpar municípios se não há estado selecionado
      setMunicipios([]);
    }
  }, [organizacao?.estado]);
  return (
    <div className="accordion-item">
      <button
        className="accordion-header"
        onClick={() => onToggleAccordion('dados-basicos')}
      >
        <h3><Clipboard size={18} style={{marginRight: '0.5rem'}} /> Dados Básicos da Organização</h3>
        <ChevronDown
          size={16}
          className={`accordion-icon ${accordionAberto === 'dados-basicos' ? 'open' : ''}`}
          style={{
            marginLeft: '0.5rem',
            transition: 'transform 0.2s ease',
            transform: accordionAberto === 'dados-basicos' ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>
      
      <div className={`accordion-content ${accordionAberto === 'dados-basicos' ? 'open' : ''}`}>
        <div className="accordion-section">
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="nome">Nome da Organização</label>
              <input
                type="text"
                id="nome"
                value={organizacao.nome || ''}
                onChange={(e) => onUpdate('nome', e.target.value)}
                placeholder="Digite o nome da organização"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cnpj">CNPJ</label>
              <input
                type="text"
                id="cnpj"
                value={organizacao.cnpj || ''}
                onChange={(e) => {
                  // Remove tudo que não é número
                  const apenasNumeros = e.target.value.replace(/\D/g, '');
                  // Limita a 14 dígitos
                  const limitado = apenasNumeros.slice(0, 14);
                  // Aplica formatação: 00.000.000/0000-00
                  let formatado = limitado;
                  if (limitado.length > 12) {
                    formatado = limitado.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
                  } else if (limitado.length > 8) {
                    formatado = limitado.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
                  } else if (limitado.length > 5) {
                    formatado = limitado.replace(/^(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
                  } else if (limitado.length > 2) {
                    formatado = limitado.replace(/^(\d{2})(\d{1,3})/, '$1.$2');
                  }
                  onUpdate('cnpj', formatado);
                }}
                placeholder="00.000.000/0000-00"
                maxLength={18}
              />
              <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Digite apenas números (14 dígitos)
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="data_fundacao">Data de Fundação</label>
              <input
                type="date"
                id="data_fundacao"
                value={organizacao.data_fundacao ? new Date(organizacao.data_fundacao).toISOString().split('T')[0] : ''}
                onChange={(e) => onUpdate('data_fundacao', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input
                type="tel"
                id="telefone"
                value={organizacao.telefone || ''}
                onChange={(e) => {
                  // Remove tudo que não é número
                  const apenasNumeros = e.target.value.replace(/\D/g, '');
                  // Limita a 11 dígitos
                  const limitado = apenasNumeros.slice(0, 11);
                  // Aplica formatação: (00) 00000-0000 ou (00) 0000-0000
                  let formatado = limitado;
                  if (limitado.length > 10) {
                    // Celular com 11 dígitos: (00) 00000-0000
                    formatado = limitado.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                  } else if (limitado.length > 6) {
                    // Telefone fixo ou celular incompleto
                    if (limitado.length === 10) {
                      // Fixo completo: (00) 0000-0000
                      formatado = limitado.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                    } else {
                      formatado = limitado.replace(/^(\d{2})(\d{1,5})/, '($1) $2');
                    }
                  } else if (limitado.length > 2) {
                    formatado = limitado.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
                  } else if (limitado.length > 0) {
                    formatado = limitado.replace(/^(\d*)/, '($1');
                  }
                  onUpdate('telefone', formatado);
                }}
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
              <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Digite apenas números (10 ou 11 dígitos)
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                value={organizacao.email || ''}
                onChange={(e) => onUpdate('email', e.target.value)}
                placeholder="contato@organizacao.com"
              />
              <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Formato: exemplo@dominio.com
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="estado">Estado</label>
              <select
                id="estado"
                value={organizacao.estado?.toString() || ''}
                onChange={(e) => onUpdate('estado', e.target.value ? parseInt(e.target.value) : null)}
                disabled={loadingEstados}
              >
                <option value="">Selecione um estado</option>
                {estados.map((estado) => (
                  <option key={estado.id} value={estado.id.toString()}>
                    {estado.descricao || estado.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="municipio">Município</label>
              <select
                id="municipio"
                value={organizacao.municipio?.toString() || ''}
                onChange={(e) => onUpdate('municipio', e.target.value ? parseInt(e.target.value) : null)}
                disabled={loadingMunicipios || !organizacao.estado}
              >
                <option value="">
                  {!organizacao.estado ? 'Selecione um estado primeiro' : 'Selecione um município'}
                </option>
                {municipios.map((municipio) => (
                  <option key={municipio.id} value={municipio.id.toString()}>
                    {municipio.descricao || municipio.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
