import { useState, useEffect } from 'react';
import {
  Map,
  Search,
  Trash,
  Eye,
  Edit,
  XCircle
} from 'lucide-react';

interface OrganizacaoComGps {
  id: number;
  nome: string;
  lat: number;
  lng: number;
  estado: string;
  municipio?: string;
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

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroMunicipio, setFiltroMunicipio] = useState('');
  const [filtroNome, setFiltroNome] = useState('');
  const [estadosDisponiveis, setEstadosDisponiveis] = useState<string[]>([]);
  const [municipiosDisponiveis, setMunicipiosDisponiveis] = useState<string[]>([]);

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

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

      // Extrair estados e municípios únicos
      const estados = [...new Set(orgsComGps.map((org: OrganizacaoComGps) => org.estado))].sort();
      const municipios = [...new Set(orgsComGps.map((org: OrganizacaoComGps) => org.municipio).filter(Boolean))].sort();

      setEstadosDisponiveis(estados);
      setMunicipiosDisponiveis(municipios);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = organizacoes;

    if (filtroEstado) {
      filtered = filtered.filter(org => org.estado === filtroEstado);
    }

    if (filtroMunicipio) {
      filtered = filtered.filter(org => org.municipio === filtroMunicipio);
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
        <div className="mapa-header">
          <h1><Map size={24} style={{marginRight: '0.5rem'}} /> Mapa das Organizações</h1>
          <p>Carregando organizações...</p>
        </div>
        <div className="loading-spinner">⏳</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mapa-page">
        <div className="mapa-header">
          <h1><Map size={24} style={{marginRight: '0.5rem'}} /> Mapa das Organizações</h1>
          <p>Erro ao carregar dados</p>
        </div>
        <div className="error-message">
          <p><XCircle size={16} style={{marginRight: '0.5rem'}} /> {error}</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#666' }}>
            Verifique se você está logado no sistema.
          </p>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button onClick={fetchOrganizacoes} className="btn btn-primary">
              🔄 Tentar Novamente
            </button>
            <button
              onClick={() => {
                const token = localStorage.getItem('@pinovara:token');
                console.log('Token no localStorage:', !!token ? 'Presente' : 'Ausente');
                if (token) {
                  console.log('Token length:', token.length);
                  console.log('Token preview:', token.substring(0, 50) + '...');
                }
                alert(`Token: ${!!token ? 'Presente' : 'Ausente'}\nVerifique o console (F12) para mais detalhes.`);
              }}
              className="btn btn-secondary"
            >
              <Search size={14} style={{marginRight: '0.25rem'}} /> Debug Token
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mapa-page">
      <div className="mapa-header">
        <div className="header-info">
          <h1><Map size={24} style={{marginRight: '0.5rem'}} /> Mapa das Organizações</h1>
        </div>

        {/* Filtros */}
        <div className="filtros-section">
          <div className="filtros-grid">
            <div className="filtro-item">
              <label htmlFor="filtro-estado">Estado:</label>
              <select
                id="filtro-estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="">Todos os estados</option>
                {estadosDisponiveis.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
                ))}
              </select>
            </div>

            <div className="filtro-item">
              <label htmlFor="filtro-municipio">Município:</label>
              <select
                id="filtro-municipio"
                value={filtroMunicipio}
                onChange={(e) => setFiltroMunicipio(e.target.value)}
              >
                <option value="">Todos os municípios</option>
                {municipiosDisponiveis.map(municipio => (
                  <option key={municipio} value={municipio}>{municipio}</option>
                ))}
              </select>
            </div>

            <div className="filtro-item">
              <label htmlFor="filtro-nome">Buscar:</label>
              <input
                id="filtro-nome"
                type="text"
                placeholder="Nome ou CNPJ..."
                value={filtroNome}
                onChange={(e) => setFiltroNome(e.target.value)}
              />
            </div>

            <div className="filtro-item">
              <button onClick={clearFilters} className="btn btn-secondary">
                <Trash size={14} style={{marginRight: '0.25rem'}} /> Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Container Principal com Mapa e Lista */}
      <div className="mapa-main-container">
        {/* Mapa Grande */}
        <div className="mapa-container">
          <MapaGrande
            organizacoes={filteredOrganizacoes}
            onOrganizacaoClick={(id) => onNavigate('detalhes', id)}
            onNavigate={onNavigate}
          />
        </div>

        {/* Lista Lateral */}
        <div className="lista-lateral">
        <h3>📍 Organizações ({filteredOrganizacoes.length})</h3>
        <div className="lista-organizacoes">
          {filteredOrganizacoes.length === 0 ? (
            <p className="empty-state">Nenhuma organização encontrada com os filtros aplicados.</p>
          ) : (
            filteredOrganizacoes.map((org) => (
              <div key={org.id} className="org-card">
                <div className="org-info">
                  <h4>{org.nome}</h4>
                  <p className="org-details">
                    {org.estado} • {org.municipio || 'Município não informado'}
                    {org.telefone && <br />}
                    {org.telefone && `📞 ${org.telefone}`}
                  </p>
                </div>
                <div className="org-actions">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => onNavigate('detalhes', org.id)}
                  >
                    <Eye size={14} style={{marginRight: '0.25rem'}} /> Ver
                  </button>
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => onNavigate('edicao', org.id)}
                  >
                    <Edit size={14} style={{marginRight: '0.25rem'}} /> Editar
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
}

function MapaGrande({ organizacoes, onOrganizacaoClick, onNavigate }: MapaGrandeProps) {
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

    // Adicionar marcadores para cada organização
    organizacoes.forEach((org) => {
      const marker = L.marker([org.lat, org.lng])
        .addTo(map)
        .bindPopup(`
          <div style="max-width: 250px; font-family: system-ui, sans-serif;">
            <h4 style="margin: 0 0 8px 0; color: #2c3e50; font-size: 16px;">${org.nome}</h4>
            <div style="margin-bottom: 8px;">
              <p style="margin: 4px 0; color: #34495e; font-size: 14px;">
                <strong>Estado:</strong> ${org.estado}
              </p>
              ${org.municipio ? `<p style="margin: 4px 0; color: #34495e; font-size: 14px;"><strong>Município:</strong> ${org.municipio}</p>` : ''}
              ${org.telefone ? `<p style="margin: 4px 0; color: #34495e; font-size: 14px;"><strong>Telefone:</strong> ${org.telefone}</p>` : ''}
              ${org.cnpj ? `<p style="margin: 4px 0; color: #34495e; font-size: 13px;"><strong>CNPJ:</strong> ${org.cnpj}</p>` : ''}
            </div>
            <div style="display: flex; gap: 4px; margin-top: 8px;">
              <button onclick="window.mapNavigateToDetails(${org.id})"
                      style="background: #3498db; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                <Eye size={14} style={{marginRight: '0.25rem'}} /> Ver Detalhes
              </button>
              <button onclick="window.mapNavigateToEdit(${org.id})"
                      style="background: #27ae60; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;">
                <Edit size={14} style={{marginRight: '0.25rem'}} /> Editar
              </button>
            </div>
          </div>
        `);

      // Adicionar evento de clique
      marker.on('click', () => onOrganizacaoClick(org.id));
    });

    // Ajustar zoom para mostrar todos os marcadores
    if (organizacoes.length > 0) {
      const group = new L.featureGroup(
        organizacoes.map(org => L.marker([org.lat, org.lng]))
      );
      map.fitBounds(group.getBounds().pad(0.1));
    }

    // Adicionar funções globais para os botões do popup
    (window as any).mapNavigateToDetails = (id: number) => onNavigate('detalhes', id);
    (window as any).mapNavigateToEdit = (id: number) => onNavigate('edicao', id);

    // Cleanup function
    return () => {
      map.remove();
    };
  }, [organizacoes, onOrganizacaoClick, onNavigate]);

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
