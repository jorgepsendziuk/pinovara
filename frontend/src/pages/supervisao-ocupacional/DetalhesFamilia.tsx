import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { Users, ArrowLeft, Loader2, Edit } from 'lucide-react';
import Tabs from '../../components/Tabs/Tabs';
import { familiaTabsConfig, getFieldValue, formatFieldValue, getFieldLabel } from '../../utils/familiaFormMapping';
import { FamiliaCompleta } from '../../types/familia';
import Validacao from '../../components/supervisao-ocupacional/Validacao';
import { useAuth } from '../../contexts/AuthContext';
import './SupervisaoOcupacionalModule.css';

export default function DetalhesFamilia() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const idFromPath = useMemo(() => {
    const match = location.pathname.match(/\/familias\/(\d+)/);
    return match ? match[1] : null;
  }, [location.pathname]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [familia, setFamilia] = useState<FamiliaCompleta | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!idFromPath) {
      setError('ID não fornecido');
      setLoading(false);
      return;
    }
    
    const idNum = parseInt(idFromPath);
    if (isNaN(idNum)) {
      setError('ID inválido');
      setLoading(false);
      return;
    }

    if (loadingRef.current || (familia && familia.id === idNum)) {
      return;
    }

    loadingRef.current = true;
    loadFamilia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFromPath]);

  const loadFamilia = async () => {
    if (!idFromPath) {
      loadingRef.current = false;
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/supervisao-ocupacional/familias/${idFromPath}`);
      if (response.data.success) {
        setFamilia(response.data.data);
      } else {
        setError('Erro ao carregar família: resposta inválida');
        setLoading(false);
        loadingRef.current = false;
      }
    } catch (err: any) {
      console.error('Erro ao carregar família:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Erro ao carregar família';
      setError(errorMsg);
      setLoading(false);
      loadingRef.current = false;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const formatarData = (dataString: string | null | undefined): string => {
    if (!dataString) return '-';
    try {
      const data = new Date(dataString);
      return data.toLocaleString('pt-BR');
    } catch {
      return '-';
    }
  };

  const renderField = (fieldName: string, label?: string, valueOverride?: any) => {
    const value = valueOverride !== undefined ? valueOverride : getFieldValue(familia, fieldName);
    const fieldLabel = label || getFieldLabel(fieldName);
    return (
      <div key={fieldName} style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block', marginBottom: '4px' }}>
          {fieldLabel}
        </label>
        <p style={{ margin: 0, fontSize: '14px', color: '#334155' }}>
          {formatFieldValue(value)}
        </p>
      </div>
    );
  };

  const renderTabContent = (tabConfig: typeof familiaTabsConfig[0]) => {
    if (tabConfig.id === 'nucleo') {
      // Renderizar array de núcleo familiar
      // Pode vir como array direto ou de tabela relacionada
      let nucleoData: any[] = [];
      
      // Tentar obter de diferentes formatos
      const nucleoDirect = getFieldValue(familia, 'nucleo');
      const nucleoRel = (familia as any).nucleo_rel || (familia as any).nucleo;
      
      if (Array.isArray(nucleoDirect)) {
        nucleoData = nucleoDirect;
      } else if (Array.isArray(nucleoRel)) {
        nucleoData = nucleoRel;
      }
      
      if (!nucleoData || nucleoData.length === 0) {
        return <p style={{ color: '#64748b' }}>Nenhum integrante cadastrado</p>;
      }
      
      return (
        <div>
          {nucleoData.map((integrante: any, index: number) => {
            // Mapear campos do banco para campos do XML
            const nome = integrante.nome || integrante.q2_1_1 || integrante.q2_1_1;
            const parentesco = integrante.g_parentesco || integrante.q2_1_2;
            const parentescoOutro = integrante.g_parentesco_outro || integrante.q2_1_2_1;
            const sexo = integrante.sexo || integrante.q2_1_3;
            const dataNascimento = integrante.d_nascimento || integrante.q2_1_4;
            const idade = integrante.idade || integrante.q2_1_4_1;
            
            return (
              <div key={integrante.id || index} style={{
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                marginBottom: '16px',
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600', color: '#3b2313' }}>
                  Integrante {index + 1}
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '12px'
                }}>
                  {nome && renderField(`nucleo[${index}].nome`, 'Nome', nome)}
                  {parentesco && renderField(`nucleo[${index}].parentesco`, 'Grau de Parentesco', parentesco)}
                  {parentescoOutro && renderField(`nucleo[${index}].parentesco_outro`, 'Grau de Parentesco - Outro', parentescoOutro)}
                  {sexo && renderField(`nucleo[${index}].sexo`, 'Sexo', sexo)}
                  {dataNascimento && renderField(`nucleo[${index}].data_nascimento`, 'Data de Nascimento', dataNascimento)}
                  {idade && renderField(`nucleo[${index}].idade`, 'Idade (em anos)', idade)}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px'
      }}>
        {tabConfig.fields.map(fieldName => {
          const label = getFieldLabel(fieldName);
          return renderField(fieldName, label);
        })}
      </div>
    );
  };

  if (loading && !familia && !error) {
    return (
      <div className="supervisao-ocupacional-module">
        <div className="loading-container">
          <Loader2 size={32} className="spinning" />
          <p>Carregando família...</p>
        </div>
      </div>
    );
  }

  if (error && !familia) {
    return (
      <div className="supervisao-ocupacional-module">
        <div className="content-header">
          <div className="header-info">
            <h1>
              <Users size={24} />
              Erro ao carregar família
            </h1>
          </div>
          <div className="header-actions">
            <button
              onClick={() => navigate('/supervisao-ocupacional/familias')}
              style={{
                padding: '10px 20px',
                background: '#f3f4f6',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
          </div>
        </div>
        <div className="lista-content">
          <div style={{ 
            background: '#fee2e2', 
            border: '1px solid #ef4444', 
            color: '#991b1b', 
            padding: '16px', 
            borderRadius: '8px'
          }}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!familia && !loading) {
    return (
      <div className="supervisao-ocupacional-module">
        <div className="content-header">
          <div className="header-info">
            <h1>
              <Users size={24} />
              Família não encontrada
            </h1>
          </div>
          <div className="header-actions">
            <button
              onClick={() => navigate('/supervisao-ocupacional/familias')}
              style={{
                padding: '10px 20px',
                background: '#f3f4f6',
                color: '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ArrowLeft size={16} />
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!familia) return null;

  const tabs = familiaTabsConfig.map(tabConfig => ({
    id: tabConfig.id,
    label: tabConfig.label,
    content: (
      <div style={{ padding: '20px', background: 'white', borderRadius: '8px' }}>
        {renderTabContent(tabConfig)}
      </div>
    )
  }));

  return (
    <div className="supervisao-ocupacional-module">
      <div className="content-header">
        <div className="header-info">
          <h1>
            <Users size={24} />
            Família #{familia.id}
          </h1>
          <p>URI: {familia.uri}</p>
        </div>
        <div className="header-actions">
          {(() => {
            const canEdit = hasPermission('sistema', 'admin') || 
                            hasPermission('supervisao_ocupacional', 'admin') || 
                            hasPermission('supervisao_ocupacional', 'tecnico');
            return canEdit ? (
              <button
                onClick={() => navigate(`/supervisao-ocupacional/familias/${familia.id}/editar`)}
                style={{
                  padding: '10px 20px',
                  background: '#056839',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginRight: '8px'
                }}
              >
                <Edit size={16} />
                Editar
              </button>
            ) : null;
          })()}
          <button
            onClick={() => navigate('/supervisao-ocupacional/familias')}
            style={{
              padding: '10px 20px',
              background: '#f3f4f6',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
        </div>
      </div>

      <div className="lista-content">
        {error && (
          <div style={{ 
            background: '#fee2e2', 
            border: '1px solid #ef4444', 
            color: '#991b1b', 
            padding: '16px', 
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Informações Básicas e Validação */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#3b2313' }}>
              Informações Básicas
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Gleba</label>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#334155' }}>
                  {familia.gleba_rel?.descricao || '-'}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Município / Estado</label>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#334155' }}>
                  {familia.municipio_rel?.descricao || '-'} / {familia.estado_rel?.uf || '-'}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Comunidade</label>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#334155' }}>
                  {familia.comunidade || '-'}
                </p>
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Número de Moradores</label>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#334155' }}>
                  {familia.n_moradores || '-'}
                </p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <Validacao
              familiaId={familia.id}
              validacaoStatus={familia.validacao}
              validacaoUsuario={familia.tecnico}
              validacaoData={familia.data_hora_validado}
              validacaoObs={familia.obs_validacao}
              validacaoUsuarioNome={familia.tecnico_rel?.name || null}
              onUpdate={loadFamilia}
            />
          </div>
        </div>

        {/* Abas com Formulário Completo */}
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <Tabs tabs={tabs} />
        </div>
      </div>
    </div>
  );
}
