import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, Save, User as UserIcon, Calendar, X, History } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Toast from '../Toast';
import { capacitacaoAPI } from '../../services/capacitacaoService';
import api from '../../services/api';
import { formatarDataBR } from '../../utils/dateHelpers';
import '../organizacoes/ModalValidacao.css';

interface ModalValidacaoProps {
  capacitacaoId: number;
  capacitacaoNome: string;
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
  capacitacaoId,
  capacitacaoNome,
  onClose,
}) => {
  const { user, isCoordinator, hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [dados, setDados] = useState<DadosValidacao | null>(null);
  const [novoStatus, setNovoStatus] = useState<number>(1);
  const [novaObs, setNovaObs] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [historicoValidacao, setHistoricoValidacao] = useState<any[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  // Verificar se pode editar (admin ou coordenador)
  const podeEditar = hasPermission('sistema', 'admin') || isCoordinator();

  useEffect(() => {
    carregarDados();
    carregarHistorico();
  }, [capacitacaoId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const capacitacao = await capacitacaoAPI.getById(capacitacaoId);
      
      // Carregar nome do usuário validador se existir
      let nomeValidador = null;
      if (capacitacao.validacao_usuario) {
        try {
          const response = await api.get(`/admin/users/${capacitacao.validacao_usuario}`);
          if (response.data.success && response.data.data?.user) {
            nomeValidador = response.data.data.user.name;
          }
        } catch (error) {
          console.error('Erro ao carregar usuário validador:', error);
        }
      }
      
      const dadosValidacao: DadosValidacao = {
        validacao_status: capacitacao.validacao_status || null,
        validacao_obs: capacitacao.validacao_obs || null,
        validacao_data: capacitacao.validacao_data || null,
        validacao_usuario: capacitacao.validacao_usuario || null,
        validacao_usuario_nome: nomeValidador,
      };
      
      setDados(dadosValidacao);
      setNovoStatus(dadosValidacao.validacao_status || 1);
      setNovaObs(dadosValidacao.validacao_obs || '');
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setToast({ message: 'Erro ao carregar dados da validação', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    try {
      setSalvando(true);
      
      const atualizacoes = {
        validacao_status: novoStatus,
        validacao_obs: novaObs || null,
        validacao_usuario: user?.id || null,
      };

      await capacitacaoAPI.updateValidacao(capacitacaoId, atualizacoes);

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

  const carregarHistorico = async () => {
    try {
      setCarregandoHistorico(true);
      const historico = await capacitacaoAPI.getHistoricoValidacao(capacitacaoId);
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
                <h2>Validação da Capacitação</h2>
                <p className="modal-organizacao-nome">{capacitacaoNome}</p>
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
                    <span>Apenas coordenadores e administradores podem editar a validação.</span>
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
                  <label htmlFor="obs">Observações</label>
                  <textarea
                    id="obs"
                    value={novaObs}
                    onChange={(e) => setNovaObs(e.target.value)}
                    disabled={!podeEditar}
                    placeholder="Digite observações sobre a validação..."
                    rows={4}
                    style={{
                      opacity: podeEditar ? 1 : 0.6,
                      cursor: podeEditar ? 'text' : 'not-allowed',
                    }}
                  />
                </div>

                {/* Informações Atuais */}
                {dados && (
                  <div className="info-section">
                    <h3>Informações Atuais</h3>
                    <div className="info-row">
                      <span className="info-label">Status:</span>
                      <span className="info-value" style={{ color: statusAtual?.cor }}>
                        <IconeStatus size={16} style={{ marginRight: '6px' }} />
                        {statusAtual?.label}
                      </span>
                    </div>
                    {dados.validacao_data && (
                      <div className="info-row">
                        <span className="info-label">Data de Validação:</span>
                        <span className="info-value">
                          <Calendar size={16} style={{ marginRight: '6px' }} />
                          {new Date(dados.validacao_data).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}
                    {dados.validacao_usuario_nome && (
                      <div className="info-row">
                        <span className="info-label">Validado por:</span>
                        <span className="info-value">
                          <UserIcon size={16} style={{ marginRight: '6px' }} />
                          {dados.validacao_usuario_nome}
                        </span>
                      </div>
                    )}
                  </div>
                )}

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
                                <span className="historico-observacoes-label">Observações:</span> {item.observacoes}
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
              </>
            )}
          </div>

          {/* Rodapé */}
          <div className="modal-footer">
            <button
              onClick={onClose}
              className="btn btn-secondary"
              disabled={salvando}
            >
              Fechar
            </button>
            {podeEditar && (
              <button
                onClick={handleSalvar}
                className="btn btn-primary"
                disabled={salvando || loading}
              >
                {salvando ? (
                  <>
                    <span className="spinner" style={{ marginRight: '8px' }}></span>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={16} style={{ marginRight: '8px' }} />
                    Salvar Validação
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalValidacao;
