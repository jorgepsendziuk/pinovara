import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{
    api: 'checking' | 'connected' | 'error';
    database: 'checking' | 'connected' | 'error';
    apiUrl: string;
    databaseError?: string;
  }>({
    api: 'checking',
    database: 'checking',
    apiUrl: '',
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  // Health check on component mount
  useEffect(() => {
    checkSystemHealth();
  }, []);

  // Refresh status every second when there is an error
  useEffect(() => {
    const hasError = healthStatus.api === 'error' || healthStatus.database === 'error';
    if (!hasError) return;
    const interval = setInterval(checkSystemHealth, 1000);
    return () => clearInterval(interval);
  }, [healthStatus.api, healthStatus.database]);

  const checkSystemHealth = async () => {
    try {
      // Get API URL from axios instance
      const apiUrl = (api.defaults.baseURL || '').replace(/\/$/, ''); // Remove trailing slash

      // Check API connection
      await api.get('/');
      setHealthStatus(prev => ({ ...prev, api: 'connected', apiUrl }));

      // Check database connection via health endpoint
      const healthResponse = await api.get('/health');
      const dbUp = healthResponse.data.data?.services?.database === 'up';
      setHealthStatus(prev => ({
        ...prev,
        database: dbUp ? 'connected' : 'error',
        databaseError: dbUp ? undefined : (healthResponse.data.data?.databaseError || 'Conexão com o banco falhou')
      }));
    } catch (error) {
      console.error('Health check failed:', error);
      const apiUrl = (api.defaults.baseURL || '').replace(/\/$/, '');
      setHealthStatus({ api: 'error', database: 'error', apiUrl });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(formData);
      console.log('✅ Login bem-sucedido, navegando...');
      navigate('/pinovara');
    } catch (error: any) {
      console.error('🔴 Erro capturado no Login:', error);
      
      // Determinar tipo de erro e mensagem amigável
      let userFriendlyMessage = '';
      let technicalDetails = '';
      
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error') || error.message?.includes('conexão')) {
        userFriendlyMessage = '🔌 Servidor Offline ou em Manutenção\n\nNão foi possível conectar ao servidor.\n\nPossíveis causas:\n• Sistema em manutenção\n• Servidor temporariamente desligado\n• Problemas de conexão com a internet\n\nTente novamente em alguns instantes.';
        technicalDetails = `Erro de Rede:\n${error.message}\n\nURL: ${error.config?.url}\nCódigo: ${error.code}`;
      } else if (error.message?.includes('Credenciais inválidas') || error.message?.includes('Email ou senha')) {
        userFriendlyMessage = '🔐 Credenciais Incorretas\n\nEmail ou senha estão incorretos. Verifique e tente novamente.';
        technicalDetails = `Erro HTTP 401:\n${error.message}\n\nResposta do servidor: ${JSON.stringify(error.response?.data, null, 2)}`;
      } else if (error.message?.includes('inativo') || error.message?.includes('sem permissões')) {
        userFriendlyMessage = '🚫 Acesso Negado\n\nSua conta está inativa ou sem permissões. Entre em contato com o administrador.';
        technicalDetails = `Erro HTTP 403:\n${error.message}\n\nResposta: ${JSON.stringify(error.response?.data, null, 2)}`;
      } else if (error.response?.status === 500) {
        userFriendlyMessage = '⚠️ Erro no Servidor\n\nOcorreu um erro no servidor. Tente novamente em alguns instantes.';
        technicalDetails = `Erro HTTP 500:\n${error.message}\n\nURL: ${error.config?.url}\nResposta: ${JSON.stringify(error.response?.data, null, 2)}`;
      } else {
        userFriendlyMessage = `❌ Erro Desconhecido\n\n${error.message || 'Ocorreu um erro inesperado. Tente novamente.'}`;
        technicalDetails = `Erro:\n${error.message}\n\nStatus: ${error.response?.status}\nDetalhes: ${JSON.stringify(error.response?.data, null, 2) || error.toString()}`;
      }
      
      // Salvar detalhes técnicos
      setErrorDetails(technicalDetails);
      setError(userFriendlyMessage);
      
      // Mostrar popup do navegador
      const showDetails = confirm(`${userFriendlyMessage}\n\n⚙️ Clique OK para ver detalhes técnicos ou CANCELAR para fechar.`);
      
      if (showDetails) {
        alert(`📋 DETALHES TÉCNICOS\n\n${technicalDetails}\n\n💡 Copie essas informações se precisar reportar o problema.`);
      }
      
      console.log('⏸️ NÃO VAI NAVEGAR - ficando na página de login');
      
      // IMPORTANTE: NÃO navegar quando houver erro!
      return; // Garante que não vai executar o navigate acima
    } finally {
      console.log('🏁 Finally executado. Loading:', loading);
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Mensagem de erro fixa no topo */}
      {error && (
        <div className="login-error-toast">
          <span className="login-error-icon">⚠️</span>
          <div className="login-error-content">
            <strong className="login-error-title">Erro no login:</strong>
            <span className="login-error-text">{error}</span>
          </div>
          <button type="button" onClick={() => setError('')} className="login-error-close" title="Fechar" aria-label="Fechar">
            ×
          </button>
        </div>
      )}

      <div className="auth-container">
        <Link to="/" className="auth-back-link">
          ← Voltar ao Início
        </Link>
        <div className="auth-header">
          <div className="logo">
            <h1>PINOVARA</h1>
            <p>Entre na sua conta</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="seu@email.com"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Não tem uma conta?{' '}
            <Link to="/register" className="link">
              Criar conta
            </Link>
          </p>
        </div>


        <div className="health-check health-check-discrete health-check-compact">
          <div className="health-header health-header-discrete">
            <span className="health-title-discrete">Status do Sistema</span>
            <div className="health-indicators-compact">
              <span className={`status-dot ${healthStatus.api}`} title="API"></span>
              <span
                className={`status-dot ${healthStatus.database}`}
                title={healthStatus.database === 'error' && healthStatus.databaseError ? healthStatus.databaseError : 'Banco de Dados'}
              />
            </div>
            <span className="health-status-text">
              {healthStatus.api === 'checking' || healthStatus.database === 'checking'
                ? 'Verificando...'
                : healthStatus.api === 'error' || healthStatus.database === 'error'
                  ? 'Erro'
                  : 'Conectado'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;