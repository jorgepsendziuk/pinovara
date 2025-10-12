import React from 'react';
import { ChevronDown, Clipboard, Calendar, User, CheckCircle, AlertCircle } from 'lucide-react';

interface Organizacao {
  uri?: string | null;
  creator_uri_user?: string | null;
  creation_date?: Date | null;
  last_update_uri_user?: string | null;
  last_update_date?: Date | null;
  model_version?: number | null;
  ui_version?: number | null;
  is_complete?: boolean | null;
  submission_date?: Date | null;
  marked_as_complete_date?: Date | null;
  complementado?: boolean | null;
  meta_instance_id?: string | null;
  meta_instance_name?: string | null;
}

interface DadosColetaProps {
  organizacao: Organizacao;
  accordionAberto: string | null;
  onToggleAccordion: (accordion: string) => void;
}

export const DadosColeta: React.FC<DadosColetaProps> = ({
  organizacao,
  accordionAberto,
  onToggleAccordion
}) => {
  const isAberto = accordionAberto === 'dados-coleta';

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isODKCollect = organizacao.meta_instance_id && organizacao.meta_instance_id.trim() !== '';

  return (
    <div className="accordion-item">
      <button
        className="accordion-header"
        onClick={() => onToggleAccordion('dados-coleta')}
        style={{
          background: isAberto 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Clipboard size={20} />
          <span>Dados da Coleta (ODK Metadata)</span>
        </div>
        <ChevronDown 
          size={20}
          style={{
            transition: 'transform 0.3s ease',
            transform: isAberto ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
        />
      </button>

      <div className={`accordion-content ${isAberto ? 'open' : ''}`}>
        <div className="accordion-section">
          {/* Indicador de Origem */}
          <div style={{
            background: isODKCollect ? '#fff3cd' : '#d1ecf1',
            border: `1px solid ${isODKCollect ? '#ffc107' : '#0dcaf0'}`,
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {isODKCollect ? (
              <>
                <Clipboard size={20} color="#856404" />
                <div>
                  <div style={{ fontWeight: '600', color: '#856404' }}>
                    Cadastro via ODK Collect (Aplicativo)
                  </div>
                  <div style={{ fontSize: '12px', color: '#856404', marginTop: '4px' }}>
                    Esta organização foi cadastrada através do aplicativo móvel
                  </div>
                </div>
              </>
            ) : (
              <>
                <AlertCircle size={20} color="#055160" />
                <div>
                  <div style={{ fontWeight: '600', color: '#055160' }}>
                    Cadastro via Sistema Web
                  </div>
                  <div style={{ fontSize: '12px', color: '#055160', marginTop: '4px' }}>
                    Esta organização foi cadastrada diretamente no sistema
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Grid de Informações */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {/* Identificação */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#495057',
                borderBottom: '2px solid #667eea',
                paddingBottom: '8px'
              }}>
                Identificação
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div>
                  <div style={{ color: '#6c757d', fontSize: '11px', marginBottom: '2px' }}>URI Única</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#495057' }}>
                    {organizacao.uri || '-'}
                  </div>
                </div>
                {isODKCollect && (
                  <>
                    <div>
                      <div style={{ color: '#6c757d', fontSize: '11px', marginBottom: '2px' }}>Instance ID</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#495057', wordBreak: 'break-all' }}>
                        {organizacao.meta_instance_id}
                      </div>
                    </div>
                    <div>
                      <div style={{ color: '#6c757d', fontSize: '11px', marginBottom: '2px' }}>Instance Name</div>
                      <div style={{ fontSize: '12px', color: '#495057' }}>
                        {organizacao.meta_instance_name || '-'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Criação */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#495057',
                borderBottom: '2px solid #28a745',
                paddingBottom: '8px'
              }}>
                Criação
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div>
                  <div style={{ color: '#6c757d', fontSize: '11px', marginBottom: '2px' }}>Criado por</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} color="#667eea" />
                    <span style={{ color: '#495057' }}>{organizacao.creator_uri_user || '-'}</span>
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6c757d', fontSize: '11px', marginBottom: '2px' }}>Data de Criação</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#667eea" />
                    <span style={{ color: '#495057' }}>{formatDate(organizacao.creation_date)}</span>
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6c757d', fontSize: '11px', marginBottom: '2px' }}>Data de Submissão</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#667eea" />
                    <span style={{ color: '#495057' }}>{formatDate(organizacao.submission_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Atualização */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#495057',
                borderBottom: '2px solid #ffc107',
                paddingBottom: '8px'
              }}>
                Última Atualização
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div>
                  <div style={{ color: '#6c757d', fontSize: '11px', marginBottom: '2px' }}>Atualizado por</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} color="#667eea" />
                    <span style={{ color: '#495057' }}>{organizacao.last_update_uri_user || '-'}</span>
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6c757d', fontSize: '11px', marginBottom: '2px' }}>Data da Atualização</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} color="#667eea" />
                    <span style={{ color: '#495057' }}>{formatDate(organizacao.last_update_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status e Versões */}
            <div style={{
              background: '#f8f9fa',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #dee2e6'
            }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#495057',
                borderBottom: '2px solid #17a2b8',
                paddingBottom: '8px'
              }}>
                Status e Versões
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div>
                  <div style={{ color: '#6c757d', fontSize: '11px', marginBottom: '2px' }}>Completo?</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {organizacao.is_complete ? (
                      <>
                        <CheckCircle size={14} color="#28a745" />
                        <span style={{ color: '#28a745', fontWeight: '500' }}>Sim</span>
                        {organizacao.marked_as_complete_date && (
                          <span style={{ color: '#6c757d', fontSize: '11px' }}>
                            ({formatDate(organizacao.marked_as_complete_date)})
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <AlertCircle size={14} color="#ffc107" />
                        <span style={{ color: '#856404', fontWeight: '500' }}>Não</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6c757d', fontSize: '11px', marginBottom: '2px' }}>Complementado?</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {organizacao.complementado ? (
                      <>
                        <CheckCircle size={14} color="#28a745" />
                        <span style={{ color: '#28a745', fontWeight: '500' }}>Sim</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={14} color="#6c757d" />
                        <span style={{ color: '#6c757d' }}>Não</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6c757d', fontSize: '11px', marginBottom: '2px' }}>Versão do Modelo</div>
                  <div style={{ color: '#495057' }}>{organizacao.model_version || '-'}</div>
                </div>
                <div>
                  <div style={{ color: '#6c757d', fontSize: '11px', marginBottom: '2px' }}>Versão da Interface</div>
                  <div style={{ color: '#495057' }}>{organizacao.ui_version || '-'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Nota Informativa */}
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: '#e7f3ff',
            border: '1px solid #b3d7ff',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#004085'
          }}>
            <strong>ℹ️ Informação:</strong> Estes dados são metadados gerados automaticamente pelo sistema ODK Collect 
            e são utilizados para rastreabilidade e controle de qualidade das coletas de dados em campo.
          </div>
        </div>
      </div>
    </div>
  );
};

