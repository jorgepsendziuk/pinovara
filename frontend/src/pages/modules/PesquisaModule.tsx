import { useAuth } from '../../contexts/AuthContext';

function PesquisaModule() {
  const { } = useAuth();

  return (
    <div className="module-page">
      <div className="page-header">
        <div className="header-content">
          <h1>🔬 Pesquisa</h1>
          <p>Acesso aos dados do sistema para pesquisadores (tabulares e sumarizados)</p>
        </div>
      </div>

      <div className="module-content">
        <div className="coming-soon">
          <div className="coming-soon-icon">🔬</div>
          <h2>Módulo Pesquisa</h2>
          <p>Este módulo será desenvolvido em breve com ferramentas avançadas de análise de dados.</p>

          <div className="module-info">
            <h3>Funcionalidades Planejadas:</h3>
            <ul>
              <li>📊 Visualização tabular de dados</li>
              <li>📈 Análises estatísticas</li>
              <li>🔍 Filtros avançados</li>
              <li>📊 Gráficos e dashboards</li>
              <li>📥 Exportação de dados</li>
              <li>🔬 Ferramentas de pesquisa</li>
              <li>📋 Relatórios de pesquisa</li>
              <li>📊 Análises comparativas</li>
              <li>📈 Tendências e padrões</li>
              <li>🎯 Insights e descobertas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PesquisaModule;
