import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface OrganizacaoStats {
  total: number;
  comQuestionario: number;
  semQuestionario: number;
  porEstado: Array<{
    estado: string;
    total: number;
  }>;
  porTipo: Array<{
    tipo: string;
    total: number;
  }>;
  recentes: Array<{
    id: number;
    nome: string;
    dataVisita: string;
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

      const data = await response.json();
      setStats(data);
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
          <h2>🏢 Dashboard - Organizações</h2>
          <p>Carregando estatísticas...</p>
        </div>
        <div className="loading-spinner">⏳</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-content">
        <div className="content-header">
          <h2>🏢 Dashboard - Organizações</h2>
          <p>Erro ao carregar dados</p>
        </div>
        <div className="error-message">
          <p>❌ {error}</p>
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
          <h2>🏢 Dashboard - Organizações</h2>
          <p>Visão geral das organizações cadastradas no sistema</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => onNavigate('cadastro')}
          >
            ➕ Nova Organização
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => onNavigate('lista')}
          >
            📋 Ver Lista
          </button>
        </div>
      </div>

      <div className="dashboard-body">
        {/* Cards de Estatísticas - Compactos */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <div className="stat-content">
              <h3>Total</h3>
              <p className="stat-number">{stats?.total || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3>Com Questionário</h3>
              <p className="stat-number">{stats?.comQuestionario || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3>Pendentes</h3>
              <p className="stat-number">{stats?.semQuestionario || 0}</p>
            </div>
          </div>
        </div>

        {/* Tabela de Organizações Recentes - DESTAQUE PRINCIPAL */}
        <div className="dashboard-card recentes-destaque">
          <h3>🕒 Organizações Recentes</h3>
          <div className="table-container">
            {stats?.recentes && stats.recentes.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Data da Visita</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentes.map((org) => (
                    <tr key={org.id}>
                      <td>
                        <div className="org-info">
                          <strong>{org.nome}</strong>
                          <small>ID: {org.id}</small>
                        </div>
                      </td>
                      <td>{new Date(org.dataVisita).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <span className="status-badge status-pending">Pendente</span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => onNavigate('detalhes', org.id)}
                        >
                          👁️ Ver
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
                  ➕ Cadastrar Primeira
                </button>
              </div>
            )}
          </div>
        </div>


        {/* Ações Rápidas */}
        <div className="quick-actions">
          <h3>⚡ Ações Rápidas</h3>
          <div className="actions-grid">
            <button 
              className="action-btn"
              onClick={() => onNavigate('cadastro')}
            >
              <span className="action-icon">➕</span>
              <span>Nova Organização</span>
            </button>
            <button 
              className="action-btn"
              onClick={() => onNavigate('lista')}
            >
              <span className="action-icon">📋</span>
              <span>Ver Lista</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📊</span>
              <span>Relatórios</span>
            </button>
            <button className="action-btn">
              <span className="action-icon">📤</span>
              <span>Exportar Dados</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardOrganizacoes;
