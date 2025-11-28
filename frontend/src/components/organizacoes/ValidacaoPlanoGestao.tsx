import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, Save, User as UserIcon, Calendar, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { organizacaoAPI } from '../../services/api';
import './Validacao.css';

interface ValidacaoPlanoGestaoProps {
  organizacaoId: number;
  validacaoStatus: number | null;
  validacaoUsuario: number | null;
  validacaoData: Date | string | null;
  validacaoObs: string | null;
  validacaoUsuarioNome?: string | null;
  onUpdate?: () => void;
}

const STATUS_VALIDACAO = [
  { valor: 1, label: 'NÃO VALIDADO', cor: '#9ca3af', icon: Clock },
  { valor: 2, label: 'VALIDADO', cor: '#10b981', icon: CheckCircle },
  { valor: 3, label: 'PENDÊNCIA', cor: '#f59e0b', icon: AlertCircle },
  { valor: 4, label: 'REPROVADO', cor: '#ef4444', icon: XCircle },
];

const ValidacaoPlanoGestao: React.FC<ValidacaoPlanoGestaoProps> = ({
  organizacaoId,
  validacaoStatus,
  validacaoUsuario,
  validacaoData,
  validacaoObs,
  validacaoUsuarioNome,
  onUpdate,
}) => {
  const { user, isCoordinator, hasPermission } = useAuth();
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novoStatus, setNovoStatus] = useState(validacaoStatus || 1);
  const [novaObs, setNovaObs] = useState(validacaoObs || '');

  // Sincronizar estado local com props quando mudarem
  useEffect(() => {
    setNovoStatus(validacaoStatus || 1);
    setNovaObs(validacaoObs || '');
  }, [validacaoStatus, validacaoObs]);

  // Verificar se pode editar (admin ou coordenador)
  const podeEditar = hasPermission('sistema', 'admin') || isCoordinator();

  const statusAtual = STATUS_VALIDACAO.find(s => s.valor === (validacaoStatus || 1));
  const IconeStatus = statusAtual?.icon || Clock;

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      await organizacaoAPI.updatePlanoGestaoValidacao(organizacaoId, {
        plano_gestao_validacao_status: novoStatus,
        plano_gestao_validacao_obs: novaObs || null,
        plano_gestao_validacao_usuario: user?.id || null,
      });

      setEditando(false);
      
      // Chamar callback para atualizar dados no componente pai
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Erro ao salvar validação do plano de gestão:', error);
      alert('Erro ao salvar validação do plano de gestão');
    } finally {
      setSalvando(false);
    }
  };

  const handleCancelar = () => {
    setNovoStatus(validacaoStatus || 1);
    setNovaObs(validacaoObs || '');
    setEditando(false);
  };

  return (
    <div className="validacao-container">
      <div className="page-header" style={{ marginBottom: '1rem', padding: '1rem 0' }}>
        <div className="page-header-left">
          <IconeStatus size={24} style={{ color: statusAtual?.cor }} />
          <div>
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Validação do Plano de Gestão</h2>
            <p style={{ fontSize: '0.85rem', margin: '0.25rem 0 0 0', color: '#6b7280' }}>Status da validação e aprovação do plano de gestão</p>
          </div>
        </div>
        {podeEditar && !editando && (
          <button
            onClick={() => setEditando(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Edit size={16} />
            Editar Validação
          </button>
        )}
      </div>

      <div className="content-section">
        {editando && podeEditar ? (
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="status">Status da Validação</label>
              <div className="status-buttons">
                {STATUS_VALIDACAO.map((status) => (
                  <button
                    key={status.valor}
                    type="button"
                    onClick={() => setNovoStatus(status.valor)}
                    className={`status-button ${novoStatus === status.valor ? 'active' : ''}`}
                    style={{
                      background: novoStatus === status.valor ? status.cor : '#f3f4f6',
                      color: novoStatus === status.valor ? 'white' : '#374151',
                      border: `2px solid ${status.cor}`,
                    }}
                  >
                    <status.icon size={18} />
                    <span>{status.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="observacoes">Observações</label>
              <textarea
                id="observacoes"
                value={novaObs}
                onChange={(e) => setNovaObs(e.target.value)}
                placeholder="Digite observações sobre a validação (opcional)"
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            <div className="form-actions">
              <button
                onClick={handleCancelar}
                className="btn btn-secondary"
                disabled={salvando}
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                className="btn btn-primary"
                disabled={salvando}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {salvando ? (
                  <>Salvando...</>
                ) : (
                  <>
                    <Save size={16} />
                    Salvar Validação
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Status Compacto */}
            <div className="status-card-compact">
              <div className="status-row">
                <div className="status-label">Status:</div>
                <div 
                  className="status-badge-compact"
                  style={{ 
                    background: statusAtual?.cor,
                    color: 'white',
                  }}
                >
                  <IconeStatus size={16} />
                  <span>{statusAtual?.label}</span>
                </div>
              </div>

              <div className="status-row">
                <div className="status-label">Data de Validação:</div>
                <div className="status-value">
                  <Calendar size={16} style={{ marginRight: '8px' }} />
                  {validacaoData 
                    ? new Date(validacaoData).toLocaleString('pt-BR')
                    : 'Ainda não validado'
                  }
                </div>
              </div>

              <div className="status-row">
                <div className="status-label">Validado por:</div>
                <div className="status-value">
                  <UserIcon size={16} style={{ marginRight: '8px' }} />
                  {validacaoUsuarioNome || 'N/A'}
                </div>
              </div>

              {validacaoObs && (
                <div className="status-row observacoes-row">
                  <div className="status-label">Observações:</div>
                  <div className="status-value observacoes-text">
                    {validacaoObs}
                  </div>
                </div>
              )}
            </div>

            {/* Mensagem Informativa */}
            <div className="alert alert-info">
              <AlertCircle size={18} />
              <span>A validação do plano de gestão é realizada por um coordenador através da lista de organizações ou nesta página.</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ValidacaoPlanoGestao;

