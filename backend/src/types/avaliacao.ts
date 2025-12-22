export type TipoPergunta = 'escala_5' | 'escala_3' | 'sim_nao_talvez' | 'sim_nao_parcialmente' | 'texto_livre';

export interface AvaliacaoVersao {
  id?: number;
  versao: string;
  descricao?: string;
  ativo?: boolean;
  created_at?: Date;
  updated_at?: Date;
  created_by?: number;
  perguntas?: AvaliacaoPergunta[];
}

export interface AvaliacaoPergunta {
  id?: number;
  id_versao: number;
  ordem: number;
  texto_pergunta: string;
  tipo: TipoPergunta;
  opcoes?: string;
  obrigatoria?: boolean;
  created_at?: Date;
}

export interface CreateAvaliacaoVersaoData {
  versao: string;
  descricao?: string;
  ativo?: boolean;
  perguntas?: Omit<AvaliacaoPergunta, 'id' | 'id_versao' | 'created_at'>[];
}

export interface CreateAvaliacaoPerguntaData {
  ordem: number;
  texto_pergunta: string;
  tipo: TipoPergunta;
  opcoes?: string;
  obrigatoria?: boolean;
}

export interface CapacitacaoAvaliacao {
  id?: number;
  id_capacitacao: number;
  id_versao_avaliacao: number;
  id_inscricao?: number;
  nome_participante?: string;
  email_participante?: string;
  telefone_participante?: string;
  comentarios?: string;
  created_at?: Date;
  respostas?: CapacitacaoAvaliacaoResposta[];
}

export interface CapacitacaoAvaliacaoResposta {
  id?: number;
  id_avaliacao: number;
  id_pergunta: number;
  resposta_texto?: string;
  resposta_opcao?: string;
  created_at?: Date;
}

export interface CreateAvaliacaoData {
  nome_participante?: string;
  email_participante?: string;
  telefone_participante?: string;
  comentarios?: string;
  respostas: {
    id_pergunta: number;
    resposta_texto?: string;
    resposta_opcao?: string;
  }[];
}

export interface AvaliacaoEstatisticas {
  pergunta: {
    id: number;
    texto: string;
    tipo: TipoPergunta;
  };
  total_respostas: number;
  distribuicao?: Record<string, number>;
  media?: number;
}

