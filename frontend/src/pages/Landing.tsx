import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ImageModal from '../components/ImageModal';

function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estado para o modal de imagens
  const [modalState, setModalState] = useState({
    isOpen: false,
    images: [] as string[],
    currentIndex: 0
  });

  // Estado para o menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Estado para detectar se o usuário rolou a página (para adicionar sombra no header)
  const [isScrolled, setIsScrolled] = useState(false);

  // Detectar scroll para adicionar sombra no header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handler para abrir o modal
  const openModal = (images: string[], index: number) => {
    setModalState({
      isOpen: true,
      images,
      currentIndex: index
    });
  };

  // Handler para fechar o modal
  const closeModal = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false
    }));
  };

  // Handler para toggle do menu mobile
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  // Função para scroll suave para as seções e fechar o menu mobile
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      // Fechar menu mobile após clicar em um item
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="landing">
      <header className={`landing-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
            <h1 className="brand-title">PINOVARA</h1>
            <p className="brand-subtitle">Pesquisa Inovadora em Gestão do Programa Nacional da Reforma Agrária</p>
          </div>

          {/* Botão Hamburger para Mobile */}
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            aria-label="Menu de navegação"
            aria-expanded={isMobileMenuOpen}
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'active' : ''}`}>
              <span className="line"></span>
              <span className="line"></span>
              <span className="line"></span>
            </span>
          </button>

          <nav className={`nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
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
                onClick={() => scrollToSection('eventos')}
              >
                Eventos
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
                    onClick={() => {
                      navigate('/pinovara');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Acessar Sistema
                  </button>
                </div>
              ) : (
                <div className="auth-nav">
                  <button 
                    className="nav-btn nav-btn-outline"
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Entrar
                  </button>
                  <button 
                    className="nav-btn nav-btn-success"
                    onClick={() => {
                      navigate('/register');
                      setIsMobileMenuOpen(false);
                    }}
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
              <div className="hero-main">
                <div className="hero-disclaimer">
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

                <div className="hero-events-call">
                  <div className="events-call-header">
                    <h3>Projeto em Ação</h3>
                    <p>Conheça os eventos que estão acontecendo no PINOVARA</p>
                  </div>

                  <div className="events-slider">
                    <div className="slider-container">
                      <div className="slider-track">
                        <div className="slide">
                          <img src="/eventos/evento-1-1.jpg" alt="Evento 1 - Foto 1" />
                        </div>
                        <div className="slide">
                          <img src="/eventos/evento-2-1.jpg" alt="Evento 2 - Foto 1" />
                        </div>
                        <div className="slide">
                          <img src="/eventos/evento-3-1.jpg" alt="Evento 3 - Foto 1" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    className="events-cta-button"
                    onClick={() => scrollToSection('eventos')}
                  >
                    Ver Todos os Eventos
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17l10-10"/>
                      <path d="M7 7h10v10"/>
                    </svg>
                  </button>
                </div>
              </div>
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
                <h4>Cadastro de Famílias</h4>
                <p>Cadastro de famílias com levantamento de informações socioeconômicas e ambientais em territórios (glebas, assentamentos e quilombos).</p>
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
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
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
                  <h4 className="phase-title">Cadastro de Famílias</h4>
                  <p className="phase-description">Acompanhamento das famílias em territórios</p>
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
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                      <polyline points="10,9 9,9 8,9"/>
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
                      <path d="M3 21h18"/>
                      <path d="M5 21V7l8-4v18"/>
                      <path d="M19 21V11l-6-4"/>
                      <path d="M9 9v.01"/>
                      <path d="M9 12v.01"/>
                      <path d="M9 15v.01"/>
                      <path d="M9 18v.01"/>
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
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
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

        <section id="eventos" className="events">
          <div className="container">
            <div className="events-header">
              <h3 className="section-title">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 2v4"/>
                  <path d="M16 2v4"/>
                  <rect width="18" height="18" x="3" y="4" rx="2"/>
                  <path d="M3 10h18"/>
                  <path d="M8 14h.01"/>
                  <path d="M12 14h.01"/>
                  <path d="M16 14h.01"/>
                  <path d="M8 18h.01"/>
                  <path d="M12 18h.01"/>
                  <path d="M16 18h.01"/>
                </svg>
                Eventos do PINOVARA
              </h3>
              <p className="section-intro">
                Acompanhe as atividades e mobilizações que estão acontecendo no projeto PINOVARA em todo o território nacional.
              </p>
            </div>

            <div className="events-grid">
              <div className="event-card">
                <div className="event-images">
                  <div className="event-image-main">
                    <img
                      src="/eventos/evento-1-1.jpg"
                      alt="Evento 1 - Principal"
                      onClick={() => openModal([
                        '/eventos/evento-1-1.jpg',
                        '/eventos/evento-1-2.jpg',
                        '/eventos/evento-1-3.jpg',
                        '/eventos/evento-1-4.jpg',
                        '/eventos/evento-1-5.jpg'
                      ], 0)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <div className="event-images-grid">
                    <img
                      src="/eventos/evento-1-2.jpg"
                      alt="Evento 1 - Foto 2"
                      onClick={() => openModal([
                        '/eventos/evento-1-1.jpg',
                        '/eventos/evento-1-2.jpg',
                        '/eventos/evento-1-3.jpg',
                        '/eventos/evento-1-4.jpg',
                        '/eventos/evento-1-5.jpg'
                      ], 1)}
                    />
                    <img
                      src="/eventos/evento-1-3.jpg"
                      alt="Evento 1 - Foto 3"
                      onClick={() => openModal([
                        '/eventos/evento-1-1.jpg',
                        '/eventos/evento-1-2.jpg',
                        '/eventos/evento-1-3.jpg',
                        '/eventos/evento-1-4.jpg',
                        '/eventos/evento-1-5.jpg'
                      ], 2)}
                    />
                    <img
                      src="/eventos/evento-1-4.jpg"
                      alt="Evento 1 - Foto 4"
                      onClick={() => openModal([
                        '/eventos/evento-1-1.jpg',
                        '/eventos/evento-1-2.jpg',
                        '/eventos/evento-1-3.jpg',
                        '/eventos/evento-1-4.jpg',
                        '/eventos/evento-1-5.jpg'
                      ], 3)}
                    />
                    <img
                      src="/eventos/evento-1-5.jpg"
                      alt="Evento 1 - Foto 5"
                      onClick={() => openModal([
                        '/eventos/evento-1-1.jpg',
                        '/eventos/evento-1-2.jpg',
                        '/eventos/evento-1-3.jpg',
                        '/eventos/evento-1-4.jpg',
                        '/eventos/evento-1-5.jpg'
                      ], 4)}
                    />
                  </div>
                </div>
                <div className="event-content">
                  <div className="event-badge">EVENTO 01</div>
                  <h4 className="event-title">Entregas do Governo Federal e Lançamento do Programa Nacional de Desenvolvimento Territorial Sustentável</h4>
                  <p className="event-description">
                    O coordenador do PINOVARA, Olivan da S. Rabêlo, participou nos dias 12 e 13 de setembro nas cidades de Andradina ( na Cooperativa COAPAR - atendida pelo PINOVARA)  e Promissão (Assentamento Reunidas - Agrovila Central) ambas cidades  do Estado de São Paulo, das entregas do Governo Federal e Lançamento do Programa Nacional de Desenvolvimento Territorial Sustentável com as presenças do Ministro do Desenvolvimento Agrário e Agricultura Familiar Luiz Paulo Teixeira e da    Superintendente Regional do INCRA em São Paulo - INCRA - SP    Sabrina Diniz Bittencourt Nepomuceno, além das lideranças de diversos movimentos sociais. "Podemos testemunhar neste evento a força da agricultura familiar  que reuniu as famílias que produzem alimentos saudáveis e sustentáveis que seguem para as mesas das outras famílias'" afirmou o coordenador do PINOVARA.
                  </p>
                </div>
              </div>

              <div className="event-card">
                <div className="event-images">
                  <div className="event-image-main">
                    <img
                      src="/eventos/evento-2-1.jpg"
                      alt="Evento 2 - Principal"
                      onClick={() => openModal([
                        '/eventos/evento-2-1.jpg',
                        '/eventos/evento-2-2.jpg',
                        '/eventos/evento-2-3.jpg',
                        '/eventos/evento-2-4.jpg'
                      ], 0)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <div className="event-images-grid">
                    <img
                      src="/eventos/evento-2-2.jpg"
                      alt="Evento 2 - Foto 2"
                      onClick={() => openModal([
                        '/eventos/evento-2-1.jpg',
                        '/eventos/evento-2-2.jpg',
                        '/eventos/evento-2-3.jpg',
                        '/eventos/evento-2-4.jpg'
                      ], 1)}
                    />
                    <img
                      src="/eventos/evento-2-3.jpg"
                      alt="Evento 2 - Foto 3"
                      onClick={() => openModal([
                        '/eventos/evento-2-1.jpg',
                        '/eventos/evento-2-2.jpg',
                        '/eventos/evento-2-3.jpg',
                        '/eventos/evento-2-4.jpg'
                      ], 2)}
                    />
                    <img
                      src="/eventos/evento-2-4.jpg"
                      alt="Evento 2 - Foto 4"
                      onClick={() => openModal([
                        '/eventos/evento-2-1.jpg',
                        '/eventos/evento-2-2.jpg',
                        '/eventos/evento-2-3.jpg',
                        '/eventos/evento-2-4.jpg'
                      ], 3)}
                    />
                  </div>
                </div>
                <div className="event-content">
                  <div className="event-badge">EVENTO 02</div>
                  <h4 className="event-title">Mobilização e sensibilização em Cooperativismo para Lideranças / Técnicos dos empreendimentos coletivos atendidos pelo PINOVARA</h4>
                  <p className="event-description">
                    No dia 15/09/25 foi realizada qualificação em Cooperativismo para as Lideranças e Técnicos dos empreendimentos coletivos atendidos pelo Pinovara. O evento aconteceu na Sede da Superintendência Regional do INCRA em São Paulo - INCRA - SP e contou com as presenças das principais lideranças de cooperativas e associações selecionadas pelo INCRA SR - SP para serem atendidas pelo PINOVARA. A qualificação foi realizada pelo Sr. Eder Vargas e Sra. Verônica Ribeiro, que conduziram o encontro trazendo abordagem fundamental sobre os princípios do Cooperativismo para o público presente ao evento.
                  </p>
                </div>
              </div>

              <div className="event-card">
                <div className="event-images">
                  <div className="event-image-main">
                    <img
                      src="/eventos/evento-3-1.jpg"
                      alt="Evento 3 - Principal"
                      onClick={() => openModal([
                        '/eventos/evento-3-1.jpg',
                        '/eventos/evento-3-2.jpg',
                        '/eventos/evento-3-3.jpg'
                      ], 0)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  <div className="event-images-grid">
                    <img
                      src="/eventos/evento-3-2.jpg"
                      alt="Evento 3 - Foto 2"
                      onClick={() => openModal([
                        '/eventos/evento-3-1.jpg',
                        '/eventos/evento-3-2.jpg',
                        '/eventos/evento-3-3.jpg'
                      ], 1)}
                    />
                    <img
                      src="/eventos/evento-3-3.jpg"
                      alt="Evento 3 - Foto 3"
                      onClick={() => openModal([
                        '/eventos/evento-3-1.jpg',
                        '/eventos/evento-3-2.jpg',
                        '/eventos/evento-3-3.jpg'
                      ], 2)}
                    />
                  </div>
                </div>
                <div className="event-content">
                  <div className="event-badge">EVENTO 03</div>
                  <h4 className="event-title">Mobilização e sensibilização para a aplicação do Perfil de Entrada, Plano de Gestão e Qualificação dos empreendimentos coletivos do PINOVARA</h4>
                  <p className="event-description">
                    No dia 16/09 foi realizada a qualificação de Mobilização e sensibilização para a aplicação do Perfil de Entrada, Plano de Gestão e Qualificação dos empreendimentos coletivos do PINOVARA. O evento aconteceu na Sede da Superintendência Regional do INCRA em São Paulo - INCRA - SP e contou com as presenças das principais lideranças / técnicos de cooperativas e associações selecionadas pelo INCRA SR - SP para serem atendidas pelo PINOVARA. A qualificação foi liderada pelo Coordenador do PINOVARA Olivan da S. Rabêlo que abordou sobre o instrumento de coleta de  dados e informações que serão coletados junto aos empreendimentos coletivos e o planejamento das atividades de gestão dos empreendimentos, assim como os procedimentos para as capacitações que serão ofertadas para as cooperativas / associações que estão no contexto dos projetos de assentamentos e territórios quilombolas atendidos pelo PINOVARA no Estado de São Paulo.
                  </p>
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
          <div className="footer-content">
            <div className="footer-links">
              <button
                onClick={() => navigate('/politica-privacidade')}
                className="footer-link"
              >
                Política de Privacidade
              </button>
              <span className="footer-separator">•</span>
              <a href="mailto:jorgefrpsendziuk@gmail.com" className="footer-link">
                Contato
              </a>
            </div>
            <div className="footer-copyright">
              <p>&copy; 2025 PINOVARA - Universidade Federal da Bahia | Parceria INCRA/UFBA - TED nº 50/2023</p>
            </div>
          </div>
        </div>
      </footer>
      {/* Modal de Imagens */}
      <ImageModal
        images={modalState.images}
        currentIndex={modalState.currentIndex}
        isOpen={modalState.isOpen}
        onClose={closeModal}
      />
    </div>
  );
}

export default Landing;