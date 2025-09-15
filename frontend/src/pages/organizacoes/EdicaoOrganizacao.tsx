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
}

interface EdicaoOrganizacaoProps {
  organizacaoId: number;
  onNavigate: (view: 'dashboard' | 'lista' | 'cadastro' | 'detalhes', organizacaoId?: number) => void;
}

function EdicaoOrganizacao({ organizacaoId, onNavigate }: EdicaoOrganizacaoProps) {
  const { } = useAuth();
  const [organizacao, setOrganizacao] = useState<Organizacao | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [stepAtual, setStepAtual] = useState(1);

  // Dados do formulário
  const [dadosBasicos, setDadosBasicos] = useState({
    nome: '',
    cnpj: '',
    dataFundacao: '',
    telefone: '',
    email: ''
  });

  const [dadosLocalizacao, setDadosLocalizacao] = useState({
    endereco: '',
    bairro: '',
    cep: '',
    estado: '',
    municipio: '',
    gpsLat: 0,
    gpsLng: 0,
    gpsAlt: 0,
    gpsAcc: 0
  });

  const [dadosCaracteristicas, setDadosCaracteristicas] = useState({
    totalSocios: 0,
    totalSociosCaf: 0,
    distintosCaf: 0,
    sociosPaa: 0,
    naosociosPaa: 0,
    sociosPnae: 0,
    naosociosPnae: 0,
    ativosTotal: 0,
    ativosCaf: 0
  });

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
      
      // Preencher formulário com dados existentes
      setDadosBasicos({
        nome: data.nome || '',
        cnpj: data.cnpj || '',
        dataFundacao: data.dataFundacao ? data.dataFundacao.split('T')[0] : '',
        telefone: data.telefone || '',
        email: data.email || ''
      });

      setDadosLocalizacao({
        endereco: data.endereco || '',
        bairro: data.bairro || '',
        cep: data.cep || '',
        estado: data.estado || '',
        municipio: data.municipio || '',
        gpsLat: data.gpsLat || 0,
        gpsLng: data.gpsLng || 0,
        gpsAlt: data.gpsAlt || 0,
        gpsAcc: data.gpsAcc || 0
      });

      if (data.caracteristicas) {
        setDadosCaracteristicas({
          totalSocios: data.caracteristicas.totalSocios || 0,
          totalSociosCaf: data.caracteristicas.totalSociosCaf || 0,
          distintosCaf: data.caracteristicas.distintosCaf || 0,
          sociosPaa: data.caracteristicas.sociosPaa || 0,
          naosociosPaa: data.caracteristicas.naosociosPaa || 0,
          sociosPnae: data.caracteristicas.sociosPnae || 0,
          naosociosPnae: data.caracteristicas.naosociosPnae || 0,
          ativosTotal: data.caracteristicas.ativosTotal || 0,
          ativosCaf: data.caracteristicas.ativosCaf || 0
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleDadosBasicosChange = (field: string, value: string) => {
    setDadosBasicos(prev => ({ ...prev, [field]: value }));
  };

  const handleDadosLocalizacaoChange = (field: string, value: string | number) => {
    setDadosLocalizacao(prev => ({ ...prev, [field]: value }));
  };

  const handleDadosCaracteristicasChange = (field: string, value: number) => {
    setDadosCaracteristicas(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const token = localStorage.getItem('@pinovara:token');
      
      const dadosCompletos = {
        ...dadosBasicos,
        ...dadosLocalizacao,
        caracteristicas: dadosCaracteristicas
      };

      const response = await fetch(`${API_BASE}/organizacoes/${organizacaoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosCompletos)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar organização');
      }

      setSuccess('Organização atualizada com sucesso!');
      
      // Navegar para detalhes após 2 segundos
      setTimeout(() => {
        onNavigate('detalhes', organizacaoId);
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar organização');
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (stepAtual) {
      case 1:
        return (
          <div className="form-step">
            <h3>📝 Dados Básicos da Organização</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Nome da Organização *</label>
                <input
                  type="text"
                  value={dadosBasicos.nome}
                  onChange={(e) => handleDadosBasicosChange('nome', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>CNPJ</label>
                <input
                  type="text"
                  value={dadosBasicos.cnpj}
                  onChange={(e) => handleDadosBasicosChange('cnpj', e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div className="form-group">
                <label>Data de Fundação</label>
                <input
                  type="date"
                  value={dadosBasicos.dataFundacao}
                  onChange={(e) => handleDadosBasicosChange('dataFundacao', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="tel"
                  value={dadosBasicos.telefone}
                  onChange={(e) => handleDadosBasicosChange('telefone', e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  value={dadosBasicos.email}
                  onChange={(e) => handleDadosBasicosChange('email', e.target.value)}
                  placeholder="contato@organizacao.com"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <h3>📍 Localização</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Endereço</label>
                <input
                  type="text"
                  value={dadosLocalizacao.endereco}
                  onChange={(e) => handleDadosLocalizacaoChange('endereco', e.target.value)}
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div className="form-group">
                <label>Bairro</label>
                <input
                  type="text"
                  value={dadosLocalizacao.bairro}
                  onChange={(e) => handleDadosLocalizacaoChange('bairro', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>CEP</label>
                <input
                  type="text"
                  value={dadosLocalizacao.cep}
                  onChange={(e) => handleDadosLocalizacaoChange('cep', e.target.value)}
                  placeholder="00000-000"
                />
              </div>

              <div className="form-group">
                <label>Estado</label>
                <input
                  type="text"
                  value={dadosLocalizacao.estado}
                  onChange={(e) => handleDadosLocalizacaoChange('estado', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Município</label>
                <input
                  type="text"
                  value={dadosLocalizacao.municipio}
                  onChange={(e) => handleDadosLocalizacaoChange('municipio', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Latitude GPS</label>
                <input
                  type="number"
                  step="any"
                  value={dadosLocalizacao.gpsLat}
                  onChange={(e) => handleDadosLocalizacaoChange('gpsLat', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="form-group">
                <label>Longitude GPS</label>
                <input
                  type="number"
                  step="any"
                  value={dadosLocalizacao.gpsLng}
                  onChange={(e) => handleDadosLocalizacaoChange('gpsLng', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="form-group">
                <label>Altitude GPS</label>
                <input
                  type="number"
                  step="any"
                  value={dadosLocalizacao.gpsAlt}
                  onChange={(e) => handleDadosLocalizacaoChange('gpsAlt', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="form-group">
                <label>Precisão GPS</label>
                <input
                  type="number"
                  step="any"
                  value={dadosLocalizacao.gpsAcc}
                  onChange={(e) => handleDadosLocalizacaoChange('gpsAcc', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <h3>👥 Características da Organização</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Total de Sócios</label>
                <input
                  type="number"
                  value={dadosCaracteristicas.totalSocios}
                  onChange={(e) => handleDadosCaracteristicasChange('totalSocios', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Total de Sócios CAF</label>
                <input
                  type="number"
                  value={dadosCaracteristicas.totalSociosCaf}
                  onChange={(e) => handleDadosCaracteristicasChange('totalSociosCaf', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Distintos CAF</label>
                <input
                  type="number"
                  value={dadosCaracteristicas.distintosCaf}
                  onChange={(e) => handleDadosCaracteristicasChange('distintosCaf', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Sócios PAA</label>
                <input
                  type="number"
                  value={dadosCaracteristicas.sociosPaa}
                  onChange={(e) => handleDadosCaracteristicasChange('sociosPaa', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Não Sócios PAA</label>
                <input
                  type="number"
                  value={dadosCaracteristicas.naosociosPaa}
                  onChange={(e) => handleDadosCaracteristicasChange('naosociosPaa', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Sócios PNAE</label>
                <input
                  type="number"
                  value={dadosCaracteristicas.sociosPnae}
                  onChange={(e) => handleDadosCaracteristicasChange('sociosPnae', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Não Sócios PNAE</label>
                <input
                  type="number"
                  value={dadosCaracteristicas.naosociosPnae}
                  onChange={(e) => handleDadosCaracteristicasChange('naosociosPnae', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Ativos Total</label>
                <input
                  type="number"
                  value={dadosCaracteristicas.ativosTotal}
                  onChange={(e) => handleDadosCaracteristicasChange('ativosTotal', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Ativos CAF</label>
                <input
                  type="number"
                  value={dadosCaracteristicas.ativosCaf}
                  onChange={(e) => handleDadosCaracteristicasChange('ativosCaf', parseInt(e.target.value) || 0)}
                  min="0"
                />
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
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Carregando dados da organização...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>❌ {error}</p>
        <button onClick={() => onNavigate('lista')} className="btn btn-primary">
          Voltar para Lista
        </button>
      </div>
    );
  }

  return (
    <div className="edicao-content">
      <div className="content-header">
        <div className="header-info">
          <h2>✏️ Editar Organização</h2>
          <p>{organizacao?.nome}</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={() => onNavigate('detalhes', organizacaoId)} 
            className="btn btn-secondary"
          >
            👁️ Ver Detalhes
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="alert-close">×</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <p>{success}</p>
          <button onClick={() => setSuccess(null)} className="alert-close">×</button>
        </div>
      )}

      <div className="edicao-body">
        {/* Steps Navigation */}
        <div className="steps-container">
          <div className="steps">
            <div className={`step ${stepAtual >= 1 ? 'active' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Dados Básicos</span>
            </div>
            <div className={`step ${stepAtual >= 2 ? 'active' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Localização</span>
            </div>
            <div className={`step ${stepAtual >= 3 ? 'active' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Características</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="form-container">
          {renderStepContent()}

          {/* Navigation */}
          <div className="form-navigation">
            <div className="nav-buttons">
              {stepAtual > 1 && (
                <button
                  onClick={() => setStepAtual(stepAtual - 1)}
                  className="btn btn-secondary"
                >
                  ← Anterior
                </button>
              )}
              
              {stepAtual < 3 ? (
                <button
                  onClick={() => setStepAtual(stepAtual + 1)}
                  className="btn btn-primary"
                >
                  Próximo →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="btn btn-success"
                >
                  {saving ? '💾 Salvando...' : '💾 Salvar Alterações'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EdicaoOrganizacao;
