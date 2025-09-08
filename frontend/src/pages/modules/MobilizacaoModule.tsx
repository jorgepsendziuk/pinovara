import { useAuth } from '../../contexts/AuthContext';

function MobilizacaoModule() {
  const { } = useAuth();

  return (
    <div className="module-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🚀 Mobilização</h1>
          <p>Cadastros de mobilização com formulários de campo, fotos, GPS e listas de presença</p>
        </div>
      </div>

      <div className="module-content">
        <div className="coming-soon">
          <div className="coming-soon-icon">🚀</div>
          <h2>Módulo Mobilização</h2>
          <p>Este módulo será desenvolvido em breve com sistema completo de mobilização comunitária.</p>

          <div className="module-info">
            <h3>Funcionalidades Planejadas:</h3>
            <ul>
              <li>📝 Formulários de campo digitais</li>
              <li>📸 Upload de fotos e mídia</li>
              <li>📍 Georreferenciamento GPS</li>
              <li>📋 Listas de presença</li>
              <li>🎯 Cadastro de eventos</li>
              <li>👥 Participantes e palestrantes</li>
              <li>📊 Métricas de engajamento</li>
              <li>📱 Interface mobile-first</li>
              <li>📊 Relatórios de mobilização</li>
              <li>🎪 Gestão de campanhas</li>
              <li>📈 Acompanhamento de resultados</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobilizacaoModule;
