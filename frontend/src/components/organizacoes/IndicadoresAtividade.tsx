import { useState, useEffect } from 'react';
import { Target, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import api from '../../services/api';

interface IndicadoresAtividadeProps {
  organizacaoId: number;
  accordionAberto: string | null;
  onToggleAccordion: (id: string) => void;
}

const INDICADORES = [
  { id: 1, descricao: 'Conformidade documental e regularidade do empreendimento' },
  { id: 2, descricao: 'Práticas de tomada de decisão' },
  { id: 3, descricao: 'Políticas públicas de apoio à produção e comercialização' },
  { id: 4, descricao: 'Associados com acesso às políticas públicas' },
  { id: 5, descricao: 'Participação dos associados no empreendimento' },
  { id: 6, descricao: 'Participação de mulheres na gestão' },
  { id: 7, descricao: 'Capacitação de gestores' },
  { id: 8, descricao: 'Capacitação de associados' },
  { id: 9, descricao: 'Geração de Empregos Diretos' },
  { id: 10, descricao: 'Controles econômicos' },
  { id: 11, descricao: 'Negócios institucionais' },
  { id: 12, descricao: 'Inovação no empreendimento' },
  { id: 13, descricao: 'Adoção de tecnologias referenciais' },
  { id: 14, descricao: 'Práticas sustentáveis no empreendimento' },
  { id: 15, descricao: 'Programa ou ações ambientais comunitárias' },
  { id: 16, descricao: 'Prática de proteção de nascentes e/ou uso racional de recursos hídricos' }
];

export function IndicadoresAtividade({
  organizacaoId,
  accordionAberto,
  onToggleAccordion
}: IndicadoresAtividadeProps) {
  const [indicadoresSelecionados, setIndicadoresSelecionados] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const isAberto = accordionAberto === 'indicadores';


  useEffect(() => {
    if (isAberto) {
      loadIndicadores();
    }
  }, [isAberto, organizacaoId]);

  const loadIndicadores = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/organizacoes/${organizacaoId}/indicadores`);
      if (response.data.success && Array.isArray(response.data.data)) {
        const ids = response.data.data.map((ind: any) => ind.valor);
        setIndicadoresSelecionados(ids);
      }
    } catch (error) {
      console.error('Erro ao carregar indicadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIndicador = async (indicadorId: number) => {
    try {
      if (indicadoresSelecionados.includes(indicadorId)) {
        // Remover
        await api.delete(`/organizacoes/${organizacaoId}/indicadores/${indicadorId}`);
        setIndicadoresSelecionados(prev => prev.filter(id => id !== indicadorId));
      } else {
        // Adicionar
        await api.post(`/organizacoes/${organizacaoId}/indicadores`, {
          id_indicador: indicadorId
        });
        setIndicadoresSelecionados(prev => [...prev, indicadorId]);
      }
    } catch (error) {
      console.error('Erro ao atualizar indicador:', error);
      alert('Erro ao atualizar indicador');
    }
  };

  return (
    <div className="accordion-item">
      <button
        className="accordion-header"
        onClick={() => onToggleAccordion('indicadores')}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={20} /> Indicadores da Atividade
          {indicadoresSelecionados.length > 0 && (
            <span style={{ 
              fontSize: '0.875rem', 
              background: '#056839', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '12px' 
            }}>
              {indicadoresSelecionados.length}
            </span>
          )}
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
          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>Carregando...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {INDICADORES.map(indicador => (
                <label
                  key={indicador.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: indicadoresSelecionados.includes(indicador.id) ? '#f0fdf4' : '#fff',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#056839'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  <input
                    type="checkbox"
                    checked={indicadoresSelecionados.includes(indicador.id)}
                    onChange={() => handleToggleIndicador(indicador.id)}
                    style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ flex: 1, fontSize: '14px' }}>
                    <strong>{indicador.id}.</strong> {indicador.descricao}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

