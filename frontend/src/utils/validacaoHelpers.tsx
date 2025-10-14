import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';

export const STATUS_VALIDACAO = {
  NAO_VALIDADO: 1,
  VALIDADO: 2,
  PENDENCIA: 3,
  REPROVADO: 4,
} as const;

export const getValidacaoConfig = (status: number | null) => {
  switch (status) {
    case STATUS_VALIDACAO.VALIDADO:
      return {
        label: 'VALIDADO',
        cor: '#10b981',
        corFundo: '#d1fae5',
        icon: CheckCircle,
      };
    case STATUS_VALIDACAO.PENDENCIA:
      return {
        label: 'PENDÊNCIA',
        cor: '#f59e0b',
        corFundo: '#fef3c7',
        icon: AlertCircle,
      };
    case STATUS_VALIDACAO.REPROVADO:
      return {
        label: 'REPROVADO',
        cor: '#ef4444',
        corFundo: '#fee2e2',
        icon: XCircle,
      };
    default: // NAO_VALIDADO ou null
      return {
        label: 'NÃO VALIDADO',
        cor: '#9ca3af',
        corFundo: '#f3f4f6',
        icon: Clock,
      };
  }
};

interface StatusBadgeProps {
  status: number | null;
  showLabel?: boolean;
  size?: 'small' | 'medium';
}

export const StatusValidacaoBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  showLabel = true,
  size = 'small'
}) => {
  const config = getValidacaoConfig(status);
  const Icon = config.icon;
  
  const sizeStyles = size === 'small' ? {
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    gap: '0.375rem',
  } : {
    padding: '0.375rem 0.75rem',
    fontSize: '0.85rem',
    gap: '0.5rem',
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        ...sizeStyles,
        background: config.corFundo,
        color: config.cor,
        borderRadius: '12px',
        fontWeight: '600',
        border: `1px solid ${config.cor}`,
      }}
      title={config.label}
    >
      <Icon size={size === 'small' ? 12 : 14} />
      {showLabel && <span>{config.label}</span>}
    </div>
  );
};

export default StatusValidacaoBadge;

