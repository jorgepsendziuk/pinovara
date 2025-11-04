import React, { useState, useEffect } from 'react';

interface RascunhoAccordionProps {
  rascunho: string | null;
  onSave: (rascunho: string | null) => Promise<void>;
  canEdit: boolean;
}

export const RascunhoAccordion: React.FC<RascunhoAccordionProps> = ({ 
  rascunho, 
  onSave,
  canEdit 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [text, setText] = useState(rascunho || '');

  useEffect(() => {
    setText(rascunho || '');
  }, [rascunho]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEdit = () => {
    if (canEdit) {
      setIsEditing(true);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(text || null);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
      alert('Erro ao salvar rascunho. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setText(rascunho || '');
    setIsEditing(false);
  };

  return (
    <div className="plano-accordion rascunho-accordion">
      <div 
        className={`accordion-header ${isExpanded ? 'expanded' : ''}`}
        onClick={toggleExpanded}
      >
        <div className="accordion-title">
          <span className="accordion-icon">{isExpanded ? '▼' : '▶'}</span>
          <h3>📝 Rascunho / Notas Colaborativas</h3>
        </div>
        <div className="accordion-stats">
          <span className="stat-badge info">
            {rascunho ? 'Com notas' : 'Vazio'}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="accordion-content">
          <div className="rascunho-info">
            <p>
              <strong>Este espaço é colaborativo!</strong> Técnicos, Supervisores, Coordenadores e 
              Administradores podem adicionar notas e discussões sobre o Plano de Gestão antes de 
              formalizar as ações.
            </p>
          </div>

          {isEditing ? (
            <div className="rascunho-editor">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Digite aqui suas notas e observações sobre o Plano de Gestão..."
                className="rascunho-textarea"
                rows={10}
              />
              <div className="button-group">
                <button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="btn-save"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Rascunho'}
                </button>
                <button 
                  onClick={handleCancel} 
                  disabled={isSaving}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="rascunho-viewer">
              {rascunho ? (
                <div className="rascunho-content">
                  <pre>{rascunho}</pre>
                </div>
              ) : (
                <div className="rascunho-empty">
                  <p>Nenhuma nota registrada ainda.</p>
                </div>
              )}
              {canEdit && (
                <button 
                  onClick={handleEdit}
                  className="btn-edit"
                >
                  {rascunho ? 'Editar Notas' : 'Adicionar Notas'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

