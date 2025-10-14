import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, Network, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import './AssociadosJuridicos.css';

interface AssociadoJuridico {
  id?: number;
  nomeOrganizacao: string;
  cnpj: string;
  tipoRelacao: string;
  dataFiliacao: string;
  situacao: string;
}

interface AssociadosJuridicosProps {
  organizacaoId: number;
}

const TIPOS_RELACAO = [
  { value: 'federada', label: 'Federada' },
  { value: 'filiada', label: 'Filiada' },
  { value: 'cooperada', label: 'Cooperada' },
  { value: 'associada', label: 'Associada' },
  { value: 'parceira', label: 'Parceira' },
  { value: 'outra', label: 'Outra' },
];

const SITUACOES = [
  { value: 'ativa', label: 'Ativa' },
  { value: 'inativa', label: 'Inativa' },
  { value: 'suspensa', label: 'Suspensa' },
];

const AssociadosJuridicos: React.FC<AssociadosJuridicosProps> = ({
  organizacaoId,
}) => {
  const [items, setItems] = useState<AssociadoJuridico[]>([]);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  
  const [editando, setEditando] = useState<number | null>(null);
  const [adicionando, setAdicionando] = useState(false);
  
  const [formData, setFormData] = useState<Partial<AssociadoJuridico>>({
    nomeOrganizacao: '',
    cnpj: '',
    tipoRelacao: '',
    dataFiliacao: '',
    situacao: 'ativa',
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
      const response = await api.get(`/organizacoes/${organizacaoId}/associados-juridicos`);
      setItems(response.data.data || response.data || []);
    } catch (error: any) {
      console.error('Erro ao carregar associados jurídicos:', error);
      setErro(error.response?.data?.error?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const iniciarAdicao = () => {
    setFormData({
      nomeOrganizacao: '',
      cnpj: '',
      tipoRelacao: '',
      dataFiliacao: '',
      situacao: 'ativa',
    });
    setAdicionando(true);
    setEditando(null);
  };

  const iniciarEdicao = (item: AssociadoJuridico) => {
    setFormData({
      nomeOrganizacao: item.nomeOrganizacao,
      cnpj: item.cnpj,
      tipoRelacao: item.tipoRelacao,
      dataFiliacao: item.dataFiliacao,
      situacao: item.situacao,
    });
    setEditando(item.id || null);
    setAdicionando(false);
  };

  const cancelar = () => {
    setFormData({
      nomeOrganizacao: '',
      cnpj: '',
      tipoRelacao: '',
      dataFiliacao: '',
      situacao: 'ativa',
    });
    setAdicionando(false);
    setEditando(null);
    setErro(null);
  };

  const validarCNPJ = (cnpj: string): boolean => {
    const cleaned = cnpj.replace(/\D/g, '');
    return cleaned.length === 14;
  };

  const formatarCNPJ = (cnpj: string): string => {
    const cleaned = cnpj.replace(/\D/g, '');
    return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  };

  const validarForm = (): string | null => {
    if (!formData.nomeOrganizacao?.trim()) {
      return 'Informe o nome da organização';
    }
    if (!formData.cnpj?.trim()) {
      return 'Informe o CNPJ';
    }
    if (!validarCNPJ(formData.cnpj)) {
      return 'CNPJ inválido (deve ter 14 dígitos)';
    }
    if (!formData.tipoRelacao) {
      return 'Selecione o tipo de relação';
    }
    if (!formData.dataFiliacao) {
      return 'Informe a data de filiação';
    }
    if (!formData.situacao) {
      return 'Selecione a situação';
    }
    
    // Verificar duplicata de CNPJ
    const duplicado = items.find(item => 
      item.cnpj === formData.cnpj && 
      item.id !== editando
    );
    if (duplicado) {
      return 'Uma organização com este CNPJ já foi cadastrada';
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
          `/organizacoes/${organizacaoId}/associados-juridicos/${editando}`,
          formData
        );
        setSucesso('Organização atualizada com sucesso!');
      } else {
        // Adicionar
        await api.post(
          `/organizacoes/${organizacaoId}/associados-juridicos`,
          formData
        );
        setSucesso('Organização adicionada com sucesso!');
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

  const excluir = async (id: number, nome: string) => {
    if (!confirm(`Deseja realmente excluir "${nome}"?`)) {
      return;
    }

    setSalvando(true);
    setErro(null);

    try {
      await api.delete(`/organizacoes/${organizacaoId}/associados-juridicos/${id}`);
      setSucesso('Organização excluída com sucesso!');
      await carregarDados();
      setTimeout(() => setSucesso(null), 3000);
    } catch (error: any) {
      console.error('Erro ao excluir:', error);
      setErro(error.response?.data?.error?.message || 'Erro ao excluir');
    } finally {
      setSalvando(false);
    }
  };

  const totalOrganizacoes = items.length;
  const totalAtivas = items.filter(item => item.situacao === 'ativa').length;

  const getTipoRelacaoLabel = (tipo: string) => {
    return TIPOS_RELACAO.find(t => t.value === tipo)?.label || tipo;
  };

  const getSituacaoLabel = (situacao: string) => {
    return SITUACOES.find(s => s.value === situacao)?.label || situacao;
  };

  const getSituacaoBadgeClass = (situacao: string) => {
    switch (situacao) {
      case 'ativa': return 'badge-success';
      case 'inativa': return 'badge-error';
      case 'suspensa': return 'badge-warning';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="associados-juridicos-container">
      <div className="page-header">
        <div className="page-header-left">
          <h2>
            <Network size={24} style={{ marginRight: '0.5rem' }} />
            Associados Jurídicos
          </h2>
        </div>
        <div className="page-header-right">
          {totalOrganizacoes > 0 && (
            <>
              <div className="badge-info">
                {totalOrganizacoes} {totalOrganizacoes === 1 ? 'organização' : 'organizações'}
              </div>
              <div className="badge-success-outline">
                {totalAtivas} {totalAtivas === 1 ? 'ativa' : 'ativas'}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="content-section">
        <p className="section-description">
          Liste todas as organizações jurídicas (cooperativas, associações, etc.) que são federadas, filiadas ou associadas a esta organização.
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
            Adicionar Organização
          </button>
        )}

        {/* Formulário de Adição/Edição */}
        {(adicionando || editando) && (
          <div className="form-card">
            <h4>{editando ? 'Editar Organização' : 'Nova Organização'}</h4>
            
            <div className="form-grid">
              <div className="form-field form-field-full">
                <label>Nome da Organização <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.nomeOrganizacao || ''}
                  onChange={(e) => setFormData({ ...formData, nomeOrganizacao: e.target.value })}
                  disabled={salvando}
                  placeholder="Nome completo da organização"
                />
              </div>

              <div className="form-field">
                <label>CNPJ <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.cnpj || ''}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  disabled={salvando}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>

              <div className="form-field">
                <label>Tipo de Relação <span className="required">*</span></label>
                <select
                  value={formData.tipoRelacao || ''}
                  onChange={(e) => setFormData({ ...formData, tipoRelacao: e.target.value })}
                  disabled={salvando}
                >
                  <option value="">Selecione...</option>
                  {TIPOS_RELACAO.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Data de Filiação <span className="required">*</span></label>
                <input
                  type="date"
                  value={formData.dataFiliacao || ''}
                  onChange={(e) => setFormData({ ...formData, dataFiliacao: e.target.value })}
                  disabled={salvando}
                />
              </div>

              <div className="form-field">
                <label>Situação <span className="required">*</span></label>
                <select
                  value={formData.situacao || 'ativa'}
                  onChange={(e) => setFormData({ ...formData, situacao: e.target.value })}
                  disabled={salvando}
                >
                  {SITUACOES.map(situacao => (
                    <option key={situacao.value} value={situacao.value}>
                      {situacao.label}
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

        {/* Lista de Organizações */}
        {loading ? (
          <div className="loading-container">
            <Loader2 size={24} className="spinning" />
            <span>Carregando...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <Network size={48} />
            <p>Nenhuma organização cadastrada</p>
            <small>Clique em "Adicionar Organização" para começar</small>
          </div>
        ) : (
          <div className="items-table">
            <table>
              <thead>
                <tr>
                  <th>Organização</th>
                  <th>CNPJ</th>
                  <th>Tipo de Relação</th>
                  <th>Data Filiação</th>
                  <th style={{ textAlign: 'center' }}>Situação</th>
                  <th style={{ textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td><strong>{item.nomeOrganizacao}</strong></td>
                    <td>{formatarCNPJ(item.cnpj)}</td>
                    <td>{getTipoRelacaoLabel(item.tipoRelacao)}</td>
                    <td>{new Date(item.dataFiliacao).toLocaleDateString('pt-BR')}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${getSituacaoBadgeClass(item.situacao)}`}>
                        {getSituacaoLabel(item.situacao)}
                      </span>
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
                          onClick={() => excluir(item.id!, item.nomeOrganizacao)}
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
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssociadosJuridicos;

