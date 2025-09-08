import { useAuth } from '../../contexts/AuthContext';

function OrganizacoesModule() {
  const { } = useAuth();

  return (
    <div className="module-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🏢 Organizações</h1>
          <p>Cadastro e gestão de organizações parceiras</p>
        </div>
      </div>

      <div className="module-content">
        <div className="coming-soon">
          <div className="coming-soon-icon">🏢</div>
          <h2>Módulo Organizações</h2>
          <p>Este módulo será desenvolvido em breve com funcionalidades completas de gestão de organizações.</p>

          <div className="module-info">
            <h3>Funcionalidades Planejadas:</h3>
            <ul>
              <li>📝 Cadastro de organizações</li>
              <li>📋 Gestão de dados organizacionais</li>
              <li>🔗 Relacionamento com associados</li>
              <li>📊 Relatórios por organização</li>
              <li>🏷️ Categorização e tags</li>
              <li>📞 Contatos e responsáveis</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizacoesModule;
