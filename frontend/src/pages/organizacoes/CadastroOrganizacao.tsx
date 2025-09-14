import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface DadosBasicos {
  nome: string;
  cnpj: string;
  dataFundacao: string;
  telefone: string;
  email: string;
  endereco: string;
  bairro: string;
  cep: string;
}

interface Caracteristicas {
  totalSocios: number;
  totalSociosCaf: number;
  distintosCaf: number;
  sociosPaa: number;
  naosociosPaa: number;
  sociosPnae: number;
  naosociosPnae: number;
  ativosTotal: number;
  ativosCaf: number;
}

interface Localizacao {
  estado: string;
  municipio: string;
  gpsLat: number;
  gpsLng: number;
  gpsAlt: number;
  gpsAcc: number;
}

interface Arquivos {
  fotos: File[];
  documentos: File[];
  observacoes: string;
}

interface CadastroOrganizacaoProps {
  onNavigate: (view: 'dashboard' | 'lista' | 'cadastro' | 'detalhes', organizacaoId?: number) => void;
}

function CadastroOrganizacao({ onNavigate }: CadastroOrganizacaoProps) {
  const { user } = useAuth();
  const [stepAtual, setStepAtual] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dadosBasicos, setDadosBasicos] = useState<DadosBasicos>({
    nome: '',
    cnpj: '',
    dataFundacao: '',
    telefone: '',
    email: '',
    endereco: '',
    bairro: '',
    cep: ''
  });

  const [caracteristicas, setCaracteristicas] = useState<Caracteristicas>({
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

  const [localizacao, setLocalizacao] = useState<Localizacao>({
    estado: '',
    municipio: '',
    gpsLat: 0,
    gpsLng: 0,
    gpsAlt: 0,
    gpsAcc: 0
  });

  const [arquivos, setArquivos] = useState<Arquivos>({
    fotos: [],
    documentos: [],
    observacoes: ''
  });

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

  const steps = [
    { id: 1, title: 'Dados Básicos', icon: '📝' },
    { id: 2, title: 'Características', icon: '📊' },
    { id: 3, title: 'Localização', icon: '📍' },
    { id: 4, title: 'Arquivos', icon: '📎' }
  ];

  const handleDadosBasicosChange = (campo: keyof DadosBasicos, valor: string) => {
    setDadosBasicos(prev => ({ ...prev, [campo]: valor }));
  };

  const handleCaracteristicasChange = (campo: keyof Caracteristicas, valor: number) => {
    setCaracteristicas(prev => ({ ...prev, [campo]: valor }));
  };

  const handleLocalizacaoChange = (campo: keyof Localizacao, valor: string | number) => {
    setLocalizacao(prev => ({ ...prev, [campo]: valor }));
  };

  const handleFileUpload = (tipo: 'fotos' | 'documentos', files: FileList | null) => {
    if (files) {
      setArquivos(prev => ({
        ...prev,
        [tipo]: [...prev[tipo], ...Array.from(files)]
      }));
    }
  };

  const removeFile = (tipo: 'fotos' | 'documentos', index: number) => {
    setArquivos(prev => ({
      ...prev,
      [tipo]: prev[tipo].filter((_, i) => i !== index)
    }));
  };

  const nextStep = () => {
    if (stepAtual < steps.length) {
      setStepAtual(stepAtual + 1);
    }
  };

  const prevStep = () => {
    if (stepAtual > 1) {
      setStepAtual(stepAtual - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('@pinovara:token');
      
      const formData = new FormData();
      
      // Adicionar dados básicos
      Object.entries(dadosBasicos).forEach(([key, value]) => {
        formData.append(key, value);
      });

      // Adicionar características
      Object.entries(caracteristicas).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Adicionar localização
      Object.entries(localizacao).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Adicionar arquivos
      arquivos.fotos.forEach((file, index) => {
        formData.append(`fotos[${index}]`, file);
      });

      arquivos.documentos.forEach((file, index) => {
        formData.append(`documentos[${index}]`, file);
      });

      formData.append('observacoes', arquivos.observacoes);

      const response = await fetch(`${API_BASE}/organizacoes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar organização');
      }

      const result = await response.json();
      
      // Navegar para a página de detalhes da organização criada
      onNavigate('detalhes', result.id);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar organização');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (stepAtual) {
      case 1:
        return (
          <div className="form-step">
            <h3>📝 Dados Básicos da Organização</h3>
            <div className="form-grid">
              <div className="form-group">
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
                />
              </div>

              <div className="form-group">
                <label>Endereço</label>
                <input
                  type="text"
                  value={dadosBasicos.endereco}
                  onChange={(e) => handleDadosBasicosChange('endereco', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Bairro</label>
                <input
                  type="text"
                  value={dadosBasicos.bairro}
                  onChange={(e) => handleDadosBasicosChange('bairro', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>CEP</label>
                <input
                  type="text"
                  value={dadosBasicos.cep}
                  onChange={(e) => handleDadosBasicosChange('cep', e.target.value)}
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="form-step">
            <h3>📊 Características da Organização</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Total de Sócios</label>
                <input
                  type="number"
                  value={caracteristicas.totalSocios}
                  onChange={(e) => handleCaracteristicasChange('totalSocios', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Sócios CAF</label>
                <input
                  type="number"
                  value={caracteristicas.totalSociosCaf}
                  onChange={(e) => handleCaracteristicasChange('totalSociosCaf', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Distintos CAF</label>
                <input
                  type="number"
                  value={caracteristicas.distintosCaf}
                  onChange={(e) => handleCaracteristicasChange('distintosCaf', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Sócios PAA</label>
                <input
                  type="number"
                  value={caracteristicas.sociosPaa}
                  onChange={(e) => handleCaracteristicasChange('sociosPaa', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Não-sócios PAA</label>
                <input
                  type="number"
                  value={caracteristicas.naosociosPaa}
                  onChange={(e) => handleCaracteristicasChange('naosociosPaa', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Sócios PNAE</label>
                <input
                  type="number"
                  value={caracteristicas.sociosPnae}
                  onChange={(e) => handleCaracteristicasChange('sociosPnae', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Não-sócios PNAE</label>
                <input
                  type="number"
                  value={caracteristicas.naosociosPnae}
                  onChange={(e) => handleCaracteristicasChange('naosociosPnae', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Ativos Total</label>
                <input
                  type="number"
                  value={caracteristicas.ativosTotal}
                  onChange={(e) => handleCaracteristicasChange('ativosTotal', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Ativos CAF</label>
                <input
                  type="number"
                  value={caracteristicas.ativosCaf}
                  onChange={(e) => handleCaracteristicasChange('ativosCaf', parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="form-step">
            <h3>📍 Localização da Organização</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Estado *</label>
                <select
                  value={localizacao.estado}
                  onChange={(e) => handleLocalizacaoChange('estado', e.target.value)}
                  required
                >
                  <option value="">Selecione o estado</option>
                  <option value="BA">Bahia</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="ES">Espírito Santo</option>
                </select>
              </div>

              <div className="form-group">
                <label>Município *</label>
                <input
                  type="text"
                  value={localizacao.municipio}
                  onChange={(e) => handleLocalizacaoChange('municipio', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Latitude GPS</label>
                <input
                  type="number"
                  step="any"
                  value={localizacao.gpsLat}
                  onChange={(e) => handleLocalizacaoChange('gpsLat', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="form-group">
                <label>Longitude GPS</label>
                <input
                  type="number"
                  step="any"
                  value={localizacao.gpsLng}
                  onChange={(e) => handleLocalizacaoChange('gpsLng', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="form-group">
                <label>Altitude GPS</label>
                <input
                  type="number"
                  step="any"
                  value={localizacao.gpsAlt}
                  onChange={(e) => handleLocalizacaoChange('gpsAlt', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="form-group">
                <label>Precisão GPS</label>
                <input
                  type="number"
                  step="any"
                  value={localizacao.gpsAcc}
                  onChange={(e) => handleLocalizacaoChange('gpsAcc', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="form-group full-width">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => {
                    // Implementar captura de GPS
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((position) => {
                        setLocalizacao(prev => ({
                          ...prev,
                          gpsLat: position.coords.latitude,
                          gpsLng: position.coords.longitude,
                          gpsAlt: position.coords.altitude || 0,
                          gpsAcc: position.coords.accuracy
                        }));
                      });
                    }
                  }}
                >
                  📍 Capturar Localização Atual
                </button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="form-step">
            <h3>📎 Arquivos e Documentos</h3>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Fotos da Organização</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload('fotos', e.target.files)}
                />
                <div className="file-list">
                  {arquivos.fotos.map((file, index) => (
                    <div key={index} className="file-item">
                      <span>📷 {file.name}</span>
                      <button 
                        type="button"
                        onClick={() => removeFile('fotos', index)}
                        className="btn btn-sm btn-danger"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Documentos</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileUpload('documentos', e.target.files)}
                />
                <div className="file-list">
                  {arquivos.documentos.map((file, index) => (
                    <div key={index} className="file-item">
                      <span>📄 {file.name}</span>
                      <button 
                        type="button"
                        onClick={() => removeFile('documentos', index)}
                        className="btn btn-sm btn-danger"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group full-width">
                <label>Observações</label>
                <textarea
                  value={arquivos.observacoes}
                  onChange={(e) => setArquivos(prev => ({ ...prev, observacoes: e.target.value }))}
                  rows={4}
                  placeholder="Observações adicionais sobre a organização..."
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="cadastro-content">
      <div className="content-header">
        <h2>🏢 Cadastro de Organização</h2>
        <p>Preencha as informações da nova organização</p>
      </div>

      <div className="cadastro-body">
        {/* Progress Steps */}
        <div className="steps-container">
          {steps.map((step) => (
            <div 
              key={step.id} 
              className={`step ${step.id === stepAtual ? 'active' : step.id < stepAtual ? 'completed' : ''}`}
            >
              <div className="step-icon">{step.icon}</div>
              <div className="step-title">{step.title}</div>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="form-container">
          {error && (
            <div className="error-message">
              <p>❌ {error}</p>
            </div>
          )}

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="form-navigation">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={prevStep}
              disabled={stepAtual === 1}
            >
              ← Anterior
            </button>

            <div className="step-info">
              Passo {stepAtual} de {steps.length}
            </div>

            {stepAtual < steps.length ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={nextStep}
              >
                Próximo →
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? '⏳ Salvando...' : '✅ Finalizar Cadastro'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CadastroOrganizacao;
