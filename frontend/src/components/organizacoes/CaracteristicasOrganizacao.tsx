import React from 'react';
import { Organizacao } from '../../types/organizacao';
import { BarChart, Users, Building2 } from 'lucide-react';

interface CaracteristicasOrganizacaoProps {
  organizacao: Organizacao;
  onUpdate: (field: keyof Organizacao, value: any) => void;
  accordionAberto: string | null;
  onToggleAccordion: (accordion: string) => void;
}

export const CaracteristicasOrganizacao: React.FC<CaracteristicasOrganizacaoProps> = ({
  organizacao,
  onUpdate,
  accordionAberto,
  onToggleAccordion
}) => {
  return (
    <div className="accordion-item">
      <button
        className="accordion-header"
        onClick={() => onToggleAccordion('caracteristicas')}
      >
        <h3><BarChart size={18} style={{marginRight: '0.5rem'}} /> Características da Organização</h3>
        <span className={`accordion-icon ${accordionAberto === 'caracteristicas' ? 'open' : ''}`}>
          ▼
        </span>
      </button>
      
      <div className={`accordion-content ${accordionAberto === 'caracteristicas' ? 'open' : ''}`}>
        <div className="accordion-section">
          
          {/* Seção: Dados Gerais dos Sócios */}
          <div className="subsection">
            <h4><Users size={16} style={{marginRight: '0.5rem'}} /> Dados Gerais dos Sócios</h4>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="n_total_socios">Total de Sócios</label>
                <input
                  type="number"
                  id="n_total_socios"
                  value={organizacao.caracteristicas_n_total_socios || ''}
                  onChange={(e) => onUpdate('caracteristicas_n_total_socios', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="n_total_socios_caf">Sócios Cafeicultores</label>
                <input
                  type="number"
                  id="n_total_socios_caf"
                  value={organizacao.caracteristicas_n_total_socios_caf || ''}
                  onChange={(e) => onUpdate('caracteristicas_n_total_socios_caf', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="n_ativos_total">Ativos Total</label>
                <input
                  type="number"
                  id="n_ativos_total"
                  value={organizacao.caracteristicas_n_ativos_total || ''}
                  onChange={(e) => onUpdate('caracteristicas_n_ativos_total', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="n_ativos_caf">Ativos Cafeicultores</label>
                <input
                  type="number"
                  id="n_ativos_caf"
                  value={organizacao.caracteristicas_n_ativos_caf || ''}
                  onChange={(e) => onUpdate('caracteristicas_n_ativos_caf', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Seção: Programas Governamentais */}
          <div className="subsection">
            <h4><Building2 size={16} style={{marginRight: '0.5rem'}} /> Programas Governamentais</h4>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="n_socios_paa">Sócios PAA</label>
                <input
                  type="number"
                  id="n_socios_paa"
                  value={organizacao.caracteristicas_n_socios_paa || ''}
                  onChange={(e) => onUpdate('caracteristicas_n_socios_paa', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="n_naosocios_paa">Não Sócios PAA</label>
                <input
                  type="number"
                  id="n_naosocios_paa"
                  value={organizacao.caracteristicas_n_naosocios_paa || ''}
                  onChange={(e) => onUpdate('caracteristicas_n_naosocios_paa', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="n_socios_pnae">Sócios PNAE</label>
                <input
                  type="number"
                  id="n_socios_pnae"
                  value={organizacao.caracteristicas_n_socios_pnae || ''}
                  onChange={(e) => onUpdate('caracteristicas_n_socios_pnae', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="n_naosocios_pnae">Não Sócios PNAE</label>
                <input
                  type="number"
                  id="n_naosocios_pnae"
                  value={organizacao.caracteristicas_n_naosocios_pnae || ''}
                  onChange={(e) => onUpdate('caracteristicas_n_naosocios_pnae', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Seção: Tipos de Café */}
          <div className="subsection">
            <h4>☕ Tipos de Café</h4>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="caf_organico">Café Orgânico</label>
                <input
                  type="number"
                  id="caf_organico"
                  value={organizacao.caracteristicas_ta_caf_organico || ''}
                  onChange={(e) => onUpdate('caracteristicas_ta_caf_organico', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="caf_agroecologico">Café Agroecológico</label>
                <input
                  type="number"
                  id="caf_agroecologico"
                  value={organizacao.caracteristicas_ta_caf_agroecologico || ''}
                  onChange={(e) => onUpdate('caracteristicas_ta_caf_agroecologico', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="caf_transicao">Café em Transição</label>
                <input
                  type="number"
                  id="caf_transicao"
                  value={organizacao.caracteristicas_ta_caf_transicao || ''}
                  onChange={(e) => onUpdate('caracteristicas_ta_caf_transicao', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="caf_convencional">Café Convencional</label>
                <input
                  type="number"
                  id="caf_convencional"
                  value={organizacao.caracteristicas_ta_caf_convencional || ''}
                  onChange={(e) => onUpdate('caracteristicas_ta_caf_convencional', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
