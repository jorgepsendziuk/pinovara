import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import './Toast.css';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  persistent?: boolean;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, persistent = true }) => {
  useEffect(() => {
    // Se não for persistente, fecha automaticamente após 5 segundos
    if (!persistent) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [persistent, onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        {type === 'success' ? (
          <CheckCircle size={24} />
        ) : (
          <XCircle size={24} />
        )}
      </div>
      <div className="toast-content">
        <div className="toast-title">
          {type === 'success' ? 'Sucesso!' : 'Erro'}
        </div>
        <div className="toast-message">{message}</div>
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Fechar">
        <X size={20} />
      </button>
    </div>
  );
};

export default Toast;

