import { useState, useEffect } from 'react';
import { FileText, ChevronDown, ChevronUp, Upload } from 'lucide-react';

interface ObservacoesFinaisProps {
  organizacao: any;
  onUpdate: (campo: string, valor: any) => Promise<void>;
  accordionAberto: string | null;
  onToggleAccordion: (id: string) => void;
}

export function ObservacoesFinais({
  organizacao,
  onUpdate,
  accordionAberto,
  onToggleAccordion
}: ObservacoesFinaisProps) {
  const [obs, setObs] = useState(organizacao?.obs || '');
  const [assinatura, setAssinatura] = useState(organizacao?.assinatura_rep_legal || '');
  
  const isAberto = accordionAberto === 'observacoes';
  const LIMITE_CARACTERES = 8192;
  const TAMANHO_MAX_ASSINATURA = 500 * 1024; // 500KB

  useEffect(() => {
    setObs(organizacao?.obs || '');
    setAssinatura(organizacao?.assinatura_rep_legal || '');
  }, [organizacao]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (obs !== organizacao?.obs) {
        onUpdate('obs', obs || null);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [obs, organizacao?.obs, onUpdate]);

  const handleUploadAssinatura = async (file: File) => {
    if (file.size > TAMANHO_MAX_ASSINATURA) {
      alert('Assinatura muito grande. Tamanho máximo: 500KB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      alert('Arquivo deve ser uma imagem');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setAssinatura(base64);
      onUpdate('assinatura_rep_legal', base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoverAssinatura = () => {
    if (confirm('Deseja realmente remover a assinatura?')) {
      setAssinatura('');
      onUpdate('assinatura_rep_legal', null);
    }
  };

  return (
    <div className="accordion-item">
      <div 
        className="accordion-header" 
        onClick={() => onToggleAccordion('observacoes')}
        style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} /> Observações Finais
        </h3>
        {isAberto ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {isAberto && (
        <div className="accordion-content" style={{ display: 'block' }}>
          <div className="form-group">
            <label>
              Observações Gerais
              <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '0.5rem' }}>
                ({obs.length}/{LIMITE_CARACTERES} caracteres)
              </span>
            </label>
            <textarea
              value={obs}
              onChange={(e) => {
                if (e.target.value.length <= LIMITE_CARACTERES) {
                  setObs(e.target.value);
                }
              }}
              placeholder="Observações adicionais sobre a atividade..."
              rows={6}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            {obs.length >= LIMITE_CARACTERES * 0.9 && (
              <p style={{ 
                fontSize: '0.75rem', 
                color: obs.length >= LIMITE_CARACTERES ? '#dc2626' : '#f59e0b', 
                marginTop: '0.25rem' 
              }}>
                {obs.length >= LIMITE_CARACTERES 
                  ? 'Limite de caracteres atingido' 
                  : 'Aproximando-se do limite de caracteres'}
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Assinatura do Representante Legal</label>
            <div style={{ marginTop: '10px' }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleUploadAssinatura(e.target.files[0]);
                  }
                }}
                style={{ display: 'none' }}
                id="assinatura-rep-legal-upload"
              />
              <label
                htmlFor="assinatura-rep-legal-upload"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  background: '#056839',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <Upload size={16} /> {assinatura ? 'Alterar Assinatura' : 'Upload Assinatura'}
              </label>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '6px' }}>
                Tamanho máximo: 500KB | Formatos: JPG, PNG
              </p>
            </div>

            {assinatura && (
              <div style={{ 
                marginTop: '15px', 
                padding: '15px', 
                background: '#f9fafb', 
                borderRadius: '8px',
                border: '1px solid #e5e7eb' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Assinatura Atual:</span>
                  <button
                    onClick={handleRemoverAssinatura}
                    style={{
                      padding: '4px 12px',
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Remover
                  </button>
                </div>
                <div style={{ 
                  background: 'white', 
                  padding: '10px', 
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <img 
                    src={assinatura} 
                    alt="Assinatura do Representante Legal" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '200px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px'
                    }} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

