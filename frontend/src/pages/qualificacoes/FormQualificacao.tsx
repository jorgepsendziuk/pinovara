import { useState, useEffect } from 'react';
import { qualificacaoAPI } from '../../services/qualificacaoService';
import api from '../../services/api';
import { Qualificacao } from '../../types/qualificacao';
import RepositorioMateriais from '../../components/qualificacoes/RepositorioMateriais';
import { 
  ArrowLeft, 
  Loader2, 
  BookOpen, 
  FileText, 
  Save,
  Calendar,
  User
} from 'lucide-react';
import '../../styles/tabs.css';
import './QualificacoesModule.css';

type AbaAtiva = 'informacoes' | 'materiais';

interface FormQualificacaoProps {
  id?: number;
  onNavigate: (view: string, id?: number) => void;
}

function FormQualificacao({ id, onNavigate }: FormQualificacaoProps) {
  const [loading, setLoading] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>('informacoes');
  const [criadorNome, setCriadorNome] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Qualificacao>>({
    titulo: '',
    objetivo_geral: '',
    objetivos_especificos: '',
    conteudo_programatico: '',
    metodologia: '',
    recursos_didaticos: '',
    estrategia_avaliacao: '',
    referencias: '',
    ativo: true
  });

  useEffect(() => {
    if (id) {
      carregarQualificacao();
    }
    
    // Verificar se há hash na URL para abrir aba específica
    if (window.location.hash === '#materiais') {
      setAbaAtiva('materiais');
    }
  }, [id]);
  
  // Escutar mudanças no hash
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#materiais') {
        setAbaAtiva('materiais');
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const carregarQualificacao = async () => {
    if (!id) return;
    
    try {
      setCarregandoDados(true);
      const qualificacao = await qualificacaoAPI.getById(id);
      setFormData(qualificacao);

      // Carregar informações do criador
      if (qualificacao.created_by) {
        try {
          const response = await api.get(`/admin/users/${qualificacao.created_by}`);
          if (response.data.success && response.data.data?.user) {
            setCriadorNome(response.data.data.user.name);
          }
        } catch (error) {
          console.error('Erro ao carregar criador:', error);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar qualificação:', error);
      alert('Erro ao carregar qualificação');
    } finally {
      setCarregandoDados(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo || formData.titulo.trim() === '') {
      alert('O título é obrigatório');
      return;
    }
    
    try {
      setLoading(true);
      
      if (id) {
        // Remover campos que não devem ser enviados no update
        const { id: _, created_at, created_by, updated_at, ...updateData } = formData;
        const dadosParaEnviar = {
          ...updateData
        };
        await qualificacaoAPI.update(id, dadosParaEnviar);
        alert('Qualificação atualizada com sucesso!');
      } else {
        // Remover campos que não devem ser enviados no create
        const { id: _, created_at, created_by, updated_at, ...createData } = formData;
        const dadosParaEnviar = {
          ...createData
        };
        await qualificacaoAPI.create(dadosParaEnviar);
        alert('Qualificação criada com sucesso!');
      }
      onNavigate('qualificacoes');
    } catch (error: any) {
      console.error('Erro ao salvar qualificação:', error);
      alert(error.message || 'Erro ao salvar qualificação');
    } finally {
      setLoading(false);
    }
  };


  if (carregandoDados && id) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Loader2 size={32} className="spinning" />
        <p>Carregando qualificação...</p>
      </div>
    );
  }

  return (
    <div className="qualificacoes-module">
      {/* Header */}
      <div style={{ 
        padding: '24px 32px', 
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <button
            onClick={() => onNavigate('qualificacoes')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              background: 'white',
              color: '#3b2313',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontWeight: '500',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#056839';
              e.currentTarget.style.color = '#056839';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.color = '#3b2313';
            }}
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <div>
            <h1 style={{ 
              margin: '0 0 8px 0', 
              fontSize: '24px', 
              fontWeight: '600',
              color: '#3b2313',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <BookOpen size={24} />
              {id ? 'Editar Qualificação' : 'Nova Qualificação'}
            </h1>
            {id && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {formData.created_at && (
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    Criada em {new Date(formData.created_at).toLocaleDateString('pt-BR')}
                  </p>
                )}
                {criadorNome && (
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} />
                    Criada por: <strong>{criadorNome}</strong>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        {id && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ 
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: formData.ativo ? '#d4edda' : '#f8d7da',
              color: formData.ativo ? '#155724' : '#721c24'
            }}>
              {formData.ativo ? 'Ativa' : 'Inativa'}
            </span>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-navigation" style={{ margin: '24px 32px 0' }}>
        <button
          className={`tab-button ${abaAtiva === 'informacoes' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('informacoes')}
          title="Informações da Qualificação"
        >
          <BookOpen size={16} /> <span>Informações</span>
        </button>
        <button
          className={`tab-button ${abaAtiva === 'materiais' ? 'active' : ''}`}
          onClick={() => setAbaAtiva('materiais')}
          title="Repositório de Materiais"
          disabled={!id}
          style={{ opacity: !id ? 0.5 : 1, cursor: !id ? 'not-allowed' : 'pointer' }}
        >
          <FileText size={16} /> <span>Materiais</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content" style={{ padding: '24px 32px' }}>
        {abaAtiva === 'informacoes' && (
          <form onSubmit={handleSubmit} style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3b2313' }}>
                Título *
              </label>
              <input
                type="text"
                value={formData.titulo || ''}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                required
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3b2313' }}>
                Objetivo Geral
              </label>
              <textarea
                value={formData.objetivo_geral || ''}
                onChange={(e) => setFormData({ ...formData, objetivo_geral: e.target.value })}
                rows={3}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3b2313' }}>
                Objetivos Específicos
              </label>
              <textarea
                value={formData.objetivos_especificos || ''}
                onChange={(e) => setFormData({ ...formData, objetivos_especificos: e.target.value })}
                rows={5}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3b2313' }}>
                Conteúdo Programático
              </label>
              <textarea
                value={formData.conteudo_programatico || ''}
                onChange={(e) => setFormData({ ...formData, conteudo_programatico: e.target.value })}
                rows={10}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3b2313' }}>
                Metodologia
              </label>
              <textarea
                value={formData.metodologia || ''}
                onChange={(e) => setFormData({ ...formData, metodologia: e.target.value })}
                rows={5}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3b2313' }}>
                Recursos Didáticos
              </label>
              <textarea
                value={formData.recursos_didaticos || ''}
                onChange={(e) => setFormData({ ...formData, recursos_didaticos: e.target.value })}
                rows={3}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3b2313' }}>
                Estratégia de Avaliação
              </label>
              <textarea
                value={formData.estrategia_avaliacao || ''}
                onChange={(e) => setFormData({ ...formData, estrategia_avaliacao: e.target.value })}
                rows={3}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3b2313' }}>
                Referências
              </label>
              <textarea
                value={formData.referencias || ''}
                onChange={(e) => setFormData({ ...formData, referencias: e.target.value })}
                rows={5}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.ativo || false}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '500', color: '#3b2313' }}>Qualificação ativa</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: loading ? '#9ca3af' : '#056839',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinning" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {id ? 'Atualizar Qualificação' : 'Criar Qualificação'}
                  </>
                )}
              </button>
              <button type="button" onClick={() => onNavigate('qualificacoes')} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {abaAtiva === 'materiais' && (
          <>
            {id ? (
              <RepositorioMateriais idQualificacao={id} />
            ) : (
              <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '40px' }}>
                <FileText size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                <h3 style={{ marginTop: 0, marginBottom: '12px', color: '#3b2313', fontSize: '18px' }}>
                  Materiais da Qualificação
                </h3>
                <p style={{ color: '#64748b', margin: 0 }}>
                  Salve a qualificação primeiro para gerenciar os materiais.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default FormQualificacao;
