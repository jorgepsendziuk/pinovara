/**
 * VersionChecker - Detecção automática de novas versões
 *
 * Verifica periodicamente se há uma nova versão em produção.
 * Só atua dentro do sistema (não na landing), para não forçar reload em visitantes.
 */
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import VERSION_INFO from '../version';

// Rotas do sistema (não landing) - só verificar versão nessas
const SYSTEM_ROUTES = ['/pinovara', '/perfil', '/organizacoes', '/qualificacoes', '/admin', '/formulario-enketo', '/supervisao'];

function isSystemRoute(pathname: string): boolean {
  return SYSTEM_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
}

// Intervalo de verificação: 5 minutos
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

const isProduction = import.meta.env.PROD;

export function VersionChecker() {
  const { pathname } = useLocation();
  const isCheckingRef = useRef(false);

  useEffect(() => {
    if (!isProduction || !isSystemRoute(pathname)) return;

    const checkVersion = async () => {
      if (isCheckingRef.current) return;
      isCheckingRef.current = true;

      try {
        // cache: 'no-store' garante que o fetch sempre busca do servidor
        const res = await fetch('/version.json', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' },
        });

        if (!res.ok) return;

        const data = await res.json();
        const serverVersion = data.shortCommitHash || data.commitHash || data.buildTimestamp;

        if (!serverVersion) return;

        // Versão do servidor diferente da bundlada = novo deploy, recarregar
        if (serverVersion !== VERSION_INFO.shortCommitHash) {
          console.info('[VersionChecker] Nova versão detectada, recarregando...', {
            atual: VERSION_INFO.shortCommitHash,
            nova: serverVersion,
          });
          window.location.reload();
        }
      } catch (err) {
        // Silencioso: falha de rede não deve impactar o app
      } finally {
        isCheckingRef.current = false;
      }
    };

    // Verificar após 30s (evitar verificação imediata após load)
    const initialTimeout = setTimeout(checkVersion, 30_000);

    const interval = setInterval(checkVersion, CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [pathname]);

  return null;
}
