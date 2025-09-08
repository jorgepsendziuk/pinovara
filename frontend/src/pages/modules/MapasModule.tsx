import { useAuth } from '../../contexts/AuthContext';

function MapasModule() {
  const { } = useAuth();

  return (
    <div className="module-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🗺️ Mapas</h1>
          <p>Mapas interativos com áreas (polígonos) e visitas (pontos)</p>
        </div>
      </div>

      <div className="module-content">
        <div className="coming-soon">
          <div className="coming-soon-icon">🗺️</div>
          <h2>Módulo Mapas</h2>
          <p>Este módulo será desenvolvido em breve com mapas interativos e georreferenciamento.</p>

          <div className="module-info">
            <h3>Funcionalidades Planejadas:</h3>
            <ul>
              <li>🗺️ Mapas interativos com Leaflet</li>
              <li>📍 Pontos de visita georreferenciados</li>
              <li>🏗️ Áreas delimitadas por polígonos</li>
              <li>📊 Camadas temáticas</li>
              <li>🔍 Filtros e buscas geográficas</li>
              <li>📍 GPS e localização em tempo real</li>
              <li>📊 Análise espacial de dados</li>
              <li>📱 Interface responsiva para mobile</li>
              <li>📤 Exportação de mapas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapasModule;
