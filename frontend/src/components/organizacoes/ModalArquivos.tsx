import { useState, useEffect } from 'react';
import { X, Download, FileText, Image } from 'lucide-react';
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
                      gap: '0.75rem',
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      {fotos.map((foto) => (
                        <div
                          key={foto.id}
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
                              <Image size={16} color="#056839" />
                              <span style={{ 
                                fontWeight: '500', 
                                fontSize: '0.875rem',
                                color: '#111'
                              }}>
                                {foto.foto}
                              </span>
                            </div>
                            {foto.obs && (
                              <p style={{ 
                                margin: '0.25rem 0 0', 
                                fontSize: '0.75rem', 
                                color: '#666'
                              }}>
                                {foto.obs}
                              </p>
                            )}
                            <p style={{ 
                              margin: '0.25rem 0 0', 
                              fontSize: '0.75rem', 
                              color: '#999'
                            }}>
                              Data: {formatDate(foto.creation_date)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDownloadFoto(foto.id)}
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
  );
};

