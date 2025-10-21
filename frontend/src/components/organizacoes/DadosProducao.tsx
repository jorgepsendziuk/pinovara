import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, Wheat, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import './DadosProducao.css';

interface Producao {
  id?: number;
  cultura: string;
  mensal: number;
  anual: number;
}

interface DadosProducaoProps {
  organizacaoId: number;
}

const DadosProducao: React.FC<DadosProducaoProps> = ({ organizacaoId }) => {
  const [items, setItems] = useState<Producao[]>([]);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [editando, setEditando] = useState<number | null>(null);
  const [adicionando, setAdicionando] = useState(false);
  
  const [formData, setFormData] = useState<Producao>({
    cultura: '',
    mensal: 0,
    anual: 0,
  });

  // Carregar dados ao montar
  useEffect(() => {
    if (organizacaoId) {
      carregarDados();
    }
  }, [organizacaoId]);

  const carregarDados = async () => {
    setLoading(true);
    setErro(null);
    try {
      const response = await api.get(`/organizacoes/${organizacaoId}/producao`);
      setItems(response.data.data || response.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar dados de produção:', error);
      setErro(error.response?.data?.error?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const iniciarAdicao = () => {
    setFormData({
      cultura: '',
      mensal: 0,
      anual: 0,
    });
    setAdicionando(true);
    setEditando(null);
  };

  const iniciarEdicao = (item: Producao) => {
    setFormData({
      cultura: item.cultura,
      mensal: item.mensal,
      anual: item.anual,
    });
    setEditando(item.id || null);
    setAdicionando(false);
  };

  const cancelar = () => {
    setFormData({
      cultura: '',
      mensal: 0,
      anual: 0,
    });
    setAdicionando(false);
    setEditando(null);
    setErro(null);
  };

  const validarForm = (): string | null => {
    if (!formData.cultura?.trim()) {
      return 'Informe o nome da cultura/produto';
    }
    if (formData.mensal === undefined || formData.mensal < 0) {
      return 'Informe a produção mensal válida (≥ 0)';
    }
    if (formData.anual === undefined || formData.anual < 0) {
      return 'Informe a produção anual válida (≥ 0)';
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
        await api.put(
          `/organizacoes/${organizacaoId}/producao/${editando}`,
          formData
        );
        setSucesso('Cultura atualizada com sucesso!');
      } else {
        await api.post(
          `/organizacoes/${organizacaoId}/producao`,
          formData
        );
        setSucesso('Cultura adicionada com sucesso!');
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

  const excluir = async (id: number, cultura: string) => {
    if (!confirm(`Deseja realmente excluir "${cultura}"?`)) {
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      await api.delete(`/organizacoes/${organizacaoId}/producao/${id}`);
      setSucesso('Cultura excluída com sucesso!');
      await carregarDados();
      setTimeout(() => setSucesso(null), 3000);
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      setErro(error.response?.data?.error?.message || 'Erro ao excluir');
    } finally {
      setSalvando(false);
    }
  };

  const totalCulturas = items.length;
  const totalProducaoMensal = items.reduce((sum, item) => sum + item.mensal, 0);
  const totalProducaoAnual = items.reduce((sum, item) => sum + item.anual, 0);

  return (
    <div className="dados-producao-container">
      {/* Header */}
      <div className="page-header" style={{ marginBottom: '1rem', padding: '1rem 0' }}>
        <div className="page-header-left">
          <Wheat size={24} style={{ color: '#f59e0b' }} />
          <div>
            <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Dados de Produção</h2>
            <p style={{ fontSize: '0.85rem', margin: '0.25rem 0 0 0', color: '#6b7280' }}>
              Gestão de culturas e volumes de produção
            </p>
          </div>
        </div>
        <div className="page-header-right">
          {items.length > 0 && (
            <>
              <div className="badge-info">
                {totalCulturas} {totalCulturas === 1 ? 'cultura' : 'culturas'}
              </div>
              <div className="badge-valor">
                {totalProducaoAnual.toLocaleString('pt-BR')} kg/ano
              </div>
            </>
          )}
        </div>
      </div>

      <div className="content-section">
        <p className="section-description">
          Liste todas as culturas ou produtos da organização, com volumes anuais de produção e valores.
        </p>

        {/* Alertas */}
        {sucesso && (
          <div className="alert alert-success">
            <CheckCircle size={18} />
            <span>{sucesso}</span>
          </div>
        )}

        {erro && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{erro}</span>
          </div>
        )}

        {/* Formulário */}
        {(adicionando || editando) && (
          <div className="form-card">
            <h3 className="form-title">
              {editando ? 'Editar Cultura' : 'Nova Cultura'}
            </h3>

            <div className="form-grid">
              <div className="form-field" style={{ gridColumn: '1 / -1' }}>
                <label>Cultura/Produto <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.cultura || ''}
                  onChange={(e) => setFormData({ ...formData, cultura: e.target.value })}
                  placeholder="Ex: Café, Milho, Feijão..."
                  disabled={salvando}
                />
              </div>

              <div className="form-field">
                <label>Produção Mensal (kg) <span className="required">*</span></label>
                <input
                  type="number"
                  value={formData.mensal || ''}
                  onChange={(e) => setFormData({ ...formData, mensal: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  disabled={salvando}
                />
              </div>

              <div className="form-field">
                <label>Produção Anual (kg) <span className="required">*</span></label>
                <input
                  type="number"
                  value={formData.anual || ''}
                  onChange={(e) => setFormData({ ...formData, anual: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  disabled={salvando}
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
                    Salvar Cultura
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

        {/* Botão Adicionar */}
        {!adicionando && !editando && (
          <button className="btn btn-primary" onClick={iniciarAdicao}>
            <Plus size={18} />
            Adicionar Cultura
          </button>
        )}

        {/* Loading */}
        {loading && (
          <div className="loading">
            <Loader2 size={24} className="spinning" />
            <span>Carregando...</span>
          </div>
        )}

        {/* Lista de Culturas */}
        {!loading && items.length > 0 && (
          <div className="table-responsive" style={{ marginTop: '1.5rem' }}>
            <table className="data-table" style={{ 
              borderCollapse: 'separate',
              borderSpacing: 0,
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <thead>
                <tr style={{ 
                  background: 'linear-gradient(135deg, #3b2313 0%, #056839 100%)',
                  color: 'white'
                }}>
                  <th style={{ 
                    padding: '14px 16px',
                    fontWeight: 600,
                    fontSize: '14px',
                    textAlign: 'left',
                    borderBottom: 'none'
                  }}>Cultura/Produto</th>
                  <th style={{ 
                    padding: '14px 16px',
                    fontWeight: 600,
                    fontSize: '14px',
                    textAlign: 'right',
                    borderBottom: 'none'
                  }}>Produção Mensal (kg)</th>
                  <th style={{ 
                    padding: '14px 16px',
                    fontWeight: 600,
                    fontSize: '14px',
                    textAlign: 'right',
                    borderBottom: 'none'
                  }}>Produção Anual (kg)</th>
                  <th style={{ 
                    padding: '14px 16px',
                    fontWeight: 600,
                    fontSize: '14px',
                    textAlign: 'center',
                    width: '150px',
                    borderBottom: 'none'
                  }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} style={{ 
                    background: index % 2 === 0 ? 'white' : '#f8faf9',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e8f5e9';
                    e.currentTarget.style.transform = 'scale(1.01)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = index % 2 === 0 ? 'white' : '#f8faf9';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}>
                    <td style={{ 
                      padding: '12px 16px',
                      borderBottom: '1px solid #e2e8f0',
                      color: '#1e293b'
                    }}>
                      <strong style={{ color: '#3b2313' }}>{item.cultura}</strong>
                    </td>
                    <td style={{ 
                      padding: '12px 16px',
                      textAlign: 'right',
                      borderBottom: '1px solid #e2e8f0',
                      color: '#64748b',
                      fontWeight: 500
                    }}>
                      {item.mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ 
                      padding: '12px 16px',
                      textAlign: 'right',
                      borderBottom: '1px solid #e2e8f0',
                      color: '#056839',
                      fontWeight: 600
                    }}>
                      {item.anual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ 
                      padding: '12px 16px',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-icon-edit"
                          onClick={() => iniciarEdicao(item)}
                          title="Editar"
                          disabled={salvando || adicionando}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon btn-icon-delete"
                          onClick={() => excluir(item.id!, item.cultura)}
                          title="Excluir"
                          disabled={salvando || adicionando}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ 
                  background: 'linear-gradient(135deg, rgba(59, 35, 19, 0.05) 0%, rgba(5, 104, 57, 0.05) 100%)',
                  borderTop: '2px solid #056839'
                }}>
                  <td style={{ 
                    padding: '14px 16px',
                    fontWeight: 700,
                    color: '#3b2313',
                    fontSize: '15px'
                  }}>TOTAL</td>
                  <td style={{ 
                    padding: '14px 16px',
                    textAlign: 'right',
                    fontWeight: 700,
                    color: '#64748b',
                    fontSize: '15px'
                  }}>
                    {totalProducaoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ 
                    padding: '14px 16px',
                    textAlign: 'right',
                    fontWeight: 700,
                    color: '#056839',
                    fontSize: '16px'
                  }}>
                    {totalProducaoAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Estado vazio */}
        {!loading && items.length === 0 && !adicionando && !editando && (
          <div className="empty-state">
            <Wheat size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              Nenhuma cultura cadastrada ainda.
            </p>
            <button className="btn btn-primary" onClick={iniciarAdicao}>
              <Plus size={18} />
              Adicionar Primeira Cultura
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DadosProducao;
