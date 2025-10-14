import { useState, useEffect } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface OrientacoesTecnicasProps {
  organizacao: any;
  onUpdate: (campo: string, valor: any) => Promise<void>;
  accordionAberto: string | null;
  onToggleAccordion: (id: string) => void;
}

const OPCOES_ENFASE = [
  { id: 0, label: 'Selecione...' },
  { id: 1, label: 'PNAE' },
  { id: 2, label: 'PAA Leite' },
  { id: 3, label: 'Crédito do INCRA' },
  { id: 4, label: 'Governos' },
  { id: 5, label: 'Redes de Cooperação e/ou Comercialização' },
  { id: 99, label: 'Outros' }
];

export function OrientacoesTecnicas({
  organizacao,
  onUpdate,
  accordionAberto,
  onToggleAccordion
}: OrientacoesTecnicasProps) {
  const [eixosTrabalhados, setEixosTrabalhados] = useState(organizacao?.eixos_trabalhados || '');
  const [enfase, setEnfase] = useState(organizacao?.enfase || 0);
  const [enfaseOutros, setEnfaseOutros] = useState(organizacao?.enfase_outros || '');
  const [metodologia, setMetodologia] = useState(organizacao?.metodologia || '');
  const [orientacoes, setOrientacoes] = useState(organizacao?.orientacoes || '');
  
  const isAberto = accordionAberto === 'orientacoes-tecnicas';
  const LIMITE_CARACTERES = 8192;

  useEffect(() => {
    setEixosTrabalhados(organizacao?.eixos_trabalhados || '');
    setEnfase(organizacao?.enfase || 0);
    setEnfaseOutros(organizacao?.enfase_outros || '');
    setMetodologia(organizacao?.metodologia || '');
    setOrientacoes(organizacao?.orientacoes || '');
  }, [organizacao]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (eixosTrabalhados !== organizacao?.eixos_trabalhados) {
        onUpdate('eixos_trabalhados', eixosTrabalhados || null);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [eixosTrabalhados, organizacao?.eixos_trabalhados, onUpdate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (enfaseOutros !== organizacao?.enfase_outros) {
        onUpdate('enfase_outros', enfaseOutros || null);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [enfaseOutros, organizacao?.enfase_outros, onUpdate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (metodologia !== organizacao?.metodologia) {
        onUpdate('metodologia', metodologia || null);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [metodologia, organizacao?.metodologia, onUpdate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (orientacoes !== organizacao?.orientacoes) {
        onUpdate('orientacoes', orientacoes || null);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [orientacoes, organizacao?.orientacoes, onUpdate]);

  const handleEnfaseChange = (value: number) => {
    setEnfase(value);
    onUpdate('enfase', value || null);
    if (value !== 99) {
      setEnfaseOutros('');
      onUpdate('enfase_outros', null);
    }
  };

  return (
    <div className="accordion-item">
      <div 
        className="accordion-header" 
        onClick={() => onToggleAccordion('orientacoes-tecnicas')}
        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BookOpen size={20} /> Orientações Técnicas da Atividade
        </h3>
        {isAberto ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {isAberto && (
        <div className="accordion-content" style={{ display: 'block' }}>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Eixos Trabalhados</label>
              <input
                type="text"
                value={eixosTrabalhados}
                onChange={(e) => setEixosTrabalhados(e.target.value)}
                placeholder="Ex: Gestão, Mercados, Comercialização, Finanças..."
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Ênfase da Atividade</label>
              <select
                value={enfase}
                onChange={(e) => handleEnfaseChange(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px'
                }}
              >
                {OPCOES_ENFASE.map(opcao => (
                  <option key={opcao.id} value={opcao.id}>{opcao.label}</option>
                ))}
              </select>
            </div>

            {enfase === 99 && (
              <div className="form-group" style={{ flex: 1 }}>
                <label>Especifique Outra Ênfase</label>
                <input
                  type="text"
                  value={enfaseOutros}
                  onChange={(e) => setEnfaseOutros(e.target.value)}
                  placeholder="Especifique qual é a ênfase..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>
              Metodologia Utilizada
              <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                ({metodologia.length}/{LIMITE_CARACTERES} caracteres)
              </span>
            </label>
            <textarea
              value={metodologia}
              onChange={(e) => {
                if (e.target.value.length <= LIMITE_CARACTERES) {
                  setMetodologia(e.target.value);
                }
              }}
              placeholder="Descreva a metodologia utilizada na atividade..."
              rows={4}
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
          </div>

          <div className="form-group">
            <label>
              Orientações e Soluções Técnicas
              <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                ({orientacoes.length}/{LIMITE_CARACTERES} caracteres)
              </span>
            </label>
            <textarea
              value={orientacoes}
              onChange={(e) => {
                if (e.target.value.length <= LIMITE_CARACTERES) {
                  setOrientacoes(e.target.value);
                }
              }}
              placeholder="Descreva as orientações e soluções técnicas fornecidas..."
              rows={4}
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
          </div>
        </div>
      )}
    </div>
  );
}

