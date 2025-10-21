import { useState, useEffect } from 'react';
import {
  Map as MapIcon,
  Search,
  Trash,
  Eye,
  Edit,
  XCircle,
  FileText
} from 'lucide-react';
import { renderToString } from 'react-dom/server';

interface OrganizacaoComGps {
  id: number;
  nome: string;
  lat: number;
  lng: number;
  estado: number;
  estado_nome?: string;
  municipio_nome?: string;
  cnpj?: string;
  telefone?: string;
}

interface MapaOrganizacoesPageProps {
  onNavigate: (view: 'dashboard' | 'lista' | 'cadastro' | 'edicao' | 'mapa' | 'detalhes', organizacaoId?: number) => void;
}

function MapaOrganizacoesPage({ onNavigate }: MapaOrganizacoesPageProps) {
  const [organizacoes, setOrganizacoes] = useState<OrganizacaoComGps[]>([]);
  const [filteredOrganizacoes, setFilteredOrganizacoes] = useState<OrganizacaoComGps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markersMap, setMarkersMap] = useState<Map<number, any>>(new Map());

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroMunicipio, setFiltroMunicipio] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [estadosDisponiveis, setEstadosDisponiveis] = useState<string[]>([]);
  const [municipiosDisponiveis, setMunicipiosDisponiveis] = useState<string[]>([]);

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

  const handleIrPara = (org: OrganizacaoComGps) => {
    if (mapInstance && markersMap.has(org.id)) {
      const marker = markersMap.get(org.id);
      mapInstance.setView([org.lat, org.lng], 15, { animate: true });
      marker.openPopup();
    }
  };

  // Função para gerar relatório
  const gerarRelatorio = async (organizacaoId: number, nomeOrganizacao: string) => {
    try {
      const response = await fetch(`${API_BASE}/organizacoes/${organizacaoId}/relatorio/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('@pinovara:token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar relatório');
      }

      // Baixar PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_${nomeOrganizacao?.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      alert('✅ Relatório gerado com sucesso!');
    } catch (error: any) {
      alert(`❌ Erro ao gerar relatório: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchOrganizacoes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [organizacoes, filtroEstado, filtroMunicipio, filtroNome]);

  const fetchOrganizacoes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('@pinovara:token');

      const response = await fetch(`${API_BASE}/organizacoes/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar estatísticas');
      }

      const responseData = await response.json();
      const statsData = responseData.data;

      // Usar os dados da API como no dashboard
      const orgsComGps = statsData.organizacoesComGps || [];
      setOrganizacoes(orgsComGps);

      // Extrair estados e municípios únicos (usando os nomes, não os IDs)
      const estados = [...new Set(orgsComGps.map((org: OrganizacaoComGps) => org.estado_nome).filter(Boolean))].sort();
      const municipios = [...new Set(orgsComGps.map((org: OrganizacaoComGps) => org.municipio_nome).filter(Boolean))].sort();

      setEstadosDisponiveis(estados);
      setMunicipiosDisponiveis(municipios);
      
      console.log('Estados disponíveis:', estados);
      console.log('Municípios disponíveis:', municipios);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = organizacoes;

    if (filtroEstado) {
      filtered = filtered.filter(org => org.estado_nome === filtroEstado);
    }

    if (filtroMunicipio) {
      filtered = filtered.filter(org => org.municipio_nome === filtroMunicipio);
    }

    if (filtroNome) {
      filtered = filtered.filter(org =>
        org.nome.toLowerCase().includes(filtroNome.toLowerCase()) ||
        (org.cnpj && org.cnpj.includes(filtroNome))
      );
    }

    setFilteredOrganizacoes(filtered);
  };

  const clearFilters = () => {
    setFiltroEstado('');
    setFiltroMunicipio('');
    setFiltroNome('');
  };

  if (loading) {
    return (
      <div className="mapa-page">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', fontSize: '1.5rem' }}>
          <MapIcon size={24} /> Mapa das Organizações
        </h2>
        <div className="loading-spinner">Carregando organizações...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mapa-page">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0', fontSize: '1.5rem' }}>
          <MapIcon size={24} /> Mapa das Organizações
        </h2>
        <div className="error-message">
          <p><XCircle size={16} style={{marginRight: '0.5rem'}} /> {error}</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button onClick={fetchOrganizacoes} className="btn btn-primary">
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mapa-page">
      {/* Header Compacto */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '1.5rem' }}>
          <MapIcon size={24} /> Mapa das Organizações
          <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>
            ({filteredOrganizacoes.length})
          </span>
        </h2>
      </div>

      {/* Filtros Compactos */}
      <div style={{
        background: 'white',
        padding: '0.75rem 1rem',
        marginBottom: '0.75rem',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'end',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '150px' }}>
          <label htmlFor="filtro-estado" style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151' }}>
            Estado:
          </label>
          <select
            id="filtro-estado"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '0.85rem'
            }}
          >
            <option value="">Todos</option>
            {estadosDisponiveis.map(estado => (
              <option key={estado} value={estado}>{estado}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: '180px' }}>
          <label htmlFor="filtro-municipio" style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151' }}>
            Município:
          </label>
          <select
            id="filtro-municipio"
            value={filtroMunicipio}
            onChange={(e) => setFiltroMunicipio(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '0.85rem'
            }}
          >
            <option value="">Todos</option>
            {municipiosDisponiveis.map(municipio => (
              <option key={municipio} value={municipio}>{municipio}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, minWidth: '200px' }}>
          <label htmlFor="filtro-nome" style={{ fontSize: '0.85rem', fontWeight: '500', color: '#374151' }}>
            Buscar:
          </label>
          <input
            id="filtro-nome"
            type="text"
            placeholder="Nome ou CNPJ..."
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '0.85rem'
            }}
          />
        </div>

        {(filtroEstado || filtroMunicipio || filtroNome) && (
          <button 
            onClick={clearFilters} 
            className="btn btn-sm"
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.85rem',
              background: '#f3f4f6',
              color: '#666',
              border: '1px solid #ddd'
            }}
          >
            <Trash size={14} /> Limpar
          </button>
        )}
      </div>

      {/* Container Principal com Mapa e Lista */}
      <div className="mapa-main-container">
        {/* Mapa Grande */}
        <div className="mapa-container">
          <MapaGrande
            organizacoes={filteredOrganizacoes}
            onOrganizacaoClick={(id) => onNavigate('detalhes', id)}
            onNavigate={onNavigate}
            onGerarRelatorio={gerarRelatorio}
            onMapReady={(map, markers) => {
              setMapInstance(map);
              setMarkersMap(markers);
            }}
          />
        </div>

        {/* Lista Lateral */}
        <div className="lista-lateral">
          <h3 style={{ 
            margin: '0 0 0.75rem 0',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#3b2313'
          }}>
            <MapIcon size={18} /> Organizações ({filteredOrganizacoes.length})
          </h3>
          <div className="lista-organizacoes">
            {filteredOrganizacoes.length === 0 ? (
              <p className="empty-state" style={{ fontSize: '0.9rem', color: '#666' }}>
                Nenhuma organização encontrada.
              </p>
            ) : (
              filteredOrganizacoes.map((org) => (
                <div key={org.id} className="org-card">
                  <div className="org-info">
                    <h4>{org.nome}</h4>
                    <p className="org-details">
                      {org.estado_nome || 'Estado não informado'}
                      {org.municipio_nome && ` - ${org.municipio_nome}`}
                      {org.telefone && (
                        <>
                          <br />
                          {org.telefone}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="org-actions">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => handleIrPara(org)}
                    >
                      <Eye size={14} /> Ir Para
                    </button>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => onNavigate('edicao', org.id)}
                    >
                      <Edit size={14} /> Editar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente do Mapa Grande
interface MapaGrandeProps {
  organizacoes: OrganizacaoComGps[];
  onOrganizacaoClick: (id: number) => void;
  onNavigate: (view: 'dashboard' | 'lista' | 'cadastro' | 'edicao' | 'mapa' | 'detalhes', organizacaoId?: number) => void;
  onGerarRelatorio?: (organizacaoId: number, nomeOrganizacao: string) => void;
  onMapReady?: (map: any, markers: Map<number, any>) => void;
}

function MapaGrande({ organizacoes, onOrganizacaoClick, onNavigate, onGerarRelatorio, onMapReady }: MapaGrandeProps) {
  useEffect(() => {
    if (organizacoes.length === 0) return;

    // Centro do Brasil
    const mapCenter: [number, number] = [-14.235, -51.925];
    const map = L.map('mapa-grande').setView(mapCenter, 4);

    // Adicionar tiles do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Map para armazenar referências dos marcadores
    const markers = new Map<number, any>();

    // Adicionar marcadores para cada organização
    organizacoes.forEach((org) => {
      // Criar popup HTML com botões
      const popupContent = document.createElement('div');
      popupContent.style.maxWidth = '250px';
      popupContent.style.fontFamily = 'system-ui, sans-serif';
      const estadoNome = org.estado_nome || 'Não informado';
      const municipioNome = org.municipio_nome || '';
      const localizacao = estadoNome && municipioNome ? `${estadoNome} - ${municipioNome}` : estadoNome;
      
      popupContent.innerHTML = `
        <h4 style="margin: 0 0 8px 0; color: #2c3e50; font-size: 16px;">#${org.id} ${org.nome}</h4>
        <div style="margin-bottom: 8px;">
          <p style="margin: 4px 0; color: #34495e; font-size: 14px;">${localizacao}</p>
          ${org.telefone ? `<p style="margin: 4px 0; color: #34495e; font-size: 14px;"><strong>Telefone:</strong> ${org.telefone}</p>` : ''}
          ${org.cnpj ? `<p style="margin: 4px 0; color: #34495e; font-size: 13px;"><strong>CNPJ:</strong> ${org.cnpj}</p>` : ''}
        </div>
      `;
      
      // Container para botões
      if (onGerarRelatorio) {
        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = 'margin-top: 8px;';
        
        const btnRelatorio = document.createElement('button');
        const iconSvg = renderToString(<FileText size={14} />);
        btnRelatorio.innerHTML = `<span style="display: inline-flex; align-items: center; gap: 4px;">${iconSvg} Ver Relatório</span>`;
        btnRelatorio.style.cssText = `
          width: 100%;
          padding: 6px 12px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        `;
        btnRelatorio.onmouseover = () => btnRelatorio.style.background = '#218838';
        btnRelatorio.onmouseout = () => btnRelatorio.style.background = '#28a745';
        btnRelatorio.onclick = (e) => {
          e.stopPropagation();
          onGerarRelatorio(org.id, org.nome);
        };
        
        btnContainer.appendChild(btnRelatorio);
        popupContent.appendChild(btnContainer);
      }

      const marker = L.marker([org.lat, org.lng])
        .addTo(map)
        .bindPopup(popupContent);

      // Armazenar referência do marcador
      markers.set(org.id, marker);
    });

    // Ajustar zoom para mostrar todos os marcadores
    if (organizacoes.length > 0) {
      const group = new L.featureGroup(
        organizacoes.map(org => L.marker([org.lat, org.lng]))
      );
      map.fitBounds(group.getBounds().pad(0.1));
    }

    // Notificar que o mapa está pronto
    if (onMapReady) {
      onMapReady(map, markers);
    }

    // Cleanup function
    return () => {
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizacoes]);

  return (
    <div
      id="mapa-grande"
      style={{
        height: '100%',
        width: '100%',
        borderRadius: '8px',
        border: '1px solid #ddd',
        minHeight: '600px'
      }}
    />
  );
}

// Import necessário para o Leaflet
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corrigir ícones do Leaflet para React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default MapaOrganizacoesPage;
