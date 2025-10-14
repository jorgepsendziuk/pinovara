import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MapaOrganizacoes from '../../components/organizacoes/MapaOrganizacoes';
import { DataGrid, DataGridColumn } from '../../components/DataGrid';
import { StatusValidacaoBadge } from '../../utils/validacaoHelpers';
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
  FileText,
  User,
  ChevronDown
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
    estado_nome?: string;
    municipio_nome?: string;
    localizacao?: string;
    tecnico_nome?: string;
    tecnico_email?: string;
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
  const { isCoordinator } = useAuth();
  const [stats, setStats] = useState<OrganizacaoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedView, setExpandedView] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  // Função para gerar relatório
  const gerarRelatorio = async (organizacaoId: number, nomeOrganizacao: string) => {
    try {
      const response = await fetch(`${API_BASE}/organizacoes/${organizacaoId}/relatorio/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('@pinovara:token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar relatório');
      }

      // Baixar PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_${nomeOrganizacao?.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('✅ Relatório gerado com sucesso!');
    } catch (error: any) {
      alert(`❌ Erro ao gerar relatório: ${error.message}`);
    }
  };

  // Definição das colunas da DataGrid
  const columns: DataGridColumn<any>[] = [
    {
      key: 'id',
      title: 'ID',
      dataIndex: 'id',
      width: '8%',
      sortable: true,
      defaultSortOrder: 'descend',
      align: 'center',
      render: (id: number) => (
        <span style={{ fontWeight: '600', color: '#666', fontSize: '13px' }}>{id}</span>
      ),
    },
    {
      key: 'nome',
      title: 'Nome',
      dataIndex: 'nome',
      width: '35%',
      sortable: true,
      render: (nome: string, record: any) => (
        <span style={{ fontWeight: '500' }}>{nome || '-'}</span>
      ),
    },
    {
      key: 'localizacao',
      title: 'Localização',
      dataIndex: 'localizacao',
      width: '20%',
      render: (localizacao: string, record: any) => {
        // Obter sigla do estado
        const estadoNome = record.estado_nome || record.estado || '';
        const siglasEstados: { [key: string]: string } = {
          'Bahia': 'BA', 'São Paulo': 'SP', 'Minas Gerais': 'MG', 'Espírito Santo': 'ES',
          'Rio de Janeiro': 'RJ', 'Paraná': 'PR', 'Santa Catarina': 'SC', 'Rio Grande do Sul': 'RS'
        };
        const estadoSigla = siglasEstados[estadoNome] || estadoNome;
        
        // Remover estado duplicado do município
        let municipio = record.municipio_nome || '';
        if (municipio && municipio.includes(' - ')) {
          const partes = municipio.split(' - ');
          municipio = partes[partes.length - 1];
        }
        
        // Se já tiver localizacao formatada no record, usar ela
        if (localizacao && localizacao !== '-') {
          return <span style={{ fontSize: '13px' }}>{localizacao}</span>;
        }
        
        return (
          <span style={{ fontSize: '13px' }}>
            {estadoSigla && municipio ? `${estadoSigla} - ${municipio}` : (estadoSigla || municipio || '-')}
          </span>
        );
      },
    },
    {
      key: 'tecnico',
      title: 'Técnico',
      dataIndex: 'tecnico_nome',
      width: '20%',
      render: (tecnico_nome: string | null, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          {tecnico_nome ? (
            <>
              <User size={14} color="#666" />
              <span style={{ color: '#444', fontWeight: '500' }} title={record.tecnico_email || undefined}>
                {tecnico_nome}
              </span>
            </>
          ) : (
            <span style={{ color: '#999', fontStyle: 'italic' }}>Sem técnico</span>
          )}
        </div>
      ),
    },
    {
      key: 'validacao',
      title: 'Validação',
      dataIndex: 'validacao_status',
      width: '10%',
      align: 'center',
      render: (validacao_status: number | null) => (
        <StatusValidacaoBadge status={validacao_status} showLabel={false} />
      ),
    },
    {
      key: 'actions',
      title: 'Ações',
      width: '17%',
      align: 'center',
      render: (_, record: any) => (
        <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            onClick={() => gerarRelatorio(record.id, record.nome)}
            className="btn-icon"
            title="Gerar Relatório"
            style={{
              padding: '0.4rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#28a745',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <FileText size={16} />
            <span style={{ fontSize: '12px', fontWeight: '500' }}>Ver Relatório</span>
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
        {/* Organizações Recentes - DESTAQUE PRINCIPAL */}
        <div className="dashboard-card recentes-destaque">
          <div className="card-header-with-actions">
            <h3>
              <Clock3 size={18} style={{marginRight: '0.5rem'}} /> 
              Organizações Recentemente Cadastradas
              {stats?.organizacoesRecentes && stats.organizacoesRecentes.length > 0 && (
                <span style={{ marginLeft: '0.5rem', fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>
                  ({stats.organizacoesRecentes.length} {stats.organizacoesRecentes.length === 1 ? 'cadastro' : 'cadastros'})
                </span>
              )}
            </h3>
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
                  dataSource={[...stats.organizacoesRecentes].sort((a, b) => b.id - a.id)}
                  rowKey="id"
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: stats.organizacoesRecentes.length,
                    showSizeChanger: true,
                    showQuickJumper: false,
                    onChange: (page: number, newPageSize: number) => {
                      setCurrentPage(page);
                      setPageSize(newPageSize);
                    }
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
              // Preview com as 3 últimas organizações
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '8%', textAlign: 'center' }}>ID</th>
                      <th style={{ width: '30%' }}>Nome</th>
                      <th style={{ width: '18%' }}>Localização</th>
                      <th style={{ width: '16%' }}>Técnico</th>
                      <th style={{ width: '11%', textAlign: 'center' }}>Validação</th>
                      <th style={{ width: '17%', textAlign: 'center' }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...stats.organizacoesRecentes].sort((a, b) => b.id - a.id).slice(0, 3).map((org) => (
                      <tr key={org.id}>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: '600', color: '#666', fontSize: '13px' }}>{org.id}</span>
                        </td>
                        <td>
                          <span style={{ fontWeight: '500' }}>{org.nome || '-'}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '13px' }}>{org.localizacao || '-'}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                            {org.tecnico_nome ? (
                              <>
                                <User size={14} color="#666" />
                                <span style={{ color: '#444', fontWeight: '500' }} title={org.tecnico_email || undefined}>
                                  {org.tecnico_nome}
                                </span>
                              </>
                            ) : (
                              <span style={{ color: '#999', fontStyle: 'italic' }}>Sem técnico</span>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <StatusValidacaoBadge status={org.validacao_status} showLabel={false} />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div className="action-buttons" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button
                              onClick={() => gerarRelatorio(org.id, org.nome)}
                              className="btn-icon"
                              title="Gerar Relatório"
                              style={{
                                padding: '0.4rem',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                color: '#28a745',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <FileText size={16} />
                              <span style={{ fontSize: '12px', fontWeight: '500' }}>Ver Relatório</span>
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
              onGerarRelatorio={gerarRelatorio}
            />
          </div>
        )}

      </div>
    </div>
  );
}

export default DashboardOrganizacoes;
