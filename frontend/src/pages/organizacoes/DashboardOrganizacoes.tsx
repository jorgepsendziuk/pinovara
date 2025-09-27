import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MapaOrganizacoes from '../../components/organizacoes/MapaOrganizacoes';
import Icon from '../../components/Icon';
import {
  Building,
  Clock,
  MapPin,
  Clock3,
  Eye,
  Plus,
  Map
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

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

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
          <p><Icon emoji="❌" size={16} /> {error}</p>
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
          <p style={{margin: '0.25rem 0 0 0', fontSize: '0.9rem'}}>Visão geral das organizações cadastradas</p>
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


        {/* Tabela de Organizações Recentes - DESTAQUE PRINCIPAL */}
        <div className="dashboard-card recentes-destaque">
          <h3><Clock3 size={18} style={{marginRight: '0.5rem'}} /> Organizações Recentes</h3>
          <div className="table-container">
            {stats?.organizacoesRecentes && stats.organizacoesRecentes.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Data da Visita</th>
                    <th>Estado</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.organizacoesRecentes.map((org) => (
                    <tr key={org.id}>
                      <td>
                        <div className="org-info">
                          <strong>{org.nome}</strong>
                          <small>ID: {org.id}</small>
                        </div>
                      </td>
                      <td>{new Date(org.dataVisita).toLocaleDateString('pt-BR')}</td>
                      <td>{org.estado}</td>
                      <td>
                        <div className="status-indicators">
                          {org.temGps && <span className="gps-indicator" title="Tem localização GPS"><MapPin size={14} /></span>}
                          <span className="status-badge status-pending">Pendente</span>
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => onNavigate('detalhes', org.id)}
                        >
                          <Eye size={14} style={{marginRight: '0.25rem'}} /> Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
