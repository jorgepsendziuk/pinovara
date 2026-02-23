import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMeuAcessoSemPapel } from '../hooks/useMeuAcessoSemPapel';
import Sidebar from '../components/Sidebar';
import VersionIndicator from '../components/VersionIndicator';
import TermosUso from '../components/TermosUso';
import {
  Users,
  Building,
  Map as MapIcon,
  GraduationCap,
  Calendar,
  MapPin,
  Archive,
  Smartphone,
  FileCheck,
  Edit,
  Mail,
  SunDim,
  Sun,
  MoonStar,
  Info,
  Shield
} from 'lucide-react';

function Dashboard() {
  const { user, hasPermission, logout } = useAuth();
  const hasNoRoles = !user?.roles || user.roles.length === 0;
  const { data: acesso, loading: acessoLoading } = useMeuAcessoSemPapel(!!user && hasNoRoles);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mostrarTermos, setMostrarTermos] = useState(false);

  useEffect(() => {
    // Verificar se usuário já aceitou os termos
    const termosAceitos = localStorage.getItem('termos_aceitos');
    const cookieTermos = document.cookie.split(';').find(c => c.trim().startsWith('termos_aceitos='));
    
    if (!termosAceitos && !cookieTermos) {
      setMostrarTermos(true);
    }
  }, []);

  const handleAcceptTermos = () => {
    // Salvar no localStorage
    localStorage.setItem('termos_aceitos', 'true');
    
    // Criar cookie com validade de 1 ano
    const dataExpiracao = new Date();
    dataExpiracao.setFullYear(dataExpiracao.getFullYear() + 1);
    document.cookie = `termos_aceitos=true; expires=${dataExpiracao.toUTCString()}; path=/; SameSite=Lax`;
    
    setMostrarTermos(false);
  };

  const handleDeclineTermos = () => {
    // Fazer logout e redirecionar para landing
    logout();
    navigate('/');
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  const isAdmin = hasPermission('sistema', 'admin');

  const h = new Date().getHours();
  const override = searchParams.get('greeting');
  const getGreeting = () => {
    if (override === 'manha') return 'Bom dia';
    if (override === 'tarde') return 'Boa tarde';
    if (override === 'noite') return 'Boa noite';
    if (h >= 5 && h < 12) return 'Bom dia';
    if (h >= 12 && h < 18) return 'Boa tarde';
    return 'Boa noite';
  };
  const getGreetingIcon = () => {
    if (override === 'manha') return SunDim;
    if (override === 'tarde') return Sun;
    if (override === 'noite') return MoonStar;
    if (h >= 5 && h < 12) return SunDim;
    if (h >= 12 && h < 18) return Sun;
    return MoonStar;
  };
  const GreetingIcon = getGreetingIcon();

  return (
    <div className="dashboard-layout">
      {/* Modal de Termos de Uso */}
      {mostrarTermos && (
        <TermosUso
          onAccept={handleAcceptTermos}
          onDecline={handleDeclineTermos}
        />
      )}

      {/* Indicador de versão com informações da sessão integradas */}
      <VersionIndicator position="top-right" theme="auto" />
      
      <Sidebar />

      <div className="main-content">
        <main className="dashboard-main dashboard-main-with-greeting">
          <div className="dashboard-greeting-bg-icon" aria-hidden>
            <GreetingIcon size={120} strokeWidth={1.2} />
          </div>
          <div className="container">
            {/* Informações do Perfil */}
            <div 
              className="profile-card-content profile-card-transparent"
              onClick={() => navigate('/perfil')}
              title="Clique para editar perfil"
            >
              <div className="profile-avatar-section"
              onClick={() => navigate('/perfil')}
              title="Clique para editar perfil"
            >
                <div className="profile-info">
                  <h3 className="profile-name">
                    <span className="profile-greeting">{getGreeting()},</span> {user.name}
                  </h3>
                  <span className="profile-email">
                    <Mail size={14} />
                    {user.email}
                  </span>
                  {user.roles && user.roles.length > 0 && (
                    <span className="profile-roles">
                      {user.roles.map((role: any) => role.name).join(', ')}
                    </span>
                  )}
                </div>
                <div className="profile-edit-icon">
                <Edit size={18} />
              </div>
              </div>

            </div>

            {/* Categorias e Cards */}
            <div className="dashboard-categories">
              {/* Usuário sem papéis: mostrar apenas capacitações inscrito e organizações associadas */}
              {hasNoRoles && (
                acessoLoading ? (
                  <div className="category-section">
                    <p style={{ color: '#666', textAlign: 'center' }}>Carregando seus acessos...</p>
                  </div>
                ) : acesso && (acesso.capacitacoesInscrito > 0 || acesso.organizacoesAssociadas > 0) ? (
                  <>
                    {acesso.capacitacoesInscrito > 0 && (
                      <div className="category-section">
                        <h2 className="category-title">Minhas Capacitações</h2>
                        <p className="category-subtitle" style={{ fontSize: '0.9em', color: '#666', marginBottom: '1rem' }}>
                          Você está inscrito em {acesso.capacitacoesInscrito} capacitação(ões) com este email
                        </p>
                        <div className="cards-grid">
                          <div className="dashboard-card" onClick={() => navigate('/capacitacoes')}>
                            <div className="card-icon">
                              <Calendar size={20} />
                            </div>
                            <h3 className="card-title">Capacitações</h3>
                          </div>
                        </div>
                      </div>
                    )}
                    {acesso.organizacoesAssociadas > 0 && (
                      <div className="category-section">
                        <h2 className="category-title">Minhas Organizações</h2>
                        <p className="category-subtitle" style={{ fontSize: '0.9em', color: '#666', marginBottom: '1rem' }}>
                          Este email está cadastrado em {acesso.organizacoesAssociadas} organização(ões)
                        </p>
                        <div className="cards-grid">
                          <div className="dashboard-card" onClick={() => navigate('/organizacoes/lista')}>
                            <div className="card-icon">
                              <Building size={20} />
                            </div>
                            <h3 className="card-title">Organizações</h3>
                          </div>
                          <div className="dashboard-card" onClick={() => navigate('/organizacoes/mapa')}>
                            <div className="card-icon">
                              <MapIcon size={20} />
                            </div>
                            <h3 className="card-title">Mapa de Organizações</h3>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="category-section" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                      <Info size={48} color="#888" strokeWidth={1.2} />
                    </div>
                    <h2 className="category-title" style={{ marginBottom: '0.5rem' }}>Bem-vindo ao PINOVARA!</h2>
                    <p style={{ color: '#666', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
                      Você ainda não possui permissões ou vínculos cadastrados. Entre em contato com a equipe do projeto
                      para solicitar acesso às capacitações ou organizações, ou aguarde o processamento do seu cadastro.
                    </p>
                  </div>
                )
              )}

              {/* Usuário com papéis: dashboard completo */}
              {!hasNoRoles && (
              <>
              {/* Perfil de Entrada e Plano de Gestão */}
              <div className="category-section">
                <h2 className="category-title">Perfil de Entrada e Plano de Gestão</h2>
                <div className="cards-grid">
                  <div className="dashboard-card" onClick={() => navigate('/organizacoes/lista')}>
                    <div className="card-icon">
                      <Building size={20} />
                    </div>
                    <h3 className="card-title">Organizações</h3>
                  </div>
                  <div className="dashboard-card" onClick={() => navigate('/organizacoes/mapa')}>
                    <div className="card-icon">
                      <MapIcon size={20} />
                    </div>
                    <h3 className="card-title">Mapa de Organizações</h3>
                  </div>
                </div>
              </div>

              {/* Qualificação e Formação Profissional */}
              <div className="category-section">
                <h2 className="category-title">Qualificação e Formação Profissional</h2>
                <div className="cards-grid">
                  <div className="dashboard-card" onClick={() => navigate('/qualificacoes')}>
                    <div className="card-icon">
                      <GraduationCap size={20} />
                    </div>
                    <h3 className="card-title">Planos de Qualificação</h3>
                  </div>
                  <div className="dashboard-card" onClick={() => navigate('/capacitacoes')}>
                    <div className="card-icon">
                      <Calendar size={20} />
                    </div>
                    <h3 className="card-title">Capacitações</h3>
                  </div>
                </div>
              </div>

              {/* Cadastro de Famílias */}
              <div className="category-section">
                <h2 className="category-title">Cadastro de Famílias</h2>
                <div className="cards-grid">
                  <div className="dashboard-card" onClick={() => navigate('/familias/territorios')}>
                    <div className="card-icon">
                      <MapPin size={20} />
                    </div>
                    <h3 className="card-title">Territórios</h3>
                  </div>
                  <div className="dashboard-card" onClick={() => navigate('/familias')}>
                    <div className="card-icon">
                      <Users size={20} />
                    </div>
                    <h3 className="card-title">Famílias</h3>
                  </div>
                  <div className="dashboard-card" onClick={() => navigate('/familias/mapa')}>
                    <div className="card-icon">
                      <MapIcon size={20} />
                    </div>
                    <h3 className="card-title">Mapa de Cadastros</h3>
                  </div>
                </div>
              </div>

              {/* Administração (apenas para admins) */}
              {isAdmin && (
                <div className="category-section">
                  <h2 className="category-title">Administração</h2>
                  <div className="cards-grid">
                    <div className="dashboard-card" onClick={() => navigate('/admin/users')}>
                      <div className="card-icon">
                        <Users size={20} />
                      </div>
                      <h3 className="card-title">Usuários</h3>
                    </div>
                    <div className="dashboard-card" onClick={() => navigate('/admin/roles')}>
                      <div className="card-icon">
                        <Shield size={20} />
                      </div>
                      <h3 className="card-title">Módulos e Papéis</h3>
                    </div>
                    <div className="dashboard-card" onClick={() => navigate('/admin/audit-logs')}>
                      <div className="card-icon">
                        <FileCheck size={20} />
                      </div>
                      <h3 className="card-title">Auditoria</h3>
                    </div>
                  </div>
                </div>
              )}

              {/* Outros */}
              <div className="category-section">
                <h2 className="category-title">Outros</h2>
                <div className="cards-grid">
                  <div className="dashboard-card" onClick={() => navigate('/repositorio')}>
                    <div className="card-icon">
                      <Archive size={20} />
                    </div>
                    <h3 className="card-title">Repositório</h3>
                  </div>
                  <div className="dashboard-card" onClick={() => navigate('/configuracao-odk')}>
                    <div className="card-icon">
                      <Smartphone size={20} />
                    </div>
                    <h3 className="card-title">Configuração ODK</h3>
                  </div>
                </div>
              </div>
              </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
