import { PrismaClient } from '@prisma/client';
import {
  AvaliacaoVersao,
  AvaliacaoPergunta,
  CreateAvaliacaoVersaoData,
  CreateAvaliacaoPerguntaData,
  CapacitacaoAvaliacao,
  CreateAvaliacaoData,
  AvaliacaoEstatisticas
} from '../types/avaliacao';
import { ErrorCode, HttpStatus } from '../types/api';
import { ApiError } from '../utils/ApiError';

const prisma = new PrismaClient();

class AvaliacaoService {
  /**
   * Listar versões de avaliação
   */
  async listVersoes(ativo?: boolean): Promise<AvaliacaoVersao[]> {
    const where: any = {};
    if (ativo !== undefined) {
      where.ativo = ativo;
    }

    const versoes = await prisma.avaliacao_versao.findMany({
      where,
      include: {
        avaliacao_pergunta: {
          orderBy: { ordem: 'asc' }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return versoes.map(v => {
      // Parse das opções das perguntas
      const perguntasParsed = v.avaliacao_pergunta.map(p => {
        let opcoesParsed;
        try {
          opcoesParsed = p.opcoes ? JSON.parse(p.opcoes) : undefined;
        } catch {
          opcoesParsed = p.opcoes ? [p.opcoes] : undefined;
        }
        return {
          ...p,
          opcoes: opcoesParsed
        };
      });

      return {
        ...v,
        perguntas: perguntasParsed
      };
    }) as any;
  }

  /**
   * Buscar versão ativa
   */
  async getVersaoAtiva(): Promise<AvaliacaoVersao | null> {
    const versao = await prisma.avaliacao_versao.findFirst({
      where: { ativo: true },
      include: {
        avaliacao_pergunta: {
          orderBy: { ordem: 'asc' }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    if (!versao) {
      return null;
    }

    // Parse das opções das perguntas
    const perguntasParsed = versao.avaliacao_pergunta.map(p => {
      let opcoesParsed;
      try {
        opcoesParsed = p.opcoes ? JSON.parse(p.opcoes) : undefined;
      } catch {
        opcoesParsed = p.opcoes ? [p.opcoes] : undefined;
      }
      return {
        ...p,
        opcoes: opcoesParsed
      };
    });

    return {
      ...versao,
      perguntas: perguntasParsed
    } as any;
  }

  /**
   * Buscar versão por ID
   */
  async getVersaoById(id: number): Promise<AvaliacaoVersao | null> {
    const versao = await prisma.avaliacao_versao.findUnique({
      where: { id },
      include: {
        avaliacao_pergunta: {
          orderBy: { ordem: 'asc' }
        }
      }
    });

    if (!versao) {
      return null;
    }

    // Parse das opções das perguntas
    const perguntasParsed = versao.avaliacao_pergunta.map(p => {
      let opcoesParsed;
      try {
        opcoesParsed = p.opcoes ? JSON.parse(p.opcoes) : undefined;
      } catch {
        opcoesParsed = p.opcoes ? [p.opcoes] : undefined;
      }
      return {
        ...p,
        opcoes: opcoesParsed
      };
    });

    return {
      ...versao,
      perguntas: perguntasParsed
    } as any;
  }

  /**
   * Criar nova versão de avaliação
   */
  async createVersao(data: CreateAvaliacaoVersaoData, userId: number): Promise<AvaliacaoVersao> {
    // Verificar se a versão já existe
    const existing = await prisma.avaliacao_versao.findUnique({
      where: { versao: data.versao }
    });

    if (existing) {
      throw new ApiError({
        message: 'Versão já existe',
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.RESOURCE_ALREADY_EXISTS
      });
    }

    // Se ativar esta versão, desativar outras
    if (data.ativo) {
      await prisma.avaliacao_versao.updateMany({
        where: { ativo: true },
        data: { ativo: false }
      });
    }

    // Criar versão
    const versao = await prisma.avaliacao_versao.create({
      data: {
        versao: data.versao,
        descricao: data.descricao,
        ativo: data.ativo !== undefined ? data.ativo : false,
        created_by: userId
      }
    });

    // Criar perguntas se fornecidas
    if (data.perguntas && data.perguntas.length > 0) {
      await prisma.avaliacao_pergunta.createMany({
        data: data.perguntas.map(p => ({
          id_versao: versao.id,
          ordem: p.ordem,
          texto_pergunta: p.texto_pergunta,
          tipo: p.tipo,
          opcoes: p.opcoes ? JSON.stringify(p.opcoes) : null,
          obrigatoria: p.obrigatoria !== undefined ? p.obrigatoria : true
        }))
      });
    }

    return this.getVersaoById(versao.id) as Promise<AvaliacaoVersao>;
  }

  /**
   * Atualizar versão de avaliação
   */
  async updateVersao(id: number, data: Partial<CreateAvaliacaoVersaoData>, userId: number): Promise<AvaliacaoVersao> {
    const existing = await prisma.avaliacao_versao.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new ApiError({
        message: 'Versão não encontrada',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    // Se ativar esta versão, desativar outras
    if (data.ativo === true) {
      await prisma.avaliacao_versao.updateMany({
        where: {
          ativo: true,
          id: { not: id }
        },
        data: { ativo: false }
      });
    }

    const updated = await prisma.avaliacao_versao.update({
      where: { id },
      data: {
        ...(data.descricao !== undefined && { descricao: data.descricao }),
        ...(data.ativo !== undefined && { ativo: data.ativo }),
        updated_at: new Date()
      }
    });

    return this.getVersaoById(id) as Promise<AvaliacaoVersao>;
  }

  /**
   * Listar perguntas de uma versão
   */
  async listPerguntas(idVersao: number): Promise<AvaliacaoPergunta[]> {
    const perguntas = await prisma.avaliacao_pergunta.findMany({
      where: { id_versao: idVersao },
      orderBy: { ordem: 'asc' }
    });

    return perguntas.map(p => {
      let opcoesParsed;
      try {
        opcoesParsed = p.opcoes ? JSON.parse(p.opcoes) : undefined;
      } catch {
        opcoesParsed = p.opcoes ? [p.opcoes] : undefined;
      }
      return {
        ...p,
        opcoes: opcoesParsed
      };
    }) as any;
  }

  /**
   * Criar pergunta
   */
  async createPergunta(idVersao: number, data: CreateAvaliacaoPerguntaData): Promise<AvaliacaoPergunta> {
    // Verificar se a versão existe
    const versao = await prisma.avaliacao_versao.findUnique({
      where: { id: idVersao }
    });

    if (!versao) {
      throw new ApiError({
        message: 'Versão não encontrada',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    const pergunta = await prisma.avaliacao_pergunta.create({
      data: {
        id_versao: idVersao,
        ordem: data.ordem,
        texto_pergunta: data.texto_pergunta,
        tipo: data.tipo,
        opcoes: data.opcoes ? JSON.stringify(data.opcoes) : null,
        obrigatoria: data.obrigatoria !== undefined ? data.obrigatoria : true
      }
    });

    let opcoesParsed;
    try {
      opcoesParsed = pergunta.opcoes ? JSON.parse(pergunta.opcoes) : undefined;
    } catch {
      opcoesParsed = pergunta.opcoes ? [pergunta.opcoes] : undefined;
    }
    return {
      ...pergunta,
      opcoes: opcoesParsed
    } as any;
  }

  /**
   * Atualizar pergunta
   */
  async updatePergunta(id: number, data: Partial<CreateAvaliacaoPerguntaData>): Promise<AvaliacaoPergunta> {
    const existing = await prisma.avaliacao_pergunta.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new ApiError({
        message: 'Pergunta não encontrada',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    const updated = await prisma.avaliacao_pergunta.update({
      where: { id },
      data: {
        ...(data.ordem !== undefined && { ordem: data.ordem }),
        ...(data.texto_pergunta !== undefined && { texto_pergunta: data.texto_pergunta }),
        ...(data.tipo !== undefined && { tipo: data.tipo }),
        ...(data.opcoes !== undefined && { opcoes: data.opcoes ? JSON.stringify(data.opcoes) : null }),
        ...(data.obrigatoria !== undefined && { obrigatoria: data.obrigatoria })
      }
    });

    let opcoesParsed;
    try {
      opcoesParsed = updated.opcoes ? JSON.parse(updated.opcoes) : undefined;
    } catch {
      opcoesParsed = updated.opcoes ? [updated.opcoes] : undefined;
    }
    return {
      ...updated,
      opcoes: opcoesParsed
    } as any;
  }

  /**
   * Excluir pergunta
   */
  async deletePergunta(id: number): Promise<void> {
    const existing = await prisma.avaliacao_pergunta.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new ApiError({
        message: 'Pergunta não encontrada',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    await prisma.avaliacao_pergunta.delete({
      where: { id }
    });
  }

  /**
   * Criar avaliação de uma capacitação
   */
  async createAvaliacao(idCapacitacao: number, data: CreateAvaliacaoData, idInscricao?: number): Promise<CapacitacaoAvaliacao> {
    // Verificar se a capacitação existe
    const capacitacao = await prisma.capacitacao.findUnique({
      where: { id: idCapacitacao }
    });

    if (!capacitacao) {
      throw new ApiError({
        message: 'Capacitação não encontrada',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    // Buscar versão ativa
    const versaoAtiva = await this.getVersaoAtiva();
    if (!versaoAtiva) {
      throw new ApiError({
        message: 'Nenhuma versão de avaliação ativa encontrada',
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.RESOURCE_CONFLICT
      });
    }

    // Se tem id_inscricao, verificar se existe e pertence à capacitação
    if (idInscricao) {
      const inscricao = await prisma.capacitacao_inscricao.findUnique({
        where: { id: idInscricao }
      });

      if (!inscricao || inscricao.id_capacitacao !== idCapacitacao) {
        throw new ApiError({
          message: 'Inscrição não encontrada ou não pertence a esta capacitação',
          statusCode: HttpStatus.NOT_FOUND,
          code: ErrorCode.RESOURCE_NOT_FOUND
        });
      }
    }

    // Validar que todas as perguntas obrigatórias foram respondidas
    const perguntasObrigatorias = await prisma.avaliacao_pergunta.findMany({
      where: {
        id_versao: versaoAtiva.id,
        obrigatoria: true
      }
    });

    const perguntasRespondidas = new Set(data.respostas.map(r => r.id_pergunta));
    const perguntasFaltantes = perguntasObrigatorias.filter(p => !perguntasRespondidas.has(p.id));

    if (perguntasFaltantes.length > 0) {
      throw new ApiError({
        message: `Perguntas obrigatórias não respondidas: ${perguntasFaltantes.map(p => p.texto_pergunta).join(', ')}`,
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.MISSING_REQUIRED_FIELD
      });
    }

    // Criar avaliação
    const avaliacao = await prisma.capacitacao_avaliacao.create({
      data: {
        id_capacitacao: idCapacitacao,
        id_versao_avaliacao: versaoAtiva.id!,
        id_inscricao: idInscricao || null,
        nome_participante: data.nome_participante?.trim() || null,
        email_participante: data.email_participante?.trim() || null,
        telefone_participante: data.telefone_participante?.trim() || null,
        comentarios: data.comentarios?.trim() || null
      }
    });

    // Criar respostas
    if (data.respostas && data.respostas.length > 0) {
      await prisma.capacitacao_avaliacao_resposta.createMany({
        data: data.respostas.map(r => ({
          id_avaliacao: avaliacao.id,
          id_pergunta: r.id_pergunta,
          resposta_texto: r.resposta_texto?.trim() || null,
          resposta_opcao: r.resposta_opcao?.trim() || null
        })),
        skipDuplicates: true
      });
    }

    return this.getAvaliacaoById(avaliacao.id) as Promise<CapacitacaoAvaliacao>;
  }

  /**
   * Buscar avaliação por ID
   */
  async getAvaliacaoById(id: number): Promise<CapacitacaoAvaliacao | null> {
    const avaliacao = await prisma.capacitacao_avaliacao.findUnique({
      where: { id },
      include: {
        capacitacao_avaliacao_resposta: {
          include: {
            avaliacao_pergunta: true
          }
        }
      }
    });

    if (!avaliacao) {
      return null;
    }

    return {
      ...avaliacao,
      respostas: avaliacao.capacitacao_avaliacao_resposta.map(r => ({
        ...r,
        pergunta: r.avaliacao_pergunta
      }))
    } as any;
  }

  /**
   * Listar avaliações de uma capacitação
   */
  async listAvaliacoes(idCapacitacao: number): Promise<CapacitacaoAvaliacao[]> {
    const avaliacoes = await prisma.capacitacao_avaliacao.findMany({
      where: { id_capacitacao: idCapacitacao },
      include: {
        capacitacao_avaliacao_resposta: {
          include: {
            avaliacao_pergunta: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return avaliacoes.map(a => ({
      ...a,
      respostas: a.capacitacao_avaliacao_resposta.map(r => ({
        ...r,
        pergunta: r.avaliacao_pergunta
      }))
    })) as any;
  }

  /**
   * Obter estatísticas de avaliações de uma capacitação
   * Usa as perguntas das respostas reais (não versão ativa) para garantir
   * que perguntas sim/nao/talvez etc. tenham suas distribuições calculadas
   */
  async getEstatisticas(idCapacitacao: number): Promise<AvaliacaoEstatisticas[]> {
    const avaliacoes = await this.listAvaliacoes(idCapacitacao);

    if (avaliacoes.length === 0) {
      return [];
    }

    const todasRespostas = avaliacoes.flatMap(a => a.respostas || []);
    if (todasRespostas.length === 0) {
      return [];
    }

    // Agrupar por id_pergunta preservando ordem (via Map com ordem de primeira aparição)
    const grupos = new Map<number, { respostas: typeof todasRespostas; pergunta: any }>();
    for (const r of todasRespostas) {
      const pergunta = (r as any).pergunta ?? (r as any).avaliacao_pergunta;
      if (!pergunta) continue;
      const id = r.id_pergunta;
      if (!grupos.has(id)) {
        grupos.set(id, { respostas: [], pergunta });
      }
      grupos.get(id)!.respostas.push(r);
    }

    // Ordenar por ordem da pergunta
    const estatisticas: AvaliacaoEstatisticas[] = [];
    const itensOrdenados = Array.from(grupos.entries()).sort(
      (a, b) => (a[1].pergunta.ordem ?? 0) - (b[1].pergunta.ordem ?? 0)
    );

    for (const [, { respostas, pergunta }] of itensOrdenados) {
      const total_respostas = respostas.length;
      let distribuicao: Record<string, number> | undefined;
      let media: number | undefined;

      if (pergunta.tipo === 'escala_5' || pergunta.tipo === 'escala_3') {
        const valores: number[] = [];
        distribuicao = {};
        const maxEscala = pergunta.tipo === 'escala_5' ? 5 : 3;
        let opcoes: string[] = [];
        try {
          const raw = (pergunta as any).opcoes;
          opcoes = Array.isArray(raw) ? raw : (typeof raw === 'string' && raw ? JSON.parse(raw) : []);
        } catch {
          opcoes = [];
        }
        for (const resposta of respostas) {
          const valor = resposta.resposta_opcao?.trim();
          if (!valor) continue;
          distribuicao[valor] = (distribuicao[valor] || 0) + 1;
          const num = parseInt(valor);
          if (!isNaN(num) && num >= 1 && num <= maxEscala) {
            valores.push(num);
          } else {
            const idx = opcoes.findIndex((o: string) => String(o).trim().toLowerCase() === valor.toLowerCase());
            if (idx >= 0) valores.push(idx + 1);
          }
        }
        if (valores.length > 0) {
          media = valores.reduce((a, b) => a + b, 0) / valores.length;
        }
      } else if (pergunta.tipo !== 'texto_livre') {
        distribuicao = {};
        for (const resposta of respostas) {
          const opcao = String(resposta.resposta_opcao ?? 'sem_resposta').trim() || 'sem_resposta';
          distribuicao[opcao] = (distribuicao[opcao] || 0) + 1;
        }
      }

      estatisticas.push({
        pergunta: {
          id: pergunta.id,
          texto: pergunta.texto_pergunta,
          tipo: pergunta.tipo as any
        },
        total_respostas,
        distribuicao,
        media
      });
    }

    return estatisticas;
  }
}

export default new AvaliacaoService();

