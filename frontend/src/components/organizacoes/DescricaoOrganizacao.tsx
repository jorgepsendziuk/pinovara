import { useState, useEffect } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface DescricaoOrganizacaoProps {
  organizacao: any;
  onUpdate: (campo: string, valor: any) => Promise<void>;
  accordionAberto: string | null;
  onToggleAccordion: (id: string) => void;
}

export function DescricaoOrganizacao({
  organizacao,
  onUpdate,
  accordionAberto,
  onToggleAccordion
}: DescricaoOrganizacaoProps) {
  const [descricao, setDescricao] = useState(organizacao?.descricao || '');
  const isAberto = accordionAberto === 'descricao';
  const LIMITE_CARACTERES = 8192;

  useEffect(() => {
    setDescricao(organizacao?.descricao || '');
  }, [organizacao?.descricao]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (descricao !== organizacao?.descricao) {
        onUpdate('descricao', descricao || null);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [descricao, organizacao?.descricao, onUpdate]);

  return (
    <div className="accordion-item">
      <button
        className="accordion-header"
        onClick={() => onToggleAccordion('descricao')}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} /> Descrição Geral do Empreendimento
        </h3>
        <ChevronDown
          size={20}
          style={{
            transition: 'transform 0.2s ease',
            transform: isAberto ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>

      <div className={`accordion-content ${isAberto ? 'open' : ''}`}>
        <div className="accordion-section">
          <div className="form-group">
            <label>
              Descrição Geral
              <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                ({descricao.length}/{LIMITE_CARACTERES} caracteres)
              </span>
            </label>
            <textarea
              value={descricao}
              onChange={(e) => {
                if (e.target.value.length <= LIMITE_CARACTERES) {
                  setDescricao(e.target.value);
                }
              }}
              placeholder="Descreva as características gerais do empreendimento, ramo de atuação, produtos/serviços, perfil dos membros, perfil diretivo, estrutura organizacional, modelo de governança..."
              rows={8}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            {descricao.length >= LIMITE_CARACTERES * 0.9 && (
              <p style={{ 
                fontSize: '0.75rem', 
                color: descricao.length >= LIMITE_CARACTERES ? '#dc2626' : '#f59e0b', 
                marginTop: '0.25rem' 
              }}>
                {descricao.length >= LIMITE_CARACTERES 
                  ? 'Limite de caracteres atingido' 
                  : 'Aproximando-se do limite de caracteres'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

