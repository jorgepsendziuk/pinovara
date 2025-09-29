import { useState } from 'react';
import { ChevronDown, ChevronUp, Calendar, User, Target, DollarSign, FileText } from 'lucide-react';
import './PlanoGestao.css';

interface AcaoPlano {
  id: string;
  nome: string;
  responsavel: string;
  inicio: string;
  termino: string;
  comoSeraFeito: string;
  recursos: string;
}

interface PlanoGestaoType {
  id: string;
  titulo: string;
  acoes: AcaoPlano[];
}

const dadosExemplo: PlanoGestaoType[] = [
  {
    id: 'plano-gestao-estrategias',
    titulo: 'Plano de Gestão e Estratégias (Foco nos Empreendimentos)',
    acoes: [
      {
        id: 'identificacao-valor-cultural',
        nome: 'Identificação do valor cultural',
        responsavel: 'Gestor do empreendimento',
        inicio: '',
        termino: '',
        comoSeraFeito: 'Definição de como o empreendimento reflete a sua identidade. Essa atividade deve dialogar com ingredientes e técnicas ancestrais (empreendimentos em territórios Quilombolas), resgate de saberes tradicionais e valorização do território.',
        recursos: 'Facilitadores'
      },
      {
        id: 'analise-diferencial-competitivo',
        nome: 'Análise do diferencial competitivo',
        responsavel: 'Gestor do empreendimento',
        inicio: '',
        termino: '',
        comoSeraFeito: 'Levantamento de características particulares e diferenciais do empreendimento. Utilizar a história, a forma de produção ou a conexão direta com a comunidade como diferenciais.',
        recursos: 'Facilitadores'
      },
      {
        id: 'missao-visao',
        nome: 'Missão e visão',
        responsavel: 'Gestor do empreendimento',
        inicio: '',
        termino: '',
        comoSeraFeito: 'Elaboração, de forma simples e direta, a missão (o que o negócio faz e para quem) e a visão (onde o negócio quer chegar a longo prazo).',
        recursos: 'Facilitadores'
      }
    ]
  },
  {
    id: 'plano-mercado-comercializacao',
    titulo: 'Plano de Mercado e Comercialização',
    acoes: [
      {
        id: 'analise-mercado-consumidor',
        nome: 'Análise do mercado consumidor',
        responsavel: 'Gestor do empreendimento',
        inicio: '',
        termino: '',
        comoSeraFeito: 'Identificação e caracterização do público-alvo, análise de demanda e preferências do consumidor.',
        recursos: 'Facilitadores'
      },
      {
        id: 'canais-distribuicao',
        nome: 'Definição dos canais de distribuição',
        responsavel: 'Gestor do empreendimento',
        inicio: '',
        termino: '',
        comoSeraFeito: 'Mapeamento e seleção dos melhores canais para comercialização dos produtos/serviços.',
        recursos: 'Facilitadores'
      }
    ]
  },
  {
    id: 'plano-tecnologia-inovacao',
    titulo: 'Plano de Tecnologia e Inovação',
    acoes: [
      {
        id: 'mapeamento-tecnologias',
        nome: 'Mapeamento de tecnologias disponíveis',
        responsavel: 'Gestor do empreendimento',
        inicio: '',
        termino: '',
        comoSeraFeito: 'Levantamento das tecnologias existentes e necessárias para melhorar os processos produtivos.',
        recursos: 'Facilitadores'
      },
      {
        id: 'plano-inovacao',
        nome: 'Desenvolvimento de plano de inovação',
        responsavel: 'Gestor do empreendimento',
        inicio: '',
        termino: '',
        comoSeraFeito: 'Criação de estratégias para implementação de inovações nos processos e produtos.',
        recursos: 'Facilitadores'
      }
    ]
  }
];

interface PlanoGestaoProps {
  onUpdate?: (dados: any) => void;
}

export function PlanoGestao({ onUpdate }: PlanoGestaoProps) {
  const [planosAbertos, setPlanosAbertos] = useState<string[]>([]);
  const [dadosPlanos, setDadosPlanos] = useState<PlanoGestaoType[]>(dadosExemplo);

  const togglePlano = (planoId: string) => {
    setPlanosAbertos(prev => 
      prev.includes(planoId) 
        ? prev.filter(id => id !== planoId)
        : [...prev, planoId]
    );
  };

  const atualizarData = (planoId: string, acaoId: string, campo: 'inicio' | 'termino', valor: string) => {
    setDadosPlanos(prev => 
      prev.map(plano => 
        plano.id === planoId 
          ? {
              ...plano,
              acoes: plano.acoes.map(acao => 
                acao.id === acaoId 
                  ? { ...acao, [campo]: valor }
                  : acao
              )
            }
          : plano
      )
    );
  };

  return (
    <div className="plano-gestao-container">
      <div className="plano-gestao-header">
        <h3>
          <Target size={20} style={{ marginRight: '0.5rem' }} />
          Plano de Gestão
        </h3>
        <p className="plano-gestao-desc">
          Defina as estratégias e ações para o desenvolvimento da organização. 
          Por enquanto, apenas as datas de início e término são editáveis para validação do design.
        </p>
      </div>

      <div className="planos-accordion">
        {dadosPlanos.map((plano) => {
          const isAberto = planosAbertos.includes(plano.id);
          
          return (
            <div key={plano.id} className="plano-accordion-item">
              <button
                className="plano-accordion-header"
                onClick={() => togglePlano(plano.id)}
                type="button"
              >
                <div className="plano-accordion-title">
                  <FileText size={16} style={{ marginRight: '0.5rem' }} />
                  {plano.titulo}
                </div>
                {isAberto ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>

              {isAberto && (
                <div className="plano-accordion-content">
                  <div className="acoes-table">
                    <div className="acoes-table-header">
                      <div className="col-acao">AÇÕES</div>
                      <div className="col-responsavel">RESPONSÁVEL<br/><small>(com Assessoria do(a) Técnico(a) de Campo)</small></div>
                      <div className="col-inicio">INÍCIO</div>
                      <div className="col-termino">TÉRMINO</div>
                      <div className="col-como">COMO SERÁ FEITO?</div>
                      <div className="col-recursos">RECURSOS</div>
                    </div>

                    {plano.acoes.map((acao) => (
                      <div key={acao.id} className="acao-row">
                        <div className="col-acao">
                          <strong>{acao.nome}</strong>
                        </div>
                        
                        <div className="col-responsavel">
                          <div className="responsavel-info">
                            <User size={14} style={{ marginRight: '0.25rem' }} />
                            {acao.responsavel}
                          </div>
                        </div>

                        <div className="col-inicio">
                          <div className="date-input-group">
                            <Calendar size={14} />
                            <input
                              type="date"
                              value={acao.inicio}
                              onChange={(e) => atualizarData(plano.id, acao.id, 'inicio', e.target.value)}
                              className="date-input"
                            />
                          </div>
                        </div>

                        <div className="col-termino">
                          <div className="date-input-group">
                            <Calendar size={14} />
                            <input
                              type="date"
                              value={acao.termino}
                              onChange={(e) => atualizarData(plano.id, acao.id, 'termino', e.target.value)}
                              className="date-input"
                            />
                          </div>
                        </div>

                        <div className="col-como">
                          <p>{acao.comoSeraFeito}</p>
                        </div>

                        <div className="col-recursos">
                          <div className="recursos-info">
                            <DollarSign size={14} style={{ marginRight: '0.25rem' }} />
                            {acao.recursos}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
