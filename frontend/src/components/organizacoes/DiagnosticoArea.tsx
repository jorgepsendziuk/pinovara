import React, { useState } from 'react';
import { GruposDiagnostico } from '../../types/organizacao';
import { Clipboard, Users, BarChart, Target, Handshake, GraduationCap } from 'lucide-react';

interface DiagnosticoAreaProps {
  titulo: string;
  icone: React.ReactNode;
  area: string;
  dados: GruposDiagnostico;
  perguntas: { [key: string]: any };
  diagnosticoAberto: string | null;
  onToggle: (area: string) => void;
  onUpdate: (categoria: string, pergunta: number, campo: 'resposta' | 'comentario' | 'proposta', valor: any) => void;
}

export const DiagnosticoArea: React.FC<DiagnosticoAreaProps> = ({
  titulo,
  icone,
  area,
  dados,
  perguntas,
  diagnosticoAberto,
  onToggle,
  onUpdate
}) => {
  // Estado para controlar qual sub-acordeão está aberto
  const [subAccordionAberto, setSubAccordionAberto] = useState<string | null>(null);

  const toggleSubAccordion = (categoria: string) => {
    setSubAccordionAberto(subAccordionAberto === categoria ? null : categoria);
  };
  const getCorResposta = (resposta: number) => {
    switch(resposta) {
      case 1: return '#d4edda'; // Sim - verde bem claro
      case 2: return '#ffeaea'; // Não - vermelho bem claro
      case 3: return '#fff9e6'; // Parcial - amarelo bem claro  
      case 4: return '#f8f9fa'; // Não se aplica - cinza bem claro
      default: return '#ffffff'; // Padrão - branco
    }
  };

  const renderSubAccordion = (categoria: string, perguntasCategoria: any[]) => {
    const isOpen = subAccordionAberto === categoria;
    
    // Títulos personalizados para cada categoria
    const titulos: { [key: string]: React.ReactElement } = {
      // Governança
      'estrutura': <><Clipboard size={16} style={{marginRight: '0.5rem'}} /> Estrutura Organizacional</>,
      'estrategia': <><Target size={16} style={{marginRight: '0.5rem'}} /> Estratégia e Planejamento</>,
      'organizacao': <><Users size={16} style={{marginRight: '0.5rem'}} /> Organização dos Associados</>,
      'direcao': <><Handshake size={16} style={{marginRight: '0.5rem'}} /> Direção e Participação</>,
      'controle': <><BarChart size={16} style={{marginRight: '0.5rem'}} /> Controle e Transparência</>,
      'educacao': <><GraduationCap size={16} style={{marginRight: '0.5rem'}} /> Educação Cooperativista</>,
      
      // Gestão de Pessoas
      'p_organizacao': <><Users size={16} style={{marginRight: '0.5rem'}} /> Organização do Trabalho</>,
      'p_desenvolvimento': <><GraduationCap size={16} style={{marginRight: '0.5rem'}} /> Desenvolvimento de Pessoas</>,
      'trabalho': <><Clipboard size={16} style={{marginRight: '0.5rem'}} /> Saúde e Segurança do Trabalho</>,
      'geracao': <><Users size={16} style={{marginRight: '0.5rem'}} /> Gênero e Geração</>,
      
      // Gestão Financeira
      'balanco': <><BarChart size={16} style={{marginRight: '0.5rem'}} /> Balanço Patrimonial</>,
      'contas': <><Clipboard size={16} style={{marginRight: '0.5rem'}} /> Contas a Pagar e Receber</>,
      'caixa': <><BarChart size={16} style={{marginRight: '0.5rem'}} /> Fluxo de Caixa</>,
      'estoque': <><Clipboard size={16} style={{marginRight: '0.5rem'}} /> Controle de Estoque</>,
      'resultado': <><BarChart size={16} style={{marginRight: '0.5rem'}} /> Demonstração de Resultado</>,
      'analise': <><Target size={16} style={{marginRight: '0.5rem'}} /> Análise de Viabilidade</>,
      'fiscal': <><Clipboard size={16} style={{marginRight: '0.5rem'}} /> Obrigações Fiscais</>,
      
      // Gestão Comercial
      'e_comercial': <><Handshake size={16} style={{marginRight: '0.5rem'}} /> Estrutura Comercial</>,
      'mercado': <><Target size={16} style={{marginRight: '0.5rem'}} /> Mercados Diferenciados</>,
      'comercial': <><Handshake size={16} style={{marginRight: '0.5rem'}} /> Estratégia Comercial</>,
      'modelo': <><Target size={16} style={{marginRight: '0.5rem'}} /> Modelo de Negócios</>,
      
      // Gestão de Processos
      'reg_sanitaria': <><Clipboard size={16} style={{marginRight: '0.5rem'}} /> Regularização Sanitária</>,
      'planejamento': <><Target size={16} style={{marginRight: '0.5rem'}} /> Planejamento da Produção</>,
      'logistica': <><Clipboard size={16} style={{marginRight: '0.5rem'}} /> Logística</>,
      'valor': <><Target size={16} style={{marginRight: '0.5rem'}} /> Cadeia de Valor</>,
      'fluxo': <><Clipboard size={16} style={{marginRight: '0.5rem'}} /> Fluxos de Processos</>,
      'qualidade': <><Target size={16} style={{marginRight: '0.5rem'}} /> Qualidade e Certificação</>,
      'producao': <><Clipboard size={16} style={{marginRight: '0.5rem'}} /> Bens de Produção</>,
      
      // Gestão de Inovação
      'iic': <><Target size={16} style={{marginRight: '0.5rem'}} /> Ideias e Iniciativas Criativas</>,
      'mar': <><GraduationCap size={16} style={{marginRight: '0.5rem'}} /> Monitoramento e Aprendizagem</>,
      'time': <><Users size={16} style={{marginRight: '0.5rem'}} /> Trabalho em Equipe</>,
      
      // Gestão Socioambiental
      'socioambiental': <><Target size={16} style={{marginRight: '0.5rem'}} /> Práticas Socioambientais</>,
      'ambiental': <><Clipboard size={16} style={{marginRight: '0.5rem'}} /> Valoração Ambiental</>,
      'reg_ambiental': <><Clipboard size={16} style={{marginRight: '0.5rem'}} /> Regularização Ambiental</>,
      'impactos_ambiental': <><Target size={16} style={{marginRight: '0.5rem'}} /> Impactos Ambientais</>,
      
      // Infraestrutura Sustentável
      'eficiencia_energetica': <><Target size={16} style={{marginRight: '0.5rem'}} /> Eficiência Energética</>,
      'recursos_naturais': <><Clipboard size={16} style={{marginRight: '0.5rem'}} /> Recursos Naturais</>,
      'agua': <><Clipboard size={16} style={{marginRight: '0.5rem'}} /> Gestão da Água</>,
      'conforto_ambiental': <><Target size={16} style={{marginRight: '0.5rem'}} /> Conforto Ambiental</>,
      'residuos': <><Clipboard size={16} style={{marginRight: '0.5rem'}} /> Gestão de Resíduos</>
    };

    return (
      <div key={categoria} className="sub-accordion" style={{ marginBottom: '10px' }}>
        {/* Cabeçalho do sub-acordeão */}
        <button
          className="sub-accordion-header"
          onClick={() => toggleSubAccordion(categoria)}
          style={{ 
            backgroundColor: '#e9ecef', 
            color: '#495057', 
            padding: '12px 15px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            width: '100%',
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: isOpen ? '0' : '0'
          }}
        >
          <span>{titulos[categoria] || categoria.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
          <span style={{ 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
            transition: 'transform 0.2s ease' 
          }}>
            ▼
          </span>
        </button>
        
        {/* Conteúdo do sub-acordeão */}
        <div 
          className="sub-accordion-content"
          style={{
            display: isOpen ? 'block' : 'none',
            borderLeft: isOpen ? '1px solid #ced4da' : 'none',
            borderRight: isOpen ? '1px solid #ced4da' : 'none',
            borderBottom: isOpen ? '1px solid #ced4da' : 'none',
            borderTop: 'none',
            borderRadius: '0 0 4px 4px',
            backgroundColor: '#fff'
          }}
        >
        
        <div className="tabela-diagnostico" style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            minWidth: '1200px'
          }}>
            <thead>
              <tr>
                <th style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: '#f8f9fa', minWidth: '400px' }}>
                  Pergunta
                </th>
                <th style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: '#f8f9fa', width: '180px' }}>
                  Resposta
                </th>
                <th style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: '#f8f9fa', width: '300px' }}>
                  Comentário
                </th>
                <th style={{ padding: '12px', border: '1px solid #ddd', backgroundColor: '#f8f9fa', width: '300px' }}>
                  Proposta
                </th>
              </tr>
            </thead>
            <tbody>
              {perguntasCategoria.map((pergunta: any, index: number) => {
                // Mapear área para prefixo correto do banco de dados
                const prefixoMap: { [key: string]: string } = {
                  'governanca-main': 'go',
                  'pessoas-main': 'gp',
                  'financeira-main': 'gf',
                  'comercial-main': 'gc',
                  'processos-main': 'gpp',
                  'inovacao-main': 'gi',
                  'socioambiental-main': 'gs',
                  'infraestrutura-main': 'is'
                };
                
                const prefixo = prefixoMap[area] || area.substring(0, 2);
                const chave = `${prefixo}_${categoria}_${pergunta.numero}`;
                const dadosResposta = dados[`${chave}_resposta`] || { resposta: 0 };
                const dadosComentario = dados[`${chave}_comentario`] || { comentario: '' };
                const dadosProposta = dados[`${chave}_proposta`] || { proposta: '' };

                return (
                  <tr key={pergunta.numero}>
                    <td style={{ 
                      padding: '12px', 
                      border: '1px solid #ddd', 
                      fontSize: '14px',
                      lineHeight: '1.4',
                      minWidth: '400px'
                    }}>
                      <strong>P{pergunta.numero}:</strong> {pergunta.texto}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      <select
                        value={dadosResposta.resposta || 0}
                        onChange={(e) => onUpdate(categoria, pergunta.numero, 'resposta', parseInt(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '5px',
                          backgroundColor: getCorResposta(dadosResposta.resposta || 0),
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          color: '#212529',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        <option value={0} style={{ color: '#212529', backgroundColor: '#fff' }}>Selecione</option>
                        <option value={1} style={{ color: '#212529', backgroundColor: '#d4edda' }}>Sim</option>
                        <option value={2} style={{ color: '#212529', backgroundColor: '#ffeaea' }}>Não</option>
                        <option value={3} style={{ color: '#212529', backgroundColor: '#fff9e6' }}>Parcial</option>
                        <option value={4} style={{ color: '#212529', backgroundColor: '#f8f9fa' }}>Não se Aplica</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      <textarea
                        value={dadosComentario.comentario || ''}
                        onChange={(e) => onUpdate(categoria, pergunta.numero, 'comentario', e.target.value)}
                        placeholder="Comentários sobre a situação atual..."
                        rows={3}
                        style={{ 
                          width: '100%', 
                          padding: '8px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          resize: 'vertical',
                          backgroundColor: '#fff',
                          color: '#212529',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                      <textarea
                        value={dadosProposta.proposta || ''}
                        onChange={(e) => onUpdate(categoria, pergunta.numero, 'proposta', e.target.value)}
                        placeholder="Propostas de melhorias..."
                        rows={3}
                        style={{ 
                          width: '100%', 
                          padding: '8px',
                          border: '1px solid #ccc',
                          borderRadius: '4px',
                          resize: 'vertical',
                          backgroundColor: '#fff',
                          color: '#212529',
                          fontSize: '14px'
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="accordion-item area-gerencial" style={{ marginBottom: '15px' }}>
      <button
        className="accordion-header area-header"
        onClick={() => onToggle(area)}
        style={{ 
          width: '100%',
          textAlign: 'left',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{icone} {titulo}</h3>
        <span className={`accordion-icon ${diagnosticoAberto === area ? 'open' : ''}`}>
          ▼
        </span>
      </button>
      
      <div className={`accordion-content ${diagnosticoAberto === area ? 'open' : ''}`}>
        <div className="area-content" style={{ padding: '15px' }}>
          {Object.entries(perguntas).map(([categoria, perguntasCategoria]) => 
            renderSubAccordion(categoria, perguntasCategoria as any[])
          )}
        </div>
      </div>
    </div>
  );
};
