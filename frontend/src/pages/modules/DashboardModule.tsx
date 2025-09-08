import { useAuth } from '../../contexts/AuthContext';

function DashboardModule() {
  const { } = useAuth();

  return (
    <div className="module-page">
      <div className="page-header">
        <div className="header-content">
          <h1>📊 Dashboard</h1>
          <p>Dashboards e painéis de controle do sistema</p>
        </div>
      </div>

      <div className="module-content">
        <div className="coming-soon">
          <div className="coming-soon-icon">📊</div>
          <h2>Módulo Dashboard</h2>
          <p>Este módulo será desenvolvido em breve com painéis de controle e dashboards interativos.</p>

          <div className="module-info">
            <h3>Funcionalidades Planejadas:</h3>
            <ul>
              <li>📈 Métricas em tempo real</li>
              <li>📊 Gráficos e visualizações</li>
              <li>🎯 KPIs e indicadores</li>
              <li>📋 Relatórios rápidos</li>
              <li>🔄 Atualizações automáticas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardModule;
