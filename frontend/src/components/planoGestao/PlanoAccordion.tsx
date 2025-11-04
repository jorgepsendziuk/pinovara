import React, { useState } from 'react';
import { GrupoAcoes } from './GrupoAcoes';
import { PlanoGestao, UpdateAcaoRequest } from '../../types/planoGestao';

interface PlanoAccordionProps {
  plano: PlanoGestao;
  onSave: (idAcaoModelo: number, dados: UpdateAcaoRequest) => Promise<void>;
  canEdit: boolean;
  defaultExpanded?: boolean;
}

export const PlanoAccordion: React.FC<PlanoAccordionProps> = ({ 
  plano, 
  onSave, 
  canEdit,
  defaultExpanded = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  console.log('🎯 PlanoAccordion renderizado:', plano.titulo, 'grupos:', plano.grupos.length);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Contar total de ações e ações editadas
  const totalAcoes = plano.grupos.reduce((total, grupo) => total + grupo.acoes.length, 0);
  const acoesEditadas = plano.grupos.reduce(
    (total, grupo) => 
      total + grupo.acoes.filter(acao => acao.id_acao_editavel !== undefined).length,
    0
  );

  return (
    <div className="plano-accordion">
      <div 
        className={`accordion-header ${isExpanded ? 'expanded' : ''}`}
        onClick={toggleExpanded}
      >
        <div className="accordion-title">
          <span className="accordion-icon">{isExpanded ? '▼' : '▶'}</span>
          <h3>{plano.titulo}</h3>
        </div>
        <div className="accordion-stats">
          <span className="stat-badge">
            {acoesEditadas} / {totalAcoes} ações preenchidas
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="accordion-content">
          <p style={{padding: '10px', background: '#fef3c7', margin: '10px'}}>
            DEBUG: Accordion expandido! Total de grupos: {plano.grupos.length}
          </p>
          {plano.grupos.map((grupo, index) => (
            <GrupoAcoes
              key={`${plano.tipo}-grupo-${index}`}
              grupo={grupo}
              onSave={onSave}
              canEdit={canEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

