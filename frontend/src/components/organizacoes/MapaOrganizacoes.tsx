import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface OrganizacaoComGps {
  id: number;
  nome: string;
  lat: number;
  lng: number;
  estado: string;
}

interface MapaOrganizacoesProps {
  organizacoes: OrganizacaoComGps[];
  onOrganizacaoClick?: (organizacaoId: number) => void;
}

// Corrigir ícones do Leaflet para React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapaOrganizacoes({ organizacoes, onOrganizacaoClick }: MapaOrganizacoesProps) {
  useEffect(() => {
    // Centro do Brasil
    const mapCenter: [number, number] = [-14.235, -51.925];
    const map = L.map('mapa-organizacoes').setView(mapCenter, 4);

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
          <div style="max-width: 200px;">
            <h4 style="margin: 0 0 8px 0; color: #2c3e50;">${org.nome}</h4>
            <p style="margin: 0; color: #7f8c8d;"><strong>Estado:</strong> ${org.estado}</p>
            <p style="margin: 4px 0 0 0; color: #7f8c8d;"><strong>ID:</strong> ${org.id}</p>
          </div>
        `);

      // Adicionar evento de clique se callback fornecido
      if (onOrganizacaoClick) {
        marker.on('click', () => onOrganizacaoClick(org.id));
      }
    });

    // Ajustar zoom para mostrar todos os marcadores se houver organizações
    if (organizacoes.length > 0) {
      const group = new L.featureGroup(
        organizacoes.map(org => L.marker([org.lat, org.lng]))
      );
      map.fitBounds(group.getBounds().pad(0.1));
    }

    // Cleanup function
    return () => {
      map.remove();
    };
  }, [organizacoes, onOrganizacaoClick]);

  return (
    <div
      id="mapa-organizacoes"
      style={{
        height: '300px',
        width: '100%',
        borderRadius: '8px',
        border: '1px solid #ddd'
      }}
    />
  );
}

export default MapaOrganizacoes;
