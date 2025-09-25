import React, { useState } from 'react';
import VERSION_INFO from '../version';
import './VersionIndicator.css';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

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
        title={showTooltip ? `v${VERSION_INFO.shortCommitHash} | ${VERSION_INFO.buildDate}` : ''}
      >
        <div 
          className="version-dot" 
          style={{ backgroundColor: getStatusColor() }}
        />
        <span className="version-text">
          {VERSION_INFO.shortCommitHash}
        </span>
      </div>

      {/* Tooltip quando hover */}
      {showTooltip && !isExpanded && (
        <div className="version-tooltip">
          <div>Versão: <strong>{VERSION_INFO.shortCommitHash}</strong></div>
          <div>Build: {VERSION_INFO.buildDate}</div>
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
              📋 Copiar Info
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionIndicator;
