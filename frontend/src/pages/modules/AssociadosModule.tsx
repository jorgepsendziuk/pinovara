import { useAuth } from '../../contexts/AuthContext';

function AssociadosModule() {
  const { } = useAuth();

  return (
    <div className="module-page">
      <div className="page-header">
        <div className="header-content">
          <h1>👥 Associados</h1>
          <p>Cadastro de pessoas associadas ligadas às organizações</p>
        </div>
      </div>

      <div className="module-content">
        <div className="coming-soon">
          <div className="coming-soon-icon">👥</div>
          <h2>Módulo Associados</h2>
          <p>Este módulo será desenvolvido em breve com funcionalidades completas de gestão de associados.</p>

          <div className="module-info">
            <h3>Funcionalidades Planejadas:</h3>
            <ul>
              <li>📝 Cadastro de associados</li>
              <li>🏢 Vinculação com organizações</li>
              <li>📊 Perfil socioeconômico</li>
              <li>📅 Histórico de participação</li>
              <li>🎯 Acompanhamento de progresso</li>
              <li>📋 Documentação e certificados</li>
              <li>📞 Contatos de emergência</li>
              <li>💼 Status de associação</li>
              <li>📈 Métricas de engajamento</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssociadosModule;
