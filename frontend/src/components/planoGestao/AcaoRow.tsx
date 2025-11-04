import React, { useState } from 'react';
import { AcaoCompleta, UpdateAcaoRequest } from '../../types/planoGestao';

interface AcaoRowProps {
  acao: AcaoCompleta;
  onSave: (idAcaoModelo: number, dados: UpdateAcaoRequest) => Promise<void>;
  canEdit: boolean;
}

export const AcaoRow: React.FC<AcaoRowProps> = ({ acao, onSave, canEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateAcaoRequest>({
    responsavel: acao.responsavel,
    data_inicio: acao.data_inicio,
    data_termino: acao.data_termino,
    como_sera_feito: acao.como_sera_feito,
    recursos: acao.recursos
  });

  const hasEdits = acao.id_acao_editavel !== undefined;

  const handleSave = async () => {
    if (!canEdit) return;

    setIsSaving(true);
    try {
      await onSave(acao.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar ação:', error);
      alert('Erro ao salvar ação. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      responsavel: acao.responsavel,
      data_inicio: acao.data_inicio,
      data_termino: acao.data_termino,
      como_sera_feito: acao.como_sera_feito,
      recursos: acao.recursos
    });
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (canEdit) {
      setIsEditing(true);
    }
  };

  return (
    <tr className={hasEdits ? 'acao-editada' : ''}>
      <td className="acao-descricao">{acao.acao}</td>
      
      <td className="acao-responsavel">
        {isEditing ? (
          <input
            type="text"
            value={formData.responsavel || ''}
            onChange={(e) => setFormData({ ...formData, responsavel: e.target.value || null })}
            placeholder={acao.hint_responsavel || 'Responsável'}
            className="form-input"
          />
        ) : (
          <span 
            onClick={handleEdit}
            className={canEdit ? 'editable-field' : ''}
            title={canEdit ? 'Clique para editar' : ''}
          >
            {acao.responsavel || '-'}
          </span>
        )}
      </td>

      <td className="acao-data">
        {isEditing ? (
          <input
            type="date"
            value={formData.data_inicio || ''}
            onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value || null })}
            className="form-input"
          />
        ) : (
          <span 
            onClick={handleEdit}
            className={canEdit ? 'editable-field' : ''}
            title={canEdit ? 'Clique para editar' : ''}
          >
            {acao.data_inicio ? new Date(acao.data_inicio).toLocaleDateString('pt-BR') : '-'}
          </span>
        )}
      </td>

      <td className="acao-data">
        {isEditing ? (
          <input
            type="date"
            value={formData.data_termino || ''}
            onChange={(e) => setFormData({ ...formData, data_termino: e.target.value || null })}
            className="form-input"
          />
        ) : (
          <span 
            onClick={handleEdit}
            className={canEdit ? 'editable-field' : ''}
            title={canEdit ? 'Clique para editar' : ''}
          >
            {acao.data_termino ? new Date(acao.data_termino).toLocaleDateString('pt-BR') : '-'}
          </span>
        )}
      </td>

      <td className="acao-como">
        {isEditing ? (
          <textarea
            value={formData.como_sera_feito || ''}
            onChange={(e) => setFormData({ ...formData, como_sera_feito: e.target.value || null })}
            placeholder={acao.hint_como_sera_feito || 'Como será feito?'}
            className="form-textarea"
            rows={3}
          />
        ) : (
          <span 
            onClick={handleEdit}
            className={canEdit ? 'editable-field' : ''}
            title={canEdit ? 'Clique para editar' : ''}
          >
            {acao.como_sera_feito || '-'}
          </span>
        )}
      </td>

      <td className="acao-recursos">
        {isEditing ? (
          <input
            type="text"
            value={formData.recursos || ''}
            onChange={(e) => setFormData({ ...formData, recursos: e.target.value || null })}
            placeholder={acao.hint_recursos || 'Recursos'}
            className="form-input"
          />
        ) : (
          <span 
            onClick={handleEdit}
            className={canEdit ? 'editable-field' : ''}
            title={canEdit ? 'Clique para editar' : ''}
          >
            {acao.recursos || '-'}
          </span>
        )}
      </td>

      <td className="acao-acoes">
        {isEditing ? (
          <div className="button-group">
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="btn-save"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
            <button 
              onClick={handleCancel} 
              disabled={isSaving}
              className="btn-cancel"
            >
              Cancelar
            </button>
          </div>
        ) : canEdit ? (
          <button 
            onClick={handleEdit}
            className="btn-edit"
          >
            Editar
          </button>
        ) : null}
      </td>
    </tr>
  );
};

