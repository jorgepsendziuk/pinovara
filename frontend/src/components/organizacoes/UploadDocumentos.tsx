import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, Image, List, Trash2, Download, 
  ChevronDown, AlertCircle 
} from 'lucide-react';
import { documentoAPI, Documento } from '../../services/api';

interface UploadDocumentosProps {
  organizacaoId: number;
  accordionAberto: string | null;
  onToggleAccordion: (accordion: string) => void;
}

const tiposDocumento = [
  { value: 'termo_adesao', label: 'Termo de Adesão', icon: FileText },
  { value: 'relatorio', label: 'Relatório da Atividade', icon: FileText },
  { value: 'lista_presenca', label: 'Lista de Presença', icon: List },
  { value: 'foto', label: 'Registro Fotográfico', icon: Image },
];

export const UploadDocumentos: React.FC<UploadDocumentosProps> = ({
  organizacaoId,
  accordionAberto,
  onToggleAccordion
}) => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState('termo_adesao');
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
      formData.append('tipo_documento', selectedTipo);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  const getTipoLabel = (tipo: string) => {
    return tiposDocumento.find(t => t.value === tipo)?.label || tipo;
  };

  const getIcon = (tipo: string) => {
    const Icon = tiposDocumento.find(t => t.value === tipo)?.icon || FileText;
    return <Icon size={16} />;
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
          {/* Formulário de Upload */}
          <div style={{ 
            background: '#f8f9fa', 
            padding: '20px', 
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <h4 style={{ marginBottom: '15px', color: '#333' }}>
              Enviar Novo Documento
            </h4>

            <div className="form-grid">
              <div className="form-group">
                <label>Tipo de Documento *</label>
                <select
                  value={selectedTipo}
                  onChange={(e) => setSelectedTipo(e.target.value)}
                  className="form-control"
                >
                  {tiposDocumento.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Arquivo *</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="form-control"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
                {selectedFile && (
                  <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                    Arquivo selecionado: {selectedFile.name}
                  </small>
                )}
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Observações</label>
                <textarea
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  className="form-control"
                  rows={3}
                  placeholder="Observações sobre o documento..."
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
              {uploading ? 'Enviando...' : 'Enviar Documento'}
            </button>
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
                      background: doc.tipo_documento === 'foto' 
                        ? '#e3f2fd' 
                        : doc.tipo_documento === 'termo_adesao'
                        ? '#fff3e0'
                        : doc.tipo_documento === 'relatorio'
                        ? '#f3e5f5'
                        : '#e8f5e9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      border: '2px solid',
                      borderColor: doc.tipo_documento === 'foto' 
                        ? '#2196f3' 
                        : doc.tipo_documento === 'termo_adesao'
                        ? '#ff9800'
                        : doc.tipo_documento === 'relatorio'
                        ? '#9c27b0'
                        : '#4caf50'
                    }}>
                      {React.cloneElement(getIcon(doc.tipo_documento), { 
                        size: 40,
                        color: doc.tipo_documento === 'foto' 
                          ? '#2196f3' 
                          : doc.tipo_documento === 'termo_adesao'
                          ? '#ff9800'
                          : doc.tipo_documento === 'relatorio'
                          ? '#9c27b0'
                          : '#4caf50'
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
                          {getTipoLabel(doc.tipo_documento)}
                        </strong>
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                        <div><strong>Arquivo:</strong> {doc.arquivo}</div>
                        <div><strong>Enviado em:</strong> {formatDate(doc.data_envio)}</div>
                        <div><strong>Por:</strong> {doc.usuario_envio}</div>
                        {doc.obs && <div><strong>Obs:</strong> {doc.obs}</div>}
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
