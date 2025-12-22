import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Maximize2 } from 'lucide-react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  level?: 'L' | 'M' | 'Q' | 'H';
}

function QRCodeDisplay({ value, size = 256, level = 'M' }: QRCodeDisplayProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleClick = () => {
    setIsFullscreen(true);
  };

  const handleClose = () => {
    setIsFullscreen(false);
  };

  return (
    <>
      <div 
        style={{ 
          display: 'inline-block', 
          padding: '20px', 
          backgroundColor: 'white', 
          borderRadius: '8px',
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onClick={handleClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <QRCodeSVG
          value={value}
          size={size}
          level={level}
          bgColor="#ffffff"
          fgColor="#000000"
        />
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: 'rgba(0,0,0,0.6)',
          borderRadius: '4px',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Maximize2 size={16} color="white" />
        </div>
      </div>

      {isFullscreen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer'
          }}
          onClick={handleClose}
        >
          <div
            style={{
              position: 'relative',
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f0f0f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <X size={24} color="#333" />
            </button>
            <QRCodeSVG
              value={value}
              size={Math.min(window.innerWidth * 0.7, window.innerHeight * 0.7, 600)}
              level={level}
              bgColor="#ffffff"
              fgColor="#000000"
            />
            <p style={{ margin: 0, color: '#666', fontSize: '14px', textAlign: 'center', maxWidth: '500px' }}>
              {value}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default QRCodeDisplay;

