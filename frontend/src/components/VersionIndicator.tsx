import React, { useState, useEffect } from 'react';
import VERSION_INFO from '../version';
import './VersionIndicator.css';
import { Clipboard, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface VersionIndicatorProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

const VersionIndicator: React.FC<VersionIndicatorProps> = ({
  position = 'top-right',
  theme = 'auto',
  className = ''
}) => {
  const { isAuthenticated, expiresIn } = useAuth();
  const [expiresInSeconds, setExpiresInSeconds] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Calcular tempo restante em segundos baseado no expiresIn e quando o token foi criado
  useEffect(() => {
    if (!isAuthenticated || !expiresIn) {
      setExpiresInSeconds(null);
      return;
    }

    const calculateRemaining = () => {
      const tokenCreatedAt = localStorage.getItem('@pinovara:tokenCreatedAt');
      if (!tokenCreatedAt) {
        setExpiresInSeconds(expiresIn);
        return;
      }

      const now = Date.now();
      const createdAt = parseInt(tokenCreatedAt);
      const elapsed = Math.floor((now - createdAt) / 1000);
      const remaining = Math.max(0, expiresIn - elapsed);
      setExpiresInSeconds(remaining);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000); // Atualizar a cada segundo

    return () => clearInterval(interval);
  }, [isAuthenticated, expiresIn]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (showTooltip) setShowTooltip(false);
  };

  const handleMouseEnter = () => {
    if (!isExpanded) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Feedback visual opcional
    console.log('Copiado para clipboard:', text);
  };

  const getStatusColor = () => {
    if (!VERSION_INFO.generated) return '#f39c12'; // amber
    if (VERSION_INFO.branchName === 'main') return '#27ae60'; // green
    return '#3498db'; // blue
  };

  const formatSessionTime = (seconds: number | null): string => {
    if (seconds === null || seconds <= 0) return 'Expirada';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getSessionColor = (): string => {
    if (!expiresInSeconds || expiresInSeconds <= 0) return '#dc2626'; // Vermelho
    if (expiresInSeconds <= 300) return '#dc2626'; // Vermelho (< 5 min)
    if (expiresInSeconds <= 1800) return '#f59e0b'; // Amarelo (< 30 min)
    return '#056839'; // Verde
  };

  const getSessionStatus = (): string => {
    if (!expiresInSeconds || expiresInSeconds <= 0) return 'Expirada';
    if (expiresInSeconds <= 300) return 'Crítica';
    if (expiresInSeconds <= 1800) return 'Atenção';
    return 'Ativa';
  };

  return (
    <div 
      className={`version-indicator ${position} ${theme} ${className} ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Indicador compacto */}
      <div 
        className="version-compact"
        onClick={toggleExpanded}
        title={showTooltip ? (
          isAuthenticated && expiresInSeconds !== null 
            ? `Sessão: ${formatSessionTime(expiresInSeconds)} | v${VERSION_INFO.shortCommitHash}`
            : `v${VERSION_INFO.shortCommitHash} | ${VERSION_INFO.buildDate}`
        ) : ''}
      >
        <div 
          className="version-dot" 
          style={{ backgroundColor: isAuthenticated && expiresInSeconds !== null ? getSessionColor() : getStatusColor() }}
        />
        {/* Mostrar tempo da sessão quando autenticado, senão mostrar código da versão */}
        {isAuthenticated && expiresInSeconds !== null ? (
          <div 
            className="session-indicator-compact"
            style={{ 
              color: getSessionColor(),
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Clock size={12} />
            <span className="version-text" style={{ color: getSessionColor() }}>
              {formatSessionTime(expiresInSeconds)}
            </span>
          </div>
        ) : (
          <span className="version-text">
            {VERSION_INFO.shortCommitHash}
          </span>
        )}
      </div>

      {/* Tooltip quando hover */}
      {showTooltip && !isExpanded && (
        <div className="version-tooltip">
          {isAuthenticated && expiresInSeconds !== null ? (
            <>
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: getSessionColor(),
                fontWeight: '600',
                fontSize: '12px'
              }}>
                <Clock size={14} />
                <span>Sessão: <strong>{formatSessionTime(expiresInSeconds)}</strong></span>
              </div>
              <div style={{ 
                marginTop: '8px', 
                paddingTop: '8px', 
                borderTop: '1px solid rgba(255,255,255,0.2)',
                fontSize: '10px',
                opacity: 0.8
              }}>
                Versão: {VERSION_INFO.shortCommitHash}
              </div>
            </>
          ) : (
            <>
              <div>Versão: <strong>{VERSION_INFO.shortCommitHash}</strong></div>
              <div>Build: {VERSION_INFO.buildDate}</div>
            </>
          )}
          <div className="tooltip-hint">Clique para mais detalhes</div>
        </div>
      )}

      {/* Panel expandido */}
      {isExpanded && (
        <div className="version-panel">
          <div className="version-header">
            <h4>Informações da Versão</h4>
            <button 
              className="version-close" 
              onClick={toggleExpanded}
              title="Fechar"
            >
              ✕
            </button>
          </div>
          
          <div className="version-details">
            {/* Informações da Sessão - Destaque quando autenticado */}
            {isAuthenticated && expiresInSeconds !== null && (
              <>
                <div className="version-section-header">
                  <Clock size={14} style={{ marginRight: '6px' }} />
                  <strong>Informações da Sessão</strong>
                </div>
                <div className="version-item session-item" style={{ 
                  backgroundColor: expiresInSeconds <= 300 ? 'rgba(220, 38, 38, 0.1)' : 
                                  expiresInSeconds <= 1800 ? 'rgba(245, 158, 11, 0.1)' : 
                                  'rgba(5, 104, 57, 0.1)',
                  borderLeft: `3px solid ${getSessionColor()}`,
                  paddingLeft: '12px'
                }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {expiresInSeconds <= 300 && <AlertTriangle size={14} />}
                    Tempo Restante:
                  </label>
                  <span 
                    className="version-value session-time"
                    style={{ 
                      color: getSessionColor(),
                      fontWeight: '700',
                      fontSize: '14px'
                    }}
                  >
                    {formatSessionTime(expiresInSeconds)}
                  </span>
                </div>
                <div className="version-item session-item">
                  <label>Status:</label>
                  <span className="version-value" style={{ color: getSessionColor() }}>
                    <div 
                      className="status-indicator"
                      style={{ backgroundColor: getSessionColor() }}
                    />
                    {getSessionStatus()}
                  </span>
                </div>
                <div className="version-divider" />
              </>
            )}

            {/* Informações da Versão */}
            <div className="version-section-header">
              <strong>Informações da Versão</strong>
            </div>
            <div className="version-item">
              <label>Commit:</label>
              <span 
                className="version-value clickable"
                onClick={() => copyToClipboard(VERSION_INFO.commitHash)}
                title="Clique para copiar hash completo"
              >
                {VERSION_INFO.shortCommitHash}
              </span>
            </div>

            <div className="version-item">
              <label>Branch:</label>
              <span className="version-value">
                {VERSION_INFO.branchName}
              </span>
            </div>

            <div className="version-item">
              <label>Build:</label>
              <span className="version-value">
                {VERSION_INFO.buildDate}
              </span>
            </div>

            <div className="version-item">
              <label>Status:</label>
              <span className="version-value">
                <div 
                  className="status-indicator"
                  style={{ backgroundColor: getStatusColor() }}
                />
                {VERSION_INFO.generated ? 'Gerado' : 'Fallback'}
              </span>
            </div>
          </div>

          <div className="version-actions">
            <button
              className="version-btn"
              onClick={() => copyToClipboard(`${VERSION_INFO.shortCommitHash} | ${VERSION_INFO.buildDate}`)}
              title="Copiar informações resumidas"
            >
              <Clipboard size={14} style={{marginRight: '0.25rem'}} /> Copiar Info
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionIndicator;
