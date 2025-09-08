import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Landing() {
  const { user } = useAuth();

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="container">
          <div className="logo">
            <h1>PINOVARA</h1>
            <p>Sistema Completo de Gestão</p>
          </div>
          
          <nav className="nav">
            {user ? (
              <div className="user-nav">
                <span>Olá, {user.name}</span>
                <Link to="/pinovara" className="btn btn-primary">
                  PINOVARA
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
              <h2>Sistema Modular com Controle de Acesso</h2>
              <p>
                Gerencie usuários, módulos e permissões de forma eficiente. 
                Sistema completo desenvolvido com React + TypeScript no frontend 
                e Node.js + Express + PostgreSQL no backend.
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
                    Ir para PINOVARA
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="features">
          <div className="container">
            <h3>Funcionalidades Principais</h3>
            
            <div className="features-grid">
              <div className="feature">
                <div className="feature-icon">🔐</div>
                <h4>Autenticação Segura</h4>
                <p>Sistema de login com JWT, criptografia bcrypt e rate limiting.</p>
              </div>
              
              <div className="feature">
                <div className="feature-icon">👥</div>
                <h4>Gerenciamento de Usuários</h4>
                <p>Cadastro, edição e controle de status de usuários do sistema.</p>
              </div>
              
              <div className="feature">
                <div className="feature-icon">🏗️</div>
                <h4>Sistema Modular</h4>
                <p>Organize funcionalidades em módulos independentes.</p>
              </div>
              
              <div className="feature">
                <div className="feature-icon">🛡️</div>
                <h4>Controle de Papéis</h4>
                <p>Defina papéis específicos para cada módulo do sistema.</p>
              </div>
              
              <div className="feature">
                <div className="feature-icon">⚡</div>
                <h4>Alta Performance</h4>
                <p>Desenvolvido com as melhores práticas e tecnologias modernas.</p>
              </div>
              
              <div className="feature">
                <div className="feature-icon">📊</div>
                <h4>Interface Moderna</h4>
                <p>UI/UX responsiva e intuitiva desenvolvida em React.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="tech-stack">
          <div className="container">
            <h3>Stack Tecnológica</h3>
            
            <div className="tech-grid">
              <div className="tech-category">
                <h4>Frontend</h4>
                <ul>
                  <li>React 18</li>
                  <li>TypeScript</li>
                  <li>Vite</li>
                  <li>React Router</li>
                  <li>Axios</li>
                </ul>
              </div>
              
              <div className="tech-category">
                <h4>Backend</h4>
                <ul>
                  <li>Node.js</li>
                  <li>Express.js</li>
                  <li>TypeScript</li>
                  <li>Prisma ORM</li>
                  <li>JWT + bcrypt</li>
                </ul>
              </div>
              
              <div className="tech-category">
                <h4>Banco de Dados</h4>
                <ul>
                  <li>PostgreSQL</li>
                  <li>Relacionamentos</li>
                  <li>Indexes</li>
                  <li>Constraints</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2024 PINOVARA. Sistema desenvolvido com as melhores práticas.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;