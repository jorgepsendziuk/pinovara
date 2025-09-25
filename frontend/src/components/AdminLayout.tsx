import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import VersionIndicator from './VersionIndicator';

function AdminLayout() {
  const { user, hasPermission } = useAuth();

  // Verificar se usuário está autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar se usuário tem permissão de admin
  if (!hasPermission('sistema', 'admin')) {
    return (
      <div className="admin-layout">
        <div className="container">
          <div className="access-denied">
            <h1>🚫 Acesso Negado</h1>
            <p>Você não tem permissão para acessar o módulo de administração.</p>
            <p>Requer permissão: <strong>admin</strong> no módulo <strong>sistema</strong></p>
            <a href="/pinovara" className="btn btn-primary">
              🏠 Voltar ao PINOVARA
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Indicador de versão discreto */}
      <VersionIndicator position="top-right" theme="auto" />
      
      <Sidebar />

      <div className="main-content">
        <main className="dashboard-main">
          <div className="container">
            {/* Admin content will be rendered here via Outlet */}
            <div className="admin-content-wrapper">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;