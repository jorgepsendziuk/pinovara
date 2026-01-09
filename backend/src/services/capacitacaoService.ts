import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import {
  Capacitacao,
  CapacitacaoFilters,
  CapacitacaoListResponse,
  CreateCapacitacaoData,
  UpdateCapacitacaoData,
  CapacitacaoInscricao,
  CreateInscricaoData,
  CapacitacaoPresenca,
  CreatePresencaData
} from '../types/capacitacao';
import { ErrorCode, HttpStatus } from '../types/api';
import { ApiError } from '../utils/ApiError';

const prisma = new PrismaClient();

class CapacitacaoService {
  /**
   * Listar capacitações com filtros e paginação
   */
  async list(filters: CapacitacaoFilters = {}): Promise<CapacitacaoListResponse> {
    const { page = 1, limit = 10, id_qualificacao, status, id_organizacao, created_by, data_inicio, data_fim } = filters;
    const filterByUser = (filters as any).filterByUser;
    const userId = (filters as any).userId;

    const whereConditions: any = {};

    if (id_qualificacao) {
      whereConditions.id_qualificacao = id_qualificacao;
    }

    if (status) {
      whereConditions.status = status;
    }

    // Se precisa filtrar por usuário (não admin/supervisor), mostrar apenas as que criou
    if (filterByUser && userId) {
      whereConditions.created_by = userId;
    } else if (created_by) {
      whereConditions.created_by = created_by;
    }

    if (data_inicio) {
      whereConditions.data_inicio = {
        gte: data_inicio
      };
    }

    if (data_fim) {
      whereConditions.data_fim = {
        lte: data_fim
      };
    }

    // Filtro por organização (via tabela de relacionamento)
    if (id_organizacao) {
      whereConditions.capacitacao_organizacao = {
        some: {
          id_organizacao: id_organizacao
        }
      };
    }

    const skip = (page - 1) * limit;

    const [capacitacoes, total] = await Promise.all([
      prisma.capacitacao.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { data_inicio: 'desc' },
        include: {
          qualificacao: {
            select: {
              id: true,
              titulo: true
            }
          },
          capacitacao_organizacao: {
            select: {
              id_organizacao: true
            }
          }
        }
      }),
      prisma.capacitacao.count({ where: whereConditions })
    ]);

    // Buscar informações dos técnicos criadores
    const criadoresIds = capacitacoes
      .filter(c => c.created_by)
      .map(c => c.created_by!)
      .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicatas

    const criadores = criadoresIds.length > 0 ? await prisma.users.findMany({
      where: {
        id: { in: criadoresIds }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    }) : [];

    // Formatar resposta
    const formattedCapacitacoes = capacitacoes.map(c => {
      const criador = c.created_by ? criadores.find(cr => cr.id === c.created_by) : null;
      return {
        ...c,
        organizacoes: c.capacitacao_organizacao.map(co => co.id_organizacao),
        tecnico_criador: criador ? {
          id: criador.id,
          name: criador.name,
          email: criador.email
        } : null
      };
    });

    return {
      capacitacoes: formattedCapacitacoes as any,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Buscar capacitação por ID
   */
  async getById(id: number): Promise<Capacitacao | null> {
    const capacitacao = await prisma.capacitacao.findUnique({
      where: { id },
      include: {
        qualificacao: {
          select: {
            id: true,
            titulo: true
          }
        },
        capacitacao_organizacao: {
          select: {
            id_organizacao: true
          }
        }
      }
    });

    if (!capacitacao) {
      return null;
    }

    // Buscar informações completas das organizações
    const organizacoesIds = capacitacao.capacitacao_organizacao.map(co => co.id_organizacao);
    const organizacoesCompletas = organizacoesIds.length > 0 ? await prisma.organizacao.findMany({
      where: {
        id: { in: organizacoesIds }
      },
      select: {
        id: true,
        nome: true,
        id_tecnico: true
      }
    }) : [];

    // Buscar informações dos técnicos
    const tecnicosIds = organizacoesCompletas
      .filter(org => org.id_tecnico)
      .map(org => org.id_tecnico!)
      .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicatas

    const tecnicos = tecnicosIds.length > 0 ? await prisma.users.findMany({
      where: {
        id: { in: tecnicosIds }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    }) : [];

    // Mapear organizações com seus técnicos
    const organizacoesComTecnicos = organizacoesCompletas.map(org => ({
      id: org.id,
      nome: org.nome,
      tecnico: org.id_tecnico ? tecnicos.find(t => t.id === org.id_tecnico) : null
    }));

    // Buscar técnico criador da capacitação
    let tecnicoCriador = null;
    if (capacitacao.created_by) {
      const criador = await prisma.users.findUnique({
        where: { id: capacitacao.created_by },
        select: {
          id: true,
          name: true,
          email: true
        }
      });
      tecnicoCriador = criador;
    }

    return {
      ...capacitacao,
      organizacoes: organizacoesIds,
      organizacoes_completas: organizacoesComTecnicos,
      tecnico_criador: tecnicoCriador
    } as any;
  }

  /**
   * Buscar capacitação por link de inscrição
   */
  async getByLinkInscricao(linkInscricao: string): Promise<Capacitacao | null> {
    const capacitacao = await prisma.capacitacao.findUnique({
      where: { link_inscricao: linkInscricao },
      include: {
        qualificacao: {
          select: {
            id: true,
            titulo: true,
            objetivo_geral: true,
            conteudo_programatico: true,
            metodologia: true,
            recursos_didaticos: true,
            estrategia_avaliacao: true,
            referencias: true
          }
        },
        capacitacao_organizacao: {
          select: {
            id_organizacao: true
          }
        }
      }
    });

    if (!capacitacao) {
      return null;
    }

    // Buscar informações completas das organizações
    const organizacoesIds = capacitacao.capacitacao_organizacao.map(co => co.id_organizacao);
    const organizacoesCompletas = organizacoesIds.length > 0 ? await prisma.organizacao.findMany({
      where: {
        id: { in: organizacoesIds }
      },
      select: {
        id: true,
        nome: true,
        id_tecnico: true
      }
    }) : [];

    // Buscar informações dos técnicos
    const tecnicosIds = organizacoesCompletas
      .filter(org => org.id_tecnico)
      .map(org => org.id_tecnico!)
      .filter((id, index, self) => self.indexOf(id) === index); // Remove duplicatas

    const tecnicos = tecnicosIds.length > 0 ? await prisma.users.findMany({
      where: {
        id: { in: tecnicosIds }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    }) : [];

    // Mapear organizações com seus técnicos
    const organizacoesComTecnicos = organizacoesCompletas.map(org => ({
      id: org.id,
      nome: org.nome,
      tecnico: org.id_tecnico ? tecnicos.find(t => t.id === org.id_tecnico) : null
    }));

    // Buscar técnico criador da capacitação
    let tecnicoCriador = null;
    if (capacitacao.created_by) {
      const criador = await prisma.users.findUnique({
        where: { id: capacitacao.created_by },
        select: {
          id: true,
          name: true,
          email: true
        }
      });
      if (criador) {
        tecnicoCriador = {
          id: criador.id,
          name: criador.name,
          email: criador.email
        };
      }
    }

    return {
      ...capacitacao,
      organizacoes: organizacoesIds,
      organizacoes_completas: organizacoesComTecnicos,
      tecnico_criador: tecnicoCriador
    } as any;
  }

  /**
   * Buscar capacitação por link de avaliação
   */
  async getByLinkAvaliacao(linkAvaliacao: string): Promise<Capacitacao | null> {
    const capacitacao = await prisma.capacitacao.findUnique({
      where: { link_avaliacao: linkAvaliacao },
      include: {
        qualificacao: {
          select: {
            id: true,
            titulo: true
          }
        }
      }
    });

    if (!capacitacao) {
      return null;
    }

    return capacitacao as any;
  }

  /**
   * Criar nova capacitação
   */
  async create(data: CreateCapacitacaoData, userId: number): Promise<Capacitacao> {
    const { organizacoes, ...capacitacaoData } = data;

    // Validações básicas
    if (!data.id_qualificacao) {
      throw new ApiError({
        message: 'Qualificação é obrigatória',
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.MISSING_REQUIRED_FIELD
      });
    }

    // Verificar se a qualificação existe
    const qualificacao = await prisma.qualificacao.findUnique({
      where: { id: data.id_qualificacao }
    });

    if (!qualificacao) {
      throw new ApiError({
        message: 'Qualificação não encontrada',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    // Gerar UUIDs únicos para links
    const linkInscricao = randomUUID();
    const linkAvaliacao = randomUUID();

    // Preparar dados para criação, convertendo strings de data para Date se necessário
    const dataToCreate: any = {
      id_qualificacao: capacitacaoData.id_qualificacao,
      titulo: capacitacaoData.titulo || null,
      local: capacitacaoData.local || null,
      turno: capacitacaoData.turno || null,
      status: capacitacaoData.status || 'planejada',
      link_inscricao: linkInscricao,
      link_avaliacao: linkAvaliacao,
      created_by: userId
    };

    // Converter datas se fornecidas
    if (capacitacaoData.data_inicio) {
      dataToCreate.data_inicio = capacitacaoData.data_inicio instanceof Date 
        ? capacitacaoData.data_inicio 
        : new Date(capacitacaoData.data_inicio);
    }
    if (capacitacaoData.data_fim) {
      dataToCreate.data_fim = capacitacaoData.data_fim instanceof Date 
        ? capacitacaoData.data_fim 
        : new Date(capacitacaoData.data_fim);
    }

    // Criar capacitação
    const capacitacao = await prisma.capacitacao.create({
      data: dataToCreate
    });

    // Criar relacionamentos many-to-many com organizações
    if (organizacoes && organizacoes.length > 0) {
      await prisma.capacitacao_organizacao.createMany({
        data: organizacoes.map(id_organizacao => ({
          id_capacitacao: capacitacao.id,
          id_organizacao
        })),
        skipDuplicates: true
      });
    }

    return this.getById(capacitacao.id) as Promise<Capacitacao>;
  }

  /**
   * Atualizar capacitação
   */
  async update(id: number, data: UpdateCapacitacaoData, userId: number): Promise<Capacitacao> {
    // Verificar se existe
    const existing = await prisma.capacitacao.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new ApiError({
        message: 'Capacitação não encontrada',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    const { organizacoes, ...capacitacaoData } = data;

    // Preparar dados para atualização, convertendo strings de data para Date se necessário
    const dataToUpdate: any = {
      updated_at: new Date()
    };

    // Adicionar campos apenas se foram fornecidos
    if (capacitacaoData.id_qualificacao !== undefined) {
      dataToUpdate.id_qualificacao = capacitacaoData.id_qualificacao;
    }
    if (capacitacaoData.titulo !== undefined) {
      dataToUpdate.titulo = capacitacaoData.titulo || null;
    }
    if (capacitacaoData.local !== undefined) {
      dataToUpdate.local = capacitacaoData.local || null;
    }
    if (capacitacaoData.turno !== undefined) {
      dataToUpdate.turno = capacitacaoData.turno || null;
    }
    if (capacitacaoData.status !== undefined) {
      dataToUpdate.status = capacitacaoData.status;
    }

    // Converter datas se fornecidas
    if (capacitacaoData.data_inicio !== undefined) {
      dataToUpdate.data_inicio = capacitacaoData.data_inicio instanceof Date 
        ? capacitacaoData.data_inicio 
        : capacitacaoData.data_inicio ? new Date(capacitacaoData.data_inicio) : null;
    }
    if (capacitacaoData.data_fim !== undefined) {
      dataToUpdate.data_fim = capacitacaoData.data_fim instanceof Date 
        ? capacitacaoData.data_fim 
        : capacitacaoData.data_fim ? new Date(capacitacaoData.data_fim) : null;
    }

    // Atualizar dados da capacitação
    const updated = await prisma.capacitacao.update({
      where: { id },
      data: dataToUpdate
    });

    // Atualizar relacionamentos many-to-many se fornecidos
    if (organizacoes !== undefined) {
      // Remover todos os relacionamentos existentes
      await prisma.capacitacao_organizacao.deleteMany({
        where: { id_capacitacao: id }
      });

      // Criar novos relacionamentos
      if (organizacoes.length > 0) {
        await prisma.capacitacao_organizacao.createMany({
          data: organizacoes.map(id_organizacao => ({
            id_capacitacao: id,
            id_organizacao
          })),
          skipDuplicates: true
        });
      }
    }

    return this.getById(id) as Promise<Capacitacao>;
  }

  /**
   * Excluir capacitação
   */
  async delete(id: number): Promise<void> {
    const existing = await prisma.capacitacao.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new ApiError({
        message: 'Capacitação não encontrada',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    await prisma.capacitacao.delete({
      where: { id }
    });
  }

  /**
   * Criar inscrição
   */
  async createInscricao(idCapacitacao: number, data: CreateInscricaoData, inscritoPor?: number): Promise<CapacitacaoInscricao> {
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

    // Validações
    if (!data.nome || data.nome.trim().length === 0) {
      throw new ApiError({
        message: 'Nome é obrigatório',
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.MISSING_REQUIRED_FIELD
      });
    }

    // Verificar se já existe inscrição com mesmo email (se fornecido)
    // Normalizar email para comparação (lowercase e trim)
    const emailNormalizado = data.email?.trim().toLowerCase() || null;
    
    if (emailNormalizado) {
      // Buscar todas as inscrições da capacitação para comparar emails (case-insensitive)
      const inscricoesExistentes = await prisma.capacitacao_inscricao.findMany({
        where: {
          id_capacitacao: idCapacitacao,
          email: { not: null }
        },
        select: {
          email: true
        }
      });

      // Verificar se algum email existente corresponde (case-insensitive)
      const emailJaExiste = inscricoesExistentes.some(
        insc => insc.email?.trim().toLowerCase() === emailNormalizado
      );

      if (emailJaExiste) {
        throw new ApiError({
          message: 'Já existe uma inscrição com este email para esta capacitação. Cada email só pode se inscrever uma vez.',
          statusCode: HttpStatus.BAD_REQUEST,
          code: ErrorCode.RESOURCE_ALREADY_EXISTS
        });
      }
    }

    const inscricao = await prisma.capacitacao_inscricao.create({
      data: {
        id_capacitacao: idCapacitacao,
        nome: data.nome.trim(),
        email: emailNormalizado, // Usar email normalizado
        telefone: data.telefone?.trim() || null,
        instituicao: data.instituicao?.trim() || null,
        cpf: data.cpf?.trim() || null,
        rg: data.rg?.trim() || null,
        inscrito_por: inscritoPor || null
      }
    });

    return inscricao as any;
  }

  /**
   * Listar inscrições de uma capacitação
   */
  async listInscricoes(idCapacitacao: number): Promise<CapacitacaoInscricao[]> {
    const inscricoes = await prisma.capacitacao_inscricao.findMany({
      where: { id_capacitacao: idCapacitacao },
      orderBy: { created_at: 'asc' }
    });

    return inscricoes as any;
  }

  /**
   * Atualizar inscrição
   */
  async updateInscricao(idCapacitacao: number, idInscricao: number, data: Partial<CreateInscricaoData>): Promise<CapacitacaoInscricao> {
    // Verificar se a inscrição existe
    const inscricao = await prisma.capacitacao_inscricao.findFirst({
      where: {
        id: idInscricao,
        id_capacitacao: idCapacitacao
      }
    });

    if (!inscricao) {
      throw new ApiError({
        message: 'Inscrição não encontrada',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    // Normalizar email se fornecido
    const emailNormalizado = data.email?.trim().toLowerCase() || null;

    // Se email foi alterado, verificar duplicatas
    if (emailNormalizado && emailNormalizado !== inscricao.email?.trim().toLowerCase()) {
      const inscricoesExistentes = await prisma.capacitacao_inscricao.findMany({
        where: {
          id_capacitacao: idCapacitacao,
          email: { not: null },
          id: { not: idInscricao }
        },
        select: {
          email: true
        }
      });

      const emailJaExiste = inscricoesExistentes.some(
        insc => insc.email?.trim().toLowerCase() === emailNormalizado
      );

      if (emailJaExiste) {
        throw new ApiError({
          message: 'Já existe uma inscrição com este email para esta capacitação',
          statusCode: HttpStatus.BAD_REQUEST,
          code: ErrorCode.RESOURCE_ALREADY_EXISTS
        });
      }
    }

    const updated = await prisma.capacitacao_inscricao.update({
      where: { id: idInscricao },
      data: {
        nome: data.nome?.trim() || inscricao.nome,
        email: emailNormalizado || inscricao.email,
        telefone: data.telefone?.trim() || inscricao.telefone,
        instituicao: data.instituicao?.trim() || inscricao.instituicao,
        cpf: data.cpf?.trim() || inscricao.cpf,
        rg: data.rg?.trim() || inscricao.rg
      }
    });

    return updated as any;
  }

  /**
   * Excluir inscrição
   */
  async deleteInscricao(idCapacitacao: number, idInscricao: number): Promise<void> {
    const inscricao = await prisma.capacitacao_inscricao.findFirst({
      where: {
        id: idInscricao,
        id_capacitacao: idCapacitacao
      }
    });

    if (!inscricao) {
      throw new ApiError({
        message: 'Inscrição não encontrada',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    await prisma.capacitacao_inscricao.delete({
      where: { id: idInscricao }
    });
  }

  /**
   * Verificar se um email está inscrito em uma capacitação (pelo link)
   */
  async verificarInscricaoPorEmail(linkInscricao: string, email: string): Promise<CapacitacaoInscricao | null> {
    // Buscar capacitação pelo link
    const capacitacao = await prisma.capacitacao.findUnique({
      where: { link_inscricao: linkInscricao }
    });

    if (!capacitacao) {
      return null;
    }

    // Normalizar email para busca (lowercase e trim)
    const emailNormalizado = email.trim().toLowerCase();

    // Buscar todas as inscrições da capacitação para comparar emails (case-insensitive)
    const inscricoes = await prisma.capacitacao_inscricao.findMany({
      where: {
        id_capacitacao: capacitacao.id,
        email: { not: null }
      }
    });

    // Encontrar inscrição com email correspondente (case-insensitive)
    const inscricao = inscricoes.find(
      insc => insc.email?.trim().toLowerCase() === emailNormalizado
    );

    return inscricao as any;
  }

  /**
   * Criar presença
   */
  async createPresenca(idCapacitacao: number, data: CreatePresencaData, createdBy?: number): Promise<CapacitacaoPresenca> {
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

    // Se tem id_inscricao, verificar se existe
    if (data.id_inscricao) {
      const inscricao = await prisma.capacitacao_inscricao.findUnique({
        where: { id: data.id_inscricao }
      });

      if (!inscricao || inscricao.id_capacitacao !== idCapacitacao) {
        throw new ApiError({
          message: 'Inscrição não encontrada ou não pertence a esta capacitação',
          statusCode: HttpStatus.NOT_FOUND,
          code: ErrorCode.RESOURCE_NOT_FOUND
        });
      }
    } else if (!data.nome || data.nome.trim().length === 0) {
      throw new ApiError({
        message: 'Nome é obrigatório para presenças avulsas',
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.MISSING_REQUIRED_FIELD
      });
    }

    // Converter data de string para Date se necessário
    let dataPresenca: Date;
    if (data.data) {
      if (typeof data.data === 'string') {
        // Se for string no formato YYYY-MM-DD, criar Date corretamente
        const dateStr = (data.data as string).trim();
        if (dateStr) {
          dataPresenca = new Date(dateStr + 'T00:00:00');
        } else {
          dataPresenca = new Date();
        }
      } else if (data.data instanceof Date) {
        dataPresenca = data.data;
      } else {
        dataPresenca = new Date();
      }
    } else {
      dataPresenca = new Date();
    }

    const presenca = await prisma.capacitacao_presenca.create({
      data: {
        id_capacitacao: idCapacitacao,
        id_inscricao: data.id_inscricao || null,
        nome: data.nome?.trim() || null,
        presente: data.presente !== undefined ? data.presente : true,
        data: dataPresenca,
        created_by: createdBy || null
      }
    });

    return presenca as any;
  }

  /**
   * Atualizar presença
   */
  async updatePresenca(idCapacitacao: number, idPresenca: number, data: Partial<CreatePresencaData>): Promise<CapacitacaoPresenca> {
    // Verificar se a presença existe e pertence à capacitação
    const presenca = await prisma.capacitacao_presenca.findFirst({
      where: {
        id: idPresenca,
        id_capacitacao: idCapacitacao
      }
    });

    if (!presenca) {
      throw new ApiError({
        message: 'Presença não encontrada',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    // Converter data de string para Date se necessário
    let dataPresenca: Date | undefined;
    if (data.data) {
      if (typeof data.data === 'string') {
        dataPresenca = new Date(data.data);
      } else if (data.data instanceof Date) {
        dataPresenca = data.data;
      }
    }

    const updateData: any = {};
    if (data.id_inscricao !== undefined) {
      updateData.id_inscricao = data.id_inscricao || null;
    }
    if (data.nome !== undefined) {
      updateData.nome = data.nome?.trim() || null;
    }
    if (data.presente !== undefined) {
      updateData.presente = data.presente;
    }
    if (dataPresenca) {
      updateData.data = dataPresenca;
    }

    const presencaAtualizada = await prisma.capacitacao_presenca.update({
      where: { id: idPresenca },
      data: updateData
    });

    return presencaAtualizada as any;
  }

  /**
   * Excluir presença
   */
  async deletePresenca(idCapacitacao: number, idPresenca: number): Promise<void> {
    // Verificar se a presença existe e pertence à capacitação
    const presenca = await prisma.capacitacao_presenca.findFirst({
      where: {
        id: idPresenca,
        id_capacitacao: idCapacitacao
      }
    });

    if (!presenca) {
      throw new ApiError({
        message: 'Presença não encontrada',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    await prisma.capacitacao_presenca.delete({
      where: { id: idPresenca }
    });
  }

  /**
   * Listar presenças de uma capacitação
   */
  async listPresencas(idCapacitacao: number): Promise<CapacitacaoPresenca[]> {
    const presencas = await prisma.capacitacao_presenca.findMany({
      where: { id_capacitacao: idCapacitacao },
      include: {
        capacitacao_inscricao: {
          select: {
            id: true,
            nome: true,
            email: true
          }
        }
      },
      orderBy: { data: 'desc' }
    });

    return presencas as any;
  }
}

export default new CapacitacaoService();

