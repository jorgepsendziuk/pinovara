import { useState, useEffect } from 'react';
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

function SystemInfo() {
  const { user } = useAuth();
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchSystemInfo();
  }, []);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <p>Carregando informações do sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Informações do Sistema</h1>
          <p>Detalhes técnicos e estatísticas do sistema PINOVARA</p>
        </div>
        
        <div className="header-actions">
          <button onClick={fetchSystemInfo} className="btn btn-primary">
            🔄 Atualizar Informações
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
        <div className="system-info-content">
          {/* Application Information */}
          <div className="info-section">
            <h2>Informações da Aplicação</h2>
            <div className="info-grid">
              <div className="info-card">
                <h3>PINOVARA System</h3>
                <div className="info-details">
                  <div className="info-item">
                    <label>Nome:</label>
                    <span>PINOVARA</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Versão:</label>
                    <span>1.0.0</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Descrição:</label>
                    <span>Sistema completo de gestão com módulos e permissões</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Ambiente:</label>
                    <span className={`env-badge ${import.meta.env.MODE}`}>
                      {import.meta.env.MODE.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Database Status */}
          <div className="info-section">
            <h2>Status do Banco de Dados</h2>
            <div className="info-grid">
              <div className="info-card">
                <div className="status-header">
                  <h3>Conexão</h3>
                  <span className={`status-indicator ${systemInfo.database.status === 'connected' ? 'connected' : 'disconnected'}`}>
                    {systemInfo.database.status === 'connected' ? '🟢 Conectado' : '🔴 Desconectado'}
                  </span>
                </div>
                
                <div className="info-details">
                  <div className="info-item">
                    <label>Status:</label>
                    <span>{systemInfo.database.status === 'connected' ? 'Online' : 'Offline'}</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Última Verificação:</label>
                    <span>{new Date(systemInfo.database.lastCheck).toLocaleString('pt-BR')}</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Tipo:</label>
                    <span>PostgreSQL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Statistics */}
          <div className="info-section">
            <h2>Estatísticas de Usuários</h2>
            <div className="stats-grid">
              <div className="stat-card large">
                <div className="stat-value">{systemInfo.users.total}</div>
                <div className="stat-label">Total de Usuários</div>
                <div className="stat-sublabel">Registrados no sistema</div>
              </div>
              
              <div className="stat-card success">
                <div className="stat-value">{systemInfo.users.active}</div>
                <div className="stat-label">Usuários Ativos</div>
                <div className="stat-percentage">
                  {systemInfo.users.total > 0 
                    ? Math.round((systemInfo.users.active / systemInfo.users.total) * 100)
                    : 0
                  }% do total
                </div>
              </div>
              
              <div className="stat-card warning">
                <div className="stat-value">{systemInfo.users.inactive}</div>
                <div className="stat-label">Usuários Inativos</div>
                <div className="stat-percentage">
                  {systemInfo.users.total > 0 
                    ? Math.round((systemInfo.users.inactive / systemInfo.users.total) * 100)
                    : 0
                  }% do total
                </div>
              </div>
            </div>
          </div>

          {/* System Components */}
          <div className="info-section">
            <h2>Componentes do Sistema</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{systemInfo.system.modules}</div>
                <div className="stat-label">Módulos</div>
                <div className="stat-sublabel">Módulos ativos do sistema</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{systemInfo.system.roles}</div>
                <div className="stat-label">Papéis</div>
                <div className="stat-sublabel">Papéis de acesso configurados</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{systemInfo.system.settings}</div>
                <div className="stat-label">Configurações</div>
                <div className="stat-sublabel">Parâmetros do sistema</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{systemInfo.system.auditLogs.toLocaleString()}</div>
                <div className="stat-label">Logs de Auditoria</div>
                <div className="stat-sublabel">Registros de atividades</div>
              </div>
            </div>
          </div>

          {/* Technical Information */}
          <div className="info-section">
            <h2>Informações Técnicas</h2>
            <div className="info-grid">
              <div className="info-card">
                <h3>Frontend</h3>
                <div className="info-details">
                  <div className="info-item">
                    <label>Framework:</label>
                    <span>React 18</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Linguagem:</label>
                    <span>TypeScript</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Build Tool:</label>
                    <span>Vite</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Roteamento:</label>
                    <span>React Router</span>
                  </div>
                </div>
              </div>
              
              <div className="info-card">
                <h3>Backend</h3>
                <div className="info-details">
                  <div className="info-item">
                    <label>Runtime:</label>
                    <span>Node.js</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Framework:</label>
                    <span>Express.js</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Linguagem:</label>
                    <span>TypeScript</span>
                  </div>
                  
                  <div className="info-item">
                    <label>ORM:</label>
                    <span>Prisma</span>
                  </div>
                </div>
              </div>
              
              <div className="info-card">
                <h3>Segurança</h3>
                <div className="info-details">
                  <div className="info-item">
                    <label>Autenticação:</label>
                    <span>JWT (JSON Web Tokens)</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Hash de Senha:</label>
                    <span>bcrypt</span>
                  </div>
                  
                  <div className="info-item">
                    <label>CORS:</label>
                    <span>Habilitado</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Auditoria:</label>
                    <span>Logs completos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Administrator Information */}
          <div className="info-section">
            <h2>Administrador Atual</h2>
            <div className="info-grid">
              <div className="info-card">
                <h3>Sessão Administrativa</h3>
                <div className="info-details">
                  <div className="info-item">
                    <label>Nome:</label>
                    <span>{user?.name}</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{user?.email}</span>
                  </div>
                  
                  <div className="info-item">
                    <label>ID:</label>
                    <span>{user?.id}</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Status:</label>
                    <span className="status-badge active">Ativo</span>
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

export default SystemInfo;