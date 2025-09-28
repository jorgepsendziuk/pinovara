import React from 'react';
import { Organizacao } from '../../types/organizacao';
import { Clipboard } from 'lucide-react';

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
  return (
    <div className="accordion-item">
      <button
        className="accordion-header"
        onClick={() => onToggleAccordion('dados-basicos')}
      >
        <h3><Clipboard size={18} style={{marginRight: '0.5rem'}} /> Dados Básicos da Organização</h3>
        <span className={`accordion-icon ${accordionAberto === 'dados-basicos' ? 'open' : ''}`}>
          ▼
        </span>
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
                value={organizacao.data_fundacao || ''}
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
          </div>
        </div>
      </div>
    </div>
  );
};
