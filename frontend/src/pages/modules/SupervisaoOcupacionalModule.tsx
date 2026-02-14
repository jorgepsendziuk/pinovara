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
    
    // Rotas: /familias = lista de famílias; /familias/:id = detalhe; /familias/:id/editar = edição
    // /familias/territorios, /familias/mapa, /familias/dashboard
    if (path.includes('/territorios/edicao/')) {
      setViewAtiva('edicao-gleba');
    } else if (path.match(/^\/familias\/\d+\/editar$/)) {
      setViewAtiva('edicao-familia');
    } else if (path.match(/^\/familias\/\d+$/)) {
      setViewAtiva('detalhes-familia');
    } else if (path.match(/\/territorios\/\d+$/)) {
      const match = path.match(/\/territorios\/(\d+)$/);
      if (match) {
        navigate(`/familias/territorios/edicao/${match[1]}`, { replace: true });
        return;
      }
    } else if (path.includes('/dashboard')) {
      setViewAtiva('dashboard');
    } else if (path.includes('/mapa')) {
      setViewAtiva('mapa');
    } else if (path.includes('/territorios')) {
      setViewAtiva('glebas');
    } else if (path === '/familias' || path === '/familias/') {
      setViewAtiva('familias');
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
    <div className="dashboard-layout">
      <VersionIndicator position="top-right" theme="auto" />
      <Sidebar />
      <div className="main-content">
        <div className="supervisao-ocupacional-module">
          {renderView()}
        </div>
      </div>
    </div>
  );
}

export default SupervisaoOcupacionalModule;
