import React, { useState, useEffect } from 'react';
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
      <div className="page-header" style={{ marginBottom: '1rem', padding: '1rem 0' }}>
        <div className="page-header-left">
          <IconeStatus size={24} style={{ color: statusAtual?.cor }} />
          <div>
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Validação do Cadastro</h2>
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
        </div>

        {/* Mensagem Informativa */}
        <div className="alert alert-info">
          <AlertCircle size={18} />
          <span>A validação do cadastro é realizada por um coordenador através da lista de organizações.</span>
        </div>
      </div>
    </div>
  );
};

export default Validacao;

