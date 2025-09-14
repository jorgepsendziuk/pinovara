import { useAuth } from '../../contexts/AuthContext';

function RelatoriosModule() {
  const { } = useAuth();

  return (
    <div className="module-page">
      <div className="page-header">
        <div className="header-content">
          <h1>📋 Relatórios</h1>
          <p>Relatórios individuais e coletivos sobre áreas e pessoas visitadas em campo e cadastradas</p>
        </div>
      </div>

      <div className="module-content">
        <div className="coming-soon">
          <div className="coming-soon-icon">📋</div>
          <h2>Módulo Relatórios</h2>
          <p>Este módulo será desenvolvido em breve com sistema completo de geração de relatórios.</p>

          <div className="module-info">
            <h3>Funcionalidades Planejadas:</h3>
            <ul>
              <li>📊 Relatórios individuais</li>
              <li>📈 Relatórios coletivos</li>
              <li>🗺️ Relatórios por área geográfica</li>
              <li>👥 Relatórios por beneficiário</li>
              <li>📅 Relatórios temporais</li>
              <li>📁 Exportação em múltiplos formatos</li>
              <li>📧 Envio automático de relatórios</li>
              <li>📋 Templates personalizáveis</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RelatoriosModule;
