import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, Save, User as UserIcon, Calendar, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Toast from '../Toast';
import { organizacaoAPI } from '../../services/api';
import { formatarDataBR } from '../../utils/dateHelpers';
import './ModalValidacao.css';

interface ModalValidacaoPlanoGestaoProps {
  organizacaoId: number;
  organizacaoNome: string;
  onClose: () => void;
}

interface DadosValidacao {
  plano_gestao_validacao_status: number | null;
  plano_gestao_validacao_obs: string | null;
  plano_gestao_validacao_data: string | null;
  plano_gestao_validacao_usuario: number | null;
  plano_gestao_validacao_usuario_nome?: string | null;
}

const STATUS_VALIDACAO = [
  { valor: 1, label: 'NÃO VALIDADO', cor: '#9ca3af', icon: Clock },
  { valor: 2, label: 'VALIDADO', cor: '#10b981', icon: CheckCircle },
  { valor: 3, label: 'PENDÊNCIA', cor: '#f59e0b', icon: AlertCircle },
  { valor: 4, label: 'REPROVADO', cor: '#ef4444', icon: XCircle },
];

const ModalValidacaoPlanoGestao: React.FC<ModalValidacaoPlanoGestaoProps> = ({
  organizacaoId,
  organizacaoNome,
  onClose,
}) => {
  const { user, isCoordinator, hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [dados, setDados] = useState<DadosValidacao | null>(null);
  const [novoStatus, setNovoStatus] = useState<number>(1);
  const [novaObs, setNovaObs] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');
  
  // Verificar se pode editar (admin ou coordenador)
  const podeEditar = hasPermission('sistema', 'admin') || isCoordinator();

  useEffect(() => {
    carregarDados();
  }, [organizacaoId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${API_BASE}/organizacoes/${organizacaoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados da organização');
      }

      const result = await response.json();
      const orgData = result.data || result;
      
      // O nome do usuário validador vem da relação com users
      const nomeValidador = orgData.users_organizacao_plano_gestao_validacao_usuarioTousers?.name || null;
      
      const dadosValidacao: DadosValidacao = {
        plano_gestao_validacao_status: orgData.plano_gestao_validacao_status || null,
        plano_gestao_validacao_obs: orgData.plano_gestao_validacao_obs || null,
        plano_gestao_validacao_data: orgData.plano_gestao_validacao_data || null,
        plano_gestao_validacao_usuario: orgData.plano_gestao_validacao_usuario || null,
        plano_gestao_validacao_usuario_nome: nomeValidador,
      };
      
      setDados(dadosValidacao);
      setNovoStatus(dadosValidacao.plano_gestao_validacao_status || 1);
      setNovaObs(dadosValidacao.plano_gestao_validacao_obs || '');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados da validação do plano de gestão');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (!podeEditar) {
      setToast({ message: 'Você não tem permissão para editar a validação', type: 'error' });
      return;
    }

    setSalvando(true);
    try {
      await organizacaoAPI.updatePlanoGestaoValidacao(organizacaoId, {
        plano_gestao_validacao_status: novoStatus,
        plano_gestao_validacao_obs: novaObs || null,
        plano_gestao_validacao_usuario: user?.id || null,
      });

      setToast({ message: 'Validação do plano de gestão salva com sucesso!', type: 'success' });
      
      // Aguardar um momento para exibir o toast antes de fechar
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Erro ao salvar validação:', error);
      setToast({ 
        message: error instanceof Error ? error.message : 'Erro ao salvar validação do plano de gestão', 
        type: 'error' 
      });
    } finally {
      setSalvando(false);
    }
  };

  const statusAtual = STATUS_VALIDACAO.find(s => s.valor === (dados?.plano_gestao_validacao_status || 1));
  const IconeStatus = statusAtual?.icon || Clock;

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          persistent={false}
        />
      )}
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Cabeçalho */}
        <div className="modal-header">
          <div className="modal-header-content">
            <CheckCircle size={22} style={{ color: '#056839' }} />
            <div>
              <h2>Validação do Plano de Gestão</h2>
              <p className="modal-organizacao-nome">{organizacaoNome}</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" title="Fechar">
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="modal-body">
          {loading ? (
            <div className="modal-loading">
              <p>Carregando dados da validação...</p>
            </div>
          ) : (
            <>
              {!podeEditar && (
                <div className="alert alert-warning">
                  <AlertCircle size={18} />
                  <span>Apenas coordenadores podem editar a validação do plano de gestão.</span>
                </div>
              )}

              {/* Campo Status */}
              <div className="form-group">
                <label htmlFor="status">Status da Validação</label>
                <div className="status-buttons">
                  {STATUS_VALIDACAO.map((status) => {
                    const Icon = status.icon;
                    const isSelected = novoStatus === status.valor;
                    
                    return (
                      <button
                        key={status.valor}
                        type="button"
                        onClick={() => podeEditar && setNovoStatus(status.valor)}
                        disabled={!podeEditar}
                        className={`status-button ${isSelected ? 'selected' : ''}`}
                        style={{
                          borderColor: isSelected ? status.cor : '#d1d5db',
                          background: isSelected ? status.cor : 'white',
                          color: isSelected ? 'white' : status.cor,
                          cursor: podeEditar ? 'pointer' : 'not-allowed',
                          opacity: podeEditar ? 1 : 0.6,
                        }}
                      >
                        <Icon size={16} />
                        <span>{status.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campo Observações */}
              <div className="form-group">
                <label htmlFor="observacoes">Observações</label>
                <textarea
                  id="observacoes"
                  value={novaObs}
                  onChange={(e) => setNovaObs(e.target.value)}
                  disabled={!podeEditar}
                  placeholder="Digite observações sobre a validação (opcional)"
                  rows={3}
                  className="form-textarea"
                  style={{
                    cursor: podeEditar ? 'text' : 'not-allowed',
                    opacity: podeEditar ? 1 : 0.6,
                  }}
                />
              </div>

              {/* Informações de Validação Anterior */}
              <div className="validation-info">
                <div className="info-row">
                  <div className="info-label">
                    <Calendar size={14} />
                    <span>Data:</span>
                  </div>
                  <div className="info-value">
                    {dados?.plano_gestao_validacao_data
                      ? formatarDataBR(dados.plano_gestao_validacao_data)
                      : 'Não validado'}
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-label">
                    <UserIcon size={14} />
                    <span>Validado por:</span>
                  </div>
                  <div className="info-value">
                    {dados?.plano_gestao_validacao_usuario_nome || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              {podeEditar && (
                <div className="modal-actions">
                  <button
                    onClick={onClose}
                    className="btn btn-secondary"
                    disabled={salvando}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSalvar}
                    className="btn btn-primary"
                    disabled={salvando}
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
              )}
            </>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default ModalValidacaoPlanoGestao;

