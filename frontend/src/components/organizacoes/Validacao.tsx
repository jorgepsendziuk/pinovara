import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, Save, User as UserIcon, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Validacao.css';

interface ValidacaoProps {
  organizacaoId: number;
  validacaoStatus: number | null;
  validacaoUsuario: number | null;
  validacaoData: Date | null;
  validacaoObs: string | null;
  validacaoUsuarioNome?: string | null;
  onUpdate: (campo: string, valor: any) => Promise<void>;
}

const STATUS_VALIDACAO = [
  { valor: 1, label: 'NÃO VALIDADO', cor: '#9ca3af', icon: Clock },
  { valor: 2, label: 'VALIDADO', cor: '#10b981', icon: CheckCircle },
  { valor: 3, label: 'PENDÊNCIA', cor: '#f59e0b', icon: AlertCircle },
  { valor: 4, label: 'REPROVADO', cor: '#ef4444', icon: XCircle },
];

const Validacao: React.FC<ValidacaoProps> = ({
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

  // Verificar se pode editar (admin ou coordenador)
  const podeEditar = hasPermission('sistema', 'admin') || isCoordinator();

  const statusAtual = STATUS_VALIDACAO.find(s => s.valor === (validacaoStatus || 1));
  const IconeStatus = statusAtual?.icon || Clock;

  const handleSalvar = async () => {
    setSalvando(true);
    try {
      // Atualizar status
      await onUpdate('validacao_status', novoStatus);
      
      // Atualizar observações
      await onUpdate('validacao_obs', novaObs || null);
      
      // Atualizar usuário e data (será feito no backend)
      await onUpdate('validacao_usuario', user?.id);
      await onUpdate('validacao_data', new Date());

      setEditando(false);
    } catch (error) {
      console.error('Erro ao salvar validação:', error);
      alert('Erro ao salvar validação');
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
      <div className="page-header">
        <div className="page-header-left">
          <IconeStatus size={28} style={{ color: statusAtual?.cor }} />
          <div>
            <h2>Validação do Cadastro</h2>
            <p>Controle de qualidade e aprovação dos dados</p>
          </div>
        </div>
      </div>

      <div className="content-section">
        {/* Status Atual */}
        <div className="status-card">
          <h3>Status Atual</h3>
          <div className="status-display">
            <div 
              className="status-badge-large"
              style={{ 
                background: statusAtual?.cor,
                color: 'white',
              }}
            >
              <IconeStatus size={24} />
              <span>{statusAtual?.label}</span>
            </div>
          </div>

          {validacaoData && (
            <div className="validacao-info">
              <div className="info-item">
                <Calendar size={16} />
                <span>
                  <strong>Data:</strong> {new Date(validacaoData).toLocaleString('pt-BR')}
                </span>
              </div>
              {validacaoUsuarioNome && (
                <div className="info-item">
                  <UserIcon size={16} />
                  <span>
                    <strong>Validado por:</strong> {validacaoUsuarioNome}
                  </span>
                </div>
              )}
            </div>
          )}

          {validacaoObs && !editando && (
            <div className="observacoes-display">
              <strong>Observações:</strong>
              <p>{validacaoObs}</p>
            </div>
          )}
        </div>

        {/* Formulário de Edição */}
        {podeEditar && (
          <div className="validacao-form">
            {!editando ? (
              <button 
                className="btn btn-primary"
                onClick={() => setEditando(true)}
              >
                Alterar Validação
              </button>
            ) : (
              <div className="form-card">
                <div className="form-field">
                  <label>Novo Status</label>
                  <select 
                    value={novoStatus}
                    onChange={(e) => setNovoStatus(parseInt(e.target.value))}
                    className="form-select"
                  >
                    {STATUS_VALIDACAO.map(status => (
                      <option key={status.valor} value={status.valor}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Observações</label>
                  <textarea
                    value={novaObs}
                    onChange={(e) => setNovaObs(e.target.value)}
                    placeholder="Adicione observações sobre a validação, pendências ou motivos de reprovação..."
                    rows={5}
                    className="form-textarea"
                  />
                </div>

                <div className="form-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={handleSalvar}
                    disabled={salvando}
                  >
                    {salvando ? (
                      <>
                        <Save className="spinning" size={16} />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Salvar Validação
                      </>
                    )}
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleCancelar}
                    disabled={salvando}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mensagem para Técnicos */}
        {!podeEditar && (
          <div className="alert alert-info">
            <AlertCircle size={18} />
            <span>Como técnico, você pode visualizar o status de validação mas não pode alterá-lo.</span>
          </div>
        )}

        {/* Legenda dos Status */}
        <div className="legenda-status">
          <h4>Legenda dos Status:</h4>
          <div className="status-grid">
            {STATUS_VALIDACAO.map(status => {
              const Icon = status.icon;
              return (
                <div key={status.valor} className="status-item">
                  <div className="status-badge-small" style={{ background: status.cor }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <strong>{status.label}</strong>
                    <small>
                      {status.valor === 1 && 'Cadastro aguardando validação'}
                      {status.valor === 2 && 'Cadastro aprovado e validado'}
                      {status.valor === 3 && 'Cadastro com pendências a corrigir'}
                      {status.valor === 4 && 'Cadastro reprovado'}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Validacao;

