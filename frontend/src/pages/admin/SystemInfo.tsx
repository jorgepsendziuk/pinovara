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

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

  const fetchSystemInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('@pinovara:token');
      
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
                color: 'white',
                padding: '1.25rem', 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{systemInfo.users.total}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>Total de Usuários</div>
              </div>
              
              <div style={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                color: 'white',
                padding: '1.25rem', 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{systemInfo.users.active}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>Usuários Ativos</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.25rem' }}>
                  {systemInfo.users.total > 0 
                    ? Math.round((systemInfo.users.active / systemInfo.users.total) * 100)
                    : 0
                  }% do total
                </div>
              </div>
              
              <div style={{ 
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', 
                color: 'white',
                padding: '1.25rem', 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{systemInfo.users.inactive}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>Usuários Inativos</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.25rem' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', 
                color: 'white',
                padding: '1.25rem', 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{systemInfo.system.modules}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>Módulos</div>
              </div>
              
              <div style={{ 
                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', 
                color: 'white',
                padding: '1.25rem', 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{systemInfo.system.roles}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>Papéis</div>
              </div>
              
              <div style={{ 
                background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', 
                color: 'white',
                padding: '1.25rem', 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{systemInfo.system.settings}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>Configurações</div>
              </div>
              
              <div style={{ 
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                color: 'white',
                padding: '1.25rem', 
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{systemInfo.system.auditLogs.toLocaleString()}</div>
                <div style={{ fontSize: '0.9rem', opacity: 0.95 }}>Logs de Auditoria</div>
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