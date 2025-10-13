import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, TrendingUp, Users, Eye, MousePointer, Clock, Globe, Smartphone } from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import './AnalyticsPanel.css';

interface AnalyticsConfig {
  measurementId: string;
  configured: boolean;
  lastCheck: string;
}

interface SystemMetrics {
  usuarios: {
    total: number;
    ativos: number;
    novosUltimos7Dias: number;
    porRole: Array<{ role: string; count: number }>;
  };
  organizacoes: {
    total: number;
    novasUltimos7Dias: number;
    novasUltimos30Dias: number;
    porEstado: Array<{ estado: string; count: number }>;
    crescimentoDiario: Array<{ data: string; total: number }>;
  };
  tecnicos: {
    total: number;
    organizacoesPorTecnico: Array<{
      tecnico: string;
      email: string;
      totalOrganizacoes: number;
    }>;
  };
  qualidadeDados: {
    organizacoesComGPS: number;
    organizacoesSemGPS: number;
    percentualComGPS: number;
    organizacoesVinculadas: number;
    organizacoesNaoVinculadas: number;
    percentualVinculadas: number;
  };
  atividades: {
    totalAuditLogs: number;
    atividadesPorDia: Array<{ data: string; count: number }>;
    acoesMaisComuns: Array<{ acao: string; count: number }>;
  };
}

function AnalyticsPanel() {
  const [config, setConfig] = useState<AnalyticsConfig | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';
  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

  useEffect(() => {
    // Verificar configuração do Google Analytics
    const analyticsConfig: AnalyticsConfig = {
      measurementId: GA_MEASUREMENT_ID,
      configured: GA_MEASUREMENT_ID !== '',
      lastCheck: new Date().toISOString()
    };
    setConfig(analyticsConfig);

    // Buscar métricas reais do sistema
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('@pinovara:token');

      console.log('🔍 Buscando métricas do sistema...');

      const response = await fetch(`${API_BASE}/admin/analytics/metrics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Erro na resposta:', response.status, errorData);
        throw new Error(errorData.error?.message || `Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Métricas carregadas:', data);
      setMetrics(data.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('❌ Erro ao buscar métricas:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    {
      title: 'Google Analytics Dashboard',
      description: 'Visualize métricas completas em tempo real',
      url: 'https://analytics.google.com',
      icon: BarChart3,
      color: '#4285f4'
    },
    {
      title: 'Relatórios em Tempo Real',
      description: 'Veja quem está online agora',
      url: `https://analytics.google.com/analytics/web/#/realtime/overview/${GA_MEASUREMENT_ID}`,
      icon: TrendingUp,
      color: '#0f9d58'
    },
    {
      title: 'Comportamento do Usuário',
      description: 'Analise fluxos e navegação',
      url: `https://analytics.google.com/analytics/web/#/report/content-pages/${GA_MEASUREMENT_ID}`,
      icon: MousePointer,
      color: '#f4b400'
    },
    {
      title: 'Demografia e Interesses',
      description: 'Conheça seu público',
      url: `https://analytics.google.com/analytics/web/#/report/visitors-overview/${GA_MEASUREMENT_ID}`,
      icon: Users,
      color: '#db4437'
    }
  ];

  const analyticsFeatures = [
    {
      icon: Eye,
      title: 'Visualizações de Página',
      description: 'Monitore as páginas mais acessadas',
      metric: 'Em tempo real',
      color: '#4285f4'
    },
    {
      icon: Users,
      title: 'Usuários Ativos',
      description: 'Veja quantos usuários estão online',
      metric: 'Atualização constante',
      color: '#0f9d58'
    },
    {
      icon: Clock,
      title: 'Tempo Médio',
      description: 'Duração das sessões dos usuários',
      metric: 'Por página',
      color: '#f4b400'
    },
    {
      icon: Globe,
      title: 'Localização',
      description: 'De onde seus usuários acessam',
      metric: 'Por estado/cidade',
      color: '#db4437'
    },
    {
      icon: Smartphone,
      title: 'Dispositivos',
      description: 'Desktop, mobile, tablet',
      metric: 'Breakdown completo',
      color: '#ab47bc'
    },
    {
      icon: MousePointer,
      title: 'Eventos Personalizados',
      description: 'Rastreie ações específicas',
      metric: 'Cliques e conversões',
      color: '#00acc1'
    }
  ];

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Carregando analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <h1>
            <BarChart3 size={32} style={{ verticalAlign: 'middle', marginRight: '12px' }} />
            Analytics e Métricas
          </h1>
          <p>Monitore o uso e performance do sistema PINOVARA</p>
        </div>

        <div className="header-actions">
          <button onClick={fetchMetrics} className="btn btn-secondary" style={{ marginRight: '12px' }}>
            🔄 Atualizar Métricas
          </button>
          <a 
            href="https://analytics.google.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            🚀 Abrir Google Analytics
          </a>
        </div>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          <strong>❌ Erro ao carregar métricas:</strong> {error}
          <button onClick={fetchMetrics} className="btn btn-sm btn-outline" style={{ marginLeft: '12px' }}>
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Status da Configuração */}
      <div className="analytics-config-section">
        <div className="config-card">
          <div className="config-header">
            <h2>⚙️ Configuração do Google Analytics</h2>
            {config?.configured ? (
              <span className="badge badge-success">✓ Configurado</span>
            ) : (
              <span className="badge badge-warning">⚠ Não Configurado</span>
            )}
          </div>

          <div className="config-details">
            {config?.configured ? (
              <>
                <div className="config-item">
                  <label>🔑 Measurement ID:</label>
                  <code>{config.measurementId}</code>
                </div>
                <div className="config-item">
                  <label>📡 Status:</label>
                  <span className="success">✓ Ativo e rastreando</span>
                </div>
                <div className="config-item">
                  <label>⏰ Última verificação:</label>
                  <span>{new Date(config.lastCheck).toLocaleString('pt-BR')}</span>
                </div>
                <div className="config-actions">
                  <a 
                    href={`https://analytics.google.com/analytics/web/#/report-home/${config.measurementId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    Ver Dashboard Completo →
                  </a>
                </div>
              </>
            ) : (
              <div className="config-warning">
                <p><strong>⚠️ Google Analytics não está configurado</strong></p>
                <p>Para habilitar analytics, adicione o Measurement ID nas variáveis de ambiente:</p>
                <code>VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX</code>
                <Link to="/admin/settings" className="btn btn-primary" style={{ marginTop: '16px' }}>
                  Ir para Configurações
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Métricas do Sistema PINOVARA */}
      {!loading && !error && !metrics && (
        <div className="empty-state" style={{ padding: '48px', textAlign: 'center', background: 'white', borderRadius: '12px', marginBottom: '32px' }}>
          <h3>📊 Nenhum dado disponível</h3>
          <p>Não foi possível carregar as métricas do sistema.</p>
          <button onClick={fetchMetrics} className="btn btn-primary" style={{ marginTop: '16px' }}>
            Carregar Métricas
          </button>
        </div>
      )}

      {metrics && (
        <>
          {/* Cards de Resumo */}
          <div className="metrics-summary-section">
            <h2>📊 Resumo Executivo</h2>
            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-icon" style={{ backgroundColor: '#4285f4' }}>
                  <Users size={32} color="white" />
                </div>
                <div className="summary-content">
                  <div className="summary-value">{metrics.usuarios.total}</div>
                  <div className="summary-label">Usuários Totais</div>
                  <div className="summary-sublabel">
                    +{metrics.usuarios.novosUltimos7Dias} nos últimos 7 dias
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon" style={{ backgroundColor: '#0f9d58' }}>
                  <Globe size={32} color="white" />
                </div>
                <div className="summary-content">
                  <div className="summary-value">{metrics.organizacoes.total}</div>
                  <div className="summary-label">Organizações</div>
                  <div className="summary-sublabel">
                    +{metrics.organizacoes.novasUltimos30Dias} no último mês
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon" style={{ backgroundColor: '#f4b400' }}>
                  <TrendingUp size={32} color="white" />
                </div>
                <div className="summary-content">
                  <div className="summary-value">{metrics.qualidadeDados.percentualComGPS}%</div>
                  <div className="summary-label">Com Geolocalização</div>
                  <div className="summary-sublabel">
                    {metrics.qualidadeDados.organizacoesComGPS} de {metrics.organizacoes.total}
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <div className="summary-icon" style={{ backgroundColor: '#db4437' }}>
                  <Eye size={32} color="white" />
                </div>
                <div className="summary-content">
                  <div className="summary-value">{metrics.atividades.totalAuditLogs}</div>
                  <div className="summary-label">Logs de Auditoria</div>
                  <div className="summary-sublabel">
                    Atividades registradas
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficos de Crescimento */}
          <div className="charts-section">
            <h2>📈 Crescimento de Organizações (30 dias)</h2>
            <div className="chart-card">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.organizacoes.crescimentoDiario}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="data" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#056839" 
                    strokeWidth={3}
                    name="Novas Organizações"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribuição por Estado */}
          <div className="charts-section">
            <h2>🌍 Distribuição por Estado (Top 10)</h2>
            <div className="chart-card">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={metrics.organizacoes.porEstado}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="estado" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#056839" name="Organizações" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Qualidade dos Dados */}
          <div className="charts-section">
            <div className="charts-row">
              <div className="chart-half">
                <h3>📍 Geolocalização</h3>
                <div className="chart-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Com GPS', value: metrics.qualidadeDados.organizacoesComGPS },
                          { name: 'Sem GPS', value: metrics.qualidadeDados.organizacoesSemGPS }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#0f9d58" />
                        <Cell fill="#f4b400" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-half">
                <h3>👥 Vínculo com Técnicos</h3>
                <div className="chart-card">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Vinculadas', value: metrics.qualidadeDados.organizacoesVinculadas },
                          { name: 'Não Vinculadas', value: metrics.qualidadeDados.organizacoesNaoVinculadas }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#4285f4" />
                        <Cell fill="#db4437" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Técnicos Mais Ativos */}
          {metrics.tecnicos.organizacoesPorTecnico.length > 0 && (
            <div className="charts-section">
              <h2>👷 Técnicos Mais Ativos</h2>
              <div className="chart-card">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.tecnicos.organizacoesPorTecnico.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tecnico" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalOrganizacoes" fill="#4285f4" name="Organizações" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Atividades Recentes */}
          {metrics.atividades.atividadesPorDia.length > 0 && (
            <div className="charts-section">
              <h2>📅 Atividades dos Últimos 7 Dias</h2>
              <div className="chart-card">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={metrics.atividades.atividadesPorDia}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#db4437" 
                      strokeWidth={2}
                      name="Ações"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {/* Links Rápidos */}
      {config?.configured && (
        <div className="quick-links-section">
          <h2>🔗 Acesso Rápido ao Google Analytics</h2>
          <div className="links-grid">
            {quickLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <a 
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-card"
                >
                  <div className="link-icon" style={{ backgroundColor: link.color }}>
                    <IconComponent size={24} color="white" />
                  </div>
                  <div className="link-content">
                    <h3>{link.title}</h3>
                    <p>{link.description}</p>
                    <span className="link-arrow">→</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Recursos Disponíveis */}
      <div className="features-section">
        <h2>📊 Recursos de Analytics Disponíveis</h2>
        <div className="features-grid">
          {analyticsFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="feature-card">
                <div className="feature-icon" style={{ color: feature.color }}>
                  <IconComponent size={32} />
                </div>
                <div className="feature-content">
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <div className="feature-metric" style={{ color: feature.color }}>
                    {feature.metric}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guia de Uso */}
      <div className="usage-guide-section">
        <h2>📖 Como Usar o Google Analytics</h2>
        <div className="guide-content">
          <div className="guide-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Acesse o Dashboard</h3>
              <p>Clique em "Abrir Google Analytics" no topo desta página ou use os links rápidos acima</p>
            </div>
          </div>

          <div className="guide-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Visualize Tempo Real</h3>
              <p>Na seção "Tempo Real" você verá quantos usuários estão online agora e quais páginas estão visitando</p>
            </div>
          </div>

          <div className="guide-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Analise Relatórios</h3>
              <p>Explore relatórios de aquisição, comportamento e conversão para entender como os usuários usam o sistema</p>
            </div>
          </div>

          <div className="guide-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Crie Alertas Personalizados</h3>
              <p>Configure alertas para ser notificado sobre mudanças importantes no uso do sistema</p>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas Importantes */}
      <div className="metrics-tips-section">
        <h2>💡 Métricas Importantes para Monitorar</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <h3>👥 Usuários Ativos</h3>
            <ul>
              <li>Quantos usuários únicos acessam o sistema</li>
              <li>Horários de pico de uso</li>
              <li>Taxa de retorno de usuários</li>
            </ul>
          </div>

          <div className="tip-card">
            <h3>📄 Páginas Mais Visitadas</h3>
            <ul>
              <li>Quais módulos são mais usados</li>
              <li>Tempo médio em cada página</li>
              <li>Taxa de saída de páginas</li>
            </ul>
          </div>

          <div className="tip-card">
            <h3>🔄 Fluxo de Navegação</h3>
            <ul>
              <li>Como usuários navegam pelo sistema</li>
              <li>Onde abandonam processos</li>
              <li>Caminhos mais comuns</li>
            </ul>
          </div>

          <div className="tip-card">
            <h3>📱 Dispositivos e Navegadores</h3>
            <ul>
              <li>Mobile vs Desktop</li>
              <li>Navegadores mais usados</li>
              <li>Velocidade de carregamento</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Links de Documentação */}
      <div className="documentation-section">
        <h2>📚 Documentação e Recursos</h2>
        <div className="docs-grid">
          <a 
            href="https://support.google.com/analytics" 
            target="_blank" 
            rel="noopener noreferrer"
            className="doc-card"
          >
            <h3>📖 Central de Ajuda do Google Analytics</h3>
            <p>Documentação oficial completa</p>
          </a>

          <a 
            href="https://analytics.google.com/analytics/academy/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="doc-card"
          >
            <h3>🎓 Google Analytics Academy</h3>
            <p>Cursos gratuitos e certificações</p>
          </a>

          <Link to="/admin/settings" className="doc-card">
            <h3>⚙️ Configurações do Sistema</h3>
            <p>Ajustar configurações do Analytics</p>
          </Link>

          <a 
            href="/docs/GOOGLE-ANALYTICS-SETUP.md" 
            target="_blank" 
            rel="noopener noreferrer"
            className="doc-card"
          >
            <h3>📋 Guia de Configuração PINOVARA</h3>
            <p>Documentação técnica do projeto</p>
          </a>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsPanel;

