import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { Users, ArrowLeft, Loader2, Save, X } from 'lucide-react';
import Tabs from '../../components/Tabs/Tabs';
import { familiaTabsConfig, getFieldValue, getFieldLabel } from '../../utils/familiaFormMapping';
import { FamiliaCompleta } from '../../types/familia';
import { useAuth } from '../../contexts/AuthContext';
import { hasFieldOptions, getFieldOptions, isMultipleSelect } from '../../utils/familiaFieldOptions';
import './SupervisaoOcupacionalModule.css';

interface Gleba {
  id: number;
  descricao: string;
}

export default function EdicaoFamilia() {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  
  const idFromPath = useMemo(() => {
    const match = location.pathname.match(/\/familias\/(\d+)\/editar/);
    return match ? match[1] : null;
  }, [location.pathname]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [familia, setFamilia] = useState<FamiliaCompleta | null>(null);
  const [formData, setFormData] = useState<Partial<FamiliaCompleta>>({});
  const loadingRef = useRef(false);
  const [glebas, setGlebas] = useState<Gleba[]>([]);

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

  useEffect(() => {
    if (familia) {
      console.log('[DEBUG] Familia carregada, atualizando formData:', familia);
      console.log('[DEBUG] FormData antes:', formData);
      setFormData(familia);
      console.log('[DEBUG] FormData atualizado com:', familia);
    }
  }, [familia]);

  useEffect(() => {
    loadGlebas();
  }, []);

  const loadGlebas = async () => {
    try {
      const response = await api.get('/supervisao-ocupacional/glebas', { params: { limit: 1000 } });
      if (response.data.success) {
        setGlebas(response.data.data.data || []);
      }
    } catch (err: any) {
      console.error('Erro ao carregar glebas:', err);
    }
  };

  const loadFamilia = async () => {
    if (!idFromPath) {
      loadingRef.current = false;
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('[DEBUG] Carregando família ID:', idFromPath);
      const response = await api.get(`/supervisao-ocupacional/familias/${idFromPath}`);
      console.log('[DEBUG] Resposta da API:', response.data);
      if (response.data.success) {
        console.log('[DEBUG] Dados da família recebidos:', response.data.data);
        console.log('[DEBUG] Campos mapeados - iuf_nome_ocupante:', response.data.data?.iuf_nome_ocupante);
        console.log('[DEBUG] Campos mapeados - g00_0_q1_2:', response.data.data?.g00_0_q1_2);
        console.log('[DEBUG] Campos mapeados - i_q1_10:', response.data.data?.i_q1_10);
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

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleSave = async () => {
    if (!idFromPath || !formData) return;

    try {
      setSaving(true);
      setError(null);
      
      const response = await api.put(`/supervisao-ocupacional/familias/${idFromPath}`, formData);
      
      if (response.data.success) {
        alert('Família atualizada com sucesso!');
        navigate(`/supervisao-ocupacional/familias/${idFromPath}`);
      } else {
        setError('Erro ao salvar: resposta inválida');
      }
    } catch (err: any) {
      console.error('Erro ao salvar família:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Erro ao salvar família';
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const renderField = (fieldName: string, label: string, type: string = 'text') => {
    const value = getFieldValue(formData, fieldName);
    
    // Debug para campos importantes
    if (['iuf_nome_ocupante', 'g00_0_q1_2', 'i_q1_10', 'i_q1_17'].includes(fieldName)) {
      console.log(`[DEBUG] renderField ${fieldName}:`, { value, formDataValue: formData[fieldName], getFieldValueResult: value });
    }
    
    // Campo quilombo: usar select de glebas
    if (fieldName === 'i_quilombo') {
      // Tentar encontrar a gleba atual pelo valor (pode ser ID ou nome)
      const currentGlebaId = value ? (typeof value === 'number' ? value : (typeof value === 'string' && !isNaN(parseInt(value)) ? parseInt(value) : null)) : null;
      
      return (
        <div key={fieldName} style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155', display: 'block', marginBottom: '8px' }}>
            Gleba/Assentamento/Quilombo
          </label>
          <select
            value={currentGlebaId ? currentGlebaId.toString() : ''}
            onChange={(e) => {
              const selectedValue = e.target.value;
              // Salvar o ID da gleba selecionada
              handleFieldChange(fieldName, selectedValue ? parseInt(selectedValue) : null);
              // Também atualizar cod_gleba se necessário
              handleFieldChange('cod_gleba', selectedValue ? parseInt(selectedValue) : null);
            }}
            style={{
              width: '100%',
              maxWidth: '100%',
              padding: '10px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            <option value="">Selecione uma Gleba/Assentamento/Quilombo...</option>
            {glebas.map((gleba) => (
              <option key={gleba.id} value={gleba.id.toString()}>
                {gleba.descricao}
              </option>
            ))}
          </select>
        </div>
      );
    }
    
    // Verificar se é campo de escolha
    if (hasFieldOptions(fieldName)) {
      const options = getFieldOptions(fieldName);
      const isMultiple = isMultipleSelect(fieldName);
      
      if (isMultiple) {
        // Select múltiplo (checkbox)
        const selectedValues = Array.isArray(value) ? value : (value ? [value] : []);
        return (
          <div key={fieldName} style={{ marginBottom: '16px', gridColumn: '1 / -1' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155', display: 'block', marginBottom: '8px' }}>
              {label}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {options.map((option) => {
                const isChecked = selectedValues.includes(String(option.value)) || selectedValues.includes(option.value);
                return (
                  <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const currentValues = Array.isArray(value) ? [...value] : (value ? [value] : []);
                        if (e.target.checked) {
                          currentValues.push(option.value);
                        } else {
                          const index = currentValues.findIndex(v => v === option.value || String(v) === String(option.value));
                          if (index > -1) currentValues.splice(index, 1);
                        }
                        handleFieldChange(fieldName, currentValues.length > 0 ? currentValues : null);
                      }}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', color: '#334155' }}>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      } else {
        // Select simples (dropdown)
        return (
          <div key={fieldName} style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155', display: 'block', marginBottom: '8px' }}>
              {label}
            </label>
            <select
              value={value !== null && value !== undefined ? String(value) : ''}
              onChange={(e) => {
                const selectedValue = e.target.value;
                if (!selectedValue) {
                  handleFieldChange(fieldName, null);
                } else {
                  // Tentar converter para número se possível
                  const option = options.find(opt => String(opt.value) === selectedValue);
                  const finalValue = option && typeof option.value === 'number' ? option.value : selectedValue;
                  handleFieldChange(fieldName, finalValue);
                }
              }}
              style={{
                width: '100%',
                maxWidth: '100%',
                padding: '10px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <option value="">Selecione...</option>
              {options.map((option) => (
                <option key={option.value} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );
      }
    }
    
    if (type === 'textarea') {
      return (
        <div key={fieldName} style={{ marginBottom: '16px', gridColumn: '1 / -1' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155', display: 'block', marginBottom: '8px' }}>
            {label}
          </label>
          <textarea
            value={value ? String(value) : ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value || null)}
            rows={4}
            style={{
              width: '100%',
              maxWidth: '100%',
              padding: '10px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
          />
        </div>
      );
    }
    
    if (type === 'number') {
      return (
        <div key={fieldName} style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155', display: 'block', marginBottom: '8px' }}>
            {label}
          </label>
          <input
            type="number"
            value={value !== null && value !== undefined ? value : ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value ? parseFloat(e.target.value) : null)}
            style={{
              width: '100%',
              maxWidth: '100%',
              padding: '10px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>
      );
    }
    
    if (type === 'date') {
      return (
        <div key={fieldName} style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155', display: 'block', marginBottom: '8px' }}>
            {label}
          </label>
          <input
            type="date"
            value={value ? String(value).split('T')[0] : ''}
            onChange={(e) => handleFieldChange(fieldName, e.target.value || null)}
            style={{
              width: '100%',
              maxWidth: '100%',
              padding: '10px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>
      );
    }
    
    return (
      <div key={fieldName} style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '14px', fontWeight: '500', color: '#334155', display: 'block', marginBottom: '8px' }}>
          {label}
        </label>
        <input
          type="text"
          value={value !== null && value !== undefined ? String(value) : ''}
          onChange={(e) => handleFieldChange(fieldName, e.target.value || null)}
          style={{
            width: '100%',
            maxWidth: '100%',
            padding: '10px',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '14px',
            boxSizing: 'border-box'
          }}
        />
      </div>
    );
  };

  // Verificar permissões de edição
  const canEdit = hasPermission('sistema', 'admin') || 
                  hasPermission('supervisao_ocupacional', 'admin') || 
                  hasPermission('supervisao_ocupacional', 'tecnico');

  useEffect(() => {
    if (!canEdit) {
      alert('Você não tem permissão para editar famílias');
      navigate(-1);
    }
  }, [canEdit, navigate]);

  const renderTabContent = (tabConfig: typeof familiaTabsConfig[0]) => {
    const typeMap: Record<string, string> = {
      'iuf_desc_acess': 'textarea',
      'obs_gerais': 'textarea',
      'obs_form': 'textarea',
      'g00_0_data_nascimento': 'date',
      'g00_0_data_casamento': 'date',
      'g00_0_1_conjuge_data_nascimento': 'date',
      'g00_0_1_conjuge_data_casamento': 'date',
      'ii_do_originaria': 'date',
      'ii_do_atual': 'date',
      'g00_0_idade': 'number',
      'g00_0_1_conjuge_idade': 'number',
      'ii_ai_matricula': 'number',
      'qa_q3_6_0': 'number',
      'qa_q3_6_1': 'number',
      'qa_q3_6_2': 'number',
      'qa_q3_6_3': 'number',
      'qa_q3_6_4': 'number',
      'qa_q3_6_5': 'number',
      'qa_q3_6_6': 'number',
      'qa_q3_6_7': 'number'
    };

    if (tabConfig.id === 'nucleo' || tabConfig.id === 'observacoes') {
      // Para núcleo e observações, usar textarea
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {tabConfig.fields.map(fieldName => {
            const label = getFieldLabel(fieldName);
            const type = typeMap[fieldName] || 'textarea';
            return renderField(fieldName, label, type);
          })}
        </div>
      );
    }

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        {tabConfig.fields.map(fieldName => {
          const label = getFieldLabel(fieldName);
          const type = typeMap[fieldName] || 'text';
          return renderField(fieldName, label, type);
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
        </div>
      </div>
    );
  }

  if (!familia) return null;

  const tabs = familiaTabsConfig.map(tabConfig => ({
    id: tabConfig.id,
    label: tabConfig.label,
    content: (
      <div style={{ 
        padding: '20px', 
        background: 'white', 
        borderRadius: '8px',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
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
            Editar Família #{familia.id}
          </h1>
          <p>URI: {familia.uri}</p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => navigate(`/supervisao-ocupacional/familias/${familia.id}`)}
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
            <X size={16} />
            Cancelar
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

        {/* Abas com Formulário Completo */}
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <Tabs tabs={tabs} />
        </div>
      </div>

      {/* Botão Flutuante de Salvar */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="floating-save-button"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          padding: '14px 28px',
          background: saving 
            ? '#94a3b8' 
            : 'linear-gradient(135deg, #056839 0%, #067a47 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          boxShadow: saving 
            ? '0 2px 8px rgba(148, 163, 184, 0.3)' 
            : '0 4px 12px rgba(5, 104, 57, 0.4)',
          cursor: saving ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: '600',
          fontSize: '14px',
          transition: 'all 0.3s ease',
          transform: saving ? 'none' : 'translateY(0)'
        }}
        onMouseEnter={(e) => {
          if (!saving) {
            e.currentTarget.style.background = 'linear-gradient(135deg, #04502d 0%, #056839 100%)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(5, 104, 57, 0.5)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          if (!saving) {
            e.currentTarget.style.background = 'linear-gradient(135deg, #056839 0%, #067a47 100%)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 104, 57, 0.4)';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {saving ? <Loader2 size={18} className="spinning" /> : <Save size={18} />}
        {saving ? 'Salvando...' : 'Salvar'}
      </button>
    </div>
  );
}
