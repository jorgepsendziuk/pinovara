import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Organizacao {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string | null;
  email: string | null;
  estado: number | null;
  municipio: number | null;
  gpsLat: number | null;
  gpsLng: number | null;
  gpsAlt: number | null;
  gpsAcc: number | null;
  dataFundacao: string | null;
  inicio: string | null;
  fim: string | null;
  deviceid: string | null;
  dataVisita: string | null;
  metaInstanceId: string | null;
  metaInstanceName: string | null;
  removido: boolean;
  idTecnico: number | null;
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
  const [abaAtiva, setAbaAtiva] = useState<'organizacao' | 'diagnostico'>('organizacao');
  const [accordionAberto, setAccordionAberto] = useState<string | null>('dados-basicos');

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

  const [dadosAssociadosCARF, setDadosAssociadosCARF] = useState({
    // AGR.FAM
    taAfMulher: 0,
    taAfHomem: 0,
    // ASSENTADO
    taAMulher: 0,
    taAHomem: 0,
    // PESCADOR
    taPMulher: 0,
    taPHomem: 0,
    // INDÍGENA
    taIMulher: 0,
    taIHomem: 0,
    // QUILOMBOLA
    taQMulher: 0,
    taQHomem: 0,
    // EXTRATIVISTA
    taEMulher: 0,
    taEHomem: 0,
    // OUTRO
    taOMulher: 0,
    taOHomem: 0
  });

  const [dadosCafTipos, setDadosCafTipos] = useState({
    // ORGÂNICO
    taCafOrganico: 0,
    // AGROECOLÓGICO
    taCafAgroecologico: 0,
    // EM TRANSIÇÃO
    taCafTransicao: 0,
    // CONVENCIONAL
    taCafConvencional: 0
  });

  const [dadosNaosocios, setDadosNaosocios] = useState({
    // NÃO SÓCIOS TOTAL
    naosocioOpTotal: 0,
    // NÃO SÓCIOS COM DAP
    naosocioOpCaf: 0
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
        endereco: '', // Campo não existe na API
        bairro: '', // Campo não existe na API
        cep: '', // Campo não existe na API
        estado: data.estado?.toString() || '',
        municipio: data.municipio?.toString() || '',
        gpsLat: data.gpsLat || 0,
        gpsLng: data.gpsLng || 0,
        gpsAlt: data.gpsAlt || 0,
        gpsAcc: data.gpsAcc || 0
      });

      // Características não existem na API atual, manter valores padrão
      setDadosCaracteristicas({
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

  const handleDadosAssociadosCARFChange = (field: string, value: number) => {
    setDadosAssociadosCARF(prev => ({ ...prev, [field]: value }));
  };

  const handleDadosCaracteristicasChange = (field: string, value: number) => {
    setDadosCaracteristicas(prev => ({ ...prev, [field]: value }));
  };

  const handleDadosCafTiposChange = (field: string, value: number) => {
    setDadosCafTipos(prev => ({ ...prev, [field]: value }));
  };

  const handleDadosNaosociosChange = (field: string, value: number) => {
    setDadosNaosocios(prev => ({ ...prev, [field]: value }));
  };


  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const token = localStorage.getItem('@pinovara:token');
      
      const dadosCompletos = {
        ...dadosBasicos,
        ...dadosLocalizacao,
        caracteristicas: dadosCaracteristicas,
        ...dadosAssociadosCARF,
        ...dadosCafTipos,
        ...dadosNaosocios
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

  const toggleAccordion = (accordionId: string) => {
    setAccordionAberto(accordionAberto === accordionId ? null : accordionId);
  };

  const renderAbaOrganizacao = () => (
    <div className="aba-content">
      <div className="accordions-container">
        {/* Accordion Dados Básicos */}
        <div className="accordion-item">
          <button
            className="accordion-header"
            onClick={() => toggleAccordion('dados-basicos')}
          >
            <h3>📝 Dados Básicos da Organização</h3>
            <span className={`accordion-icon ${accordionAberto === 'dados-basicos' ? 'open' : ''}`}>
              ▼
            </span>
          </button>
          <div className={`accordion-content ${accordionAberto === 'dados-basicos' ? 'open' : ''}`}>
            <div className="accordion-section">
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
          </div>
        </div>

        {/* Accordion Localização */}
        <div className="accordion-item">
          <button
            className="accordion-header"
            onClick={() => toggleAccordion('localizacao')}
          >
            <h3>📍 Localização</h3>
            <span className={`accordion-icon ${accordionAberto === 'localizacao' ? 'open' : ''}`}>
              ▼
            </span>
          </button>
          <div className={`accordion-content ${accordionAberto === 'localizacao' ? 'open' : ''}`}>
            <div className="accordion-section">
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

              </div>
            </div>
          </div>
        </div>

        {/* Accordion Características dos Associados */}
        <div className="accordion-item">
          <button
            className="accordion-header"
            onClick={() => toggleAccordion('caracteristicas-associados')}
          >
            <h3>👥 Características dos Associados Pessoa Física e da Base Produtiva</h3>
            <span className={`accordion-icon ${accordionAberto === 'caracteristicas-associados' ? 'open' : ''}`}>
              ▼
            </span>
          </button>
          <div className={`accordion-content ${accordionAberto === 'caracteristicas-associados' ? 'open' : ''}`}>
            <div className="accordion-section">
        {/* Campos de Sócios */}
        <div className="socios-summary">
          <div className="form-grid">
            <div className="form-group">
              <label>Nº. Total de Sócios no Presente Momento (com e sem CARF)</label>
              <input
                type="number"
                value={dadosCaracteristicas.totalSocios}
                onChange={(e) => handleDadosCaracteristicasChange('totalSocios', parseInt(e.target.value) || 0)}
                min="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Nº. Total de Sócios no Presente Momento com CARF ("nº. de CPF")</label>
              <input
                type="number"
                value={dadosCaracteristicas.totalSociosCaf}
                onChange={(e) => handleDadosCaracteristicasChange('totalSociosCaf', parseInt(e.target.value) || 0)}
                min="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>% Sócios com CARF</label>
              <input
                type="text"
                value={dadosCaracteristicas.totalSocios > 0 ? 
                  ((dadosCaracteristicas.totalSociosCaf / dadosCaracteristicas.totalSocios) * 100).toFixed(1) + '%' : '0%'}
                readOnly
                className="form-input readonly"
              />
            </div>

            <div className="form-group">
              <label>Nº. de CARF Distintas no Empreendimento ("nº. de Famílias")</label>
              <input
                type="number"
                value={dadosCaracteristicas.distintosCaf}
                onChange={(e) => handleDadosCaracteristicasChange('distintosCaf', parseInt(e.target.value) || 0)}
                min="0"
                className="form-input"
              />
            </div>

          </div>
        </div>

        {/* Tabela Total de Associados com CARF */}
        <div className="table-container">
          <table className="associados-carf-table">
            <thead>
              <tr>
                <th rowSpan={3} className="header-cell">Total de Associados com CARF</th>
                <th>AGR.FAM</th>
                <th>ASSENTADO</th>
                <th>PESCADOR</th>
                <th>INDÍGENA</th>
                <th>QUILOMBOLA</th>
                <th>EXTRATIVISTA</th>
                <th>OUTRO</th>
                <th rowSpan={3} className="header-cell">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr className="data-row">
                <td className="row-label">Nº. de Homens</td>
                <td>
                  <input
                    type="number"
                    value={dadosAssociadosCARF.taAfHomem}
                    onChange={(e) => handleDadosAssociadosCARFChange('taAfHomem', parseInt(e.target.value) || 0)}
                    min="0"
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={dadosAssociadosCARF.taAHomem}
                    onChange={(e) => handleDadosAssociadosCARFChange('taAHomem', parseInt(e.target.value) || 0)}
                    min="0"
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={dadosAssociadosCARF.taPHomem}
                    onChange={(e) => handleDadosAssociadosCARFChange('taPHomem', parseInt(e.target.value) || 0)}
                    min="0"
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={dadosAssociadosCARF.taIHomem}
                    onChange={(e) => handleDadosAssociadosCARFChange('taIHomem', parseInt(e.target.value) || 0)}
                    min="0"
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={dadosAssociadosCARF.taQHomem}
                    onChange={(e) => handleDadosAssociadosCARFChange('taQHomem', parseInt(e.target.value) || 0)}
                    min="0"
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={dadosAssociadosCARF.taEHomem}
                    onChange={(e) => handleDadosAssociadosCARFChange('taEHomem', parseInt(e.target.value) || 0)}
                    min="0"
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={dadosAssociadosCARF.taOHomem}
                    onChange={(e) => handleDadosAssociadosCARFChange('taOHomem', parseInt(e.target.value) || 0)}
                    min="0"
                    className="table-input"
                  />
                </td>
                <td className="total-cell">
                  {dadosAssociadosCARF.taAfHomem + dadosAssociadosCARF.taAHomem + dadosAssociadosCARF.taPHomem + 
                   dadosAssociadosCARF.taIHomem + dadosAssociadosCARF.taQHomem + dadosAssociadosCARF.taEHomem + 
                   dadosAssociadosCARF.taOHomem}
                </td>
              </tr>
              <tr className="data-row">
                <td className="row-label">Nº. de Mulheres</td>
                <td>
                  <input
                    type="number"
                    value={dadosAssociadosCARF.taAfMulher}
                    onChange={(e) => handleDadosAssociadosCARFChange('taAfMulher', parseInt(e.target.value) || 0)}
                    min="0"
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={dadosAssociadosCARF.taAMulher}
                    onChange={(e) => handleDadosAssociadosCARFChange('taAMulher', parseInt(e.target.value) || 0)}
                    min="0"
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={dadosAssociadosCARF.taPMulher}
                    onChange={(e) => handleDadosAssociadosCARFChange('taPMulher', parseInt(e.target.value) || 0)}
                    min="0"
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={dadosAssociadosCARF.taIMulher}
                    onChange={(e) => handleDadosAssociadosCARFChange('taIMulher', parseInt(e.target.value) || 0)}
                    min="0"
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={dadosAssociadosCARF.taQMulher}
                    onChange={(e) => handleDadosAssociadosCARFChange('taQMulher', parseInt(e.target.value) || 0)}
                    min="0"
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={dadosAssociadosCARF.taEMulher}
                    onChange={(e) => handleDadosAssociadosCARFChange('taEMulher', parseInt(e.target.value) || 0)}
                    min="0"
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={dadosAssociadosCARF.taOMulher}
                    onChange={(e) => handleDadosAssociadosCARFChange('taOMulher', parseInt(e.target.value) || 0)}
                    min="0"
                    className="table-input"
                  />
                </td>
                <td className="total-cell">
                  {dadosAssociadosCARF.taAfMulher + dadosAssociadosCARF.taAMulher + dadosAssociadosCARF.taPMulher + 
                   dadosAssociadosCARF.taIMulher + dadosAssociadosCARF.taQMulher + dadosAssociadosCARF.taEMulher + 
                   dadosAssociadosCARF.taOMulher}
                </td>
              </tr>
              <tr className="total-row">
                <td className="row-label">TOTAL</td>
                <td className="total-cell">
                  {dadosAssociadosCARF.taAfHomem + dadosAssociadosCARF.taAfMulher}
                </td>
                <td className="total-cell">
                  {dadosAssociadosCARF.taAHomem + dadosAssociadosCARF.taAMulher}
                </td>
                <td className="total-cell">
                  {dadosAssociadosCARF.taPHomem + dadosAssociadosCARF.taPMulher}
                </td>
                <td className="total-cell">
                  {dadosAssociadosCARF.taIHomem + dadosAssociadosCARF.taIMulher}
                </td>
                <td className="total-cell">
                  {dadosAssociadosCARF.taQHomem + dadosAssociadosCARF.taQMulher}
                </td>
                <td className="total-cell">
                  {dadosAssociadosCARF.taEHomem + dadosAssociadosCARF.taEMulher}
                </td>
                <td className="total-cell">
                  {dadosAssociadosCARF.taOHomem + dadosAssociadosCARF.taOMulher}
                </td>
                <td className="total-cell">
                  {(dadosAssociadosCARF.taAfHomem + dadosAssociadosCARF.taAfMulher) + 
                   (dadosAssociadosCARF.taAHomem + dadosAssociadosCARF.taAMulher) + 
                   (dadosAssociadosCARF.taPHomem + dadosAssociadosCARF.taPMulher) + 
                   (dadosAssociadosCARF.taIHomem + dadosAssociadosCARF.taIMulher) + 
                   (dadosAssociadosCARF.taQHomem + dadosAssociadosCARF.taQMulher) + 
                   (dadosAssociadosCARF.taEHomem + dadosAssociadosCARF.taEMulher) + 
                   (dadosAssociadosCARF.taOHomem + dadosAssociadosCARF.taOMulher)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tabela Total de CARF por Tipo */}
        <div className="table-container">
          <table className="caf-tipos-table">
            <thead>
              <tr>
                <th className="header-cell">Total de CARF</th>
                <th>ORGÂNICO</th>
                <th>AGROECOLÓGICO</th>
                <th>EM TRANSIÇÃO</th>
                <th>CONVENCIONAL</th>
                <th className="header-cell">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr className="data-row">
                <td className="row-label">Nº. de CARF</td>
                <td>
                  <input
                    type="number"
                    value={dadosCafTipos.taCafOrganico}
                    onChange={(e) => handleDadosCafTiposChange('taCafOrganico', parseInt(e.target.value) || 0)}
                    min="0"
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={dadosCafTipos.taCafAgroecologico}
                    onChange={(e) => handleDadosCafTiposChange('taCafAgroecologico', parseInt(e.target.value) || 0)}
                    min="0"
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={dadosCafTipos.taCafTransicao}
                    onChange={(e) => handleDadosCafTiposChange('taCafTransicao', parseInt(e.target.value) || 0)}
                    min="0"
                    className="table-input"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={dadosCafTipos.taCafConvencional}
                    onChange={(e) => handleDadosCafTiposChange('taCafConvencional', parseInt(e.target.value) || 0)}
                    min="0"
                    className="table-input"
                  />
                </td>
                <td className="total-cell">
                  {dadosCafTipos.taCafOrganico + dadosCafTipos.taCafAgroecologico + 
                   dadosCafTipos.taCafTransicao + dadosCafTipos.taCafConvencional}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Campos de Sócios Ativos */}
        <div className="socios-summary">
          <div className="form-grid">
            <div className="form-group">
              <label>Nº. de Sócios "Ativos" Total (com e sem DAP)</label>
              <input
                type="number"
                value={dadosCaracteristicas.ativosTotal}
                onChange={(e) => handleDadosCaracteristicasChange('ativosTotal', parseInt(e.target.value) || 0)}
                min="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Nº. de Sócios "Ativos" com DAP</label>
              <input
                type="number"
                value={dadosCaracteristicas.ativosCaf}
                onChange={(e) => handleDadosCaracteristicasChange('ativosCaf', parseInt(e.target.value) || 0)}
                min="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Relação de Sócios Ativos/Total</label>
              <input
                type="text"
                value={dadosCaracteristicas.totalSocios > 0 ? 
                  ((dadosCaracteristicas.ativosTotal / dadosCaracteristicas.totalSocios) * 100).toFixed(1) + '%' : '0%'}
                readOnly
                className="form-input readonly"
              />
            </div>

            <div className="form-group">
              <label>Relação de Sócios com DAP Ativos/Total</label>
              <input
                type="text"
                value={dadosCaracteristicas.totalSociosCaf > 0 ? 
                  ((dadosCaracteristicas.ativosCaf / dadosCaracteristicas.totalSociosCaf) * 100).toFixed(1) + '%' : '0%'}
                readOnly
                className="form-input readonly"
              />
            </div>
          </div>
        </div>

        {/* Campos de Não Sócios */}
        <div className="socios-summary">
          <div className="form-grid">
            <div className="form-group">
              <label>Nº. Agricultores NÃO Sócios que Realizaram Operação Comercial com o Empreendimento nos últimos 12 meses (com e sem DAP)</label>
              <input
                type="number"
                value={dadosNaosocios.naosocioOpTotal}
                onChange={(e) => handleDadosNaosociosChange('naosocioOpTotal', parseInt(e.target.value) || 0)}
                min="0"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Nº. Agricultores NÃO Sócios que Realizaram Operação Comercial com o Empreendimento nos últimos 12 meses com DAP</label>
              <input
                type="number"
                value={dadosNaosocios.naosocioOpCaf}
                onChange={(e) => handleDadosNaosociosChange('naosocioOpCaf', parseInt(e.target.value) || 0)}
                min="0"
                className="form-input"
              />
            </div>
          </div>
        </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAbaDiagnostico = () => (
    <div className="aba-content">
      <div className="diagnostico-placeholder">
        <h3>🔍 Diagnóstico</h3>
        <p>Em desenvolvimento...</p>
      </div>
    </div>
  );

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
        <div className="header-actions-top">
          <button
            onClick={() => onNavigate('lista')}
            className="btn btn-secondary btn-voltar"
          >
            ← Voltar
          </button>
          <div className="header-data-visita">
            <label>Data da Visita:</label>
            <input
              type="date"
              value={organizacao?.dataVisita ? organizacao.dataVisita.split('T')[0] : ''}
              readOnly
              className="data-visita-readonly"
            />
          </div>
        </div>
        <div className="header-info">
          <h2>{organizacao?.nome}</h2>
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
        {/* Tabs Navigation */}
        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab-button ${abaAtiva === 'organizacao' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('organizacao')}
            >
              🏢 Organização
            </button>
            <button
              className={`tab-button ${abaAtiva === 'diagnostico' ? 'active' : ''}`}
              onClick={() => setAbaAtiva('diagnostico')}
            >
              🔍 Diagnóstico
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content-container">
          {abaAtiva === 'organizacao' && renderAbaOrganizacao()}
          {abaAtiva === 'diagnostico' && renderAbaDiagnostico()}

          {/* Form Actions */}
          <div className="form-actions">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="btn btn-success btn-save"
            >
              {saving ? '💾 Salvando...' : '💾 Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EdicaoOrganizacao;
