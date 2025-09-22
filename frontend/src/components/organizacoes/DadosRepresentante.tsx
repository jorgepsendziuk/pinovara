import React from 'react';
import { DadosRepresentante } from '../../types/organizacao';

interface DadosRepresentanteProps {
  dados: DadosRepresentante;
  onUpdate: (field: keyof DadosRepresentante, value: string | number) => void;
  accordionAberto: string | null;
  onToggleAccordion: (accordion: string) => void;
}

export const DadosRepresentanteComponent: React.FC<DadosRepresentanteProps> = ({
  dados,
  onUpdate,
  accordionAberto,
  onToggleAccordion
}) => {
  return (
    <div className="accordion-item">
      <button
        className="accordion-header"
        onClick={() => onToggleAccordion('representante')}
      >
        <h3>👤 Dados do Representante</h3>
        <span className={`accordion-icon ${accordionAberto === 'representante' ? 'open' : ''}`}>
          ▼
        </span>
      </button>
      
      <div className={`accordion-content ${accordionAberto === 'representante' ? 'open' : ''}`}>
        <div className="accordion-section">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="representante_nome">Nome Completo</label>
              <input
                type="text"
                id="representante_nome"
                value={dados.nome}
                onChange={(e) => onUpdate('nome', e.target.value)}
                placeholder="Nome completo do representante"
              />
            </div>

            <div className="form-group">
              <label htmlFor="representante_cpf">CPF</label>
              <input
                type="text"
                id="representante_cpf"
                value={dados.cpf}
                onChange={(e) => onUpdate('cpf', e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="representante_rg">RG</label>
              <input
                type="text"
                id="representante_rg"
                value={dados.rg}
                onChange={(e) => onUpdate('rg', e.target.value)}
                placeholder="00.000.000-0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="representante_telefone">Telefone</label>
              <input
                type="tel"
                id="representante_telefone"
                value={dados.telefone}
                onChange={(e) => onUpdate('telefone', e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="representante_email">E-mail</label>
              <input
                type="email"
                id="representante_email"
                value={dados.email}
                onChange={(e) => onUpdate('email', e.target.value)}
                placeholder="representante@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="representante_logradouro">Logradouro</label>
              <input
                type="text"
                id="representante_logradouro"
                value={dados.endLogradouro}
                onChange={(e) => onUpdate('endLogradouro', e.target.value)}
                placeholder="Rua, Avenida, etc."
              />
            </div>

            <div className="form-group">
              <label htmlFor="representante_bairro">Bairro</label>
              <input
                type="text"
                id="representante_bairro"
                value={dados.endBairro}
                onChange={(e) => onUpdate('endBairro', e.target.value)}
                placeholder="Nome do bairro"
              />
            </div>

            <div className="form-group">
              <label htmlFor="representante_numero">Número</label>
              <input
                type="text"
                id="representante_numero"
                value={dados.endNumero}
                onChange={(e) => onUpdate('endNumero', e.target.value)}
                placeholder="Número"
              />
            </div>

            <div className="form-group">
              <label htmlFor="representante_complemento">Complemento</label>
              <input
                type="text"
                id="representante_complemento"
                value={dados.endComplemento}
                onChange={(e) => onUpdate('endComplemento', e.target.value)}
                placeholder="Apartamento, Bloco, etc."
              />
            </div>

            <div className="form-group">
              <label htmlFor="representante_cep">CEP</label>
              <input
                type="text"
                id="representante_cep"
                value={dados.endCep}
                onChange={(e) => onUpdate('endCep', e.target.value)}
                placeholder="00000-000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="representante_funcao">Função</label>
              <select
                id="representante_funcao"
                value={dados.funcao}
                onChange={(e) => onUpdate('funcao', parseInt(e.target.value))}
              >
                <option value={1}>Presidente</option>
                <option value={2}>Vice-Presidente</option>
                <option value={3}>Secretário</option>
                <option value={4}>Tesoureiro</option>
                <option value={5}>Diretor</option>
                <option value={6}>Coordenador</option>
                <option value={7}>Representante</option>
                <option value={8}>Outro</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
