import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="container">
          <div className="brand">
            <h1 className="brand-title">PINOVARA</h1>
            <p className="brand-subtitle">Sistema Integrado de Gestão Socioambiental</p>
          </div>

          <nav className="nav">
            {user ? (
              <div className="user-nav">
                <span>Olá, {user.name}</span>
                <Link to="/pinovara" className="btn btn-primary">
                  Acessar Sistema
                </Link>
              </div>
            ) : (
              <div className="auth-nav">
                <Link to="/login" className="btn btn-outline">
                  Entrar
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Criar Conta
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <div className="hero-logo">
                <img
                  src="/pinovara.png"
                  alt="PINOVARA Logo"
                  className="hero-logo-image"
                />
              </div>
              <h2>Sistema Integrado de Gestão Socioambiental</h2>
              <p>
                Plataforma completa para coleta, processamento e gerenciamento de dados
                socioeconômicos, ambientais e do Relatório Técnico de Identificação e
                Delimitação (RTID) no contexto do Programa Nacional de Reforma Agrária (PNRA).
              </p>

              {!user && (
                <div className="hero-actions">
                  <Link to="/register" className="btn btn-primary btn-large">
                    Começar Agora
                  </Link>
                  <Link to="/login" className="btn btn-outline btn-large">
                    Já tenho conta
                  </Link>
                </div>
              )}

              {user && (
                <div className="hero-actions">
                  <Link to="/pinovara" className="btn btn-primary btn-large">
                    Acessar Sistema
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="features">
          <div className="container">
            <h3>Módulos Especializados</h3>

            <div className="features-grid">
              <div className="feature">
                <div className="feature-icon">📊</div>
                <h4>Diagnóstico Socioambiental</h4>
                <p>Coleta e análise integrada de dados socioeconômicos e ambientais para avaliação de assentamentos.</p>
              </div>

              <div className="feature">
                <div className="feature-icon">📋</div>
                <h4>RTID - Relatório Técnico</h4>
                <p>Gerenciamento completo do processo de Identificação e Delimitação de áreas para reforma agrária.</p>
              </div>

              <div className="feature">
                <div className="feature-icon">👥</div>
                <h4>Associados e Famílias</h4>
                <p>Cadastro e acompanhamento socioeconômico de famílias assentadas e seus beneficiários.</p>
              </div>

              <div className="feature">
                <div className="feature-icon">🗺️</div>
                <h4>Mapas e Georreferenciamento</h4>
                <p>Visualização geográfica de áreas, sobreposições temáticas e análise espacial integrada.</p>
              </div>

              <div className="feature">
                <div className="feature-icon">📈</div>
                <h4>Relatórios e Indicadores</h4>
                <p>Geração automática de relatórios, dashboards e indicadores para monitoramento e avaliação.</p>
              </div>

              <div className="feature">
                <div className="feature-icon">🔬</div>
                <h4>Pesquisa e Análise</h4>
                <p>Ferramentas avançadas de pesquisa, filtros e análise de dados socioambientais.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="tech-stack">
          <div className="container">
            <h3>Benefícios para o PNRA</h3>

            <div className="tech-grid">
              <div className="tech-category">
                <h4>Eficiência Operacional</h4>
                <ul>
                  <li>Automatização de processos</li>
                  <li>Redução de tempo de análise</li>
                  <li>Padronização de procedimentos</li>
                  <li>Integração de dados</li>
                  <li>Controle de qualidade</li>
                </ul>
              </div>

              <div className="tech-category">
                <h4>Gestão Socioambiental</h4>
                <ul>
                  <li>Acompanhamento de famílias</li>
                  <li>Monitoramento ambiental</li>
                  <li>Análise de vulnerabilidades</li>
                  <li>Indicadores de desenvolvimento</li>
                  <li>Relatórios de impacto</li>
                </ul>
              </div>

              <div className="tech-category">
                <h4>Tecnologia Avançada</h4>
                <ul>
                  <li>Interface responsiva</li>
                  <li>Processamento em tempo real</li>
                  <li>Segurança de dados</li>
                  <li>Backup automático</li>
                  <li>Suporte multiusuário</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2024 PINOVARA - Projeto Inovador em Gestão do PNRA. Desenvolvido para o Programa Nacional de Reforma Agrária.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;