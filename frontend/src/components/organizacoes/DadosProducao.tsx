import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, Wheat, AlertCircle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import './DadosProducao.css';

interface Producao {
  id?: number;
  cultura: string;
  volumeAnual: number;
  unidadeMedida: string;
  valorMedio: number;
  tipoProducao: string;
  destinacao: string;
}

interface DadosProducaoProps {
  organizacaoId: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const UNIDADES_MEDIDA = [
  { value: 'kg', label: 'Quilograma (kg)' },
  { value: 't', label: 'Tonelada (t)' },
  { value: 'sc', label: 'Saco (sc)' },
  { value: 'l', label: 'Litro (l)' },
  { value: 'cx', label: 'Caixa (cx)' },
  { value: 'dz', label: 'Dúzia (dz)' },
  { value: 'un', label: 'Unidade (un)' },
];

const TIPOS_PRODUCAO = [
  { value: 'organica', label: 'Orgânica' },
  { value: 'agroecologica', label: 'Agroecológica' },
  { value: 'transicao', label: 'Em Transição' },
  { value: 'convencional', label: 'Convencional' },
];

const DESTINACOES = [
  { value: 'paa', label: 'PAA' },
  { value: 'pnae', label: 'PNAE' },
  { value: 'mercado_local', label: 'Mercado Local' },
  { value: 'feira', label: 'Feira' },
  { value: 'cooperativa', label: 'Cooperativa' },
  { value: 'industria', label: 'Indústria' },
  { value: 'exportacao', label: 'Exportação' },
  { value: 'outros', label: 'Outros' },
];

const DadosProducao: React.FC<DadosProducaoProps> = ({ organizacaoId }) => {
  const [items, setItems] = useState<Producao[]>([]);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  
  const [editando, setEditando] = useState<number | null>(null);
  const [adicionando, setAdicionando] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Producao>>({
    cultura: '',
    volumeAnual: 0,
    unidadeMedida: '',
    valorMedio: 0,
    tipoProducao: '',
    destinacao: '',
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
      const response = await axios.get(`${API_BASE_URL}/organizacoes/${organizacaoId}/producao`);
      setItems(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar dados de produção:', error);
      setErro(error.response?.data?.error || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const iniciarAdicao = () => {
    setFormData({
      cultura: '',
      volumeAnual: 0,
      unidadeMedida: '',
      valorMedio: 0,
      tipoProducao: '',
      destinacao: '',
    });
    setAdicionando(true);
    setEditando(null);
  };

  const iniciarEdicao = (item: Producao) => {
    setFormData({
      cultura: item.cultura,
      volumeAnual: item.volumeAnual,
      unidadeMedida: item.unidadeMedida,
      valorMedio: item.valorMedio,
      tipoProducao: item.tipoProducao,
      destinacao: item.destinacao,
    });
    setEditando(item.id || null);
    setAdicionando(false);
  };

  const cancelar = () => {
    setFormData({
      cultura: '',
      volumeAnual: 0,
      unidadeMedida: '',
      valorMedio: 0,
      tipoProducao: '',
      destinacao: '',
    });
    setAdicionando(false);
    setEditando(null);
    setErro(null);
  };

  const validarForm = (): string | null => {
    if (!formData.cultura?.trim()) {
      return 'Informe o nome da cultura/produto';
    }
    if (!formData.volumeAnual || formData.volumeAnual <= 0) {
      return 'Informe um volume anual válido (> 0)';
    }
    if (!formData.unidadeMedida) {
      return 'Selecione a unidade de medida';
    }
    if (!formData.valorMedio || formData.valorMedio < 0) {
      return 'Informe um valor médio válido (≥ 0)';
    }
    if (!formData.tipoProducao) {
      return 'Selecione o tipo de produção';
    }
    if (!formData.destinacao) {
      return 'Selecione a destinação';
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
        await axios.put(
          `${API_BASE_URL}/organizacoes/${organizacaoId}/producao/${editando}`,
          formData
        );
        setSucesso('Cultura atualizada com sucesso!');
      } else {
        await axios.post(
          `${API_BASE_URL}/organizacoes/${organizacaoId}/producao`,
          formData
        );
        setSucesso('Cultura adicionada com sucesso!');
      }
      
      await carregarDados();
      cancelar();
      
      setTimeout(() => setSucesso(null), 3000);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setErro(error.response?.data?.error || 'Erro ao salvar dados');
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
      await axios.delete(`${API_BASE_URL}/organizacoes/${organizacaoId}/producao/${id}`);
      setSucesso('Cultura excluída com sucesso!');
      await carregarDados();
      setTimeout(() => setSucesso(null), 3000);
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      setErro(error.response?.data?.error || 'Erro ao excluir');
    } finally {
      setSalvando(false);
    }
  };

  const totalCulturas = items.length;
  const valorTotalProducao = items.reduce((sum, item) => sum + (item.valorMedio * item.volumeAnual), 0);

  const getUnidadeLabel = (unidade: string) => {
    return UNIDADES_MEDIDA.find(u => u.value === unidade)?.label || unidade;
  };

  const getTipoProducaoLabel = (tipo: string) => {
    return TIPOS_PRODUCAO.find(t => t.value === tipo)?.label || tipo;
  };

  const getTipoProducaoBadgeClass = (tipo: string) => {
    switch (tipo) {
      case 'organica': return 'badge-organica';
      case 'agroecologica': return 'badge-agroecologica';
      case 'transicao': return 'badge-transicao';
      case 'convencional': return 'badge-convencional';
      default: return 'badge-secondary';
    }
  };

  const getDestinacaoLabel = (destinacao: string) => {
    return DESTINACOES.find(d => d.value === destinacao)?.label || destinacao;
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    <div className="dados-producao-container">
      <div className="page-header">
        <div className="page-header-left">
          <h2>
            <Wheat size={24} style={{ marginRight: '0.5rem' }} />
            Dados de Produção
          </h2>
        </div>
        <div className="page-header-right">
          {totalCulturas > 0 && (
            <>
              <div className="badge-info">
                {totalCulturas} {totalCulturas === 1 ? 'cultura' : 'culturas'}
              </div>
              <div className="badge-valor">
                {formatarMoeda(valorTotalProducao)}
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
            Adicionar Cultura
          </button>
        )}

        {/* Formulário de Adição/Edição */}
        {(adicionando || editando) && (
          <div className="form-card">
            <h4>{editando ? 'Editar Cultura' : 'Nova Cultura'}</h4>
            
            <div className="form-grid">
              <div className="form-field form-field-full">
                <label>Cultura / Produto <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.cultura || ''}
                  onChange={(e) => setFormData({ ...formData, cultura: e.target.value })}
                  disabled={salvando}
                  placeholder="Ex: Café arábica, Milho, Feijão, etc."
                />
              </div>

              <div className="form-field">
                <label>Volume Anual <span className="required">*</span></label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.volumeAnual || ''}
                  onChange={(e) => setFormData({ ...formData, volumeAnual: parseFloat(e.target.value) || 0 })}
                  disabled={salvando}
                  placeholder="0"
                />
              </div>

              <div className="form-field">
                <label>Unidade <span className="required">*</span></label>
                <select
                  value={formData.unidadeMedida || ''}
                  onChange={(e) => setFormData({ ...formData, unidadeMedida: e.target.value })}
                  disabled={salvando}
                >
                  <option value="">Selecione...</option>
                  {UNIDADES_MEDIDA.map(unidade => (
                    <option key={unidade.value} value={unidade.value}>
                      {unidade.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Valor Médio (R$/unidade) <span className="required">*</span></label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.valorMedio || ''}
                  onChange={(e) => setFormData({ ...formData, valorMedio: parseFloat(e.target.value) || 0 })}
                  disabled={salvando}
                  placeholder="0.00"
                />
              </div>

              <div className="form-field">
                <label>Tipo de Produção <span className="required">*</span></label>
                <select
                  value={formData.tipoProducao || ''}
                  onChange={(e) => setFormData({ ...formData, tipoProducao: e.target.value })}
                  disabled={salvando}
                >
                  <option value="">Selecione...</option>
                  {TIPOS_PRODUCAO.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Destinação Principal <span className="required">*</span></label>
                <select
                  value={formData.destinacao || ''}
                  onChange={(e) => setFormData({ ...formData, destinacao: e.target.value })}
                  disabled={salvando}
                >
                  <option value="">Selecione...</option>
                  {DESTINACOES.map(dest => (
                    <option key={dest.value} value={dest.value}>
                      {dest.label}
                    </option>
                  ))}
                </select>
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

        {/* Lista de Produções */}
        {loading ? (
          <div className="loading-container">
            <Loader2 size={24} className="spinning" />
            <span>Carregando...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <Wheat size={48} />
            <p>Nenhuma cultura cadastrada</p>
            <small>Clique em "Adicionar Cultura" para começar</small>
          </div>
        ) : (
          <div className="items-table">
            <table>
              <thead>
                <tr>
                  <th>Cultura / Produto</th>
                  <th style={{ textAlign: 'right' }}>Volume Anual</th>
                  <th style={{ textAlign: 'right' }}>Valor Médio</th>
                  <th style={{ textAlign: 'right' }}>Valor Total</th>
                  <th style={{ textAlign: 'center' }}>Tipo</th>
                  <th>Destinação</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.cultura}</strong></td>
                    <td style={{ textAlign: 'right' }}>
                      {item.volumeAnual.toLocaleString('pt-BR')} {item.unidadeMedida}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {formatarMoeda(item.valorMedio)}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatarMoeda(item.valorMedio * item.volumeAnual)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${getTipoProducaoBadgeClass(item.tipoProducao)}`}>
                        {getTipoProducaoLabel(item.tipoProducao)}
                      </span>
                    </td>
                    <td>{getDestinacaoLabel(item.destinacao)}</td>
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
                          onClick={() => excluir(item.id!, item.cultura)}
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
                  <td colSpan={3}><strong>TOTAL GERAL</strong></td>
                  <td style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.1rem' }}>
                    {formatarMoeda(valorTotalProducao)}
                  </td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DadosProducao;

