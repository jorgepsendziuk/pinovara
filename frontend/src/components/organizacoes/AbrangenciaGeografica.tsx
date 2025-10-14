import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, MapPin, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../services/api';
import './AbrangenciaGeografica.css';

interface Estado {
  id: number;
  descricao: string;
}

interface Municipio {
  id: number;
  descricao: string;
  id_estado: number;
}

interface AbrangenciaSocio {
  id?: number;
  estado: number;
  municipio: number;
  numSocios: number;
  estadoNome?: string;
  municipioNome?: string;
}

interface AbrangenciaGeograficaProps {
  organizacaoId: number;
  nTotalSocios?: number | null;
}

const AbrangenciaGeografica: React.FC<AbrangenciaGeograficaProps> = ({
  organizacaoId,
  nTotalSocios,
}) => {
  
  const [items, setItems] = useState<AbrangenciaSocio[]>([]);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  
  const [editando, setEditando] = useState<number | null>(null);
  const [adicionando, setAdicionando] = useState(false);
  
  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipiosPorEstado, setMunicipiosPorEstado] = useState<{ [key: number]: Municipio[] }>({});
  const [loadingMunicipios, setLoadingMunicipios] = useState<{ [key: number]: boolean }>({});
  
  const [formData, setFormData] = useState<Partial<AbrangenciaSocio>>({
    estado: 0,
    municipio: 0,
    numSocios: 0,
  });

  // Carregar estados ao montar
  useEffect(() => {
    carregarEstados();
  }, []);

  // Carregar dados ao montar
  useEffect(() => {
    if (organizacaoId) {
      carregarDados();
    }
  }, [organizacaoId]);

  const carregarEstados = async () => {
    try {
      const response = await api.get('/organizacoes/estados');
      setEstados(response.data.data || response.data);
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
      setErro('Erro ao carregar estados');
    }
  };

  const carregarMunicipios = async (estadoId: number) => {
    if (municipiosPorEstado[estadoId]) return; // Já carregou
    
    setLoadingMunicipios(prev => ({ ...prev, [estadoId]: true }));
    try {
      const response = await api.get(`/organizacoes/municipios/${estadoId}`);
      setMunicipiosPorEstado(prev => ({ ...prev, [estadoId]: response.data.data || response.data }));
    } catch (error) {
      console.error('Erro ao carregar municípios:', error);
    } finally {
      setLoadingMunicipios(prev => ({ ...prev, [estadoId]: false }));
    }
  };

  const carregarDados = async () => {
    setLoading(true);
    setErro(null);
    try {
      const response = await api.get(`/organizacoes/${organizacaoId}/abrangencia-socios`);
      setItems(response.data.data || response.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar abrangência geográfica:', error);
      setErro(error.response?.data?.error?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleEstadoChange = (estadoId: number) => {
    setFormData({ ...formData, estado: estadoId, municipio: 0 });
    if (estadoId > 0) {
      carregarMunicipios(estadoId);
    }
  };

  const iniciarAdicao = () => {
    setFormData({ estado: 0, municipio: 0, numSocios: 0 });
    setAdicionando(true);
    setEditando(null);
  };

  const iniciarEdicao = (item: AbrangenciaSocio) => {
    setFormData({
      estado: item.estado,
      municipio: item.municipio,
      numSocios: item.numSocios,
    });
    setEditando(item.id || null);
    setAdicionando(false);
    
    // Carregar municípios do estado se não estiverem carregados
    if (item.estado) {
      carregarMunicipios(item.estado);
    }
  };

  const cancelar = () => {
    setFormData({ estado: 0, municipio: 0, numSocios: 0 });
    setAdicionando(false);
    setEditando(null);
    setErro(null);
  };

  const validarForm = (): string | null => {
    if (!formData.estado || formData.estado === 0) {
      return 'Selecione um estado';
    }
    if (!formData.municipio || formData.municipio === 0) {
      return 'Selecione um município';
    }
    if (formData.numSocios === undefined || formData.numSocios === null || formData.numSocios < 0) {
      return 'Informe um número válido de sócios (≥ 0)';
    }
    
    // Verificar duplicata
    const duplicado = items.find(item => 
      item.municipio === formData.municipio && 
      item.id !== editando
    );
    if (duplicado) {
      return 'Este município já foi cadastrado';
    }
    
    return null;
  };

  const salvar = async () => {
    const erroValidacao = validarForm();
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    setSalvando(true);
    setErro(null);
    setSucesso(null);

    try {
      if (editando) {
        // Atualizar
        await api.put(
          `/organizacoes/${organizacaoId}/abrangencia-socios/${editando}`,
          formData
        );
        setSucesso('Município atualizado com sucesso!');
      } else {
        // Adicionar
        await api.post(
          `/organizacoes/${organizacaoId}/abrangencia-socios`,
          formData
        );
        setSucesso('Município adicionado com sucesso!');
      }
      
      await carregarDados();
      cancelar();
      
      setTimeout(() => setSucesso(null), 3000);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setErro(error.response?.data?.error?.message || 'Erro ao salvar dados');
    } finally {
      setSalvando(false);
    }
  };

  const excluir = async (id: number, municipioNome: string) => {
    if (!confirm(`Deseja realmente excluir "${municipioNome}"?`)) {
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      await api.delete(`/organizacoes/${organizacaoId}/abrangencia-socios/${id}`);
      setSucesso('Município excluído com sucesso!');
      await carregarDados();
      setTimeout(() => setSucesso(null), 3000);
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      setErro(error.response?.data?.error?.message || 'Erro ao excluir');
    } finally {
      setSalvando(false);
    }
  };

  // Cálculos
  const totalSociosCadastrados = items.reduce((sum, item) => sum + item.numSocios, 0);
  const totalMunicipios = items.length;
  
  let statusTotal: 'success' | 'warning' | 'error' = 'success';
  if (nTotalSocios) {
    if (totalSociosCadastrados > nTotalSocios) {
      statusTotal = 'error';
    } else if (totalSociosCadastrados < nTotalSocios && totalSociosCadastrados > 0) {
      statusTotal = 'warning';
    }
  }

  const getEstadoNome = (estadoId: number) => {
    return estados.find(e => e.id === estadoId)?.descricao || '';
  };

  const getMunicipioNome = (estadoId: number, municipioId: number) => {
    const municipios = municipiosPorEstado[estadoId] || [];
    return municipios.find(m => m.id === municipioId)?.descricao || '';
  };

  return (
    <div className="abrangencia-container">
      <div className="page-header">
        <div className="page-header-left">
          <h2>
            <MapPin size={24} style={{ marginRight: '0.5rem' }} />
            Abrangência Geográfica
          </h2>
        </div>
        <div className="page-header-right">
          {totalMunicipios > 0 && (
            <div className="badge-info">
              {totalMunicipios} {totalMunicipios === 1 ? 'município' : 'municípios'}
            </div>
          )}
        </div>
      </div>

      <div className="content-section">
          <p className="section-description">
            Liste todos os municípios onde residem os sócios da organização.
          </p>

          {/* Alertas */}
          {erro && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <span>{erro}</span>
            </div>
          )}

          {sucesso && (
            <div className="alert alert-success">
              <CheckCircle size={18} />
              <span>{sucesso}</span>
            </div>
          )}

          {/* Botão Adicionar */}
          {!adicionando && !editando && (
            <button 
              className="btn btn-primary"
              onClick={iniciarAdicao}
              disabled={salvando}
            >
              <Plus size={18} />
              Adicionar Município
            </button>
          )}

          {/* Formulário de Adição/Edição */}
          {(adicionando || editando) && (
            <div className="form-card">
              <h4>{editando ? 'Editar Município' : 'Novo Município'}</h4>
              
              <div className="form-grid">
                <div className="form-field">
                  <label>Estado <span className="required">*</span></label>
                  <select
                    value={formData.estado || 0}
                    onChange={(e) => handleEstadoChange(parseInt(e.target.value))}
                    disabled={salvando}
                  >
                    <option value={0}>Selecione...</option>
                    {estados.map(estado => (
                      <option key={estado.id} value={estado.id}>
                        {estado.descricao}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field">
                  <label>Município <span className="required">*</span></label>
                  <select
                    value={formData.municipio || 0}
                    onChange={(e) => setFormData({ ...formData, municipio: parseInt(e.target.value) })}
                    disabled={!formData.estado || formData.estado === 0 || salvando}
                  >
                    <option value={0}>Selecione...</option>
                    {loadingMunicipios[formData.estado || 0] ? (
                      <option value={0}>Carregando...</option>
                    ) : (
                      (municipiosPorEstado[formData.estado || 0] || []).map(municipio => (
                        <option key={municipio.id} value={municipio.id}>
                          {municipio.descricao}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-field">
                  <label>Número de Sócios <span className="required">*</span></label>
                  <input
                    type="number"
                    min="0"
                    value={formData.numSocios || ''}
                    onChange={(e) => setFormData({ ...formData, numSocios: parseInt(e.target.value) || 0 })}
                    disabled={salvando}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="btn btn-success"
                  onClick={salvar}
                  disabled={salvando}
                >
                  {salvando ? (
                    <>
                      <Loader2 size={18} className="spinning" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Salvar
                    </>
                  )}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={cancelar}
                  disabled={salvando}
                >
                  <X size={18} />
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de Municípios */}
          {loading ? (
            <div className="loading-container">
              <Loader2 size={24} className="spinning" />
              <span>Carregando...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state">
              <MapPin size={48} />
              <p>Nenhum município cadastrado</p>
              <small>Clique em "Adicionar Município" para começar</small>
            </div>
          ) : (
            <div className="items-table">
              <table>
                <thead>
                  <tr>
                    <th>UF</th>
                    <th>Município</th>
                    <th style={{ textAlign: 'center' }}>Nº Sócios</th>
                    <th style={{ textAlign: 'center' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <strong>{getEstadoNome(item.estado)}</strong>
                      </td>
                      <td>{getMunicipioNome(item.estado, item.municipio)}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>
                        {item.numSocios}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => iniciarEdicao(item)}
                            disabled={salvando || adicionando || editando !== null}
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => excluir(item.id!, getMunicipioNome(item.estado, item.municipio))}
                            disabled={salvando || adicionando || editando !== null}
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="total-row">
                    <td colSpan={2}><strong>TOTAL</strong></td>
                    <td style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.1rem' }}>
                      {totalSociosCadastrados}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
      </div>
    </div>
  );
};

export default AbrangenciaGeografica;

