import React, { useEffect, useRef } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { Organizacao } from '../../types/organizacao';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface EnderecoLocalizacaoProps {
  organizacao: Organizacao;
  onUpdate: (field: keyof Organizacao, value: any) => void;
  accordionAberto: string | null;
  onToggleAccordion: (accordion: string) => void;
}

// Corrigir ícones do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export const EnderecoLocalizacao: React.FC<EnderecoLocalizacaoProps> = ({
  organizacao,
  onUpdate,
  accordionAberto,
  onToggleAccordion
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    // Inicializar mapa apenas se o accordion estiver aberto e houver GPS
    if (accordionAberto === 'endereco-localizacao' && organizacao.gps_lat && organizacao.gps_lng) {
      if (!mapRef.current) {
        // Criar mapa
        const map = L.map('mapa-endereco').setView(
          [organizacao.gps_lat, organizacao.gps_lng],
          15
        );

        // Adicionar tiles do OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Adicionar marcador
        const marker = L.marker([organizacao.gps_lat, organizacao.gps_lng]).addTo(map);
        marker.bindPopup(`<b>${organizacao.nome}</b>`).openPopup();

        mapRef.current = map;
        markerRef.current = marker;
      } else {
        // Atualizar posição se o mapa já existe
        mapRef.current.setView([organizacao.gps_lat!, organizacao.gps_lng!], 15);
        if (markerRef.current) {
          markerRef.current.setLatLng([organizacao.gps_lat!, organizacao.gps_lng!]);
          markerRef.current.getPopup()?.setContent(`<b>${organizacao.nome}</b>`);
        }
      }
    }

    // Cleanup ao desmontar ou fechar accordion
    return () => {
      if (accordionAberto !== 'endereco-localizacao' && mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [accordionAberto, organizacao.gps_lat, organizacao.gps_lng, organizacao.nome]);

  const isAberto = accordionAberto === 'endereco-localizacao';
  const temGPS = organizacao.gps_lat && organizacao.gps_lng;

  return (
    <div className="accordion-item">
      <button 
        className="accordion-header"
        onClick={() => onToggleAccordion('endereco-localizacao')}
      >
        <h3>
          <MapPin size={18} style={{marginRight: '0.5rem'}} /> 
          Endereço e Localização
        </h3>
        <ChevronDown
          size={16}
          className={`accordion-icon ${isAberto ? 'open' : ''}`}
          style={{
            marginLeft: '0.5rem',
            transition: 'transform 0.2s ease',
            transform: isAberto ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>

      <div className={`accordion-content ${isAberto ? 'open' : ''}`}>
        <div className="accordion-section">
          <div className="endereco-grid">
            {/* Lado Esquerdo - Formulário de Endereço */}
            <div>
              <h4 style={{ marginBottom: '1rem', color: '#333', fontSize: '1.1rem' }}>
                Dados do Endereço
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="organizacao_end_logradouro">Logradouro *</label>
                  <input
                    type="text"
                    id="organizacao_end_logradouro"
                    value={organizacao.organizacao_end_logradouro || ''}
                    onChange={(e) => onUpdate('organizacao_end_logradouro', e.target.value)}
                    placeholder="Rua, Avenida, etc."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="organizacao_end_numero">Número *</label>
                    <input
                      type="text"
                      id="organizacao_end_numero"
                      value={organizacao.organizacao_end_numero || ''}
                      onChange={(e) => onUpdate('organizacao_end_numero', e.target.value)}
                      placeholder="123"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label htmlFor="organizacao_end_cep">CEP *</label>
                    <input
                      type="text"
                      id="organizacao_end_cep"
                      value={organizacao.organizacao_end_cep || ''}
                      onChange={(e) => onUpdate('organizacao_end_cep', e.target.value)}
                      placeholder="00000-000"
                      maxLength={8}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="organizacao_end_bairro">Bairro</label>
                  <input
                    type="text"
                    id="organizacao_end_bairro"
                    value={organizacao.organizacao_end_bairro || ''}
                    onChange={(e) => onUpdate('organizacao_end_bairro', e.target.value)}
                    placeholder="Nome do bairro"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="organizacao_end_complemento">Complemento</label>
                  <input
                    type="text"
                    id="organizacao_end_complemento"
                    value={organizacao.organizacao_end_complemento || ''}
                    onChange={(e) => onUpdate('organizacao_end_complemento', e.target.value)}
                    placeholder="Apartamento, sala, etc."
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label htmlFor="gps_lat">GPS Latitude</label>
                    <input
                      type="text"
                      id="gps_lat"
                      value={organizacao.gps_lat || ''}
                      readOnly
                      disabled
                      style={{ 
                        background: '#f5f5f5',
                        cursor: 'not-allowed',
                        color: '#666'
                      }}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '0' }}>
                    <label htmlFor="gps_lng">GPS Longitude</label>
                    <input
                      type="text"
                      id="gps_lng"
                      value={organizacao.gps_lng || ''}
                      readOnly
                      disabled
                      style={{ 
                        background: '#f5f5f5',
                        cursor: 'not-allowed',
                        color: '#666'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Lado Direito - Mapa */}
            <div>
              <h4 style={{ marginBottom: '1rem', color: '#333', fontSize: '1.1rem' }}>
                Localização no Mapa
              </h4>
              {temGPS ? (
                <div 
                  id="mapa-endereco" 
                  style={{ 
                    width: '100%', 
                    height: '400px', 
                    borderRadius: '8px',
                    border: '1px solid #dee2e6',
                    overflow: 'hidden'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '400px',
                  borderRadius: '8px',
                  border: '2px dashed #dee2e6',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f8f9fa',
                  color: '#666'
                }}>
                  <MapPin size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
                  <p style={{ margin: 0, textAlign: 'center' }}>
                    Coordenadas GPS não disponíveis
                  </p>
                  <small style={{ marginTop: '5px', opacity: 0.7 }}>
                    Use o aplicativo móvel para capturar a localização
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

