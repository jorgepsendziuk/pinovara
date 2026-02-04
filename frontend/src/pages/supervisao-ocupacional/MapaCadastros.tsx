import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import { Map as MapIcon, Search, Eye, Loader2, Users, Home } from 'lucide-react';
import { StatusValidacaoBadge } from '../../utils/validacaoHelpers';
import './SupervisaoOcupacionalModule.css';

// Corrigir ícones padrão do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FamiliaComGps {
  id: number;
  uri: string;
  gps_lat: number | null;
  gps_lng: number | null;
  gleba_rel: { id: number; descricao: string } | null;
  estado_rel: { id: number; descricao: string; uf: string } | null;
  municipio_rel: { id: number; descricao: string } | null;
  validacao: number | null;
  comunidade: string | null;
  n_moradores: number | null;
}

export default function MapaCadastros() {
  const navigate = useNavigate();
  const [familias, setFamilias] = useState<FamiliaComGps[]>([]);
  const [filteredFamilias, setFilteredFamilias] = useState<FamiliaComGps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markersMap, setMarkersMap] = useState<Map<number, any>>(new Map());

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroMunicipio, setFiltroMunicipio] = useState('');
  const [filtroGleba, setFiltroGleba] = useState('');
  const [filtroValidacao, setFiltroValidacao] = useState('');
  const [estadosDisponiveis, setEstadosDisponiveis] = useState<Array<{ id: number; descricao: string; uf: string }>>([]);
  const [municipiosDisponiveis, setMunicipiosDisponiveis] = useState<Array<{ id: number; descricao: string }>>([]);
  const [glebasDisponiveis, setGlebasDisponiveis] = useState<Array<{ id: number; descricao: string }>>([]);

  useEffect(() => {
    fetchFamilias();
    fetchEstados();
    fetchGlebas();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [familias, filtroEstado, filtroMunicipio, filtroGleba, filtroValidacao]);

  useEffect(() => {
    if (filtroEstado) {
      fetchMunicipios(parseInt(filtroEstado));
    } else {
      setMunicipiosDisponiveis([]);
    }
  }, [filtroEstado]);

  const fetchFamilias = async () => {
    try {
      setLoading(true);
      const response = await api.get('/supervisao-ocupacional/familias', {
        params: { limit: 1000 }
      });
      if (response.data.success) {
        const familiasComGps = (response.data.data.data || []).filter(
          (f: FamiliaComGps) => f.gps_lat && f.gps_lng
        );
        setFamilias(familiasComGps);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar famílias');
    } finally {
      setLoading(false);
    }
  };

  const fetchEstados = async () => {
    try {
      const response = await api.get('/supervisao-ocupacional/estados');
      if (response.data.success) {
        setEstadosDisponiveis(response.data.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar estados:', err);
    }
  };

  const fetchMunicipios = async (estadoId: number) => {
    try {
      const response = await api.get(`/supervisao-ocupacional/municipios/${estadoId}`);
      if (response.data.success) {
        setMunicipiosDisponiveis(response.data.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar municípios:', err);
    }
  };

  const fetchGlebas = async () => {
    try {
      const response = await api.get('/supervisao-ocupacional/glebas', {
        params: { limit: 1000 }
      });
      if (response.data.success) {
        setGlebasDisponiveis(response.data.data.data || []);
      }
    } catch (err) {
      console.error('Erro ao carregar glebas:', err);
    }
  };

  const applyFilters = () => {
    let filtered = familias;

    if (filtroEstado) {
      filtered = filtered.filter(f => f.estado_rel?.id === parseInt(filtroEstado));
    }
    if (filtroMunicipio) {
      filtered = filtered.filter(f => f.municipio_rel?.id === parseInt(filtroMunicipio));
    }
    if (filtroGleba) {
      filtered = filtered.filter(f => f.gleba_rel?.id === parseInt(filtroGleba));
    }
    if (filtroValidacao) {
      filtered = filtered.filter(f => f.validacao === parseInt(filtroValidacao));
    }

    setFilteredFamilias(filtered);
  };

  const handleIrPara = (familia: FamiliaComGps) => {
    if (mapInstance && markersMap.has(familia.id) && familia.gps_lat && familia.gps_lng) {
      const marker = markersMap.get(familia.id);
      mapInstance.setView([familia.gps_lat, familia.gps_lng], 15, { animate: true });
      marker.openPopup();
    }
  };

  if (loading) {
    return (
      <div className="supervisao-ocupacional-module">
        <div className="loading-container">
          <Loader2 size={32} className="spinning" />
          <p>Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="supervisao-ocupacional-module">
      <div className="content-header">
        <div className="header-info">
          <h1>
            <MapIcon size={24} />
            Mapa de Cadastros
          </h1>
          <p>
            {filteredFamilias.length} família{filteredFamilias.length !== 1 ? 's' : ''} com localização
          </p>
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

        {/* Filtros */}
        <div style={{
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '16px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Estado</label>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Todos os estados</option>
                {estadosDisponiveis.map(estado => (
                  <option key={estado.id} value={estado.id.toString()}>
                    {estado.uf} - {estado.descricao}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Município</label>
              <select
                value={filtroMunicipio}
                onChange={(e) => setFiltroMunicipio(e.target.value)}
                disabled={!filtroEstado}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  opacity: filtroEstado ? 1 : 0.5
                }}
              >
                <option value="">Todos os municípios</option>
                {municipiosDisponiveis.map(municipio => (
                  <option key={municipio.id} value={municipio.id.toString()}>
                    {municipio.descricao}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Gleba</label>
              <select
                value={filtroGleba}
                onChange={(e) => setFiltroGleba(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Todas as glebas</option>
                {glebasDisponiveis.map(gleba => (
                  <option key={gleba.id} value={gleba.id.toString()}>
                    {gleba.descricao}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500', color: '#334155' }}>Validação</label>
              <select
                value={filtroValidacao}
                onChange={(e) => setFiltroValidacao(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Todas as validações</option>
                <option value="1">Não Validado</option>
                <option value="2">Validado</option>
                <option value="3">Pendência</option>
                <option value="4">Reprovado</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setFiltroEstado('');
              setFiltroMunicipio('');
              setFiltroGleba('');
              setFiltroValidacao('');
            }}
            style={{
              padding: '8px 16px',
              background: '#f3f4f6',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Limpar Filtros
          </button>
        </div>

        {/* Container Principal com Mapa e Lista */}
        <div style={{ display: 'flex', gap: '16px', flexDirection: window.innerWidth < 1024 ? 'column' : 'row' }}>
          {/* Mapa Grande */}
          <div style={{ flex: 1, minHeight: '600px' }}>
            <MapaGrande
              familias={filteredFamilias}
              onFamiliaClick={(id) => navigate(`/supervisao-ocupacional/familias/${id}`)}
              onMapReady={(map, markers) => {
                setMapInstance(map);
                setMarkersMap(markers);
              }}
            />
          </div>

          {/* Lista Lateral */}
          <div style={{
            width: window.innerWidth < 1024 ? '100%' : '350px',
            background: 'white',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            maxHeight: '600px',
            overflowY: 'auto'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#3b2313'
            }}>
              <Users size={18} /> Famílias ({filteredFamilias.length})
            </h3>
            <div>
              {filteredFamilias.length === 0 ? (
                <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', padding: '20px' }}>
                  Nenhuma família encontrada com localização GPS.
                </p>
              ) : (
                filteredFamilias.map((familia) => (
                  <div key={familia.id} style={{
                    padding: '12px',
                    borderBottom: '1px solid #f1f5f9',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#3b2313' }}>
                          #{familia.id}
                        </h4>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>
                          {familia.gleba_rel?.descricao || 'Sem gleba'}
                        </p>
                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>
                          {familia.municipio_rel?.descricao || '-'} / {familia.estado_rel?.uf || '-'}
                        </p>
                        <StatusValidacaoBadge status={familia.validacao} size="small" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleIrPara(familia)}
                        style={{
                          padding: '6px 12px',
                          background: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#64748b'
                        }}
                      >
                        <MapIcon size={12} /> Ir Para
                      </button>
                      <button
                        onClick={() => navigate(`/supervisao-ocupacional/familias/${familia.id}`)}
                        style={{
                          padding: '6px 12px',
                          background: '#056839',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Eye size={12} /> Ver
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente do Mapa Grande
interface MapaGrandeProps {
  familias: FamiliaComGps[];
  onFamiliaClick: (id: number) => void;
  onMapReady?: (map: any, markers: Map<number, any>) => void;
}

function MapaGrande({ familias, onFamiliaClick, onMapReady }: MapaGrandeProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<number, any>>(new Map());
  const initializedRef = useRef(false);

  useEffect(() => {
    // Aguardar um pouco para garantir que o DOM está pronto
    const timer = setTimeout(() => {
      const mapContainer = document.getElementById('mapa-cadastros');
      if (!mapContainer || initializedRef.current) return;

      // Limpar mapa anterior se existir
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Centro do Brasil
      const mapCenter: [number, number] = [-14.235, -51.925];
      const map = L.map('mapa-cadastros', {
        center: mapCenter,
        zoom: 4,
        zoomControl: true,
        preferCanvas: false
      });

      // Adicionar tiles do OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
        minZoom: 2
      }).addTo(map);

      mapRef.current = map;
      initializedRef.current = true;

      // Forçar atualização do tamanho após um delay
      setTimeout(() => {
        map.invalidateSize();
      }, 300);

      if (onMapReady) {
        onMapReady(map, markersRef.current);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, []); // Executar apenas uma vez na montagem

  // Atualizar marcadores quando familias mudarem
  useEffect(() => {
    if (!mapRef.current || !initializedRef.current) return;

    const map = mapRef.current;

    // Limpar marcadores anteriores
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current.clear();

    // Adicionar marcadores para cada família
    familias.forEach((familia) => {
      if (!familia.gps_lat || !familia.gps_lng) return;

      // Criar popup HTML
      const popupContent = document.createElement('div');
      popupContent.style.maxWidth = '250px';
      popupContent.style.fontFamily = 'system-ui, sans-serif';
      
      const localizacao = familia.municipio_rel?.descricao && familia.estado_rel?.uf
        ? `${familia.municipio_rel.descricao} - ${familia.estado_rel.uf}`
        : familia.estado_rel?.uf || 'Localização não informada';

      popupContent.innerHTML = `
        <h4 style="margin: 0 0 8px 0; color: #2c3e50; font-size: 16px;">#${familia.id}</h4>
        <div style="margin-bottom: 8px;">
          <p style="margin: 4px 0; color: #34495e; font-size: 14px;"><strong>Gleba:</strong> ${familia.gleba_rel?.descricao || 'Não informada'}</p>
          <p style="margin: 4px 0; color: #34495e; font-size: 14px;">${localizacao}</p>
          ${familia.comunidade ? `<p style="margin: 4px 0; color: #34495e; font-size: 13px;"><strong>Comunidade:</strong> ${familia.comunidade}</p>` : ''}
          ${familia.n_moradores ? `<p style="margin: 4px 0; color: #34495e; font-size: 13px;"><strong>Moradores:</strong> ${familia.n_moradores}</p>` : ''}
        </div>
      `;

      // Criar marcador
      const marker = L.marker([familia.gps_lat, familia.gps_lng], {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `<div style="
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #056839;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(map);

      marker.bindPopup(popupContent);
      marker.on('click', () => onFamiliaClick(familia.id));

      markersRef.current.set(familia.id, marker);
    });

    // Ajustar view para mostrar todos os marcadores
    if (familias.length > 0 && familias.some(f => f.gps_lat && f.gps_lng)) {
      const bounds = L.latLngBounds(
        familias
          .filter(f => f.gps_lat && f.gps_lng)
          .map(f => [f.gps_lat!, f.gps_lng!])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Forçar atualização do mapa
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [familias, onFamiliaClick]);

  return (
    <div
      id="mapa-cadastros"
      style={{
        height: '600px',
        width: '100%',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#f5f5f5',
        position: 'relative',
        zIndex: 1
      }}
    />
  );
}
