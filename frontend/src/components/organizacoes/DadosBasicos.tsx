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
                onChange={(e) => onUpdate('cnpj', e.target.value)}
                placeholder="00.000.000/0000-00"
              />
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
                onChange={(e) => onUpdate('telefone', e.target.value)}
                placeholder="(00) 00000-0000"
              />
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
                    {estado.nome}
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
                    {municipio.nome}
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
