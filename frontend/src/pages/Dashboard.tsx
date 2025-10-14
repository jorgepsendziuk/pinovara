import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import VersionIndicator from '../components/VersionIndicator';
import TermosUso from '../components/TermosUso';

function Dashboard() {
  const { user, hasPermission, logout } = useAuth();
  const navigate = useNavigate();
  const [mostrarTermos, setMostrarTermos] = useState(false);

  useEffect(() => {
    // Verificar se usuário já aceitou os termos
    const termosAceitos = localStorage.getItem('termos_aceitos');
    const cookieTermos = document.cookie.split(';').find(c => c.trim().startsWith('termos_aceitos='));
    
    if (!termosAceitos && !cookieTermos) {
      setMostrarTermos(true);
    }
  }, []);

  const handleAcceptTermos = () => {
    // Salvar no localStorage
    localStorage.setItem('termos_aceitos', 'true');
    
    // Criar cookie com validade de 1 ano
    const dataExpiracao = new Date();
    dataExpiracao.setFullYear(dataExpiracao.getFullYear() + 1);
    document.cookie = `termos_aceitos=true; expires=${dataExpiracao.toUTCString()}; path=/; SameSite=Lax`;
    
    setMostrarTermos(false);
  };

  const handleDeclineTermos = () => {
    // Fazer logout e redirecionar para landing
    logout();
    navigate('/');
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="dashboard-layout">
      {/* Modal de Termos de Uso */}
      {mostrarTermos && (
        <TermosUso
          onAccept={handleAcceptTermos}
          onDecline={handleDeclineTermos}
        />
      )}

      {/* Indicador de versão discreto */}
      <VersionIndicator position="top-right" theme="auto" />
      
      <Sidebar />

      <div className="main-content">
        <main className="dashboard-main">
          <div className="container">
            <div className="page-header">
              <div className="header-content">
                <h2>Dashboard do Usuário</h2>
                <p>Gerencie suas informações e visualize seus dados</p>
              </div>
            </div>

            {/* Card de acesso rápido ao perfil */}
            <div className="quick-access-card">
              <div className="card-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className="card-content">
                <h3>Meu Perfil</h3>
                <p>Atualize suas informações pessoais, altere sua senha e gerencie suas preferências</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/perfil')}
                >
                  Acessar Perfil
                </button>
              </div>
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
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
