import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/Sidebar';
import Profile from '../Profile';
import './PerfilModule.css';

type ViewType = 'perfil';

function PerfilModule() {
  const { } = useAuth();
  const [viewAtiva, setViewAtiva] = useState<ViewType>('perfil');

  const handleNavegacao = (view: ViewType) => {
    setViewAtiva(view);
  };

  const renderView = () => {
    switch (viewAtiva) {
      case 'perfil':
        return <Profile />;
      default:
        return <Profile />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="main-content">
        <main className="perfil-main">
          <div className="perfil-container">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default PerfilModule;
