import { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import './SessionExpiryAlert.css';

interface SessionExpiryAlertProps {
  expiresIn: number; // Tempo de expiração em segundos
  onRefresh: () => Promise<void>;
  onExpire: () => void;
}

const SessionExpiryAlert: React.FC<SessionExpiryAlertProps> = ({ 
  expiresIn, 
  onRefresh, 
  onExpire 
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(expiresIn);
  const [tokenCreatedAt, setTokenCreatedAt] = useState<number>(Date.now());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('@pinovara:tokenCreatedAt');
    if (stored) {
      setTokenCreatedAt(parseInt(stored));
    } else {
      const now = Date.now();
      setTokenCreatedAt(now);
      localStorage.setItem('@pinovara:tokenCreatedAt', now.toString());
    }
  }, []);

  useEffect(() => {
    const calculateRemaining = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - tokenCreatedAt) / 1000);
      const remaining = Math.max(0, expiresIn - elapsed);
      
      setTimeRemaining(remaining);
      
      const minutes = Math.floor(remaining / 60);
      
      // Mostrar aviso quando faltar 5 minutos
      if (minutes <= 5 && minutes > 0 && !showExpired) {
        setShowWarning(true);
      }
      
      // Mostrar modal de expirado quando chegar a 0
      if (remaining === 0) {
        setShowWarning(false);
        setShowExpired(true);
        onExpire();
      }
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000); // Verificar a cada segundo

    return () => clearInterval(interval);
  }, [expiresIn, tokenCreatedAt, showExpired, onExpire]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await onRefresh();
      setShowWarning(false);
      // Atualizar timestamp
      const now = Date.now();
      setTokenCreatedAt(now);
      localStorage.setItem('@pinovara:tokenCreatedAt', now.toString());
    } catch (error) {
      console.error('Erro ao renovar sessão:', error);
      alert('Erro ao renovar sessão. Por favor, faça login novamente.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Modal de Aviso (5 minutos restantes) */}
      {showWarning && !showExpired && (
        <div className="session-alert-overlay">
          <div className="session-alert-modal warning">
            <div className="session-alert-header">
              <AlertTriangle size={24} color="#f59e0b" />
              <h3>Atenção: Sessão Expirando</h3>
              <button 
                className="session-alert-close"
                onClick={() => setShowWarning(false)}
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>
            <div className="session-alert-body">
              <p>
                Sua sessão expirará em <strong>{formatTime(timeRemaining)}</strong>.
              </p>
              <p>
                Para evitar perder seu trabalho, renove sua sessão agora.
              </p>
            </div>
            <div className="session-alert-actions">
              <button
                className="session-alert-btn primary"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <>
                    <RefreshCw size={16} className="spinning" />
                    Renovando...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Renovar Sessão
                  </>
                )}
              </button>
              <button
                className="session-alert-btn secondary"
                onClick={() => setShowWarning(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Sessão Expirada */}
      {showExpired && (
        <div className="session-alert-overlay">
          <div className="session-alert-modal expired">
            <div className="session-alert-header">
              <AlertTriangle size={24} color="#dc2626" />
              <h3>Sessão Expirada</h3>
            </div>
            <div className="session-alert-body">
              <p>
                Sua sessão expirou por segurança. Por favor, faça login novamente.
              </p>
            </div>
            <div className="session-alert-actions">
              <button
                className="session-alert-btn primary"
                onClick={() => {
                  window.location.href = '/login';
                }}
              >
                Ir para Login
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionExpiryAlert;
