import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, User as UserIcon, Calendar, History } from 'lucide-react';
import { qualificacaoAPI } from '../../services/qualificacaoService';
import api from '../../services/api';
import { formatarDataBR } from '../../utils/dateHelpers';
import '../organizacoes/ModalValidacao.css';

const STATUS_VALIDACAO = [
  { valor: 1, label: 'NÃO VALIDADO', cor: '#9ca3af', icon: Clock },
  { valor: 2, label: 'VALIDADO', cor: '#10b981', icon: CheckCircle },
  { valor: 3, label: 'PENDÊNCIA', cor: '#f59e0b', icon: AlertCircle },
  { valor: 4, label: 'REPROVADO', cor: '#ef4444', icon: XCircle },
];

interface DadosValidacao {
  validacao_status: number | null;
  validacao_obs: string | null;
  validacao_data: string | null;
  validacao_usuario: number | null;
  validacao_usuario_nome?: string | null;
}

interface HistoricoItem {
  log_id?: number;
  data_mudanca: string;
  usuario_nome?: string | null;
  status_anterior: number | null;
  status_novo: number | null;
  observacoes?: string | null;
}

interface ValidacaoQualificacaoReadOnlyProps {
  qualificacaoId: number;
}

const ValidacaoQualificacaoReadOnly: React.FC<ValidacaoQualificacaoReadOnlyProps> = ({ qualificacaoId }) => {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<DadosValidacao | null>(null);
  const [historicoValidacao, setHistoricoValidacao] = useState<HistoricoItem[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  useEffect(() => {
    carregarDados();
    carregarHistorico();
  }, [qualificacaoId]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const qualificacao = await qualificacaoAPI.getById(qualificacaoId);
      let nomeValidador: string | null = null;
      if (qualificacao.validacao_usuario) {
        try {
          const response = await api.get(`/admin/users/${qualificacao.validacao_usuario}`);
          if (response.data.success && response.data.data?.user) {
            nomeValidador = response.data.data.user.name;
          }
        } catch {
          // ignora
        }
      }
      setDados({
        validacao_status: qualificacao.validacao_status ?? null,
        validacao_obs: qualificacao.validacao_obs ?? null,
        validacao_data: qualificacao.validacao_data ?? null,
        validacao_usuario: qualificacao.validacao_usuario ?? null,
        validacao_usuario_nome: nomeValidador,
      });
    } catch (error) {
      console.error('Erro ao carregar dados da validação:', error);
      setDados(null);
    } finally {
      setLoading(false);
    }
  };

  const carregarHistorico = async () => {
    try {
      setCarregandoHistorico(true);
      const historico = await qualificacaoAPI.getHistoricoValidacao(qualificacaoId);
      setHistoricoValidacao(historico || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setHistoricoValidacao([]);
    } finally {
      setCarregandoHistorico(false);
    }
  };

  const getStatusLabel = (status: number | null): string => {
    if (status === null) return '-';
    const s = STATUS_VALIDACAO.find(x => x.valor === status);
    return s?.label ?? 'Desconhecido';
  };

  const statusAtual = STATUS_VALIDACAO.find(s => s.valor === (dados?.validacao_status ?? 1));
  const IconeStatus = statusAtual?.icon ?? Clock;

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
        Carregando dados da validação...
      </div>
    );
  }

  return (
    <div style={{ padding: '0 4px' }}>
      <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
        Acompanhe o status e o histórico da validação desta qualificação. A edição é feita por coordenadores na lista de qualificações.
      </p>

      {dados && (
        <div className="info-section">
          <h3>Status atual</h3>
          <div className="info-row">
            <span className="info-label">Status:</span>
            <span className="info-value" style={{ color: statusAtual?.cor }}>
              <IconeStatus size={16} style={{ marginRight: '6px' }} />
              {statusAtual?.label}
            </span>
          </div>
          {dados.validacao_data && (
            <div className="info-row">
              <span className="info-label">Data de validação:</span>
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
          {dados.validacao_obs && (
            <div className="info-row info-row-observacoes">
              <span className="info-label">Observações:</span>
              <span className="info-value info-value-observacoes" style={{ whiteSpace: 'pre-wrap' }}>{dados.validacao_obs}</span>
            </div>
          )}
        </div>
      )}

      <div className="historico-section">
        <div className="historico-header">
          <History size={18} />
          <h3>Histórico de validação</h3>
        </div>
        {carregandoHistorico ? (
          <div className="historico-loading">
            <p>Carregando histórico...</p>
          </div>
        ) : historicoValidacao.length > 0 ? (
          <div className="historico-list">
            {historicoValidacao.map((item, index) => {
              const statusAnteriorObj = STATUS_VALIDACAO.find(s => s.valor === item.status_anterior);
              const statusNovoObj = STATUS_VALIDACAO.find(s => s.valor === item.status_novo);
              return (
                <div key={item.log_id ?? index} className="historico-item">
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
                    {item.status_anterior != null && (
                      <span className="historico-status-anterior" style={{ color: statusAnteriorObj?.cor ?? '#666' }}>
                        {getStatusLabel(item.status_anterior)}
                      </span>
                    )}
                    {item.status_anterior != null && item.status_novo != null && (
                      <span className="historico-arrow">→</span>
                    )}
                    {item.status_novo != null && (
                      <span className="historico-status-novo" style={{ color: statusNovoObj?.cor ?? '#666', fontWeight: 600 }}>
                        {getStatusLabel(item.status_novo)}
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
    </div>
  );
};

export default ValidacaoQualificacaoReadOnly;
