import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { Map, Save, X, Loader2 } from 'lucide-react';
import './SupervisaoOcupacionalModule.css';

interface Gleba {
  id: number;
  descricao: string;
  municipio: string | null;
  id_municipio: number | null;
  estado: string | null;
  id_estado: number | null;
  pasta: string | null;
}

interface Estado {
  id: number;
  descricao: string;
  uf: string;
}

interface Municipio {
  id: number;
  descricao: string;
}

export default function EdicaoGleba() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extrair ID do pathname usando useMemo para garantir que seja recalculado
  const idFromPath = useMemo(() => {
    const match = location.pathname.match(/\/territorios\/edicao\/(\d+)/);
    const id = match ? match[1] : null;
    console.log('EdicaoGleba - pathname:', location.pathname, 'ID extraído:', id);
    return id;
  }, [location.pathname]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gleba, setGleba] = useState<Gleba | null>(null);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const loadingRef = useRef(false);
  const currentIdRef = useRef<string | null>(null);

  // Reset quando ID mudar
  useEffect(() => {
    if (currentIdRef.current !== idFromPath) {
      currentIdRef.current = idFromPath;
      loadingRef.current = false;
      setGleba(null);
      setError(null);
    }
  }, [idFromPath]);

  useEffect(() => {
    console.log('EdicaoGleba useEffect - idFromPath:', idFromPath, 'loadingRef.current:', loadingRef.current, 'gleba?.id:', gleba?.id);
    
    if (!idFromPath) {
      console.error('EdicaoGleba - ID não encontrado no pathname:', location.pathname);
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

    // Evitar carregar novamente se já está carregando ou já carregou esta gleba
    if (loadingRef.current || (gleba && gleba.id === idNum)) {
      console.log('EdicaoGleba - Pulando carregamento (já carregando ou já carregado)');
      return;
    }

    console.log('EdicaoGleba - Iniciando carregamento para ID:', idNum);
    loadingRef.current = true;
    loadGleba();
    loadEstados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idFromPath, gleba]);

  useEffect(() => {
    if (gleba?.id_estado && !municipios.length) {
      loadMunicipios(gleba.id_estado);
    }
  }, [gleba?.id_estado, municipios.length]);

  const loadGleba = async () => {
    if (!idFromPath) {
      loadingRef.current = false;
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/supervisao-ocupacional/glebas/${idFromPath}`);
      if (response.data.success) {
        setGleba(response.data.data);
      } else {
        setError('Erro ao carregar gleba: resposta inválida');
        setLoading(false);
        loadingRef.current = false;
      }
    } catch (err: any) {
      console.error('Erro ao carregar gleba:', err);
      const errorMsg = err.response?.data?.error || err.message || 'Erro ao carregar território';
      setError(errorMsg);
      setLoading(false);
      loadingRef.current = false;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const loadEstados = async () => {
    try {
      const response = await api.get('/supervisao-ocupacional/estados');
      if (response.data.success) {
        setEstados(response.data.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar estados:', err);
    }
  };

  const loadMunicipios = async (estadoId: number) => {
    try {
      const response = await api.get(`/supervisao-ocupacional/municipios/${estadoId}`);
      if (response.data.success) {
        setMunicipios(response.data.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar municípios:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gleba || !idFromPath) return;

    try {
      setSaving(true);
      setError(null);
      const response = await api.put(`/supervisao-ocupacional/glebas/${idFromPath}`, gleba);
      if (response.data.success) {
        navigate('/familias/territorios');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao salvar território');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !gleba && !error) {
    return (
      <div className="supervisao-ocupacional-module">
        <div className="loading-container">
          <Loader2 size={32} className="spinning" />
          <p>Carregando território...</p>
        </div>
      </div>
    );
  }

  if (error && !gleba) {
    return (
      <div className="supervisao-ocupacional-module">
        <div className="content-header">
          <div className="header-info">
            <h1>
              <Map size={24} />
              Erro ao carregar território
            </h1>
          </div>
          <div className="header-actions">
            <button
              onClick={() => navigate('/familias/territorios')}
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

  if (!gleba && !loading) {
    return (
      <div className="supervisao-ocupacional-module">
        <div className="content-header">
          <div className="header-info">
            <h1>
              <Map size={24} />
              Território não encontrado
            </h1>
          </div>
          <div className="header-actions">
            <button
              onClick={() => navigate('/familias/territorios')}
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
            Território não encontrado
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="supervisao-ocupacional-module">
      <div className="content-header">
        <div className="header-info">
          <h1>
            <Map size={24} />
            Editar território #{gleba.id}
          </h1>
        </div>
        <div className="header-actions">
          <button
            onClick={() => navigate('/familias/territorios')}
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

        <form onSubmit={handleSubmit} style={{
          background: 'white',
          padding: '24px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                Descrição *
              </label>
              <input
                type="text"
                value={gleba.descricao || ''}
                onChange={(e) => setGleba({ ...gleba, descricao: e.target.value })}
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

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                Estado *
              </label>
              <select
                value={gleba.id_estado || ''}
                onChange={(e) => {
                  const estadoId = e.target.value ? parseInt(e.target.value) : null;
                  const estado = estados.find(e => e.id === estadoId);
                  setGleba({
                    ...gleba,
                    id_estado: estadoId,
                    estado: estado?.uf || null,
                    id_municipio: null,
                    municipio: null
                  });
                }}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Selecione um estado</option>
                {estados.map(estado => (
                  <option key={estado.id} value={estado.id}>
                    {estado.uf} - {estado.descricao}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                Município *
              </label>
              <select
                value={gleba.id_municipio || ''}
                onChange={(e) => {
                  const municipioId = e.target.value ? parseInt(e.target.value) : null;
                  const municipio = municipios.find(m => m.id === municipioId);
                  setGleba({
                    ...gleba,
                    id_municipio: municipioId,
                    municipio: municipio?.descricao || null
                  });
                }}
                required
                disabled={!gleba.id_estado}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  opacity: gleba.id_estado ? 1 : 0.5
                }}
              >
                <option value="">Selecione um município</option>
                {municipios.map(municipio => (
                  <option key={municipio.id} value={municipio.id}>
                    {municipio.descricao}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>
                Pasta
              </label>
              <input
                type="text"
                value={gleba.pasta || ''}
                onChange={(e) => setGleba({ ...gleba, pasta: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => navigate('/familias/territorios')}
                style={{
                  padding: '12px 24px',
                  background: '#f3f4f6',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{
                  padding: '12px 24px',
                  background: '#056839',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {saving ? <Loader2 size={16} className="spinning" /> : <Save size={16} />}
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
