import { useState, useEffect } from 'react';
import { X, Download, FileText, Image, ZoomIn } from 'lucide-react';
import { documentoAPI, fotoAPI, Documento, Foto } from '../../services/api';
import '../../styles/Modal.css';

interface ModalArquivosProps {
  organizacaoId: number;
  organizacaoNome: string;
  onClose: () => void;
}

export const ModalArquivos: React.FC<ModalArquivosProps> = ({
  organizacaoId,
  organizacaoNome,
  onClose
}) => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'documentos' | 'fotos'>('documentos');
  const [fotoAmpliada, setFotoAmpliada] = useState<Foto | null>(null);

  useEffect(() => {
    loadArquivos();
  }, [organizacaoId]);

  const loadArquivos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [docsData, fotosData] = await Promise.all([
        documentoAPI.list(organizacaoId),
        fotoAPI.list(organizacaoId)
      ]);
      
      setDocumentos(docsData);
      setFotos(fotosData);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar arquivos');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocumento = async (documentoId: number) => {
    try {
      await documentoAPI.download(organizacaoId, documentoId);
    } catch (err: any) {
      alert(`Erro ao fazer download: ${err.message}`);
    }
  };

  const handleDownloadFoto = async (fotoId: number) => {
    try {
      await fotoAPI.download(organizacaoId, fotoId);
    } catch (err: any) {
      alert(`Erro ao fazer download: ${err.message}`);
    }
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('pt-BR');
    } catch {
      return '-';
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#056839' }}>
                Arquivos Anexados
              </h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#666' }}>
                {organizacaoNome}
              </p>
            </div>
            <button
              onClick={onClose}
              className="modal-close-btn"
              title="Fechar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div style={{ 
            display: 'flex', 
            borderBottom: '2px solid #e5e7eb',
            marginBottom: '1rem'
          }}>
            <button
              onClick={() => setActiveTab('documentos')}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'documentos' ? '3px solid #056839' : '3px solid transparent',
                color: activeTab === 'documentos' ? '#056839' : '#666',
                fontWeight: activeTab === 'documentos' ? '600' : '400',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all 0.2s'
              }}
            >
              <FileText size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Documentos ({documentos.length})
            </button>
            <button
              onClick={() => setActiveTab('fotos')}
              style={{
                padding: '0.75rem 1.5rem',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'fotos' ? '3px solid #056839' : '3px solid transparent',
                color: activeTab === 'fotos' ? '#056839' : '#666',
                fontWeight: activeTab === 'fotos' ? '600' : '400',
                cursor: 'pointer',
                fontSize: '0.875rem',
                transition: 'all 0.2s'
              }}
            >
              <Image size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Fotos ({fotos.length})
            </button>
          </div>

          {/* Content */}
          <div className="modal-body">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                Carregando arquivos...
              </div>
            ) : error ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem', 
              color: '#dc2626',
              background: '#fee2e2',
              borderRadius: '8px'
            }}>
              {error}
            </div>
          ) : (
            <>
              {/* Documentos Tab */}
              {activeTab === 'documentos' && (
                <div>
                  {documentos.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '2rem', 
                      color: '#666',
                      background: '#f9fafb',
                      borderRadius: '8px'
                    }}>
                      Nenhum documento anexado
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'grid', 
                      gap: '0.75rem',
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      {documentos.map((doc) => (
                        <div
                          key={doc.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '1rem',
                            background: '#f9fafb',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f3f4f6';
                            e.currentTarget.style.borderColor = '#056839';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f9fafb';
                            e.currentTarget.style.borderColor = '#e5e7eb';
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.5rem',
                              marginBottom: '0.25rem'
                            }}>
                              <FileText size={16} color="#056839" />
                              <span style={{ 
                                fontWeight: '500', 
                                fontSize: '0.875rem',
                                color: '#111'
                              }}>
                                {doc.arquivo}
                              </span>
                            </div>
                            {doc.obs && (
                              <p style={{ 
                                margin: '0.25rem 0 0', 
                                fontSize: '0.75rem', 
                                color: '#666'
                              }}>
                                {doc.obs}
                              </p>
                            )}
                            <p style={{ 
                              margin: '0.25rem 0 0', 
                              fontSize: '0.75rem', 
                              color: '#999'
                            }}>
                              Data: {formatDate(doc.creation_date)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDownloadDocumento(doc.id)}
                            style={{
                              padding: '0.5rem 1rem',
                              background: '#056839',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#044d2a'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#056839'}
                          >
                            <Download size={16} />
                            Baixar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fotos Tab */}
              {activeTab === 'fotos' && (
                <div>
                  {fotos.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '2rem', 
                      color: '#666',
                      background: '#f9fafb',
                      borderRadius: '8px'
                    }}>
                      Nenhuma foto anexada
                    </div>
                  ) : (
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: '1rem',
                      maxHeight: '500px',
                      overflowY: 'auto',
                      padding: '0.5rem'
                    }}>
                      {fotos.map((foto) => (
                        <div
                          key={foto.id}
                          style={{
                            background: 'white',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#056839';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 104, 57, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {/* Miniatura clicável */}
                          <div
                            onClick={() => setFotoAmpliada(foto)}
                            style={{
                              width: '100%',
                              height: '180px',
                              background: '#f8f9fa',
                              cursor: 'pointer',
                              position: 'relative',
                              overflow: 'hidden'
                            }}
                          >
                            <img
                              src={`/api/organizacoes/${organizacaoId}/fotos/${foto.id}/view`}
                              alt={foto.foto || 'Foto'}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `
                                    <div style="
                                      width: 100%;
                                      height: 100%;
                                      display: flex;
                                      align-items: center;
                                      justify-content: center;
                                      flex-direction: column;
                                      gap: 0.5rem;
                                      color: #999;
                                    ">
                                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                        <polyline points="21 15 16 10 5 21"/>
                                      </svg>
                                      <span style="font-size: 0.75rem;">Imagem não disponível</span>
                                    </div>
                                  `;
                                }
                              }}
                            />
                            {/* Overlay de zoom ao hover */}
                            <div
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(0, 0, 0, 0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                            >
                              <ZoomIn size={32} color="white" />
                            </div>
                          </div>

                          {/* Informações */}
                          <div style={{ padding: '0.75rem' }}>
                            <div style={{ 
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              color: '#111',
                              marginBottom: '0.25rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }} title={foto.foto || ''}>
                              {foto.foto}
                            </div>
                            {foto.obs && (
                              <div style={{ 
                                fontSize: '0.7rem', 
                                color: '#666',
                                marginBottom: '0.5rem',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>
                                {foto.obs}
                              </div>
                            )}
                            <div style={{ 
                              fontSize: '0.65rem', 
                              color: '#999',
                              marginBottom: '0.75rem'
                            }}>
                              {formatDate(foto.creation_date)}
                            </div>
                            <button
                              onClick={() => handleDownloadFoto(foto.id)}
                              style={{
                                width: '100%',
                                padding: '0.5rem',
                                background: '#056839',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#044d2a'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#056839'}
                            >
                              <Download size={14} />
                              Baixar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button
              onClick={onClose}
              style={{
                padding: '0.625rem 1.5rem',
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#6b7280'}
            >
              Fechar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Foto Ampliada */}
      {fotoAmpliada && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setFotoAmpliada(null)}
        >
          <button
            onClick={() => setFotoAmpliada(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
              zIndex: 10001
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <X size={24} color="white" />
          </button>

          <div 
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`/api/organizacoes/${organizacaoId}/fotos/${fotoAmpliada.id}/view`}
              alt={fotoAmpliada.foto || 'Foto ampliada'}
              style={{
                maxWidth: '100%',
                maxHeight: 'calc(90vh - 100px)',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)'
              }}
            />
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '15px 20px',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontWeight: '600', color: '#111', marginBottom: '5px' }}>
                {fotoAmpliada.foto}
              </div>
              {fotoAmpliada.obs && (
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '10px' }}>
                  {fotoAmpliada.obs}
                </div>
              )}
              <button
                onClick={() => handleDownloadFoto(fotoAmpliada.id)}
                style={{
                  padding: '8px 20px',
                  background: '#056839',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#044d2a'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#056839'}
              >
                <Download size={16} />
                Baixar Foto
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

