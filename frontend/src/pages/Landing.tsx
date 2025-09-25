import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import VersionIndicator from '../components/VersionIndicator';

function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Função para scroll suave para as seções
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="landing">
      {/* Indicador de versão discreto */}
      <VersionIndicator position="top-right" theme="auto" />
      
      <header className="landing-header">
        <div className="container">
          <div className="brand">
            <h1 className="brand-title">PINOVARA</h1>
            <p className="brand-subtitle">Pesquisa Inovadora em Gestão do Programa Nacional da Reforma Agrária</p>
          </div>

          <nav className="nav">
            <div className="nav-menu">
              <button 
                className="nav-link" 
                onClick={() => scrollToSection('eixos')}
              >
                Eixos Estruturantes
              </button>
              <button 
                className="nav-link" 
                onClick={() => scrollToSection('metas')}
              >
                Metas do Projeto
              </button>
              <button 
                className="nav-link" 
                onClick={() => scrollToSection('coordenacao')}
              >
                Coordenação
              </button>
            </div>

            <div className="nav-actions">
              {user ? (
                <div className="user-nav">
                  <span className="user-greeting">Olá, {user.name}</span>
                  <button 
                    className="nav-btn nav-btn-primary"
                    onClick={() => navigate('/pinovara')}
                  >
                    Acessar Sistema
                  </button>
                </div>
              ) : (
                <div className="auth-nav">
                  <button 
                    className="nav-btn nav-btn-outline"
                    onClick={() => navigate('/login')}
                  >
                    Entrar
                  </button>
                  <button 
                    className="nav-btn nav-btn-success"
                    onClick={() => navigate('/register')}
                  >
                    Cadastrar
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="landing-main">
        <section className="hero">
          <div className="container">
            <div className="hero-content">
              <div className="hero-header">
                <div className="hero-logo">
                  <img
                    src="/pinovara.png"
                    alt="PINOVARA Logo"
                    className="hero-logo-image"
                  />
                </div>
                <h2>Pesquisa Inovadora em Gestão do PNRA</h2>
              </div>
              <p>
                Parceria estratégica entre o Instituto Nacional de Colonização e Reforma Agrária (INCRA)
                e a Universidade Federal da Bahia (UFBA) por meio do Termo de Execução Descentralizado (TED)
                número 50/2023, visando impactar a vida de mais de 5.000 (cinco mil) famílias nos estados
                da Bahia, São Paulo e Espírito Santo.
              </p>
              <p>
                Desenvolvimento de processos inovadores no georreferenciamento e supervisão ocupacional
                com coleta de dados socioeconômicos/ambientais de lotes e perímetros em projetos de
                assentamento federais e regularização fundiária de territórios quilombolas.
              </p>
            </div>
          </div>
        </section>

        <section id="eixos" className="features">
          <div className="container">
            <h3 className="section-title">Eixos Estruturantes do PINOVARA</h3>

            <div className="features-grid">
              <div className="feature">
                <div className="feature-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <h4>Acadêmico-Científico</h4>
                <p>Pesquisas, publicações, extensão e inovações para desenvolvimento de processos inovadores na gestão do PNRA.</p>
              </div>

              <div className="feature">
                <div className="feature-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9,22 9,12 15,12 15,22"/>
                  </svg>
                </div>
                <h4>Suporte à Regularização Fundiária</h4>
                <p>Georreferenciamento de perímetros de Projetos de Assentamentos Federais e territórios quilombolas.</p>
              </div>

              <div className="feature">
                <div className="feature-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h4>Supervisão Ocupacional</h4>
                <p>Supervisão ocupacional com levantamento de informações socioeconômicas e ambientais das famílias.</p>
              </div>

              <div className="feature">
                <div className="feature-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    <path d="M8 12l2 2 4-4"/>
                  </svg>
                </div>
                <h4>Mapeamento Socioeconômico e Ambiental</h4>
                <p>Elaboração de diagnóstico para apoiar a transição agroecológica em Assentamentos e Territórios Quilombolas.</p> 
              </div>

              <div className="feature">
                <div className="feature-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                </div>
                <h4>RTID - Relatório Técnico</h4>
                <p>Relatório Técnico de Identificação e Delimitação para territórios quilombolas vinculados ao INCRA.</p>
              </div>

              <div className="feature">
                <div className="feature-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 3v18h18"/>
                    <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                    <circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <h4>Perfil de Entrada e Plano de Gestão</h4>
                <p>Elaboração de perfil social, econômico, ambiental e planos de gestão para empreendimentos coletivos.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="metas" className="objectives">
          <div className="container">
            <div className="objectives-header">
              <h3 className="section-title">
                Metas do Projeto PINOVARA
              </h3>
              
              <div className="objectives-summary">
                <div className="summary-stats">
                  <div className="stat-box">
                    <div className="stat-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"/>
                        <rect x="9" y="11" width="6" height="11"/>
                        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <span className="stat-number">13</span>
                      <span className="stat-label">Metas Estratégicas</span>
                    </div>
                  </div>

                  <div className="stat-box">
                    <div className="stat-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <span className="stat-number">3</span>
                      <span className="stat-label">Estados Atendidos</span>
                    </div>
                  </div>

                  <div className="stat-box">
                    <div className="stat-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                    </div>
                    <div className="stat-content">
                      <span className="stat-number">5.000+</span>
                      <span className="stat-label">Famílias Beneficiadas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="objectives-grid">
              <div className="phase-box">
                <div className="phase-box-header">
                  <div className="phase-badge">FASE 01</div>
                  <div className="phase-icon-large">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
                    </svg>
                  </div>
                  <h4 className="phase-title">Planejamento</h4>
                  <p className="phase-description">Estruturação inicial do projeto</p>
                </div>
                <div className="phase-metas-list">
                  <div className="meta-entry">
                    <span className="meta-index">Meta 01:</span>
                    <span className="meta-description">Constituição da Equipe do Projeto</span>
                  </div>
                  <div className="meta-entry">
                    <span className="meta-index">Meta 02:</span>
                    <span className="meta-description">Elaboração do Plano de Ação Detalhado</span>
                  </div>
                </div>
              </div>

              <div className="phase-box">
                <div className="phase-box-header">
                  <div className="phase-badge">FASE 02</div>
                  <div className="phase-icon-large">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <h4 className="phase-title">Georreferenciamento</h4>
                  <p className="phase-description">Mapeamento territorial preciso</p>
                </div>
                <div className="phase-metas-list">
                  <div className="meta-entry">
                    <span className="meta-index">Meta 03:</span>
                    <span className="meta-description">Georreferenciamento - Bahia</span>
                  </div>
                  <div className="meta-entry">
                    <span className="meta-index">Meta 04:</span>
                    <span className="meta-description">Georreferenciamento - São Paulo</span>
                  </div>
                </div>
              </div>

              <div className="phase-box">
                <div className="phase-box-header">
                  <div className="phase-badge">FASE 03</div>
                  <div className="phase-icon-large">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <h4 className="phase-title">Supervisão Ocupacional</h4>
                  <p className="phase-description">Acompanhamento das famílias</p>
                </div>
                <div className="phase-metas-list">
                  <div className="meta-entry">
                    <span className="meta-index">Meta 05:</span>
                    <span className="meta-description">Supervisão - Bahia</span>
                  </div>
                  <div className="meta-entry">
                    <span className="meta-index">Meta 06:</span>
                    <span className="meta-description">Supervisão - São Paulo</span>
                  </div>
                </div>
              </div>

              <div className="phase-box">
                <div className="phase-box-header">
                  <div className="phase-badge">FASE 04</div>
                  <div className="phase-icon-large">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18"/>
                      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                    </svg>
                  </div>
                  <h4 className="phase-title">RTID</h4>
                  <p className="phase-description">Relatório Técnico de Identificação</p>
                </div>
                <div className="phase-metas-list">
                  <div className="meta-entry">
                    <span className="meta-index">Meta 07:</span>
                    <span className="meta-description">RTID - Bahia</span>
                  </div>
                  <div className="meta-entry">
                    <span className="meta-index">Meta 08:</span>
                    <span className="meta-description">RTID - Espírito Santo</span>
                  </div>
                  <div className="meta-entry">
                    <span className="meta-index">Meta 09:</span>
                    <span className="meta-description">RTID - São Paulo</span>
                  </div>
                </div>
              </div>

              <div className="phase-box">
                <div className="phase-box-header">
                  <div className="phase-badge">FASE 05</div>
                  <div className="phase-icon-large">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h4 className="phase-title">Desenvolvimento Socioeconômico</h4>
                  <p className="phase-description">Capacitação e planejamento estratégico</p>
                </div>
                <div className="phase-metas-list">
                  <div className="meta-entry">
                    <span className="meta-index">Meta 10:</span>
                    <span className="meta-description">Mapeamento Socioambiental</span>
                  </div>
                  <div className="meta-entry">
                    <span className="meta-index">Meta 11:</span>
                    <span className="meta-description">Qualificação e Formação Profissional</span>
                  </div>
                  <div className="meta-entry">
                    <span className="meta-index">Meta 12:</span>
                    <span className="meta-description">Perfil de Entrada e Plano de Gestão</span>
                  </div>
                </div>
              </div>

              <div className="phase-box">
                <div className="phase-box-header">
                  <div className="phase-badge">FASE 06</div>
                  <div className="phase-icon-large">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4"/>
                      <rect x="9" y="11" width="6" height="11"/>
                      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                      <line x1="12" y1="15" x2="12" y2="19"/>
                    </svg>
                  </div>
                  <h4 className="phase-title">Pesquisa e Inovação</h4>
                  <p className="phase-description">Desenvolvimento de processos inovadores</p>
                </div>
                <div className="phase-metas-list">
                  <div className="meta-entry">
                    <span className="meta-index">Meta 13:</span>
                    <span className="meta-description">Estudos e Diagnósticos Inovadores</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="coordenacao" className="coordinators">
          <div className="container">
            <div className="coordinators-header">
              <h3 className="section-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                  <path d="M12 14l3-3 3 3-3 3-3-3"/>
                </svg>
                Coordenação do Projeto
              </h3>
              <p className="section-intro">
                Liderança acadêmica especializada em gestão pública e desenvolvimento sustentável
                para o sucesso do projeto PINOVARA.
              </p>
            </div>
            
            <div className="coordinators-grid">
              <div className="coordinator-box">
                <div className="coordinator-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                    <path d="M12 14l3-3 3 3-3 3-3-3"/>
                  </svg>
                </div>
                <div className="coordinator-content">
                  <div className="coordinator-badge">COORDENADOR GERAL</div>
                  <h4 className="coordinator-name">Prof. Dr. Olivan da Silva Rabêlo</h4>
                  <p className="coordinator-institution">Escola de Administração da UFBA</p>
                  <p className="coordinator-specialty">
                  Doutor em Economia Aplicada 
                  </p>
                  <p className="coordinator-description">
                    Responsável pela coordenação geral e estratégica do projeto PINOVARA, garantindo a excelência acadêmica e o impacto social.
                  </p>
                </div>
              </div>

              <div className="coordinator-box">
                <div className="coordinator-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    <path d="M12 14l2-2 2 2-2 2-2-2"/>
                  </svg>
                </div>
                <div className="coordinator-content">
                  <div className="coordinator-badge">VICE-COORDENADOR</div>
                  <h4 className="coordinator-name">Prof. Dr. Artur Caldas Brandão</h4>
                  <p className="coordinator-institution">Escola Politécnica da UFBA</p>
                  <p className="coordinator-specialty">
                  Doutor em Engenharia da Produção
                  </p>
                  <p className="coordinator-description">
                    Responsável pela supervisão das atividades e tecnologias voltadas ao Geoprocessamento.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <footer className="landing-footer">
        <div className="container">
          <div className="footer-simple">
            <p>&copy; 2025 PINOVARA - Universidade Federal da Bahia | Parceria INCRA/UFBA - TED nº 50/2023</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;