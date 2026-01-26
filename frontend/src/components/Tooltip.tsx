import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  backgroundColor?: string;
  delay?: number;
}

export default function Tooltip({ text, children, backgroundColor = '#3b2313', delay = 0 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Mostrar imediatamente se delay for 0, caso contrário usar o delay
    const showTooltip = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        
        // Calcular posição inicial baseada no container (estimativa)
        // Posicionar acima do elemento (assumindo altura aproximada de 50px)
        let top = rect.top - 50 - 8;
        let left = rect.left + (rect.width / 2) - 150; // Assumindo largura máxima de 300px
        
        // Ajustar se sair da tela à esquerda
        if (left < 10) {
          left = 10;
        }
        
        // Ajustar se sair da tela à direita
        if (left + 300 > window.innerWidth - 10) {
          left = window.innerWidth - 310;
        }
        
        // Se não couber acima, posicionar abaixo
        if (top < 10) {
          top = rect.bottom + 8;
        }
        
        setPosition({ top, left });
        setIsVisible(true);
        
        // Ajustar posição após renderização
        requestAnimationFrame(() => {
          if (tooltipRef.current && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            
            // Recalcular com dimensões reais
            let newTop = rect.top - tooltipRect.height - 8;
            let newLeft = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            
            // Ajustar se sair da tela
            if (newLeft < 10) {
              newLeft = 10;
            }
            if (newLeft + tooltipRect.width > window.innerWidth - 10) {
              newLeft = window.innerWidth - tooltipRect.width - 10;
            }
            if (newTop < 10) {
              newTop = rect.bottom + 8;
            }
            
            setPosition({ top: newTop, left: newLeft });
          }
        });
      }
    };
    
    if (delay === 0) {
      showTooltip();
    } else {
      timeoutRef.current = setTimeout(showTooltip, delay);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            left: `${position.left}px`,
            backgroundColor: backgroundColor,
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: 10000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            pointerEvents: 'none',
            maxWidth: '300px',
            whiteSpace: 'normal',
            textAlign: 'center',
            lineHeight: '1.5',
            minWidth: '120px'
          }}
        >
          {text}
          {/* Seta do tooltip */}
          <div
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: `6px solid ${backgroundColor}`
            }}
          />
        </div>
      )}
    </div>
  );
}
