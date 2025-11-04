import React from 'react';
import { AcaoRow } from './AcaoRow';
import { GrupoAcoes as GrupoAcoesType, UpdateAcaoRequest } from '../../types/planoGestao';

interface GrupoAcoesProps {
  grupo: GrupoAcoesType;
  onSave: (idAcaoModelo: number, dados: UpdateAcaoRequest) => Promise<void>;
  canEdit: boolean;
}

export const GrupoAcoes: React.FC<GrupoAcoesProps> = ({ grupo, onSave, canEdit }) => {
  console.log('📋 GrupoAcoes renderizado:', grupo.nome || 'sem nome', 'com', grupo.acoes.length, 'ações');
  console.log('📋 Ações:', grupo.acoes.map(a => a.acao).join(', '));
  
  return (
    <div className="grupo-acoes" style={{border: '2px solid red', margin: '10px', padding: '10px'}}>
      {grupo.nome && <h4 className="grupo-titulo">{grupo.nome}</h4>}
      
      <p style={{background: 'yellow', padding: '5px'}}>
        DEBUG: Grupo "{grupo.nome || 'sem nome'}" com {grupo.acoes.length} ações
      </p>
      
      <div className="aviso-salvar">
        ⚠️ <strong>Importante:</strong> Lembre-se de salvar cada ação individualmente clicando no botão "Salvar" correspondente.
      </div>

      <table className="tabela-acoes" style={{width: '100%', border: '1px solid blue'}}>
        <thead>
          <tr>
            <th className="col-acao">Ação</th>
            <th className="col-responsavel">Responsável</th>
            <th className="col-data">Início</th>
            <th className="col-data">Término</th>
            <th className="col-como">Como Será Feito?</th>
            <th className="col-recursos">Recursos</th>
            <th className="col-acoes">Ações</th>
          </tr>
        </thead>
        <tbody>
          {grupo.acoes.map((acao) => (
            <AcaoRow
              key={acao.id}
              acao={acao}
              onSave={onSave}
              canEdit={canEdit}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

