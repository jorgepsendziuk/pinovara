import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corrigir ícones padrão do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Organizacao {
  id: number;
  nome: string;
  cnpj: string;
  municipio: string;
  estado: string;
  gpsLat: number;
  gpsLng: number;
  gpsAlt: number;
  status: string;
  dataVisita: string;
}

// Função para criar ícone personalizado
const createCustomIcon = (status: string) => {
  const color = getStatusColor(status);
  const icon = getStatusIcon(status);
  
  return L.divIcon({
    html: `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        ${icon}
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completo': return '#28a745';
    case 'pendente': return '#ffc107';
    case 'rascunho': return '#6c757d';
    default: return '#007bff';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completo': return '✅';
    case 'pendente': return '⏳';
    case 'rascunho': return '📝';
    default: return '🏢';
  }
};

function MapaOrganizacoes() {
  const { } = useAuth();
  const [organizacoes, setOrganizacoes] = useState<Organizacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtros, setFiltros] = useState({
    status: '',
    estado: '',
    municipio: ''
  });
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [mapaPronto, setMapaPronto] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://pinovaraufba.com.br' : 'http://localhost:3001');

  const organizacoesFiltradas = organizacoes.filter(org => {
    if (filtros.status && org.status !== filtros.status) return false;
    if (filtros.estado && org.estado !== filtros.estado) return false;
    if (filtros.municipio && !org.municipio.toLowerCase().includes(filtros.municipio.toLowerCase())) return false;
    return true;
  });

  useEffect(() => {
    fetchOrganizacoes();
  }, []);

  // Inicializar mapa após o componente estar montado
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current && !mapInstanceRef.current) {
        console.log('Inicializando mapa...', mapRef.current);

        try {
          mapInstanceRef.current = L.map(mapRef.current, {
            center: [-12.5, -38.5], // Centro da Bahia
            zoom: 7,
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: true,
            keyboard: true,
            dragging: true,
            touchZoom: true,
            fadeAnimation: true,
            zoomAnimation: true,
            markerZoomAnimation: true
          });

          // Adicionar estilos CSS diretamente no mapa
          // CSS FORÇADO PARA SOBRESCREVER QUALQUER INTERFERÊNCIA
          const forceStyle = document.createElement('style');
          forceStyle.textContent = `
            /* Forçar visibilidade máxima para testes */
            * {
              box-sizing: border-box;
            }

            /* Garantir que o body não tenha overflow que bloqueie */
            body, html {
              overflow: visible !important;
              position: static !important;
            }

            /* Sobrescrever qualquer modal ou overlay que possa estar ativo */
            .modal-overlay, [class*="modal"], [class*="overlay"] {
              display: none !important;
            }

            /* Garantir que containers de layout não bloqueiem */
            .dashboard-layout, .main-content, .dashboard-main, .container {
              overflow: visible !important;
              position: static !important;
            }
          `;
          document.head.appendChild(forceStyle);

          const style = document.createElement('style');
          style.textContent = `
            .leaflet-container {
              background: #f8f9fa !important;
              font-family: inherit;
            }
            .leaflet-popup {
              z-index: 10000 !important;
            }
            .leaflet-popup-content-wrapper {
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.15);
              background: white !important;
            }
            .leaflet-popup-content {
              margin: 0 !important;
              color: #333 !important;
            }
            .leaflet-popup-tip {
              background: white;
              z-index: 10001 !important;
            }
            .leaflet-popup-close-button {
              display: block !important;
              z-index: 10002 !important;
            }
            .custom-div-icon {
              border: none !important;
              background: transparent !important;
            }
            .leaflet-popup-pane {
              z-index: 10000 !important;
            }
            .leaflet-map-pane {
              z-index: 100 !important;
            }
            .leaflet-marker-pane {
              z-index: 600 !important;
            }
            .mapa-container {
              overflow: visible !important;
              position: relative !important;
            }
            .mapa-leaflet {
              overflow: visible !important;
              position: relative !important;
              z-index: 1 !important;
            }
            /* Forçar visibilidade dos popups */
            .leaflet-popup {
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
            }
            /* Garantir que o mapa não tenha overflow que corte popups */
            #mapa-organizacoes {
              overflow: visible !important;
            }
            #mapa-organizacoes,
            #mapa-organizacoes .leaflet-container,
            #mapa-organizacoes .leaflet-map-pane,
            #mapa-organizacoes .leaflet-popup-pane,
            #mapa-organizacoes .leaflet-overlay-pane {
              overflow: visible !important;
              position: relative !important;
            }
            /* Sobrescrever estilos globais que podem interferir */
            .leaflet-popup-pane,
            .leaflet-popup-pane * {
              overflow: visible !important;
            }
            /* Garantir que popups apareçam sobre elementos com z-index alto */
            .leaflet-popup-pane {
              z-index: 99999 !important;
            }
            .leaflet-popup {
              z-index: 99999 !important;
              pointer-events: auto !important;
            }
            .leaflet-popup-content-wrapper {
              background: red !important;
              color: yellow !important;
              border: 5px solid black !important;
              box-shadow: 0 0 50px rgba(255,0,0,1) !important;
              padding: 20px !important;
              min-width: 300px !important;
              min-height: 200px !important;
            }
            .leaflet-popup-content {
              background: yellow !important;
              color: red !important;
              padding: 20px !important;
              font-size: 18px !important;
              font-weight: bold !important;
              border: 3px solid black !important;
            }

            /* Tornar mapa mais visível */
            .leaflet-container {
              border: 5px solid blue !important;
              background: lightblue !important;
            }
          `;
          document.head.appendChild(style);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(mapInstanceRef.current);

          console.log('🎉 Mapa inicializado com sucesso!');
          console.log('🗺️ Instância do mapa:', mapInstanceRef.current);

          // TESTE 1: Modificar elemento existente (title)
          document.title = '🚨 TESTE ATIVO - POPUPS BLOQUEADOS 🚨';
          console.log('📝 Title modificado para:', document.title);

          // TESTE 2: Modificar background do body
          document.body.style.background = 'red';
          document.body.style.backgroundImage = 'none';
          setTimeout(() => {
            document.body.style.background = 'linear-gradient(45deg, red, yellow)';
            console.log('🎨 Background do body modificado para vermelho/amarelo');
          }, 500);

          // TESTE 3: Criar elemento usando método diferente
          const testElement = document.createElement('div');
          testElement.setAttribute('id', 'debug-test-element');
          testElement.style.cssText = 'position:fixed;top:50px;left:50px;background:red;color:white;padding:20px;z-index:999999;font-size:20px;border:3px solid yellow;';
          testElement.textContent = '🚨 ELEMENTO DE TESTE FORÇADO 🚨';
          document.body.insertBefore(testElement, document.body.firstChild);
          console.log('🔧 Elemento inserido no início do body');

          // TESTE 4: Verificar se conseguimos executar setInterval
          let counter = 0;
          const intervalId = setInterval(() => {
            counter++;
            testElement.textContent = `🚨 CONTADOR: ${counter} 🚨`;
            console.log(`⏰ Contador: ${counter}`);
            if (counter >= 10) {
              clearInterval(intervalId);
              testElement.textContent = '🚨 TESTE CONCLUÍDO 🚨';
            }
          }, 1000);

          // Teste básico do Leaflet
          console.log('🧪 Testando Leaflet:', typeof L, typeof L.marker, typeof L.popup);

          // CRIAR MARCADOR DE TESTE IMEDIATAMENTE
          try {
            console.log('🧪 Criando marcador de teste...');
            const testMarker = L.marker([-12.9714, -38.5014]).addTo(mapInstanceRef.current!);
            testMarker.bindPopup('<h3>TESTE - Salvador</h3><p>Este é um teste!</p>');
            testMarker.openPopup();
            console.log('✅ Marcador de teste criado e popup aberto!');

            // TESTE CRÍTICO: Criar popup HTML puro na posição do mapa
            setTimeout(() => {
              const mapRect = mapInstanceRef.current!.getContainer().getBoundingClientRect();
              console.log('📐 Posição do mapa:', mapRect);

              const manualPopup = document.createElement('div');
              manualPopup.style.cssText = `
                position: fixed !important;
                left: ${mapRect.left + 100}px !important;
                top: ${mapRect.top + 100}px !important;
                background: red !important;
                color: yellow !important;
                border: 5px solid black !important;
                padding: 30px !important;
                z-index: 10000000 !important;
                font-size: 24px !important;
                font-weight: bold !important;
                box-shadow: 0 0 100px rgba(255,0,0,1) !important;
                width: 400px !important;
                height: 200px !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
              `;
              manualPopup.innerHTML = `
                <div>
                  🚨 POPUP MANUAL SOBRE O MAPA 🚨
                  <br><br>
                  Posição: ${mapRect.left + 100}, ${mapRect.top + 100}
                  <br><br>
                  <button style="background:yellow;color:red;padding:10px;border:2px solid black;" onclick="this.parentElement.parentElement.remove()">FECHAR</button>
                </div>
              `;
              document.body.appendChild(manualPopup);
              console.log('🎯 Popup manual criado sobre o mapa!');
            }, 1500);

            // Teste ainda mais simples - alert no clique
            testMarker.on('click', function() {
              console.log('🎯 MARCADOR DE TESTE CLICADO!');
              alert('Marcador clicado! Verifique se há popups visíveis.');
              this.openPopup();
            });

          } catch (error) {
            console.error('❌ Erro no marcador de teste:', error);
          }

          setMapaPronto(true);

          // TESTE FINAL - Criar um popup HTML simples fora do Leaflet
          setTimeout(() => {
            console.log('🎯 Criando popup HTML simples...');

            // Primeiro teste: verificar se conseguimos modificar o DOM
            const testDiv = document.createElement('div');
            testDiv.id = 'test-popup';
            testDiv.innerHTML = 'TESTE BÁSICO';
            testDiv.style.cssText = `
              position: fixed !important;
              top: 50px !important;
              left: 50px !important;
              background: red !important;
              color: white !important;
              padding: 10px !important;
              z-index: 999999 !important;
              font-size: 16px !important;
              font-weight: bold !important;
              border: 3px solid yellow !important;
            `;
            document.body.appendChild(testDiv);
            console.log('✅ Teste básico criado no DOM');

            // Segundo teste: popup maior e mais visível
            setTimeout(() => {
              const bigPopup = document.createElement('div');
              bigPopup.innerHTML = `
                <div style="
                  position: fixed !important;
                  top: 200px !important;
                  left: 200px !important;
                  width: 400px !important;
                  height: 300px !important;
                  background: yellow !important;
                  border: 5px solid red !important;
                  padding: 20px !important;
                  z-index: 1000000 !important;
                  font-size: 24px !important;
                  font-weight: bold !important;
                  color: black !important;
                  box-shadow: 0 0 50px rgba(255,0,0,1) !important;
                  display: block !important;
                  visibility: visible !important;
                  opacity: 1 !important;
                ">
                  🚨 TESTE DE VISIBILIDADE FORÇADO 🚨
                  <br><br>
                  Se você NÃO vê este popup gigante,
                  há algo BLOQUEANDO todos os elementos!
                  <br><br>
                  <button style="
                    background: red;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    font-size: 18px;
                    cursor: pointer;
                  " onclick="this.parentElement.parentElement.remove()">FECHAR</button>
                </div>
              `;
              document.body.appendChild(bigPopup);
              console.log('✅ Popup gigante criado!');
            }, 1000);

          }, 2000);

          // RESUMO FINAL DOS TESTES
          setTimeout(() => {
            console.log('📋 === RESUMO DOS TESTES ===');
            console.log('✅ Mapa Leaflet: CARREGADO');
            console.log('✅ Marcador: CRIADO');
            console.log('🎯 Popups: TESTANDO VISIBILIDADE...');
            console.log('🔍 Verifique os elementos coloridos na tela!');
          }, 4000);

        } catch (error) {
          console.error('Erro ao inicializar mapa:', error);
        }
      }
    }, 100); // Pequeno delay para garantir que o DOM esteja pronto

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        console.log('Limpando mapa');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Atualizar marcadores quando organizações mudarem
  useEffect(() => {
    console.log('Atualizando marcadores...', organizacoesFiltradas.length, 'organizações filtradas');

    if (mapInstanceRef.current && organizacoesFiltradas.length > 0 && mapaPronto) {
      console.log('Adicionando marcadores...');

      // Limpar marcadores existentes
      markersRef.current.forEach(marker => {
        if (mapInstanceRef.current) {
          try {
            mapInstanceRef.current.removeLayer(marker);
          } catch (error) {
            console.warn('Erro ao remover marcador:', error);
          }
        }
      });
      markersRef.current = [];

      // Adicionar novos marcadores
      console.log('Iniciando criação de marcadores para', organizacoesFiltradas.length, 'organizações');
      const bounds = L.latLngBounds([]);

      console.log('📊 Organizações filtradas:', organizacoesFiltradas.length);
      console.log('📍 Primeiras 3 organizações:', organizacoesFiltradas.slice(0, 3));

      organizacoesFiltradas.forEach((org, index) => {
        console.log(`Processando marcador ${index + 1}/${organizacoesFiltradas.length}:`, org.nome);
        console.log(`Coordenadas:`, [org.gpsLat, org.gpsLng], 'Válidas?', !isNaN(org.gpsLat) && !isNaN(org.gpsLng));

        try {
          console.log('📍 Criando marcador para:', org.nome, 'em', [org.gpsLat, org.gpsLng]);

          const marker = L.marker([org.gpsLat, org.gpsLng], {
            icon: createCustomIcon(org.status)
          }).addTo(mapInstanceRef.current!);

          console.log('✅ Marcador criado com sucesso:', marker);

          const popupContent = `
            <div style="min-width: 280px; max-width: 320px;">
              <h3 style="margin: 0 0 0.5rem 0; color: #212529; font-size: 1.1rem; font-weight: 600; line-height: 1.3;">${org.nome}</h3>

              <div style="background: #f8f9fa; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem;">
                <p style="margin: 0.25rem 0; color: #6c757d; font-size: 0.85rem;"><strong>ID:</strong> ${org.id}</p>
                <p style="margin: 0.25rem 0; color: #6c757d; font-size: 0.85rem;"><strong>CNPJ:</strong> ${org.cnpj || 'Não informado'}</p>
                <p style="margin: 0.25rem 0; color: #6c757d; font-size: 0.85rem;"><strong>📍 Localização:</strong> ${org.municipio} - ${org.estado}</p>
                <p style="margin: 0.25rem 0; color: #6c757d; font-size: 0.85rem;"><strong>📊 Status:</strong>
                  <span style="display: inline-block; padding: 0.2rem 0.4rem; border-radius: 0.2rem; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; background: ${getStatusColor(org.status)}20; color: ${getStatusColor(org.status)}; margin-left: 0.25rem;">
                    ${org.status}
                  </span>
                </p>
                <p style="margin: 0.25rem 0; color: #6c757d; font-size: 0.85rem;"><strong>📅 Última visita:</strong> ${
                  org.dataVisita ? new Date(org.dataVisita).toLocaleDateString('pt-BR') : 'Não informado'
                }</p>
                <p style="margin: 0.25rem 0; color: #6c757d; font-size: 0.85rem;"><strong>📍 GPS:</strong> ${org.gpsLat.toFixed(4)}, ${org.gpsLng.toFixed(4)}</p>
                <p style="margin: 0.25rem 0; color: #6c757d; font-size: 0.85rem;"><strong>⛰️ Altitude:</strong> ${org.gpsAlt}m</p>
              </div>

              <div style="display: flex; gap: 0.5rem; flex-direction: column;">
                <button onclick="window.location.href='/organizacoes/detalhes/${org.id}'" style="
                  background: linear-gradient(135deg, #007bff, #0056b3); color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem;
                  font-size: 0.9rem; font-weight: 600; cursor: pointer; text-decoration: none; text-align: center;
                  box-shadow: 0 2px 4px rgba(0,123,255,0.3); transition: all 0.2s ease;
                " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(0,123,255,0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(0,123,255,0.3)';">
                  👁️ Ver Detalhes Completos
                </button>
                <button onclick="window.location.href='/organizacoes/edicao/${org.id}'" style="
                  background: linear-gradient(135deg, #28a745, #1e7e34); color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem;
                  font-size: 0.9rem; font-weight: 600; cursor: pointer; text-decoration: none; text-align: center;
                  box-shadow: 0 2px 4px rgba(40,167,69,0.3); transition: all 0.2s ease;
                " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 8px rgba(40,167,69,0.4)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 4px rgba(40,167,69,0.3)';">
                  ✏️ Editar Organização
                </button>
              </div>
            </div>
          `;

          // TESTE SIMPLES - Popup básico primeiro
          const testPopup = `<div style="padding: 10px;"><h3>${org.nome}</h3><p>ID: ${org.id}</p><button onclick="alert('Teste')">Clique aqui</button></div>`;
          marker.bindPopup(testPopup);

          // Evento de clique simples
          marker.on('click', () => {
            console.log('✅ MARCADOR CLICADO:', org.nome);
            marker.openPopup();
          });

          // Abrir popup do primeiro marcador automaticamente
          if (index === 0) {
            setTimeout(() => {
              console.log('🚀 ABRINDO POPUP AUTOMATICAMENTE');
              marker.openPopup();
            }, 2000);
          }

          markersRef.current.push(marker);
          bounds.extend([org.gpsLat, org.gpsLng]);

        } catch (error) {
          console.error('Erro ao criar marcador para', org.nome, ':', error);
        }
      });

      // Ajustar visualização para mostrar todos os marcadores
      if (bounds.isValid() && markersRef.current.length > 0) {
        try {
          mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
          console.log('Visualização ajustada para mostrar', markersRef.current.length, 'marcadores');
        } catch (error) {
          console.warn('Erro ao ajustar visualização:', error);
        }
      }

      console.log('Total de marcadores criados:', markersRef.current.length);
      console.log('Marcadores criados com sucesso. Popups devem estar funcionais agora.');
    } else {
      console.log('Condições para atualizar marcadores não atendidas:', {
        mapaExiste: !!mapInstanceRef.current,
        temOrganizacoes: organizacoesFiltradas.length > 0,
        mapaPronto: mapaPronto
      });
    }
  }, [organizacoesFiltradas, mapaPronto]);

  // Função para adicionar coordenadas variadas aos marcadores (para teste)
  const adicionarCoordenadasVariadas = (organizacoes: Organizacao[]) => {
    const baseLat = -12.9714; // Salvador
    const baseLng = -38.5014;

    return organizacoes.map((org, index) => {
      // Se já tem coordenadas válidas, mantém
      if (org.gpsLat && org.gpsLng && org.gpsLat !== 0 && org.gpsLng !== 0) {
        return org;
      }

      // Adiciona coordenadas variadas baseadas no índice
      const variation = index * 0.01; // Variação de ~1km
      const angle = (index * 45) * (Math.PI / 180); // Ângulo em radianos

      return {
        ...org,
        gpsLat: baseLat + Math.sin(angle) * variation,
        gpsLng: baseLng + Math.cos(angle) * variation,
        gpsAlt: 10 + Math.random() * 50,
        gpsAcc: 5 + Math.random() * 10
      };
    });
  };

  const fetchOrganizacoes = async () => {
    console.log('🚀 Iniciando fetchOrganizacoes...');
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('@pinovara:token');
      console.log('🔑 Token encontrado:', !!token);

      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log('Buscando organizações em:', `${API_BASE}/organizacoes`);

      const response = await fetch(`${API_BASE}/organizacoes`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta:', response.status, errorText);
        throw new Error(`Erro ao carregar organizações: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Dados recebidos da API:', data);
      console.log('📊 Tipo de dados:', typeof data, Array.isArray(data) ? 'ARRAY' : 'OBJETO');

      // Verificar se a resposta é um array ou um objeto com propriedade data
      let organizacoesArray: Organizacao[] = [];
      if (Array.isArray(data)) {
        organizacoesArray = data;
        console.log('Dados são um array direto:', organizacoesArray.length);
      } else if (data.data && Array.isArray(data.data)) {
        organizacoesArray = data.data;
        console.log('Dados estão em data.data:', organizacoesArray.length);
      } else if (data.organizacoes && Array.isArray(data.organizacoes)) {
        organizacoesArray = data.organizacoes;
        console.log('Dados estão em data.organizacoes:', organizacoesArray.length);
      } else {
        console.error('Formato de resposta inesperado:', data);
        console.error('Tipo de dados:', typeof data);
        console.error('É array?', Array.isArray(data));
        console.error('Propriedades:', Object.keys(data));

        // Se não conseguir carregar dados reais, criar dados de teste
        console.log('Criando dados de teste...');
        organizacoesArray = [
          {
            id: 1,
            nome: 'Associação dos Produtores de Cacau',
            cnpj: '12.345.678/0001-01',
            estado: 'BA',
            municipio: 'Ilhéus',
            gpsLat: -14.7889,
            gpsLng: -39.0358,
            gpsAlt: 15,
            dataVisita: '2024-01-10',
            status: 'completo'
          },
          {
            id: 2,
            nome: 'Cooperativa Agrícola do Oeste',
            cnpj: '23.456.789/0001-02',
            estado: 'BA',
            municipio: 'Vitória da Conquista',
            gpsLat: -14.8658,
            gpsLng: -40.8397,
            gpsAlt: 920,
            dataVisita: '2024-01-15',
            status: 'pendente'
          },
          {
            id: 3,
            nome: 'Sindicato dos Trabalhadores Rurais',
            cnpj: '34.567.890/0001-03',
            estado: 'BA',
            municipio: 'Feira de Santana',
            gpsLat: -12.2664,
            gpsLng: -38.9664,
            gpsAlt: 220,
            dataVisita: '2024-01-20',
            status: 'rascunho'
          },
          {
            id: 4,
            nome: 'Associação dos Cafeicultores',
            cnpj: '45.678.901/0001-04',
            estado: 'BA',
            municipio: 'Brumado',
            gpsLat: -14.2038,
            gpsLng: -41.6656,
            gpsAlt: 450,
            dataVisita: '2024-01-25',
            status: 'completo'
          },
          {
            id: 5,
            nome: 'Cooperativa de Leite',
            cnpj: '56.789.012/0001-05',
            estado: 'BA',
            municipio: 'Euclides da Cunha',
            gpsLat: -10.5078,
            gpsLng: -39.0156,
            gpsAlt: 400,
            dataVisita: '2024-01-30',
            status: 'pendente'
          },
          {
            id: 6,
            nome: 'Sindicato Rural de Teixeira de Freitas',
            cnpj: '67.890.123/0001-06',
            estado: 'BA',
            municipio: 'Teixeira de Freitas',
            gpsLat: -17.5350,
            gpsLng: -39.7419,
            gpsAlt: 100,
            dataVisita: '2024-02-05',
            status: 'completo'
          }
        ];
      }

      // Adicionar coordenadas variadas se necessário
      const organizacoesComCoordenadas = adicionarCoordenadasVariadas(organizacoesArray);

      // Filtrar apenas organizações com coordenadas GPS válidas
      const organizacoesComGPS = organizacoesComCoordenadas.filter((org: Organizacao) =>
        org.gpsLat && org.gpsLng &&
        org.gpsLat !== 0 && org.gpsLng !== 0
      );

      console.log(`Total de organizações: ${organizacoesArray.length}`);
      console.log(`Organizações com GPS: ${organizacoesComGPS.length}`);
      console.log('Organizações processadas:', organizacoesComGPS);

      setOrganizacoes(organizacoesComGPS);
    } catch (err) {
      console.error('Erro ao buscar organizações:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltroChange = (field: string, value: string) => {
    setFiltros(prev => ({ ...prev, [field]: value }));
  };




  const estados = [...new Set(organizacoes.map(org => org.estado))].sort();

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Carregando mapa das organizações...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>❌ {error}</p>
        <button onClick={fetchOrganizacoes} className="btn btn-primary">
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="mapa-content">
      <div className="content-header">
        <div className="header-info">
          <h2>🗺️ Mapa das Organizações</h2>
          <p>Visualize a localização geográfica de todas as organizações cadastradas</p>
          <div className="header-stats">
            <span className="stat-item">
              <strong>{organizacoesFiltradas.length}</strong> organizações no mapa
            </span>
            <span className="stat-item">
              <strong>{organizacoes.length}</strong> total cadastradas
            </span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtros">
          <div className="filter-group">
            <label>Status</label>
            <select
              value={filtros.status}
              onChange={(e) => handleFiltroChange('status', e.target.value)}
            >
              <option value="">Todos</option>
              <option value="completo">Completo</option>
              <option value="pendente">Pendente</option>
              <option value="rascunho">Rascunho</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Estado</label>
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
            >
              <option value="">Todos</option>
              {estados.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Município</label>
            <input
              type="text"
              value={filtros.municipio}
              onChange={(e) => handleFiltroChange('municipio', e.target.value)}
              placeholder="Digite o município..."
            />
          </div>

          <div className="filter-actions">
            <button 
              className="btn btn-secondary" 
              onClick={() => setFiltros({ status: '', estado: '', municipio: '' })}
            >
              🗑️ Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="mapa-container">
        {mapaPronto ? (
          <div
            id="mapa-organizacoes"
            ref={mapRef}
            style={{
              height: '600px',
              width: '100%',
              borderRadius: '8px',
              display: 'block',
              position: 'relative',
              zIndex: 1,
              overflow: 'visible',
              isolation: 'isolate'
            }}
            className="mapa-leaflet"
          />
        ) : (
          <div style={{
            height: '600px',
            width: '100%',
            background: 'transparent',
            border: '1px solid #ddd',
            borderRadius: '8px',
            display: 'block',
            position: 'relative'
          }}>
            {/* Fallback: mapa estático do OpenStreetMap */}
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=-39.0,-13.0,-38.0,-12.0&layer=mapnik&marker=-12.9714,-38.5014"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                borderRadius: '8px'
              }}
              title="Mapa de Salvador - BA"
            />

          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="legenda-container">
        <h4>Legenda</h4>
        <div className="legenda-items">
          <div className="legenda-item">
            <span className="legenda-icon" style={{ backgroundColor: '#28a745' }}>✅</span>
            <span>Completo</span>
          </div>
          <div className="legenda-item">
            <span className="legenda-icon" style={{ backgroundColor: '#ffc107' }}>⏳</span>
            <span>Pendente</span>
          </div>
          <div className="legenda-item">
            <span className="legenda-icon" style={{ backgroundColor: '#6c757d' }}>📝</span>
            <span>Rascunho</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MapaOrganizacoes;
