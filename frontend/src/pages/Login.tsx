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
  const [healthStatus, setHealthStatus] = useState<{
    api: 'checking' | 'connected' | 'error';
    database: 'checking' | 'connected' | 'error';
  }>({
    api: 'checking',
    database: 'checking',
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  // Health check on component mount
  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      // Check API connection
      const response = await api.get('/');
      setHealthStatus(prev => ({ ...prev, api: 'connected' }));
      
      // Check database connection via health endpoint
      const healthResponse = await api.get('/health');
      setHealthStatus(prev => ({ 
        ...prev, 
        database: healthResponse.data.database === 'connected' ? 'connected' : 'error'
      }));
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus({ api: 'error', database: 'error' });
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
      navigate('/pinovara');
    } catch (error: any) {
      setError(error.message || 'Erro desconhecido no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="back-link">
            ← Voltar ao início
          </Link>
          
          <div className="logo">
            <h1>PINOVARA</h1>
            <p>Entre na sua conta</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

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

        <div className="demo-credentials">
          <h4>Credenciais de Demonstração:</h4>
          <p>
            <strong>Email:</strong> demo@pinovara.com<br />
            <strong>Senha:</strong> Demo123
          </p>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
            Ou use: test@example.com / password123
          </p>
        </div>

        <div className="health-check">
          <h4>Status do Sistema:</h4>
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
      </div>
    </div>
  );
}

export default Login;