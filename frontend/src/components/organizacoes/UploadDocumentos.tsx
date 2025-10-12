import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, Image, Trash2, Download, 
  ChevronDown, ChevronUp, AlertCircle, Plus, RefreshCw
} from 'lucide-react';
import { documentoAPI, Documento } from '../../services/api';

interface UploadDocumentosProps {
  organizacaoId: number;
  accordionAberto: string | null;
  onToggleAccordion: (accordion: string) => void;
}

export const UploadDocumentos: React.FC<UploadDocumentosProps> = ({
  organizacaoId,
  accordionAberto,
  onToggleAccordion
}) => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [uploadFormAberto, setUploadFormAberto] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [obs, setObs] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Carregar documentos
  const loadDocumentos = async () => {
    setLoading(true);
    try {
      const docs = await documentoAPI.list(organizacaoId);
      setDocumentos(docs);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar documentos' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizacaoId) {
      loadDocumentos();
    }
  }, [organizacaoId]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Selecione um arquivo' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('arquivo', selectedFile);
      if (obs) {
        formData.append('obs', obs);
      }

      await documentoAPI.upload(organizacaoId, formData);

      setMessage({ type: 'success', text: 'Arquivo enviado com sucesso!' });
      setSelectedFile(null);
      setObs('');
      loadDocumentos();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao enviar arquivo' });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentoId: number) => {
    if (!confirm('Deseja realmente excluir este documento?')) return;

    try {
      await documentoAPI.delete(organizacaoId, documentoId);
      setMessage({ type: 'success', text: 'Documento excluído com sucesso!' });
      loadDocumentos();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao excluir documento' });
    }
  };

  const handleDownload = async (documentoId: number) => {
    try {
      await documentoAPI.download(organizacaoId, documentoId);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao fazer download' });
    }
  };

  const handleSyncODK = async () => {
    setSyncing(true);
    try {
      const result = await documentoAPI.syncFromODK(organizacaoId);
      
      // Montar mensagem com detalhes
      let mensagem = `Sincronização concluída!
      
Total no ODK: ${result.total_odk}
Já existentes: ${result.ja_existentes}
Baixados agora: ${result.baixadas}
Erros: ${result.erros}`;

      // Adicionar detalhes dos arquivos
      if (result.detalhes && result.detalhes.length > 0) {
        mensagem += '\n\n';
        mensagem += result.detalhes.map((d: any) => {
          const status = d.status === 'baixada' ? '✓' : d.status === 'existente' ? '=' : '✗';
          const nome = d.nome_arquivo || d.uri;
          const msg = d.mensagem ? ` (${d.mensagem})` : '';
          return `${status} ${nome}${msg}`;
        }).join('\n');
      }
      
      alert(mensagem);
      
      await loadDocumentos();
    } catch (error: any) {
      alert('Erro ao sincronizar: ' + error.message);
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText size={16} color="#dc3545" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <Image size={16} color="#2196f3" />;
    if (['doc', 'docx'].includes(ext || '')) return <FileText size={16} color="#007bff" />;
    return <FileText size={16} />;
  };

  const getFileColor = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '#dc3545';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return '#2196f3';
    if (['doc', 'docx'].includes(ext || '')) return '#007bff';
    return '#6c757d';
  };

  const isAberto = accordionAberto === 'arquivos';

  return (
    <div className="accordion-item">
      <button 
        className="accordion-header"
        onClick={() => onToggleAccordion('arquivos')}
      >
        <h3>
          <Upload size={18} style={{marginRight: '0.5rem'}} /> 
          Arquivos e Documentos
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
          {/* Sub-accordion para Upload */}
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setUploadFormAberto(!uploadFormAberto)}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: uploadFormAberto ? '#28a745' : '#f8f9fa',
                color: uploadFormAberto ? 'white' : '#333',
                border: `2px solid ${uploadFormAberto ? '#28a745' : '#dee2e6'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={18} />
                Enviar Novo Arquivo
              </span>
              {uploadFormAberto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {/* Botão Sincronizar ODK */}
            <button
              onClick={handleSyncODK}
              disabled={syncing}
              style={{
                marginTop: '10px',
                padding: '12px 16px',
                background: syncing ? '#6c757d' : '#17a2b8',
                color: 'white',
                border: '2px solid #17a2b8',
                borderRadius: '8px',
                cursor: syncing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                width: '100%',
                justifyContent: 'center'
              }}
              title="Sincronizar arquivos do ODK Collect"
            >
              <RefreshCw size={16} className={syncing ? 'spinning' : ''} />
              {syncing ? 'Sincronizando...' : 'Sincronizar ODK'}
            </button>

            {uploadFormAberto && (
              <div style={{ 
                background: '#f8f9fa', 
                padding: '20px', 
                borderRadius: '0 0 8px 8px',
                border: '2px solid #28a745',
                borderTop: 'none',
                marginTop: '-2px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label>Arquivo *</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="form-control"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                {selectedFile && (
                  <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                    📎 Arquivo selecionado: <strong>{selectedFile.name}</strong>
                  </small>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '0' }}>
                <label>Observações</label>
                <textarea
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  className="form-control"
                  rows={3}
                  placeholder="Descrição do arquivo, tipo de documento, etc..."
                />
              </div>
            </div>

            {message && (
              <div style={{
                padding: '10px',
                marginTop: '15px',
                borderRadius: '4px',
                background: message.type === 'success' ? '#d4edda' : '#f8d7da',
                color: message.type === 'success' ? '#155724' : '#721c24',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                {message.text}
              </div>
            )}

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  style={{
                    marginTop: '15px',
                    padding: '10px 20px',
                    background: selectedFile && !uploading ? '#28a745' : '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: selectedFile && !uploading ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Upload size={16} />
                  {uploading ? 'Enviando...' : 'Enviar Arquivo'}
                </button>
              </div>
            )}
          </div>

          {/* Lista de Documentos */}
          <div>
            <h4 style={{ marginBottom: '15px', color: '#333' }}>
              Documentos Enviados ({documentos.length})
            </h4>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                Carregando documentos...
              </div>
            ) : documentos.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666',
                background: '#f8f9fa',
                borderRadius: '8px'
              }}>
                <Upload size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
                <p>Nenhum documento enviado ainda</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {documentos.map(doc => (
                  <div
                    key={doc.id}
                    style={{
                      padding: '15px',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      background: 'white',
                      display: 'flex',
                      gap: '15px',
                      alignItems: 'center'
                    }}
                  >
                    {/* Miniatura */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      background: `${getFileColor(doc.arquivo || '')}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: '2px solid',
                      borderColor: getFileColor(doc.arquivo || '')
                    }}>
                      {React.cloneElement(getFileIcon(doc.arquivo || ''), { 
                        size: 40
                      })}
                    </div>

                    {/* Informações */}
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <strong style={{ fontSize: '16px', color: '#333' }}>
                          {doc.arquivo}
                        </strong>
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                        <div><strong>Enviado em:</strong> {formatDate(doc.creation_date)}</div>
                        <div><strong>Por:</strong> {doc.creator_uri_user}</div>
                        {doc.obs && <div><strong>Descrição:</strong> {doc.obs}</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => handleDownload(doc.id)}
                        style={{
                          padding: '8px 12px',
                          background: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        style={{
                          padding: '8px 12px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// CSS para animação de spinning
const style = document.createElement('style');
style.textContent = `
  .spinning {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;
document.head.appendChild(style);
