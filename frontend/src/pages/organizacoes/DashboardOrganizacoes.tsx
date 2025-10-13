import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MapaOrganizacoes from '../../components/organizacoes/MapaOrganizacoes';
import { DataGrid, DataGridColumn } from '../../components/DataGrid';
import { PDFService, OrganizacaoData } from '../../services/pdfService';
import {
  Building,
  Clock,
  MapPin,
  Clock3,
  Eye,
  Plus,
  Map,
  XCircle,
  ChevronDown,
  Edit,
  Printer,
  Trash
} from 'lucide-react';

interface OrganizacaoStats {
  total: number;
  comGps: number;
  semGps: number;
  comQuestionario: number;
  semQuestionario: number;
  porEstado: Array<{
    estado: string;
    total: number;
  }>;
  organizacoesRecentes: Array<{
    id: number;
    nome: string;
    dataVisita: string;
    estado: string;
    temGps: boolean;
  }>;
  organizacoesComGps: Array<{
    id: number;
    nome: string;
    lat: number;
    lng: number;
    estado: string;
  }>;
}

interface DashboardOrganizacoesProps {
  onNavigate: (view: 'dashboard' | 'lista' | 'cadastro' | 'detalhes', organizacaoId?: number) => void;
}

function DashboardOrganizacoes({ onNavigate }: DashboardOrganizacoesProps) {
  const { } = useAuth();
  const [stats, setStats] = useState<OrganizacaoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedView, setExpandedView] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

  const gerarTermoAdesao = async (organizacaoId: number) => {
    try {
      // Buscar dados completos da organização
      const response = await fetch(`${API_BASE}/organizacoes/${organizacaoId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('@pinovara:token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar dados da organização');
      }

      const responseData = await response.json();
      const orgData = responseData.data || responseData;

      // Preparar dados para o PDF
      const dadosPDF: OrganizacaoData = {
        nome: orgData.nome || '',
        cnpj: orgData.cnpj || '',
        endereco: `${orgData.organizacao_end_logradouro || ''} ${orgData.organizacao_end_numero || ''}, ${orgData.organizacao_end_bairro || ''}, CEP: ${orgData.organizacao_end_cep || ''}`.trim(),
        representanteNome: orgData.representante_nome || '',
        representanteCPF: orgData.representante_cpf || '',
        representanteRG: orgData.representante_rg || '',
        representanteFuncao: orgData.representante_funcao || '',
        representanteEndereco: `${orgData.representante_end_logradouro || ''} ${orgData.representante_end_numero || ''}, ${orgData.representante_end_bairro || ''}, CEP: ${orgData.representante_end_cep || ''}`.trim()
      };

      // Gerar PDF
      await PDFService.gerarTermoAdesao(dadosPDF);
    } catch (error) {
      console.error('Erro ao gerar termo de adesão:', error);
      if (error instanceof Error) {
        alert(`Erro ao gerar termo de adesão: ${error.message}`);
      } else {
        alert('Erro ao gerar termo de adesão. Verifique se você está logado e tente novamente.');
      }
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('@pinovara:token');

      const response = await fetch(`${API_BASE}/organizacoes/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas');
      }

      const responseData = await response.json();
      setStats(responseData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  // Definição das colunas da DataGrid
  const columns: DataGridColumn<any>[] = [
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      width: '10%',
      sortable: true,
      align: 'center',
      render: (id: number) => (
        <span style={{ fontWeight: 'bold', color: '#666' }}>#{id}</span>
      ),
    },
    {
      key: 'nome',
      title: 'Nome',
      dataIndex: 'nome',
      width: '35%',
      sortable: true,
      render: (nome: string) => nome || '-',
    },
    {
      key: 'localizacao',
      title: 'Localização',
      dataIndex: 'localizacao',
      width: '25%',
      render: (localizacao: string) => localizacao || '-',
    },
    {
      key: 'dataVisita',
      title: 'Data da Visita',
      dataIndex: 'data_visita',
      width: '15%',
      render: (dataVisita: string) => dataVisita ? new Date(dataVisita).toLocaleDateString('pt-BR') : '-',
    },
    {
      key: 'actions',
      title: 'Ações',
      width: '15%',
      align: 'center',
      render: (_, record: any) => (
        <div className="action-buttons" style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
          <button
            onClick={() => onNavigate('detalhes', record.id)}
            className="btn-icon"
            title="Ver organização"
            style={{ padding: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#007bff' }}
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => onNavigate('edicao', record.id)}
            className="btn-icon"
            title="Editar organização"
            style={{ padding: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#007bff' }}
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => gerarTermoAdesao(record.id)}
            className="btn-icon"
            title="Imprimir Termo de Adesão"
            style={{
              padding: '0.25rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#28a745'
            }}
          >
            <Printer size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-content">
        <div className="content-header">
          <h2><Building size={20} style={{marginRight: '0.5rem'}} /> Dashboard - Organizações</h2>
          <p>Carregando estatísticas...</p>
        </div>
        <div className="loading-spinner"><Clock size={24} /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-content">
        <div className="content-header">
          <h2><Building size={20} style={{marginRight: '0.5rem'}} /> Dashboard - Organizações</h2>
          <p>Erro ao carregar dados</p>
        </div>
        <div className="error-message">
          <p><XCircle size={16} style={{marginRight: '0.5rem'}} /> {error}</p>
          <button onClick={fetchStats} className="btn btn-primary">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <div className="content-header">
        <div className="header-info">
          <h2><Building size={20} style={{marginRight: '0.5rem'}} /> Dashboard - Organizações</h2>
        </div>
      </div>

      <div className="dashboard-body">
        {/* Cards de Estatísticas - Indicadores Discretos */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><Building size={24} /></div>
            <div className="stat-content">
              <h3>Total de Organizações</h3>
              <p className="stat-number">{stats?.total || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon"><MapPin size={24} /></div>
            <div className="stat-content">
              <h3>Com Localização GPS</h3>
              <p className="stat-number">{stats?.comGps || 0}</p>
              <small className="stat-percentage">
                {stats?.total ? Math.round((stats.comGps / stats.total) * 100) : 0}% do total
              </small>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon"><Clock size={24} /></div>
            <div className="stat-content">
              <h3>Pendentes</h3>
              <p className="stat-number">{stats?.semQuestionario || 0}</p>
            </div>
          </div>
        </div>


        {/* Organizações Recentes - DESTAQUE PRINCIPAL */}
        <div className="dashboard-card recentes-destaque">
          <div className="card-header-with-actions">
            <h3><Clock3 size={18} style={{marginRight: '0.5rem'}} /> Organizações Recentes</h3>
            {stats?.organizacoesRecentes && stats.organizacoesRecentes.length > 3 && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setExpandedView(!expandedView)}
              >
                {expandedView ? 'Mostrar Menos' : 'Ver Todas'}
                <ChevronDown
                  size={14}
                  style={{
                    marginLeft: '0.25rem',
                    transform: expandedView ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}
                />
              </button>
            )}
          </div>

          {stats?.organizacoesRecentes && stats.organizacoesRecentes.length > 0 ? (
            expandedView ? (
              // DataGrid completo quando expandido
              <div className="organizacoes-datagrid-container">
                <DataGrid<any>
                  columns={columns}
                  dataSource={stats.organizacoesRecentes}
                  rowKey="id"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    showQuickJumper: false,
                  }}
                  emptyState={{
                    title: 'Nenhuma organização recente',
                    description: 'Não há organizações recentes para exibir.',
                    icon: '🏢',
                  }}
                  responsive={true}
                  size="small"
                  className="organizacoes-datagrid"
                />
              </div>
            ) : (
              // Tabela reduzida com as 3 últimas organizações
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '10%' }}>ID</th>
                      <th style={{ width: '35%' }}>Nome</th>
                      <th style={{ width: '25%' }}>Localização</th>
                      <th style={{ width: '15%' }}>Data da Visita</th>
                      <th style={{ width: '15%' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.organizacoesRecentes.slice(0, 3).map((org) => (
                      <tr key={org.id}>
                        <td>
                          <span style={{ fontWeight: 'bold', color: '#666' }}>#{org.id}</span>
                        </td>
                        <td>
                          <div className="org-info">
                            <strong>{org.nome}</strong>
                            {org.temGps && (
                              <span style={{ marginLeft: '8px', color: '#0f9d58' }} title="Tem localização GPS">
                                <MapPin size={14} style={{ verticalAlign: 'middle' }} />
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          {org.localizacao || '-'}
                        </td>
                        <td>{org.dataVisita ? new Date(org.dataVisita).toLocaleDateString('pt-BR') : '-'}</td>
                        <td>
                          <div className="action-buttons" style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                            <button
                              className="btn-icon"
                              onClick={() => onNavigate('detalhes', org.id)}
                              title="Ver organização"
                              style={{ padding: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#007bff' }}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => onNavigate('edicao', org.id)}
                              title="Editar organização"
                              style={{ padding: '0.25rem', border: 'none', background: 'transparent', cursor: 'pointer', color: '#007bff' }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="btn-icon"
                              onClick={() => gerarTermoAdesao(org.id)}
                              title="Imprimir Termo de Adesão"
                              style={{
                                padding: '0.25rem',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: '#28a745'
                              }}
                            >
                              <Printer size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="empty-state">
              <p>Nenhuma organização cadastrada ainda</p>
              <button
                className="btn btn-primary"
                onClick={() => onNavigate('cadastro')}
              >
                <Plus size={14} style={{marginRight: '0.25rem'}} /> Cadastrar Primeira
              </button>
            </div>
          )}
        </div>

        {/* Mapa das Localizações das Organizações */}
        {stats?.organizacoesComGps && stats.organizacoesComGps.length > 0 && (
          <div className="dashboard-card">
            <h3><Map size={18} style={{marginRight: '0.5rem'}} /> Mapa das Organizações</h3>
            <p style={{ marginBottom: '0.5rem', color: '#666', fontSize: '0.85rem' }}>
              {stats.organizacoesComGps.length} organizações com localização GPS
            </p>
            <MapaOrganizacoes
              organizacoes={stats.organizacoesComGps}
              onOrganizacaoClick={(id) => onNavigate('detalhes', id)}
            />
          </div>
        )}

      </div>
    </div>
  );
}

export default DashboardOrganizacoes;
