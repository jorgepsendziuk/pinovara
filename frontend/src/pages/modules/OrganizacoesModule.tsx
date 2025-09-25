import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import VersionIndicator from '../../components/VersionIndicator';
import DashboardOrganizacoes from '../organizacoes/DashboardOrganizacoes';
import ListaOrganizacoes from '../organizacoes/ListaOrganizacoes';
import CadastroOrganizacao from '../organizacoes/CadastroOrganizacao';
// import DetalhesOrganizacao from '../organizacoes/DetalhesOrganizacao'; // Removido
import EdicaoOrganizacao from '../organizacoes/EdicaoOrganizacao';
import MapaOrganizacoes from '../organizacoes/MapaOrganizacoes';
import '../organizacoes/OrganizacoesModule.css';

type ViewType = 'dashboard' | 'lista' | 'cadastro' | 'edicao' | 'mapa' | 'detalhes';

function OrganizacoesModule() {
  const { } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [viewAtiva, setViewAtiva] = useState<ViewType>('dashboard');
  const [organizacaoSelecionada, setOrganizacaoSelecionada] = useState<number | null>(null);

  // Determinar view baseada na URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard')) {
      setViewAtiva('dashboard');
    } else if (path.includes('/lista')) {
      setViewAtiva('lista');
    } else if (path.includes('/cadastro')) {
      setViewAtiva('cadastro');
    } else if (path.includes('/mapa')) {
      setViewAtiva('mapa');
    } else if (path.includes('/edicao/')) {
      setViewAtiva('edicao');
      const id = path.split('/edicao/')[1];
      if (id) {
        setOrganizacaoSelecionada(parseInt(id));
      }
    } else {
      // Rota padrão /organizacoes vai para dashboard
      setViewAtiva('dashboard');
    }
  }, [location.pathname]);

  const handleNavegacao = (view: ViewType, organizacaoId?: number) => {
    setViewAtiva(view);
    if (organizacaoId) {
      setOrganizacaoSelecionada(organizacaoId);
    }
    
    // Navegar para a URL correspondente
    switch (view) {
      case 'dashboard':
        navigate('/organizacoes/dashboard');
        break;
      case 'lista':
        navigate('/organizacoes/lista');
        break;
      case 'cadastro':
        navigate('/organizacoes/cadastro');
        break;
      case 'mapa':
        navigate('/organizacoes/mapa');
        break;
      case 'edicao':
        if (organizacaoId) {
          navigate(`/organizacoes/edicao/${organizacaoId}`);
        }
        break;
      case 'detalhes':
        // Redireciona para edição (funcionalidade combinada)
        if (organizacaoId) {
          navigate(`/organizacoes/edicao/${organizacaoId}`);
          setViewAtiva('edicao');
        }
        break;
    }
  };

  const renderView = () => {
    switch (viewAtiva) {
      case 'dashboard':
        return <DashboardOrganizacoes onNavigate={handleNavegacao} />;
      case 'lista':
        return <ListaOrganizacoes onNavigate={handleNavegacao} />;
      case 'cadastro':
        return <CadastroOrganizacao onNavigate={handleNavegacao} />;
      case 'mapa':
        return <MapaOrganizacoes />;
      case 'edicao':
        return organizacaoSelecionada ? (
          <EdicaoOrganizacao 
            organizacaoId={organizacaoSelecionada} 
            onNavigate={(pagina: string) => handleNavegacao(pagina as ViewType)} 
          />
        ) : (
          <div className="error-message">
            <p>❌ ID da organização não fornecido</p>
            <button onClick={() => setViewAtiva('lista')} className="btn btn-primary">
              Voltar para Lista
            </button>
          </div>
        );
      case 'detalhes':
        // Redireciona para edição (funcionalidade combinada)
        return organizacaoSelecionada ? (
          <EdicaoOrganizacao 
            organizacaoId={organizacaoSelecionada} 
            onNavigate={(pagina: string) => handleNavegacao(pagina as ViewType)} 
          />
        ) : (
          <div className="error-message">
            <p>❌ ID da organização não fornecido</p>
            <button onClick={() => setViewAtiva('lista')} className="btn btn-primary">
              Voltar para Lista
            </button>
          </div>
        );
      default:
        return <DashboardOrganizacoes onNavigate={handleNavegacao} />;
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Indicador de versão discreto */}
      <VersionIndicator position="top-right" theme="auto" />
      
      <Sidebar />

      <div className="main-content">
        <main className="dashboard-main">
          <div className="container">
            <div className="organizacoes-module">

              {/* Conteúdo do módulo */}
              <div className="module-content">
                {renderView()}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default OrganizacoesModule;
