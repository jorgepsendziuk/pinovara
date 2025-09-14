import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/Sidebar';
import DashboardOrganizacoes from '../organizacoes/DashboardOrganizacoes';
import ListaOrganizacoes from '../organizacoes/ListaOrganizacoes';
import CadastroOrganizacao from '../organizacoes/CadastroOrganizacao';
import DetalhesOrganizacao from '../organizacoes/DetalhesOrganizacao';
import '../organizacoes/OrganizacoesModule.css';

type ViewType = 'dashboard' | 'lista' | 'cadastro' | 'detalhes';

function OrganizacoesModule() {
  const { } = useAuth();
  const [viewAtiva, setViewAtiva] = useState<ViewType>('dashboard');
  const [organizacaoSelecionada, setOrganizacaoSelecionada] = useState<number | null>(null);

  const handleNavegacao = (view: ViewType, organizacaoId?: number) => {
    setViewAtiva(view);
    if (organizacaoId) {
      setOrganizacaoSelecionada(organizacaoId);
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
      case 'detalhes':
        return organizacaoSelecionada ? (
          <DetalhesOrganizacao organizacaoId={organizacaoSelecionada} onNavigate={handleNavegacao} />
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
      <Sidebar />

      <div className="main-content">
        <main className="dashboard-main">
          <div className="container">
            <div className="organizacoes-module">
              {/* Navegação do módulo */}
              <div className="module-navigation">
                <div className="nav-buttons">
                  <button 
                    className={`nav-btn ${viewAtiva === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setViewAtiva('dashboard')}
                  >
                    📊 Dashboard
                  </button>
                  <button 
                    className={`nav-btn ${viewAtiva === 'lista' ? 'active' : ''}`}
                    onClick={() => setViewAtiva('lista')}
                  >
                    📋 Lista
                  </button>
                  <button 
                    className={`nav-btn ${viewAtiva === 'cadastro' ? 'active' : ''}`}
                    onClick={() => setViewAtiva('cadastro')}
                  >
                    ➕ Nova
                  </button>
                </div>
              </div>

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
