import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, Save, User as UserIcon, Calendar, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import '../organizacoes/Validacao.css';

interface ValidacaoProps {
  familiaId: number;
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

const Validacao: React.FC<ValidacaoProps> = ({
  familiaId,
  validacaoStatus,
  validacaoUsuario,
  validacaoData,
  validacaoObs,
  validacaoUsuarioNome,
  onUpdate,
}) => {
  const { user, hasPermission } = useAuth();
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [novoStatus, setNovoStatus] = useState(validacaoStatus || 1);
  const [novaObs, setNovaObs] = useState(validacaoObs || '');

  // Sincronizar estado local com props quando mudarem
  useEffect(() => {
    setNovoStatus(validacaoStatus || 1);
    setNovaObs(validacaoObs || '');
  }, [validacaoStatus, validacaoObs]);

  // Verificar se pode editar (admin ou coordenador do módulo supervisao_ocupacional)
  const podeEditar = hasPermission('sistema', 'admin') || 
                     hasPermission('supervisao_ocupacional', 'admin') || 
                     hasPermission('supervisao_ocupacional', 'coordenador');

  const statusAtual = STATUS_VALIDACAO.find(s => s.valor === (validacaoStatus || 1));
  const IconeStatus = statusAtual?.icon || Clock;

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      await api.patch(`/supervisao-ocupacional/familias/${familiaId}/validacao`, {
        validacao: novoStatus,
        obs_validacao: novaObs || null
      });

      setEditando(false);
      
      // Chamar callback para atualizar dados
      if (onUpdate) {
        onUpdate();
      }
    } catch (error: any) {
      console.error('Erro ao salvar validação:', error);
      alert(error.response?.data?.error || 'Erro ao salvar validação');
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
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Validação da Família</h2>
            <p style={{ fontSize: '0.85rem', margin: '0.25rem 0 0 0', color: '#6b7280' }}>Status da validação e aprovação</p>
          </div>
        </div>
      </div>

      <div className="content-section">
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

          {validacaoObs && !editando && (
            <div className="status-row observacoes-row">
              <div className="status-label">Observações:</div>
              <div className="status-value observacoes-text">
                {validacaoObs}
              </div>
            </div>
          )}

          {/* Campos de Edição */}
          {editando && (
            <>
              <div className="status-row">
                <div className="status-label">Novo Status:</div>
                <div className="status-value" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {STATUS_VALIDACAO.map((status) => {
                    const Icon = status.icon;
                    const isSelected = novoStatus === status.valor;
                    return (
                      <button
                        key={status.valor}
                        type="button"
                        onClick={() => setNovoStatus(status.valor)}
                        className="status-button-edit"
                        style={{
                          border: `2px solid ${isSelected ? status.cor : '#d1d5db'}`,
                          background: isSelected ? status.cor : 'white',
                          color: isSelected ? 'white' : status.cor,
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px',
                          fontWeight: isSelected ? '600' : '400',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Icon size={16} />
                        <span>{status.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="status-row observacoes-row">
                <div className="status-label">Observações:</div>
                <textarea
                  value={novaObs}
                  onChange={(e) => setNovaObs(e.target.value)}
                  placeholder="Digite observações sobre a validação..."
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Botões de Ação */}
        {podeEditar && (
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            marginTop: '24px',
            justifyContent: 'flex-end'
          }}>
            {!editando ? (
              <button
                onClick={() => setEditando(true)}
                style={{
                  padding: '10px 20px',
                  background: '#056839',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#04502d';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#056839';
                }}
              >
                <CheckCircle size={16} />
                Editar Validação
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancelar}
                  disabled={salvando}
                  style={{
                    padding: '10px 20px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: salvando ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    opacity: salvando ? 0.6 : 1
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSalvar}
                  disabled={salvando}
                  style={{
                    padding: '10px 20px',
                    background: '#056839',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: salvando ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: salvando ? 0.6 : 1
                  }}
                >
                  {salvando ? (
                    <>
                      <Loader2 size={16} className="spinning" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Salvar Validação
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {/* Mensagem Informativa */}
        {!podeEditar && (
          <div className="alert alert-info" style={{ marginTop: '24px' }}>
            <AlertCircle size={18} />
            <span>A validação da família é realizada por um coordenador através da lista de famílias.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Validacao;
