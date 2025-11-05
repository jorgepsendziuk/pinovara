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
  }>({
    api: 'checking',
    database: 'checking',
    apiUrl: '',
  });

  const [isHealthExpanded, setIsHealthExpanded] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Health check on component mount
  useEffect(() => {
    checkSystemHealth();
  }, []);

  // Debug: Monitorar mudanças no estado error
  useEffect(() => {
    console.log('🔍 Estado "error" mudou para:', error);
  }, [error]);

  const checkSystemHealth = async () => {
    try {
      // Get API URL from axios instance
      const apiUrl = (api.defaults.baseURL || '').replace(/\/$/, ''); // Remove trailing slash

      // Check API connection
      await api.get('/');
      setHealthStatus(prev => ({ ...prev, api: 'connected', apiUrl }));

      // Check database connection via health endpoint
      const healthResponse = await api.get('/health');
      setHealthStatus(prev => ({
        ...prev,
        database: healthResponse.data.data?.services?.database === 'up' ? 'connected' : 'error'
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
      navigate('/organizacoes/lista');
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

  // Debug: Log na renderização
  console.log('🎨 Renderizando Login. Estado error:', error, 'length:', error?.length);

  return (
    <div className="auth-page">
      {/* Mensagem de erro fixa no topo */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          padding: '1rem 1.5rem',
          backgroundColor: '#fee2e2',
          border: '2px solid #dc2626',
          borderRadius: '8px',
          color: '#dc2626',
          fontSize: '0.95rem',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          boxShadow: '0 4px 16px rgba(220, 38, 38, 0.25)',
          minWidth: '400px',
          maxWidth: '600px',
          animation: 'slideDown 0.3s ease-out'
        }}>
          <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '1rem' }}>Erro no login:</strong>
            <span style={{ fontSize: '0.9rem' }}>{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0',
              lineHeight: 1
            }}
            title="Fechar"
          >
            ×
          </button>
        </div>
      )}

      <div className="auth-container">
        <div className="auth-header">
          <Link 
            to="/" 
            className="btn btn-outline btn-sm"
            style={{
              position: 'absolute',
              top: '-60px',
              left: '0',
              background: 'white',
              border: '2px solid var(--primary-color)',
              color: 'var(--primary-color)'
            }}
          >
            ← Voltar ao Início
          </Link>
          
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


        <div className="health-check">
          <div
            className="health-header"
            onClick={() => setIsHealthExpanded(!isHealthExpanded)}
          >
            <h4>Status do Sistema:</h4>
            <div className="health-indicators-compact">
              <span className={`status-dot ${healthStatus.api}`} title="API"></span>
              <span className={`status-dot ${healthStatus.database}`} title="Banco de Dados"></span>
            </div>
            <span className={`accordion-arrow ${isHealthExpanded ? 'expanded' : ''}`}>
              ▼
            </span>
          </div>

          {isHealthExpanded && (
            <div className="health-details">
              <div className="health-status">
                <div className="health-item">
                  <span className="health-label">API:</span>
                  <span className={`health-indicator ${healthStatus.api}`}>
                    {healthStatus.api === 'checking' && '⏳ Verificando...'}
                    {healthStatus.api === 'connected' && '✅ Conectado'}
                    {healthStatus.api === 'error' && '❌ Erro'}
                  </span>
                </div>
                <div className="health-item">
                  <span className="health-label">Banco de Dados:</span>
                  <span className={`health-indicator ${healthStatus.database}`}>
                    {healthStatus.database === 'checking' && '⏳ Verificando...'}
                    {healthStatus.database === 'connected' && '✅ Conectado'}
                    {healthStatus.database === 'error' && '❌ Erro'}
                  </span>
                </div>
                {healthStatus.apiUrl && (
                  <div className="health-item">
                    <span className="health-label">URL da API:</span>
                    <span className="health-indicator api-url">
                      🔗 {healthStatus.apiUrl}
                    </span>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={checkSystemHealth}
                className="btn btn-outline btn-small health-refresh"
                disabled={healthStatus.api === 'checking'}
              >
                🔄 Verificar Novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;