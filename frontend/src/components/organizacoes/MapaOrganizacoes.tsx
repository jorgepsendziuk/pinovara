import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FileText } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import { StatusValidacaoBadge, getValidacaoConfig } from '../../utils/validacaoHelpers';

interface OrganizacaoComGps {
  id: number;
  nome: string;
  lat: number;
  lng: number;
  estado: string;
  estado_nome?: string;
  municipio_nome?: string;
  validacao_status?: number | null;
}

interface MapaOrganizacoesProps {
  organizacoes: OrganizacaoComGps[];
  onOrganizacaoClick?: (organizacaoId: number) => void;
  onGerarRelatorio?: (organizacaoId: number, nomeOrganizacao: string) => void;
}

// Corrigir ícones do Leaflet para React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapaOrganizacoes({ organizacoes, onOrganizacaoClick, onGerarRelatorio }: MapaOrganizacoesProps) {
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
      // Criar popup HTML com botão
      const popupContent = document.createElement('div');
      popupContent.style.maxWidth = '250px';
      const estadoSigla = (org.estado_nome || org.estado || '').toString().trim().substring(0, 2);
      const municipioNome = org.municipio_nome || '';
      const localizacao = estadoSigla && municipioNome ? `${estadoSigla} - ${municipioNome}` : (estadoSigla || municipioNome || 'Não informado');
      
      // Renderizar badge de validação
      const validacaoConfig = getValidacaoConfig(org.validacao_status || null);
      const badgeIcon = renderToString(<validacaoConfig.icon size={12} />);
      
      popupContent.innerHTML = `
        <div>
          <h4 style="margin: 0 0 8px 0; color: #2c3e50; font-size: 14px;">#${org.id} ${org.nome}</h4>
          <p style="margin: 0 0 8px 0; color: #7f8c8d; font-size: 12px;">${localizacao}</p>
          <div style="display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; background: ${validacaoConfig.corFundo}; color: ${validacaoConfig.cor}; border-radius: 8px; font-size: 11px; font-weight: 600; border: 1px solid ${validacaoConfig.cor};" title="${validacaoConfig.label}">
            ${badgeIcon}
            <span>${validacaoConfig.label}</span>
          </div>
        </div>
      `;
      
      // Adicionar botão de ver relatório se callback fornecido
      if (onGerarRelatorio) {
        const btnContainer = document.createElement('div');
        btnContainer.style.marginTop = '8px';
        
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
          font-size: 12px;
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

      // Não adicionar evento de clique para não redirecionar
      // O clique agora apenas abre o popup
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
  }, [organizacoes, onOrganizacaoClick, onGerarRelatorio]);

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
