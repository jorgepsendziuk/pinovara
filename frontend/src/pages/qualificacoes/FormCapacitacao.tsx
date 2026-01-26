import { useState, useEffect } from 'react';
import { capacitacaoAPI } from '../../services/capacitacaoService';
import { qualificacaoAPI } from '../../services/qualificacaoService';
import { organizacaoAPI } from '../../services/api';
import { Capacitacao } from '../../types/capacitacao';
import { Qualificacao } from '../../types/qualificacao';
import { Organizacao } from '../../types/organizacao';
import Validacao from '../../components/capacitacoes/Validacao';
import api from '../../services/api';
import { ArrowLeft, Save, Loader2, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import '../../pages/organizacoes/OrganizacoesModule.css';
import '../../styles/tabs.css';

type AbaAtiva = 'informacoes' | 'validacao';

interface FormCapacitacaoProps {
  id?: number;
  onNavigate: (view: string, id?: number) => void;
}

function FormCapacitacao({ id, onNavigate }: FormCapacitacaoProps) {
  const { isCoordinator, isSupervisor } = useAuth();
  const [loading, setLoading] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('informacoes');
  const [qualificacoes, setQualificacoes] = useState<Qualificacao[]>([]);
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  const [organizacoesSelecionadas, setOrganizacoesSelecionadas] = useState<number[]>([]);
  const [validacaoUsuarioNome, setValidacaoUsuarioNome] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Capacitacao>>({
    id_qualificacao: 0,
    titulo: '',
    data_inicio: '',
    data_fim: '',
    local: '',
    turno: '',
    status: 'planejada'
  });

  useEffect(() => {
    // Bloquear acesso de coordenadores e supervisores à edição
    if (id && (isCoordinator() || isSupervisor())) {
      alert('Você não tem permissão para editar capacitações. Use as ações na lista para gerar relatórios.');
      onNavigate('capacitacoes');
      return;
    }
    
    carregarQualificacoes();
    carregarOrganizacoes();
    if (id) {
      carregarCapacitacao();
    }
  }, [id, isCoordinator, isSupervisor, onNavigate]);

  const carregarQualificacoes = async () => {
    try {
      const response = await qualificacaoAPI.list({ ativo: true, limit: 1000 });
      setQualificacoes(response.qualificacoes);
    } catch (error) {
      console.error('Erro ao carregar qualificações:', error);
    }
  };

  const carregarOrganizacoes = async () => {
    try {
      const response = await organizacaoAPI.list({ limit: 1000 });
      setOrganizacoes(response.organizacoes || []);
    } catch (error) {
      console.error('Erro ao carregar organizações:', error);
    }
  };

  const carregarCapacitacao = async () => {
    if (!id) return;
    
    try {
      setCarregandoDados(true);
      const capacitacao = await capacitacaoAPI.getById(id);
      setFormData({
        ...capacitacao,
        data_inicio: capacitacao.data_inicio ? new Date(capacitacao.data_inicio).toISOString().split('T')[0] : '',
        data_fim: capacitacao.data_fim ? new Date(capacitacao.data_fim).toISOString().split('T')[0] : ''
      });

      // Carregar organizações vinculadas
      if (capacitacao.organizacoes && capacitacao.organizacoes.length > 0) {
        setOrganizacoesSelecionadas(capacitacao.organizacoes);
      }

      // Carregar informações do usuário validador
      if (capacitacao.validacao_usuario) {
        try {
          const response = await api.get(`/admin/users/${capacitacao.validacao_usuario}`);
          if (response.data.success && response.data.data?.user) {
            setValidacaoUsuarioNome(response.data.data.user.name);
          }
        } catch (error) {
          console.error('Erro ao carregar usuário validador:', error);
        }
      } else {
        setValidacaoUsuarioNome(null);
      }
    } catch (error) {
      console.error('Erro ao carregar capacitação:', error);
      alert('Erro ao carregar capacitação');
    } finally {
      setCarregandoDados(false);
    }
  };

  const handleToggleOrganizacao = (organizacaoId: number) => {
    setOrganizacoesSelecionadas(prev => {
      if (prev.includes(organizacaoId)) {
        return prev.filter(id => id !== organizacaoId);
      } else {
        return [...prev, organizacaoId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id_qualificacao) {
      alert('Selecione uma qualificação');
      return;
    }

    if (organizacoesSelecionadas.length === 0) {
      alert('Selecione pelo menos uma organização');
      return;
    }
    
    try {
      setLoading(true);
      
      // Preparar dados com organizações e converter datas
      const dadosComOrganizacoes: any = {
        id_qualificacao: formData.id_qualificacao,
        titulo: formData.titulo || undefined,
        local: formData.local || undefined,
        turno: formData.turno || undefined,
        status: formData.status || 'planejada',
        organizacoes: organizacoesSelecionadas
      };

      // Converter datas de string para Date se existirem
      if (formData.data_inicio) {
        dadosComOrganizacoes.data_inicio = new Date(formData.data_inicio);
      }
      if (formData.data_fim) {
        dadosComOrganizacoes.data_fim = new Date(formData.data_fim);
      }

      if (id) {
        await capacitacaoAPI.update(id, dadosComOrganizacoes);
      } else {
        await capacitacaoAPI.create(dadosComOrganizacoes);
      }

      alert(id ? 'Capacitação atualizada com sucesso!' : 'Capacitação criada com sucesso!');
      onNavigate('capacitacoes');
    } catch (error: any) {
      console.error('Erro ao salvar capacitação:', error);
      alert(error.message || 'Erro ao salvar capacitação');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateValidacao = async (campo: string, valor: any): Promise<void> => {
    if (!id) return;

    try {
      const dados: any = {};
      
      if (campo === 'validacao_status') {
        dados.validacao_status = valor;
      } else if (campo === 'validacao_obs') {
        dados.validacao_obs = valor;
      } else if (campo === 'validacao_usuario') {
        dados.validacao_usuario = valor;
      } else if (campo === 'validacao_data') {
        // A data será definida no backend
        return;
      }

      const capacitacaoAtualizada = await capacitacaoAPI.updateValidacao(id, dados);
      
      // Atualizar formData com os novos dados
      setFormData({
        ...formData,
        validacao_status: capacitacaoAtualizada.validacao_status,
        validacao_usuario: capacitacaoAtualizada.validacao_usuario,
        validacao_data: capacitacaoAtualizada.validacao_data,
        validacao_obs: capacitacaoAtualizada.validacao_obs
      });

      // Se atualizou o usuário validador, recarregar o nome
      if (capacitacaoAtualizada.validacao_usuario && capacitacaoAtualizada.validacao_usuario !== formData.validacao_usuario) {
        try {
          const response = await api.get(`/admin/users/${capacitacaoAtualizada.validacao_usuario}`);
          if (response.data.success && response.data.data?.user) {
            setValidacaoUsuarioNome(response.data.data.user.name);
          }
        } catch (error) {
          console.error('Erro ao carregar usuário validador:', error);
        }
      }
    } catch (error: any) {
      console.error('Erro ao atualizar validação:', error);
      throw error;
    }
  };

  const getStatusBadgeColor = (status: number | null | undefined) => {
    switch (status) {
      case 2: return '#10b981'; // Verde - VALIDADO
      case 3: return '#f59e0b'; // Amarelo - PENDÊNCIA
      case 4: return '#ef4444'; // Vermelho - REPROVADO
      default: return '#9ca3af'; // Cinza - NÃO VALIDADO
    }
  };

  const getStatusIcon = (status: number | null | undefined) => {
    switch (status) {
      case 2: return CheckCircle;
      case 3: return AlertCircle;
      case 4: return XCircle;
      default: return Clock;
    }
  };

  if (carregandoDados && id) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Loader2 size={32} className="spinning" />
        <p>Carregando capacitação...</p>
      </div>
    );
  }

  return (
    <div className="qualificacoes-module">
      <div style={{ 
        padding: '24px 32px', 
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ 
            margin: '0 0 8px 0', 
            fontSize: '24px', 
            fontWeight: '600',
            color: '#3b2313',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {id ? 'Editar Capacitação' : 'Nova Capacitação'}
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
            {id ? 'Atualize as informações da capacitação' : 'Preencha os dados para criar uma nova capacitação'}
          </p>
        </div>
        <button
          onClick={() => onNavigate('capacitacoes')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'white',
            color: '#3b2313',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontWeight: '500',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
      </div>

      {/* Tabs Navigation */}
      {id && (
        <div className="tabs-navigation" style={{ margin: '24px 32px 0' }}>
          <button
            className={`tab-button ${abaAtiva === 'informacoes' ? 'active' : ''}`}
            onClick={() => setAbaAtiva('informacoes')}
            title="Informações da Capacitação"
          >
            <span>Informações</span>
          </button>
          {!isCoordinator() && (
            <button
              className={`tab-button ${abaAtiva === 'validacao' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('validacao')}
              title="Validação"
              style={{
                background: abaAtiva === 'validacao' 
                  ? '#056839'
                  : formData.validacao_status === 2
                    ? '#d4edda'
                    : formData.validacao_status === 3
                      ? '#fff3cd'
                      : formData.validacao_status === 4
                        ? '#f8d7da'
                        : '#f3f4f6',
                color: abaAtiva === 'validacao' 
                  ? 'white'
                  : formData.validacao_status === 2
                    ? '#155724'
                    : formData.validacao_status === 3
                      ? '#856404'
                      : formData.validacao_status === 4
                        ? '#721c24'
                        : '#6b7280'
              }}
            >
              {(() => {
                const StatusIcon = getStatusIcon(formData.validacao_status);
                return <StatusIcon size={16} />;
              })()}
              <span>Validação</span>
            </button>
          )}
        </div>
      )}

      {/* Tab Content */}
      <div className="tab-content" style={{ padding: '24px 32px' }}>
        {abaAtiva === 'informacoes' && (
          <div className="lista-content" style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
            <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3b2313' }}>
              Qualificação *
            </label>
            <select
              value={formData.id_qualificacao || ''}
              onChange={(e) => setFormData({ ...formData, id_qualificacao: parseInt(e.target.value) })}
              required
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Selecione uma qualificação</option>
              {qualificacoes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.titulo}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3b2313' }}>
              Organizações *
            </label>
            <div style={{ 
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '16px',
              maxHeight: '300px',
              overflowY: 'auto',
              backgroundColor: '#f8fafc'
            }}>
              {organizacoes.length === 0 ? (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                  Carregando organizações...
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {organizacoes.map((org) => (
                    <label
                      key={org.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '10px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        backgroundColor: organizacoesSelecionadas.includes(org.id!) ? '#f0fdf4' : '#fff',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = '#056839'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                    >
                      <input
                        type="checkbox"
                        checked={organizacoesSelecionadas.includes(org.id!)}
                        onChange={() => handleToggleOrganizacao(org.id!)}
                        style={{ marginRight: '10px', width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <span style={{ flex: 1, fontSize: '14px', color: '#334155' }}>
                        {org.nome || 'Sem nome'}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p style={{ marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
              {organizacoesSelecionadas.length} organização(ões) selecionada(s)
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3b2313' }}>
              Título
            </label>
            <input
              type="text"
              value={formData.titulo || ''}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Título da capacitação (opcional, usará o título da qualificação se não informado)"
              style={{ 
                width: '100%', 
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3b2313' }}>
                Data Início
              </label>
              <input
                type="date"
                value={formData.data_inicio || ''}
                onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3b2313' }}>
                Data Fim
              </label>
              <input
                type="date"
                value={formData.data_fim || ''}
                onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3b2313' }}>
                Local
              </label>
              <input
                type="text"
                value={formData.local || ''}
                onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                placeholder="Local da capacitação"
                style={{ 
                  width: '100%', 
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3b2313' }}>
                Turno
              </label>
              <input
                type="text"
                value={formData.turno || ''}
                onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                placeholder="Ex: Manhã, Tarde, Noite"
                style={{ 
                  width: '100%', 
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3b2313' }}>
              Status
            </label>
            <select
              value={formData.status || 'planejada'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              style={{ 
                width: '100%', 
                padding: '12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="planejada">Planejada</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => onNavigate('capacitacoes')}
              style={{
                padding: '12px 24px',
                background: 'white',
                color: '#3b2313',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px 24px',
                background: loading ? '#9ca3af' : '#056839',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="spinning" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {id ? 'Atualizar' : 'Criar'} Capacitação
                </>
              )}
            </button>
          </div>
        </form>
        </div>
        )}

        {abaAtiva === 'validacao' && id && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <Validacao
              capacitacaoId={id}
              validacaoStatus={formData.validacao_status || null}
              validacaoUsuario={formData.validacao_usuario || null}
              validacaoData={formData.validacao_data ? new Date(formData.validacao_data) : null}
              validacaoObs={formData.validacao_obs || null}
              validacaoUsuarioNome={validacaoUsuarioNome}
              onUpdate={handleUpdateValidacao}
              onUpdateAll={async (dados) => {
                if (!id) return;
                try {
                  const capacitacaoAtualizada = await capacitacaoAPI.updateValidacao(id, dados);
                  setFormData({
                    ...formData,
                    validacao_status: capacitacaoAtualizada.validacao_status,
                    validacao_usuario: capacitacaoAtualizada.validacao_usuario,
                    validacao_data: capacitacaoAtualizada.validacao_data,
                    validacao_obs: capacitacaoAtualizada.validacao_obs
                  });
                  if (capacitacaoAtualizada.validacao_usuario && capacitacaoAtualizada.validacao_usuario !== formData.validacao_usuario) {
                    try {
                      const response = await api.get(`/admin/users/${capacitacaoAtualizada.validacao_usuario}`);
                      if (response.data.success && response.data.data?.user) {
                        setValidacaoUsuarioNome(response.data.data.user.name);
                      }
                    } catch (error) {
                      console.error('Erro ao carregar usuário validador:', error);
                    }
                  }
                } catch (error: any) {
                  throw error;
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default FormCapacitacao;
