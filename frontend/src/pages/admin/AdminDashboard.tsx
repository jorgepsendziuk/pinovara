import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SystemInfo {
  users: {
    total: number;
    active: number;
    inactive: number;
  };
  system: {
    roles: number;
    modules: number;
    settings: number;
    auditLogs: number;
  };
  database: {
    status: string;
    lastCheck: string;
  };
}

interface RecentActivity {
  id: string;
  action: string;
  entity: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

interface QuickStat {
  title: string;
  value: number;
  change: number;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
}

function AdminDashboard() {
  const { user } = useAuth();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const fetchSystemInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/admin/system-info`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar informações do sistema');
      }

      const data = await response.json();
      setSystemInfo(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      setActivityLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_BASE}/admin/audit-logs?page=1&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar atividades recentes');
      }

      const data = await response.json();
      setRecentActivity(data.data.logs || []);
    } catch (err) {
      console.error('Erro ao carregar atividades recentes:', err);
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemInfo();
    fetchRecentActivity();
  }, []);

  const quickStats: QuickStat[] = systemInfo ? [
    {
      title: 'Total de Usuários',
      value: systemInfo.users.total,
      change: 12,
      changeType: 'positive',
      icon: '👥',
      color: 'blue'
    },
    {
      title: 'Usuários Ativos',
      value: systemInfo.users.active,
      change: 8,
      changeType: 'positive',
      icon: '✅',
      color: 'green'
    },
    {
      title: 'Módulos Ativos',
      value: systemInfo.system.modules,
      change: 0,
      changeType: 'neutral',
      icon: '📦',
      color: 'purple'
    },
    {
      title: 'Logs de Auditoria',
      value: systemInfo.system.auditLogs,
      change: 25,
      changeType: 'positive',
      icon: '📋',
      color: 'orange'
    }
  ] : [];

  const adminActions = [
    {
      title: 'Gerenciar Usuários',
      description: 'Criar, editar e controlar permissões de usuários',
      icon: '👥',
      path: '/admin/users',
      color: 'blue',
      stats: `${systemInfo?.users.active || 0} ativos`
    },
    {
      title: 'Configurações do Sistema',
      description: 'Ajustar parâmetros e configurações gerais',
      icon: '⚙️',
      path: '/admin/settings',
      color: 'green',
      stats: `${systemInfo?.system.settings || 0} configurações`
    },
    {
      title: 'Logs de Auditoria',
      description: 'Monitorar atividades e mudanças no sistema',
      icon: '🔍',
      path: '/admin/audit-logs',
      color: 'orange',
      stats: `${systemInfo?.system.auditLogs || 0} registros`
    },
    {
      title: 'Módulos e Papéis',
      description: 'Organizar módulos e definir permissões',
      icon: '🎭',
      path: '/admin/roles',
      color: 'purple',
      stats: `${systemInfo?.system.roles || 0} papéis`
    },
    {
      title: 'Backup e Restauração',
      description: 'Gerenciar backups do sistema e configurações',
      icon: '💾',
      path: '/admin/backup',
      color: 'green',
      stats: 'Sistema seguro'
    },
    {
      title: 'Monitor do Sistema',
      description: 'Monitoramento em tempo real de recursos',
      icon: '🔍',
      path: '/admin/monitor',
      color: 'orange',
      stats: 'Online'
    }
  ];

  const getActionBadgeClass = (action: string): string => {
    switch (action.toUpperCase()) {
      case 'CREATE': return 'badge badge-success';
      case 'UPDATE': return 'badge badge-warning';
      case 'DELETE': return 'badge badge-danger';
      case 'LOGIN': return 'badge badge-info';
      default: return 'badge badge-primary';
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Carregando dashboard administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🎛️ Dashboard Administrativo</h1>
          <p>Bem-vindo ao painel de controle do PINOVARA</p>
        </div>

        <div className="header-actions">
          <button onClick={() => { fetchSystemInfo(); fetchRecentActivity(); }} className="btn btn-primary">
            🔄 Atualizar Dados
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      {systemInfo && (
        <div className="dashboard-content">
          {/* Quick Stats */}
          <div className="quick-stats-section">
            <div className="stats-grid">
              {quickStats.map((stat, index) => (
                <div key={index} className="quick-stat-card">
                  <div className="stat-icon" style={{ background: `var(--${stat.color}-gradient)` }}>
                    <span>{stat.icon}</span>
                  </div>
                  <div className="stat-content">
                    <div className="stat-value">{stat.value.toLocaleString()}</div>
                    <div className="stat-title">{stat.title}</div>
                    <div className={`stat-change ${stat.changeType}`}>
                      {stat.change > 0 ? '+' : ''}{stat.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="system-status-section">
            <div className="status-card">
              <div className="status-header">
                <h2>💻 Status do Sistema</h2>
                <div className="status-indicators">
                  <span className={`status-indicator ${systemInfo.database.status === 'connected' ? 'connected' : 'disconnected'}`}>
                    {systemInfo.database.status === 'connected' ? '🟢 Online' : '🔴 Offline'}
                  </span>
                </div>
              </div>

              <div className="status-details">
                <div className="status-metric">
                  <label>🗄️ Banco de Dados:</label>
                  <span className={systemInfo.database.status === 'connected' ? 'success' : 'error'}>
                    {systemInfo.database.status === 'connected' ? 'Conectado' : 'Desconectado'}
                  </span>
                </div>

                <div className="status-metric">
                  <label>⏰ Última Verificação:</label>
                  <span>{new Date(systemInfo.database.lastCheck).toLocaleString('pt-BR')}</span>
                </div>

                <div className="status-metric">
                  <label>👨‍💼 Administrador Atual:</label>
                  <span>{user?.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="admin-actions-section">
            <h2>⚡ Ações Administrativas</h2>
            <div className="actions-grid">
              {adminActions.map((action, index) => (
                <Link key={index} to={action.path} className="action-card">
                  <div className="action-header">
                    <div className="action-icon" style={{ background: `var(--${action.color}-gradient)` }}>
                      <span>{action.icon}</span>
                    </div>
                    <div className="action-stats">{action.stats}</div>
                  </div>

                  <div className="action-content">
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                    <div className="action-link">
                      <span>Acessar</span>
                      <span>→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity-section">
            <div className="activity-header">
              <h2>📋 Atividades Recentes</h2>
              <Link to="/admin/audit-logs" className="view-all-link">
                Ver Todos →
              </Link>
            </div>

            {activityLoading ? (
              <div className="loading-state">
                <p>Carregando atividades...</p>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="empty-state">
                <h3>Nenhuma atividade recente</h3>
                <p>As atividades do sistema aparecerão aqui</p>
              </div>
            ) : (
              <div className="activity-list">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      <span className={getActionBadgeClass(activity.action)}>
                        {activity.action}
                      </span>
                    </div>

                    <div className="activity-content">
                      <div className="activity-primary">
                        <span className="activity-entity">{activity.entity}</span>
                        <span className="activity-time">
                          {new Date(activity.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>

                      {activity.user && (
                        <div className="activity-user">
                          por {activity.user.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Overview */}
          <div className="system-overview-section">
            <h2>📊 Visão Geral do Sistema</h2>

            <div className="overview-grid">
              <div className="overview-card">
                <h3>👥 Gestão de Usuários</h3>
                <div className="overview-stats">
                  <div className="stat">
                    <span className="stat-number">{systemInfo.users.total}</span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number active">{systemInfo.users.active}</span>
                    <span className="stat-label">Ativos</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number inactive">{systemInfo.users.inactive}</span>
                    <span className="stat-label">Inativos</span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h3>🎭 Permissões e Papéis</h3>
                <div className="overview-stats">
                  <div className="stat">
                    <span className="stat-number">{systemInfo.system.modules}</span>
                    <span className="stat-label">Módulos</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{systemInfo.system.roles}</span>
                    <span className="stat-label">Papéis</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">{systemInfo.system.settings}</span>
                    <span className="stat-label">Configurações</span>
                  </div>
                </div>
              </div>

              <div className="overview-card">
                <h3>🔍 Auditoria</h3>
                <div className="overview-stats">
                  <div className="stat">
                    <span className="stat-number">{systemInfo.system.auditLogs.toLocaleString()}</span>
                    <span className="stat-label">Logs Totais</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">24h</span>
                    <span className="stat-label">Últimas 24h</span>
                  </div>
                  <div className="stat">
                    <span className="stat-number">7d</span>
                    <span className="stat-label">Última Semana</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;