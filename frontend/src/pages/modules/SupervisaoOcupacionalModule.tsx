import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import VersionIndicator from '../../components/VersionIndicator';
import DashboardSupervisao from '../supervisao-ocupacional/DashboardSupervisao';
import ListaGlebas from '../supervisao-ocupacional/ListaGlebas';
import ListaFamilias from '../supervisao-ocupacional/ListaFamilias';
import MapaCadastros from '../supervisao-ocupacional/MapaCadastros';
import EdicaoGleba from '../supervisao-ocupacional/EdicaoGleba';
import DetalhesFamilia from '../supervisao-ocupacional/DetalhesFamilia';
import EdicaoFamilia from '../supervisao-ocupacional/EdicaoFamilia';
import '../supervisao-ocupacional/SupervisaoOcupacionalModule.css';
// Ocultado temporariamente
// import SyncODKFamilias from '../supervisao-ocupacional/SyncODKFamilias';

type ViewType = 'dashboard' | 'glebas' | 'familias' | 'mapa' | 'edicao-gleba' | 'detalhes-familia' | 'edicao-familia'; // | 'sync' - ocultado temporariamente

function SupervisaoOcupacionalModule() {
  const location = useLocation();
  const navigate = useNavigate();
  const [viewAtiva, setViewAtiva] = useState<ViewType>('dashboard');
  const [lastPath, setLastPath] = useState<string>('');

  // Determinar view baseada na URL
  useEffect(() => {
    const path = location.pathname;
    
    // Evitar processamento duplicado
    if (path === lastPath) {
      return;
    }
    
    setLastPath(path);
    
    // Verificar rotas específicas primeiro (mais específicas primeiro)
    if (path.includes('/glebas/edicao/')) {
      setViewAtiva('edicao-gleba');
    } else if (path.match(/\/familias\/\d+\/editar$/)) {
      setViewAtiva('edicao-familia');
    } else if (path.match(/\/familias\/\d+$/)) {
      setViewAtiva('detalhes-familia');
    } else if (path.match(/\/glebas\/\d+$/)) {
      // Se for um ID numérico sem /edicao/, redirecionar para edição
      const match = path.match(/\/glebas\/(\d+)$/);
      if (match) {
        navigate(`/supervisao-ocupacional/glebas/edicao/${match[1]}`, { replace: true });
        return;
      }
    } else if (path.includes('/dashboard')) {
      setViewAtiva('dashboard');
    } else if (path.includes('/mapa')) {
      setViewAtiva('mapa');
    } else if (path.includes('/glebas')) {
      setViewAtiva('glebas');
    } else if (path.includes('/familias')) {
      setViewAtiva('familias');
    // Ocultado temporariamente
    // } else if (path.includes('/sync')) {
    //   setViewAtiva('sync');
    } else if (path === '/supervisao-ocupacional' || path === '/supervisao-ocupacional/') {
      // Redirecionar para dashboard se não houver view específica
      navigate('/supervisao-ocupacional/dashboard', { replace: true });
    }
  }, [location.pathname, navigate, lastPath]);

  const renderView = () => {
    switch (viewAtiva) {
      case 'dashboard':
        return <DashboardSupervisao />;
      case 'glebas':
        return <ListaGlebas />;
      case 'familias':
        return <ListaFamilias />;
      case 'mapa':
        return <MapaCadastros />;
      case 'edicao-gleba':
        return <EdicaoGleba />;
      case 'detalhes-familia':
        return <DetalhesFamilia />;
      case 'edicao-familia':
        return <EdicaoFamilia />;
      // Ocultado temporariamente
      // case 'sync':
      //   return <SyncODKFamilias />;
      default:
        return <DashboardSupervisao />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <VersionIndicator />
        <div className="supervisao-ocupacional-module">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

export default SupervisaoOcupacionalModule;
