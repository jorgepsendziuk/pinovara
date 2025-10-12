import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// ID do Google Analytics - Substituir pelo seu ID real
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

// Declarar tipos do gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const GoogleAnalytics: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Verificar se GA está habilitado
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === '') {
      console.log('Google Analytics não configurado (VITE_GA_MEASUREMENT_ID não definido)');
      return;
    }

    // Carregar script do Google Analytics
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Inicializar dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: location.pathname + location.search,
      send_page_view: true,
    });

    console.log('Google Analytics inicializado:', GA_MEASUREMENT_ID);

    return () => {
      // Cleanup se necessário
    };
  }, []);

  // Rastrear mudanças de página
  useEffect(() => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_path: location.pathname + location.search,
      page_title: document.title,
    });
  }, [location]);

  return null; // Componente não renderiza nada
};

// Hook personalizado para eventos customizados
export const useAnalytics = () => {
  const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
    if (!GA_MEASUREMENT_ID || !window.gtag) {
      console.log('Analytics event (não enviado):', eventName, eventParams);
      return;
    }

    window.gtag('event', eventName, eventParams);
    console.log('Analytics event:', eventName, eventParams);
  };

  const trackPageView = (path: string, title?: string) => {
    if (!GA_MEASUREMENT_ID || !window.gtag) return;

    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title || document.title,
    });
  };

  return { trackEvent, trackPageView };
};

export default GoogleAnalytics;

