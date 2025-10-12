import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';

export const AvisoCookies: React.FC = () => {
  const [mostrar, setMostrar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se usuário já aceitou cookies
    const cookiesAceitos = localStorage.getItem('cookies_aceitos');
    if (!cookiesAceitos) {
      // Pequeno delay para não aparecer imediatamente
      setTimeout(() => setMostrar(true), 1000);
    }
  }, []);

  const handleAceitar = () => {
    // Salvar preferência
    localStorage.setItem('cookies_aceitos', 'true');
    
    // Criar cookie com validade de 1 ano
    const dataExpiracao = new Date();
    dataExpiracao.setFullYear(dataExpiracao.getFullYear() + 1);
    document.cookie = `cookies_aceitos=true; expires=${dataExpiracao.toUTCString()}; path=/; SameSite=Lax`;
    
    setMostrar(false);
  };

  const handleSaibaMais = () => {
    navigate('/politica-privacidade');
  };

  if (!mostrar) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'linear-gradient(135deg, #3b2313 0%, #056839 100%)',
      color: 'white',
      padding: '20px',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.3)',
      zIndex: 9999,
      animation: 'slideUp 0.4s ease-out'
    }}>
      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
        `}
      </style>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        {/* Ícone */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Cookie size={32} />
        </div>

        {/* Texto */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <p style={{
            margin: 0,
            fontSize: '15px',
            lineHeight: '1.6'
          }}>
            Este site usa cookies para melhorar sua experiência de navegação e garantir o 
            funcionamento adequado do sistema. Ao continuar navegando, você concorda com nossa 
            Política de Cookies e Privacidade.
          </p>
        </div>

        {/* Botões */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleSaibaMais}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            Saiba Mais
          </button>
          
          <button
            onClick={handleAceitar}
            style={{
              padding: '10px 24px',
              background: 'white',
              color: '#056839',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            }}
          >
            Aceitar Cookies
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvisoCookies;

