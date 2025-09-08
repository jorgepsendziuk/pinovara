import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  showLoginButton?: boolean;
  showDashboardButton?: boolean;
  moduleName?: string;
  requiredRole?: string;
  contactAdmin?: boolean;
}

function AccessDenied({
  title = "Acesso Negado",
  message,
  showLoginButton = false,
  showDashboardButton = true,
  moduleName,
  requiredRole,
  contactAdmin = false
}: AccessDeniedProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Gerar mensagem baseada no contexto
  const getMessage = () => {
    if (message) return message;

    if (!isAuthenticated) {
      return "Você precisa estar logado para acessar esta página.";
    }

    if (moduleName && requiredRole) {
      return `Você não tem permissão para acessar o módulo "${moduleName}" como "${requiredRole}".`;
    }

    if (moduleName) {
      return `Você não tem permissão para acessar o módulo "${moduleName}".`;
    }

    return "Você não tem permissão para acessar esta página.";
  };

  const getSubtitle = () => {
    if (!isAuthenticated) {
      return "Faça login para continuar";
    }

    if (user) {
      return `Usuário: ${user.name} (${user.email})`;
    }

    return "Verifique suas permissões de acesso";
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToDashboard = () => {
    navigate('/pinovara');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="access-denied-page">
      <div className="access-denied-container">
        {/* Ícone de bloqueio */}
        <div className="access-denied-icon">
          <div className="lock-icon">
            🔒
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="access-denied-content">
          <h1 className="access-denied-title">{title}</h1>
          <p className="access-denied-message">{getMessage()}</p>
          <p className="access-denied-subtitle">{getSubtitle()}</p>

          {/* Informações de permissão se aplicável */}
          {moduleName && (
            <div className="access-denied-details">
              <div className="detail-item">
                <span className="detail-label">Módulo:</span>
                <span className="detail-value">{moduleName}</span>
              </div>
              {requiredRole && (
                <div className="detail-item">
                  <span className="detail-label">Permissão necessária:</span>
                  <span className="detail-value">{requiredRole}</span>
                </div>
              )}
              {user && (
                <div className="detail-item">
                  <span className="detail-label">Seu tipo de usuário:</span>
                  <span className="detail-value">
                    {user.roles?.[0]?.name || 'Não definido'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Ações disponíveis */}
        <div className="access-denied-actions">
          {showLoginButton && !isAuthenticated && (
            <button
              onClick={handleGoToLogin}
              className="btn btn-primary btn-large"
            >
              🔑 Fazer Login
            </button>
          )}

          {showDashboardButton && isAuthenticated && (
            <button
              onClick={handleGoToDashboard}
              className="btn btn-secondary btn-large"
            >
              🏠 Ir para Dashboard
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="btn btn-outline btn-large"
            >
              🚪 Fazer Logout
            </button>
          )}
        </div>

        {/* Contato com administrador */}
        {contactAdmin && (
          <div className="access-denied-contact">
            <p className="contact-message">
              Precisa de acesso? Entre em contato com o administrador do sistema.
            </p>
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-label">📧 Email:</span>
                <span className="contact-value">admin@pinovara.com</span>
              </div>
              <div className="contact-item">
                <span className="contact-label">📞 Telefone:</span>
                <span className="contact-value">(11) 99999-9999</span>
              </div>
            </div>
          </div>
        )}

        {/* Informações adicionais */}
        <div className="access-denied-footer">
          <p className="footer-text">
            Sistema PINOVARA - Controle de Acesso
          </p>
          <p className="footer-version">
            Versão 1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default AccessDenied;
