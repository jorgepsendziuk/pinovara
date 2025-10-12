import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import VersionIndicator from '../components/VersionIndicator';

function Dashboard() {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="dashboard-layout">
      {/* Indicador de versão discreto */}
      <VersionIndicator position="top-right" theme="auto" />
      
      <Sidebar />

      <div className="main-content">
        <main className="dashboard-main">
          <div className="container">
            <div className="welcome-section">
              <h2>Bem-vindo, {user.name}!</h2>
              <p>Este é o dashboard do sistema PINOVARA.</p>
            </div>

            <div className="user-details">
              <h3>Informações da Conta</h3>

              <div className="info-grid">
                <div className="info-item">
                  <label>ID do Usuário:</label>
                  <span>{user.id}</span>
                </div>

                <div className="info-item">
                  <label>Email:</label>
                  <span>{user.email}</span>
                </div>

                <div className="info-item">
                  <label>Nome:</label>
                  <span>{user.name}</span>
                </div>

                <div className="info-item">
                  <label>Status:</label>
                  <span className={`status ${user.active ? 'active' : 'inactive'}`}>
                    {user.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            </div>

            <div className="user-roles">
              <h3>Papéis e Módulos</h3>

              {user.roles && user.roles.length > 0 ? (
                <div className="roles-grid">
                  {user.roles.map((role: any) => (
                    <div key={role.id} className="role-card">
                      <div className="role-header">
                        <h4>{role.name}</h4>
                        <span className="module-badge">{role.module.name}</span>
                      </div>
                      <p>Módulo: {role.module.name}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-roles">
                  <p>Nenhum papel atribuído ainda.</p>
                </div>
              )}
            </div>

            <div className="dashboard-stats">
              <h3>Estatísticas</h3>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{user.roles ? user.roles.length : 0}</div>
                  <div className="stat-label">Papéis Atribuídos</div>
                </div>

                <div className="stat-card">
                  <div className="stat-value">
                    {user.roles ?
                      new Set(user.roles.map(role => role.module.id)).size : 0
                    }
                  </div>
                  <div className="stat-label">Módulos com Acesso</div>
                </div>

                <div className="stat-card">
                  <div className="stat-value">
                    {user.active ? 'Sim' : 'Não'}
                  </div>
                  <div className="stat-label">Conta Ativa</div>
                </div>
              </div>
            </div>

            {/* Admin Access */}
            {hasPermission('sistema', 'admin') && (
              <div className="admin-access">
                <h3>Administração</h3>
                <p>Você tem acesso ao painel administrativo do sistema.</p>
                <a href="/admin" className="btn btn-primary">
                  Acessar Painel Admin
                </a>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;