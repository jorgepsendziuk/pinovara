import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import './SessionTimer.css';

interface SessionTimerProps {
  expiresIn: number; // Tempo de expiração em segundos
  onExpire?: () => void;
}

const SessionTimer: React.FC<SessionTimerProps> = ({ expiresIn, onExpire }) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(expiresIn);
  const [tokenCreatedAt, setTokenCreatedAt] = useState<number>(Date.now());

  useEffect(() => {
    // Recuperar timestamp de quando o token foi criado
    const stored = localStorage.getItem('@pinovara:tokenCreatedAt');
    if (stored) {
      setTokenCreatedAt(parseInt(stored));
    } else {
      // Se não existe, assumir que foi criado agora
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
      
      if (remaining === 0 && onExpire) {
        onExpire();
      }
    };

    // Calcular imediatamente
    calculateRemaining();

    // Atualizar a cada minuto
    const interval = setInterval(calculateRemaining, 60000);

    return () => clearInterval(interval);
  }, [expiresIn, tokenCreatedAt, onExpire]);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getColor = (): string => {
    const minutes = Math.floor(timeRemaining / 60);
    if (minutes < 5) return '#dc2626'; // Vermelho
    if (minutes < 30) return '#f59e0b'; // Amarelo
    return '#056839'; // Verde
  };

  const minutes = Math.floor(timeRemaining / 60);

  return (
    <div className="session-timer" style={{ color: getColor() }}>
      <Clock size={14} style={{ marginRight: '4px' }} />
      <span className="session-timer-text">
        {formatTime(timeRemaining)}
      </span>
    </div>
  );
};

export default SessionTimer;
