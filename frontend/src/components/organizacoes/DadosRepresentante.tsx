import React from 'react';
import { DadosRepresentante } from '../../types/organizacao';
import { User, ChevronDown } from 'lucide-react';

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
        <h3><User size={18} style={{marginRight: '0.5rem'}} /> Dados do Representante</h3>
        <ChevronDown
          size={16}
          className={`accordion-icon ${accordionAberto === 'representante' ? 'open' : ''}`}
          style={{
            marginLeft: '0.5rem',
            transition: 'transform 0.2s ease',
            transform: accordionAberto === 'representante' ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>
      
      <div className={`accordion-content ${accordionAberto === 'representante' ? 'open' : ''}`}>
        <div className="accordion-section">
          <div className="form-grid">
            <div className="form-group two-thirds">
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
                onChange={(e) => {
                  // Remove tudo que não é número
                  const apenasNumeros = e.target.value.replace(/\D/g, '');
                  // Limita a 11 dígitos
                  const limitado = apenasNumeros.slice(0, 11);
                  // Aplica formatação: 000.000.000-00
                  let formatado = limitado;
                  if (limitado.length > 9) {
                    formatado = limitado.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                  } else if (limitado.length > 6) {
                    formatado = limitado.replace(/^(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
                  } else if (limitado.length > 3) {
                    formatado = limitado.replace(/^(\d{3})(\d{1,3})/, '$1.$2');
                  }
                  onUpdate('cpf', formatado);
                }}
                placeholder="000.000.000-00"
                maxLength={14}
              />
              <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Digite apenas números (11 dígitos)
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="representante_rg">RG</label>
              <input
                type="text"
                id="representante_rg"
                value={dados.rg}
                onChange={(e) => onUpdate('rg', e.target.value)}
                placeholder="00.000.000-0"
                maxLength={12}
              />
            </div>

            <div className="form-group">
              <label htmlFor="representante_telefone">Telefone</label>
              <input
                type="tel"
                id="representante_telefone"
                value={dados.telefone}
                onChange={(e) => {
                  // Remove tudo que não é número
                  const apenasNumeros = e.target.value.replace(/\D/g, '');
                  // Limita a 11 dígitos
                  const limitado = apenasNumeros.slice(0, 11);
                  // Aplica formatação: (00) 00000-0000 ou (00) 0000-0000
                  let formatado = limitado;
                  if (limitado.length > 10) {
                    formatado = limitado.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                  } else if (limitado.length > 6) {
                    if (limitado.length === 10) {
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
              <label htmlFor="representante_email">E-mail</label>
              <input
                type="email"
                id="representante_email"
                value={dados.email}
                onChange={(e) => onUpdate('email', e.target.value)}
                placeholder="representante@email.com"
              />
              <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Formato: exemplo@dominio.com
              </small>
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
                onChange={(e) => {
                  // Remove tudo que não é número
                  const apenasNumeros = e.target.value.replace(/\D/g, '');
                  // Limita a 8 dígitos
                  const limitado = apenasNumeros.slice(0, 8);
                  // Aplica formatação: 00000-000
                  let formatado = limitado;
                  if (limitado.length > 5) {
                    formatado = limitado.replace(/^(\d{5})(\d{1,3})/, '$1-$2');
                  }
                  onUpdate('endCep', formatado);
                }}
                placeholder="00000-000"
                maxLength={9}
              />
              <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Digite apenas números (8 dígitos)
              </small>
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
