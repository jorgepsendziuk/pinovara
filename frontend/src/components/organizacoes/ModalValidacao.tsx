import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, Save, User as UserIcon, Calendar, X, History } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Toast from '../Toast';
import { organizacaoAPI } from '../../services/api';
import { HistoricoValidacao } from '../../types/organizacao';
import { formatarDataBR } from '../../utils/dateHelpers';
import './ModalValidacao.css';

interface ModalValidacaoProps {
  organizacaoId: number;
  organizacaoNome: string;
  onClose: () => void;
}

interface DadosValidacao {
  validacao_status: number | null;
  validacao_obs: string | null;
  validacao_data: string | null;
  validacao_usuario: number | null;
  validacao_usuario_nome?: string | null;
}

const STATUS_VALIDACAO = [
  { valor: 1, label: 'NÃO VALIDADO', cor: '#9ca3af', icon: Clock },
  { valor: 2, label: 'VALIDADO', cor: '#10b981', icon: CheckCircle },
  { valor: 3, label: 'PENDÊNCIA', cor: '#f59e0b', icon: AlertCircle },
  { valor: 4, label: 'REPROVADO', cor: '#ef4444', icon: XCircle },
];

const ModalValidacao: React.FC<ModalValidacaoProps> = ({
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
  const [historicoValidacao, setHistoricoValidacao] = useState<HistoricoValidacao[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');
  
  // Verificar se pode editar (admin ou coordenador)
  const podeEditar = hasPermission('sistema', 'admin') || isCoordinator();

  useEffect(() => {
    carregarDados();
    carregarHistorico();
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
      const nomeValidador = orgData.users?.name || orgData.validacao_usuario_nome || null;
      
      const dadosValidacao: DadosValidacao = {
        validacao_status: orgData.validacao_status || null,
        validacao_obs: orgData.validacao_obs || null,
        validacao_data: orgData.validacao_data || null,
        validacao_usuario: orgData.validacao_usuario || null,
        validacao_usuario_nome: nomeValidador,
      };
      
      setDados(dadosValidacao);
      setNovoStatus(dadosValidacao.validacao_status || 1);
      setNovaObs(dadosValidacao.validacao_obs || '');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados da validação');
    } finally {
      setLoading(false);
    }
  };

  const carregarHistorico = async () => {
    try {
      setCarregandoHistorico(true);
      const historico = await organizacaoAPI.getHistoricoValidacao(organizacaoId);
      setHistoricoValidacao(historico);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      // Não mostrar erro ao usuário, apenas logar
      setHistoricoValidacao([]);
    } finally {
      setCarregandoHistorico(false);
    }
  };

  const getStatusLabel = (status: number | null): string => {
    if (status === null) return '-';
    const statusObj = STATUS_VALIDACAO.find(s => s.valor === status);
    return statusObj?.label || 'Desconhecido';
  };

  const handleSalvar = async () => {
    if (!podeEditar) {
      setToast({ message: 'Você não tem permissão para editar a validação', type: 'error' });
      return;
    }

    setSalvando(true);
    try {
      const token = localStorage.getItem('@pinovara:token');
      
      // Atualizar os campos de validação usando a rota específica
      const atualizacoes = {
        validacao_status: novoStatus,
        validacao_obs: novaObs || null,
        validacao_usuario: user?.id,
      };

      const response = await fetch(`${API_BASE}/organizacoes/${organizacaoId}/validacao`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(atualizacoes),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Erro ao salvar validação');
      }

      setToast({ message: 'Validação salva com sucesso!', type: 'success' });
      
      // Recarregar histórico após salvar
      await carregarHistorico();
      
      // Aguardar um momento para exibir o toast antes de fechar
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Erro ao salvar validação:', error);
      setToast({ 
        message: error instanceof Error ? error.message : 'Erro ao salvar validação', 
        type: 'error' 
      });
    } finally {
      setSalvando(false);
    }
  };

  const statusAtual = STATUS_VALIDACAO.find(s => s.valor === (dados?.validacao_status || 1));
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
              <h2>Validação do Cadastro</h2>
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
                  <span>Apenas coordenadores podem editar a validação do cadastro.</span>
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
                    {dados?.validacao_data
                      ? formatarDataBR(dados.validacao_data)
                      : 'Não validado'}
                  </div>
                </div>

                <div className="info-row">
                  <div className="info-label">
                    <UserIcon size={14} />
                    <span>Validado por:</span>
                  </div>
                  <div className="info-value">
                    {dados?.validacao_usuario_nome || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Histórico de Validação */}
              <div className="historico-section">
                <div className="historico-header">
                  <History size={18} />
                  <h3>Histórico de Validação</h3>
                </div>
                {carregandoHistorico ? (
                  <div className="historico-loading">
                    <p>Carregando histórico...</p>
                  </div>
                ) : historicoValidacao.length > 0 ? (
                  <div className="historico-list">
                    {historicoValidacao.map((item, index) => {
                      const statusAnteriorLabel = getStatusLabel(item.status_anterior);
                      const statusNovoLabel = getStatusLabel(item.status_novo);
                      const statusAnteriorObj = STATUS_VALIDACAO.find(s => s.valor === item.status_anterior);
                      const statusNovoObj = STATUS_VALIDACAO.find(s => s.valor === item.status_novo);
                      
                      return (
                        <div key={item.log_id || index} className="historico-item">
                          <div className="historico-item-header">
                            <span className="historico-data">{formatarDataBR(item.data_mudanca)}</span>
                            {item.usuario_nome && (
                              <span className="historico-usuario">
                                <UserIcon size={14} />
                                {item.usuario_nome}
                              </span>
                            )}
                          </div>
                          <div className="historico-mudanca">
                            {item.status_anterior !== null && (
                              <span 
                                className="historico-status-anterior"
                                style={{ color: statusAnteriorObj?.cor || '#666' }}
                              >
                                {statusAnteriorLabel}
                              </span>
                            )}
                            {item.status_anterior !== null && item.status_novo !== null && (
                              <span className="historico-arrow">→</span>
                            )}
                            {item.status_novo !== null && (
                              <span 
                                className="historico-status-novo"
                                style={{ color: statusNovoObj?.cor || '#666', fontWeight: '600' }}
                              >
                                {statusNovoLabel}
                              </span>
                            )}
                          </div>
                          {item.observacoes && (
                            <div className="historico-observacoes">
                              <strong>Observações:</strong> {item.observacoes}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="historico-empty">
                    <p>Nenhum histórico de validação encontrado.</p>
                  </div>
                )}
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

export default ModalValidacao;

