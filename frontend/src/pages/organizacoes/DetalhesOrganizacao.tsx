import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Organizacao {
  id: number;
  nome: string;
  cnpj: string;
  dataFundacao: string;
  telefone: string;
  email: string;
  endereco: string;
  bairro: string;
  cep: string;
  estado: string;
  municipio: string;
  gpsLat: number;
  gpsLng: number;
  gpsAlt: number;
  gpsAcc: number;
  dataVisita: string;
  status: string;
  caracteristicas: {
    totalSocios: number;
    totalSociosCaf: number;
    distintosCaf: number;
    sociosPaa: number;
    naosociosPaa: number;
    sociosPnae: number;
    naosociosPnae: number;
    ativosTotal: number;
    ativosCaf: number;
  };
  questionarios: {
    go: { completo: boolean; progresso: number };
    gpp: { completo: boolean; progresso: number };
    gc: { completo: boolean; progresso: number };
    gf: { completo: boolean; progresso: number };
    gp: { completo: boolean; progresso: number };
    gs: { completo: boolean; progresso: number };
    gi: { completo: boolean; progresso: number };
    is: { completo: boolean; progresso: number };
  };
  arquivos: Array<{
    id: number;
    nome: string;
    tipo: string;
    url: string;
  }>;
  producoes: Array<{
    id: number;
    cultura: string;
    anual: number;
    mensal: number;
  }>;
  abrangenciaPj: Array<{
    id: number;
    razaoSocial: string;
    cnpjPj: string;
    numSociosCaf: number;
    numSociosTotal: number;
  }>;
  abrangenciaSocio: Array<{
    id: number;
    numSocios: number;
    estado: string;
    municipio: string;
  }>;
}

interface DetalhesOrganizacaoProps {
  organizacaoId: number;
  onNavigate: (view: 'dashboard' | 'lista' | 'cadastro' | 'detalhes', organizacaoId?: number) => void;
}

function DetalhesOrganizacao({ organizacaoId }: DetalhesOrganizacaoProps) {
  const { } = useAuth();
  const [organizacao, setOrganizacao] = useState<Organizacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [abaAtiva, setAbaAtiva] = useState('geral');

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

  useEffect(() => {
    if (organizacaoId) {
      fetchOrganizacao();
    }
  }, [organizacaoId]);

  const fetchOrganizacao = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('@pinovara:token');
      
      const response = await fetch(`${API_BASE}/organizacoes/${organizacaoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar organização');
      }

      const data = await response.json();
      setOrganizacao(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const abas = [
    { id: 'geral', label: 'Informações Gerais', icon: '📋' },
    { id: 'questionarios', label: 'Questionários', icon: '📝' },
    { id: 'arquivos', label: 'Arquivos', icon: '📎' },
    { id: 'producao', label: 'Produção', icon: '🌾' },
    { id: 'abrangencia', label: 'Abrangência', icon: '🌍' }
  ];

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'completo': { text: 'Completo', class: 'status-complete' },
      'pendente': { text: 'Pendente', class: 'status-pending' },
      'rascunho': { text: 'Rascunho', class: 'status-draft' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { text: status, class: 'status-unknown' };
    
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const renderAbaConteudo = () => {
    if (!organizacao) return null;

    switch (abaAtiva) {
      case 'geral':
        return (
          <div className="tab-content">
            <div className="info-grid">
              <div className="info-section">
                <h3>📋 Dados Básicos</h3>
                <div className="info-list">
                  <div className="info-item">
                    <label>Nome:</label>
                    <span>{organizacao.nome}</span>
                  </div>
                  <div className="info-item">
                    <label>CNPJ:</label>
                    <span>{organizacao.cnpj || '-'}</span>
                  </div>
                  <div className="info-item">
                    <label>Data de Fundação:</label>
                    <span>{organizacao.dataFundacao ? new Date(organizacao.dataFundacao).toLocaleDateString('pt-BR') : '-'}</span>
                  </div>
                  <div className="info-item">
                    <label>Telefone:</label>
                    <span>{organizacao.telefone || '-'}</span>
                  </div>
                  <div className="info-item">
                    <label>E-mail:</label>
                    <span>{organizacao.email || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3>📍 Localização</h3>
                <div className="info-list">
                  <div className="info-item">
                    <label>Endereço:</label>
                    <span>{organizacao.endereco || '-'}</span>
                  </div>
                  <div className="info-item">
                    <label>Bairro:</label>
                    <span>{organizacao.bairro || '-'}</span>
                  </div>
                  <div className="info-item">
                    <label>CEP:</label>
                    <span>{organizacao.cep || '-'}</span>
                  </div>
                  <div className="info-item">
                    <label>Município:</label>
                    <span>{organizacao.municipio}</span>
                  </div>
                  <div className="info-item">
                    <label>Estado:</label>
                    <span>{organizacao.estado}</span>
                  </div>
                  <div className="info-item">
                    <label>GPS:</label>
                    <span>{organizacao.gpsLat}, {organizacao.gpsLng}</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3>📊 Características</h3>
                <div className="info-list">
                  <div className="info-item">
                    <label>Total de Sócios:</label>
                    <span>{organizacao.caracteristicas.totalSocios}</span>
                  </div>
                  <div className="info-item">
                    <label>Sócios CAF:</label>
                    <span>{organizacao.caracteristicas.totalSociosCaf}</span>
                  </div>
                  <div className="info-item">
                    <label>Distintos CAF:</label>
                    <span>{organizacao.caracteristicas.distintosCaf}</span>
                  </div>
                  <div className="info-item">
                    <label>Sócios PAA:</label>
                    <span>{organizacao.caracteristicas.sociosPaa}</span>
                  </div>
                  <div className="info-item">
                    <label>Sócios PNAE:</label>
                    <span>{organizacao.caracteristicas.sociosPnae}</span>
                  </div>
                  <div className="info-item">
                    <label>Ativos Total:</label>
                    <span>{organizacao.caracteristicas.ativosTotal}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'questionarios':
        return (
          <div className="tab-content">
            <h3>📝 Status dos Questionários</h3>
            <div className="questionarios-grid">
              {Object.entries(organizacao.questionarios).map(([key, questionario]) => {
                const nomeCompleto = {
                  go: 'Gestão Organizacional',
                  gpp: 'Gestão de Processos e Produção',
                  gc: 'Gestão Comercial',
                  gf: 'Gestão Financeira',
                  gp: 'Gestão de Pessoas',
                  gs: 'Gestão Socioambiental',
                  gi: 'Gestão de Inovação',
                  is: 'Infraestrutura e Sustentabilidade'
                }[key] || key.toUpperCase();

                return (
                  <div key={key} className="questionario-card">
                    <div className="questionario-header">
                      <h4>{nomeCompleto}</h4>
                      <span className={`status-badge ${questionario.completo ? 'status-complete' : 'status-pending'}`}>
                        {questionario.completo ? 'Completo' : 'Pendente'}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${questionario.progresso}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">{questionario.progresso}% concluído</div>
                    <button className="btn btn-primary btn-sm">
                      {questionario.completo ? 'Revisar' : 'Continuar'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'arquivos':
        return (
          <div className="tab-content">
            <h3>📎 Arquivos e Documentos</h3>
            <div className="arquivos-grid">
              {organizacao.arquivos.map((arquivo) => (
                <div key={arquivo.id} className="arquivo-card">
                  <div className="arquivo-icon">
                    {arquivo.tipo === 'image' ? '🖼️' : '📄'}
                  </div>
                  <div className="arquivo-info">
                    <h4>{arquivo.nome}</h4>
                    <p>Tipo: {arquivo.tipo}</p>
                  </div>
                  <div className="arquivo-actions">
                    <button className="btn btn-sm btn-primary">👁️ Ver</button>
                    <button className="btn btn-sm btn-secondary">⬇️ Baixar</button>
                  </div>
                </div>
              ))}
              {organizacao.arquivos.length === 0 && (
                <div className="empty-state">
                  <p>Nenhum arquivo anexado</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'producao':
        return (
          <div className="tab-content">
            <h3>🌾 Dados de Produção</h3>
            <div className="producao-table">
              {organizacao.producoes.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Cultura</th>
                      <th>Produção Anual</th>
                      <th>Produção Mensal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {organizacao.producoes.map((producao) => (
                      <tr key={producao.id}>
                        <td>{producao.cultura}</td>
                        <td>{producao.anual.toLocaleString('pt-BR')} kg</td>
                        <td>{producao.mensal.toLocaleString('pt-BR')} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <p>Nenhum dado de produção cadastrado</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'abrangencia':
        return (
          <div className="tab-content">
            <div className="abrangencia-sections">
              <div className="abrangencia-section">
                <h3>🏢 Pessoa Jurídica</h3>
                {organizacao.abrangenciaPj.length > 0 ? (
                  <div className="abrangencia-list">
                    {organizacao.abrangenciaPj.map((pj) => (
                      <div key={pj.id} className="abrangencia-item">
                        <h4>{pj.razaoSocial}</h4>
                        <p>CNPJ: {pj.cnpjPj}</p>
                        <p>Sócios CAF: {pj.numSociosCaf}</p>
                        <p>Total de Sócios: {pj.numSociosTotal}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Nenhuma pessoa jurídica cadastrada</p>
                )}
              </div>

              <div className="abrangencia-section">
                <h3>👥 Sócios</h3>
                {organizacao.abrangenciaSocio.length > 0 ? (
                  <div className="abrangencia-list">
                    {organizacao.abrangenciaSocio.map((socio) => (
                      <div key={socio.id} className="abrangencia-item">
                        <p>Número de Sócios: {socio.numSocios}</p>
                        <p>Localização: {socio.municipio} - {socio.estado}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Nenhum dado de sócios cadastrado</p>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="detalhes-content">
        <div className="content-header">
          <h2>🏢 Detalhes da Organização</h2>
          <p>Carregando informações...</p>
        </div>
        <div className="loading-spinner">⏳</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detalhes-content">
        <div className="content-header">
          <h2>🏢 Detalhes da Organização</h2>
          <p>Erro ao carregar dados</p>
        </div>
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={fetchOrganizacao} className="btn btn-primary">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!organizacao) {
    return (
      <div className="detalhes-content">
        <div className="content-header">
          <h2>🏢 Detalhes da Organização</h2>
          <p>Organização não encontrada</p>
        </div>
        <div className="empty-state">
          <p>❌ Organização não encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="detalhes-content">
      <div className="content-header">
        <div className="header-info">
          <h2>🏢 {organizacao.nome}</h2>
          <p>{organizacao.municipio} - {organizacao.estado}</p>
          <div className="header-meta">
            <span>ID: {organizacao.id}</span>
            <span>Status: {getStatusBadge(organizacao.status)}</span>
            <span>Última visita: {organizacao.dataVisita ? new Date(organizacao.dataVisita).toLocaleDateString('pt-BR') : '-'}</span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">✏️ Editar</button>
          <button className="btn btn-primary">📝 Questionário</button>
          <button className="btn btn-success">📊 Relatório</button>
        </div>
      </div>

      <div className="detalhes-body">
        {/* Tabs Navigation */}
        <div className="tabs-navigation">
          {abas.map((aba) => (
            <button
              key={aba.id}
              className={`tab-button ${abaAtiva === aba.id ? 'active' : ''}`}
              onClick={() => setAbaAtiva(aba.id)}
            >
              <span className="tab-icon">{aba.icon}</span>
              <span className="tab-label">{aba.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderAbaConteudo()}
      </div>
    </div>
  );
}

export default DetalhesOrganizacao;
