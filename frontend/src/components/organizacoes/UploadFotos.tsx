import React, { useState, useEffect } from 'react';
import { 
  Upload, Image, Trash2, Download, 
  ChevronDown, ChevronUp, AlertCircle, Plus, X, RefreshCw
} from 'lucide-react';
import { fotoAPI, Foto } from '../../services/api';

interface UploadFotosProps {
  organizacaoId: number;
  accordionAberto: string | null;
  onToggleAccordion: (accordion: string) => void;
}

export const UploadFotos: React.FC<UploadFotosProps> = ({
  organizacaoId,
  accordionAberto,
  onToggleAccordion
}) => {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [uploadFormAberto, setUploadFormAberto] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [obs, setObs] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [fotoAmpliada, setFotoAmpliada] = useState<Foto | null>(null);

  // Carregar fotos
  const loadFotos = async () => {
    setLoading(true);
    try {
      const data = await fotoAPI.list(organizacaoId);
      setFotos(data);
    } catch (error: any) {
      console.error('Erro ao carregar fotos:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar fotos' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizacaoId) {
      loadFotos();
    }
  }, [organizacaoId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar se é imagem
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Por favor, selecione apenas imagens' });
        return;
      }
      setSelectedFile(file);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('foto', selectedFile);
      if (obs) formData.append('obs', obs);

      await fotoAPI.upload(organizacaoId, formData);
      
      setMessage({ type: 'success', text: 'Foto enviada com sucesso!' });
      setSelectedFile(null);
      setObs('');
      setUploadFormAberto(false);
      
      // Recarregar lista
      await loadFotos();

      // Limpar mensagem após 3s
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erro ao enviar foto' });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (foto: Foto) => {
    try {
      await fotoAPI.download(organizacaoId, foto.id);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro ao fazer download da foto' });
    }
  };

  const handleDelete = async (foto: Foto) => {
    if (!confirm(`Tem certeza que deseja excluir esta foto?`)) {
      return;
    }

    try {
      await fotoAPI.delete(organizacaoId, foto.id);
      setMessage({ type: 'success', text: 'Foto excluída com sucesso!' });
      await loadFotos();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Erro ao excluir foto' });
    }
  };

  const handleSyncODK = async () => {
    setSyncing(true);
    setMessage({ type: 'success', text: '🔄 Sincronizando com ODK Collect...' });

    try {
      const resultado = await fotoAPI.syncFromODK(organizacaoId);
      
      let mensagem = '';
      let tipo: 'success' | 'error' = 'success';

      if (resultado.baixadas > 0) {
        mensagem = `✅ Download concluído! 📊 ${resultado.total_odk} fotos encontradas • ${resultado.baixadas} baixadas • ${resultado.ja_existentes} já existiam • ${resultado.erros} erros`;
        await loadFotos();
      } else if (resultado.total_odk === 0) {
        mensagem = '⚠️ Nenhuma foto encontrada no ODK para esta organização';
        tipo = 'error';
      } else {
        mensagem = `✅ Todas as ${resultado.total_odk} fotos já foram baixadas anteriormente`;
      }

      setMessage({ type: tipo, text: mensagem });
      setTimeout(() => setMessage(null), 8000);
    } catch (error: any) {
      setMessage({ type: 'error', text: `❌ Erro ao baixar fotos do ODK: ${error.message}` });
      setTimeout(() => setMessage(null), 8000);
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAberto = accordionAberto === 'fotos';

  return (
    <div className="accordion-item">
      <button
        className="accordion-header"
        onClick={() => onToggleAccordion('fotos')}
        style={{
          background: isAberto 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Image size={20} />
          <span>Fotos</span>
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
          {/* Mensagens de Feedback */}
          {message && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '20px',
              borderRadius: '8px',
              background: message.type === 'success' ? '#d4edda' : '#f8d7da',
              color: message.type === 'success' ? '#155724' : '#721c24',
              border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {message.text}
            </div>
          )}

          {/* Botões de Ação */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
            {/* Botão Upload */}
            <button
              onClick={() => setUploadFormAberto(!uploadFormAberto)}
              style={{
                flex: 1,
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
                Enviar Nova Foto
              </span>
              {uploadFormAberto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            {/* Botão Sincronizar ODK */}
            <button
              onClick={handleSyncODK}
              disabled={syncing}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: syncing ? '#6c757d' : '#056839',
                color: 'white',
                border: `2px solid ${syncing ? '#6c757d' : '#056839'}`,
                borderRadius: '8px',
                cursor: syncing ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                fontSize: '15px',
                fontWeight: '600',
                transition: 'all 0.2s ease',
                opacity: syncing ? 0.7 : 1
              }}
              title="Baixar fotos do ODK Collect"
            >
              <RefreshCw size={18} className={syncing ? 'spin' : ''} />
              {syncing ? 'Baixando...' : 'Baixar Fotos'}
            </button>
          </div>

          {/* Sub-accordion para Upload */}
          <div style={{ marginBottom: '20px' }}>

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
                <label>Imagem *</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*"
                  style={{
                    padding: '8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                {selectedFile && (
                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#6c757d' }}>
                    Arquivo selecionado: {selectedFile.name}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '0' }}>
                <label>Descrição/Observação</label>
                <textarea
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  rows={3}
                  placeholder="Digite uma descrição ou observação sobre a foto..."
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

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
                    {uploading ? 'Enviando...' : 'Enviar Foto'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Lista de Fotos */}
          <div>
            <h4 style={{ marginBottom: '15px', color: '#333' }}>
              Fotos Enviadas ({fotos.length})
            </h4>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                Carregando fotos...
              </div>
            ) : fotos.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px', 
                background: '#f8f9fa',
                borderRadius: '8px',
                color: '#6c757d'
              }}>
                <Image size={48} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                <p>Nenhuma foto enviada ainda</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {fotos.map((foto) => (
                  <div
                    key={foto.id}
                    style={{
                      background: 'white',
                      border: '1px solid #dee2e6',
                      borderRadius: '8px',
                      padding: '15px',
                      display: 'flex',
                      gap: '15px',
                      alignItems: 'center'
                    }}
                  >
                    {/* Miniatura - Imagem Real */}
                    <div 
                      onClick={() => setFotoAmpliada(foto)}
                      style={{
                        width: '150px',
                        height: '150px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        flexShrink: 0,
                        border: '2px solid #667eea',
                        background: '#f8f9fa',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease',
                        position: 'relative'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <img
                        src={`${import.meta.env.VITE_API_URL}/organizacoes/${organizacaoId}/fotos/${foto.id}/view`}
                        alt={foto.obs || foto.foto || 'Foto'}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          // Indicar que arquivo não existe
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; background: #f8d7da; color: #721c24; font-size: 10px; padding: 5px; text-align: center;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span style="margin-top: 4px;">Arquivo não encontrado</span></div>';
                          }
                        }}
                      />
                    </div>

                    {/* Informações */}
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'start',
                        marginBottom: '8px'
                      }}>
                        <div style={{ fontWeight: '600', fontSize: '15px', color: '#333' }}>
                          {foto.obs || foto.foto || `Foto ${foto.id}`}
                        </div>
                      </div>
                      
                      <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                        <div><strong>Arquivo:</strong> {foto.foto || 'N/A'}</div>
                        <div><strong>Enviado em:</strong> {formatDate(foto.creation_date)}</div>
                        <div><strong>Por:</strong> {foto.creator_uri_user}</div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => handleDownload(foto)}
                        style={{
                          padding: '8px 12px',
                          background: '#17a2b8',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px'
                        }}
                        title="Baixar foto"
                      >
                        <Download size={14} />
                        Baixar
                      </button>
                      <button
                        onClick={() => handleDelete(foto)}
                        style={{
                          padding: '8px 12px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px'
                        }}
                        title="Excluir foto"
                      >
                        <Trash2 size={14} />
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Preview Ampliado */}
      {fotoAmpliada && (
        <div
          onClick={() => setFotoAmpliada(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
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
              color: 'white',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            <X size={24} />
          </button>
          
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90%',
              maxHeight: '90%',
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
            }}
          >
            <img
              src={`${import.meta.env.VITE_API_URL}/organizacoes/${organizacaoId}/fotos/${fotoAmpliada.id}/view`}
              alt={fotoAmpliada.foto || 'Foto'}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                display: 'block'
              }}
            />
            {fotoAmpliada.obs && (
              <div style={{
                padding: '15px',
                background: '#f8f9fa',
                borderTop: '1px solid #dee2e6'
              }}>
                <strong>Descrição:</strong> {fotoAmpliada.obs}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

