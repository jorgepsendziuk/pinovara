import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import VersionIndicator from '../../components/VersionIndicator';
import DashboardOrganizacoes from '../organizacoes/DashboardOrganizacoes';
import ListaOrganizacoes from '../organizacoes/ListaOrganizacoes';
// import CadastroOrganizacao from '../organizacoes/CadastroOrganizacao'; // Removido - usa EdicaoOrganizacao
// import DetalhesOrganizacao from '../organizacoes/DetalhesOrganizacao'; // Removido
import EdicaoOrganizacao from '../organizacoes/EdicaoOrganizacao';
import MapaOrganizacoesPage from '../organizacoes/MapaOrganizacoesPage';
import PlanoGestaoPage from '../organizacoes/PlanoGestaoPage';
import '../organizacoes/OrganizacoesModule.css';

type ViewType = 'dashboard' | 'lista' | 'cadastro' | 'edicao' | 'mapa' | 'detalhes' | 'planoGestao';

function OrganizacoesModule() {
  const { isSupervisor } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [viewAtiva, setViewAtiva] = useState<ViewType>('dashboard');
  const [organizacaoSelecionada, setOrganizacaoSelecionada] = useState<number | null>(null);

  // Determinar view baseada na URL
  useEffect(() => {
    const path = location.pathname;
    
    // Bloquear supervisores de acessar rotas de edição e cadastro via URL
    if (isSupervisor() && (path.includes('/cadastro') || path.includes('/edicao/'))) {
      console.warn('⚠️ Supervisores não podem acessar páginas de edição/cadastro');
      navigate('/organizacoes/lista', { replace: true });
      return;
    }
    
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
    } else if (path.includes('/plano-gestao/')) {
      setViewAtiva('planoGestao');
      const id = path.split('/plano-gestao/')[1];
      if (id) {
        setOrganizacaoSelecionada(parseInt(id));
      }
    } else {
      // Rota padrão /organizacoes vai para dashboard
      setViewAtiva('dashboard');
    }
  }, [location.pathname, isSupervisor, navigate]);

  const handleNavegacao = (view: ViewType, organizacaoId?: number) => {
    // Bloquear acesso de supervisores a edição e cadastro
    if (isSupervisor() && (view === 'edicao' || view === 'cadastro')) {
      console.warn('⚠️ Supervisores não podem acessar páginas de edição/cadastro');
      navigate('/organizacoes/lista');
      return;
    }
    
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
      case 'planoGestao':
        if (organizacaoId) {
          navigate(`/organizacoes/plano-gestao/${organizacaoId}`);
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
        // Usar EdicaoOrganizacao sem ID = modo criação
        return <EdicaoOrganizacao onNavigate={(pagina: string, dados?: any) => handleNavegacao(pagina as ViewType, dados)} />;
      case 'mapa':
        return <MapaOrganizacoesPage onNavigate={handleNavegacao} />;
      case 'edicao':
        return organizacaoSelecionada ? (
          <EdicaoOrganizacao 
            organizacaoId={organizacaoSelecionada} 
            onNavigate={(pagina: string, dados?: any) => handleNavegacao(pagina as ViewType, dados)} 
          />
        ) : (
          <div className="error-message">
            <p>❌ ID da organização não fornecido</p>
            <button onClick={() => setViewAtiva('lista')} className="btn btn-primary">
              Voltar para Lista
            </button>
          </div>
        );
      case 'planoGestao':
        return organizacaoSelecionada ? (
          <PlanoGestaoPage organizacaoId={organizacaoSelecionada} />
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
            onNavigate={(pagina: string, dados?: any) => handleNavegacao(pagina as ViewType, dados)} 
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
        <main className="dashboard-main" style={{padding: viewAtiva === 'mapa' ? '0' : '20px'}}>
          <div className={viewAtiva === 'mapa' ? 'full-width-container' : 'full-width-container'}>
            <div className="organizacoes-module">

              {/* Conteúdo do módulo */}
              <div className="module-content" style={{padding: viewAtiva === 'mapa' ? '0' : 'inherit'}}>
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
