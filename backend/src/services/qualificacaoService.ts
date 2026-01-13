import { PrismaClient } from '@prisma/client';
import {
  Qualificacao,
  QualificacaoFilters,
  QualificacaoListResponse,
  CreateQualificacaoData,
  UpdateQualificacaoData
} from '../types/qualificacao';
import { ErrorCode, HttpStatus } from '../types/api';
import { ApiError } from '../utils/ApiError';

const prisma = new PrismaClient();

class QualificacaoService {
  /**
   * Listar qualificações com filtros e paginação
   */
  async list(filters: QualificacaoFilters = {}): Promise<QualificacaoListResponse> {
    const { page = 1, limit = 10, titulo, ativo, id_organizacao, id_instrutor, created_by } = filters;
    const filterByUser = (filters as any).filterByUser;
    const userId = (filters as any).userId;

    const whereConditions: any = {};

    if (titulo) {
      whereConditions.titulo = {
        contains: titulo,
        mode: 'insensitive'
      };
    }

    if (ativo !== undefined) {
      whereConditions.ativo = ativo;
    }

    // Se precisa filtrar por usuário (não admin/supervisor), mostrar apenas as que criou + as padrão (1, 2, 3) + as compartilhadas
    if (filterByUser && userId) {
      // Buscar IDs de qualificações compartilhadas com o usuário (se a tabela existir)
      let idsCompartilhadas: number[] = [];
      try {
        const qualificacoesCompartilhadas = await prisma.qualificacao_tecnico.findMany({
          where: { id_tecnico: userId },
          select: { id_qualificacao: true }
        });
        idsCompartilhadas = qualificacoesCompartilhadas.map(qt => qt.id_qualificacao);
      } catch (error: any) {
        // Se a tabela não existir ainda, ignorar e continuar sem filtro de compartilhamento
        console.warn('Tabela qualificacao_tecnico ainda não existe ou erro ao buscar compartilhamentos:', error.message);
      }

      whereConditions.OR = [
        { created_by: userId }, // Qualificações que o usuário criou
        { id: { in: [1, 2, 3] } }, // Qualificações padrão do sistema
        ...(idsCompartilhadas.length > 0 ? [{ id: { in: idsCompartilhadas } }] : []) // Qualificações compartilhadas com o usuário
      ];
    } else if (created_by) {
      whereConditions.created_by = created_by;
    }

    // Filtro por organização (via tabela de relacionamento)
    if (id_organizacao) {
      whereConditions.qualificacao_organizacao = {
        some: {
          id_organizacao: id_organizacao
        }
      };
    }

    // Filtro por instrutor (via tabela de relacionamento)
    if (id_instrutor) {
      whereConditions.qualificacao_instrutor = {
        some: {
          id_instrutor: id_instrutor
        }
      };
    }

    const skip = (page - 1) * limit;

    const [qualificacoes, total] = await Promise.all([
      prisma.qualificacao.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          qualificacao_organizacao: {
            select: {
              id_organizacao: true
            }
          },
          qualificacao_instrutor: {
            select: {
              id_instrutor: true
            }
          },
          qualificacao_tecnico: {
            select: {
              id_tecnico: true,
              tecnico: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            }
          },
          created_by_user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        }
      }),
      prisma.qualificacao.count({ where: whereConditions })
    ]);

    // Buscar informações dos criadores
    const criadoresIds = qualificacoes
      .filter(q => q.created_by)
      .map(q => q.created_by!)
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
    const formattedQualificacoes = qualificacoes.map(q => {
      const criador = q.created_by_user || (q.created_by ? criadores.find(cr => cr.id === q.created_by) : null);
      return {
        ...q,
        organizacoes: q.qualificacao_organizacao.map(ro => ro.id_organizacao),
        instrutores: q.qualificacao_instrutor.map(ri => ri.id_instrutor),
        equipe_tecnica: (q.qualificacao_tecnico || []).map(qt => ({
          id_tecnico: qt.id_tecnico,
          tecnico: qt.tecnico
        })),
        criador: criador ? {
          id: criador.id,
          name: criador.name,
          email: criador.email
        } : null
      };
    });

    return {
      qualificacoes: formattedQualificacoes as any,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Buscar qualificação por ID
   */
  async getById(id: number): Promise<Qualificacao | null> {
    const qualificacao = await prisma.qualificacao.findUnique({
      where: { id },
      include: {
        qualificacao_organizacao: {
          select: {
            id_organizacao: true
          }
        },
        qualificacao_instrutor: {
          select: {
            id_instrutor: true
          }
        },
        qualificacao_tecnico: {
          select: {
            id_tecnico: true,
            tecnico: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        created_by_user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      }
    });

    if (!qualificacao) {
      return null;
    }

    return {
      ...qualificacao,
      organizacoes: qualificacao.qualificacao_organizacao.map(ro => ro.id_organizacao),
      instrutores: qualificacao.qualificacao_instrutor.map(ri => ri.id_instrutor),
      equipe_tecnica: qualificacao.qualificacao_tecnico.map(qt => ({
        id_tecnico: qt.id_tecnico,
        tecnico: qt.tecnico
      })),
      criador: qualificacao.created_by_user ? {
        id: qualificacao.created_by_user.id,
        name: qualificacao.created_by_user.name,
        email: qualificacao.created_by_user.email
      } : null
    } as any;
  }

  /**
   * Criar nova qualificação
   */
  async create(data: CreateQualificacaoData, userId: number): Promise<Qualificacao> {
    const { organizacoes, instrutores, ...qualificacaoData } = data;

    // Validações básicas
    if (!data.titulo || data.titulo.trim().length === 0) {
      throw new ApiError({
        message: 'Título da qualificação é obrigatório',
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.MISSING_REQUIRED_FIELD
      });
    }

    // Criar qualificação
    const qualificacao = await prisma.qualificacao.create({
      data: {
        ...qualificacaoData,
        titulo: qualificacaoData.titulo.trim(),
        created_by: userId,
        ativo: qualificacaoData.ativo !== undefined ? qualificacaoData.ativo : true
      }
    });

    // Criar relacionamentos many-to-many
    if (organizacoes && organizacoes.length > 0) {
      await prisma.qualificacao_organizacao.createMany({
        data: organizacoes.map((id_organizacao: number) => ({
          id_qualificacao: qualificacao.id,
          id_organizacao
        })),
        skipDuplicates: true
      });
    }

    if (instrutores && instrutores.length > 0) {
      await prisma.qualificacao_instrutor.createMany({
        data: instrutores.map((id_instrutor: number) => ({
          id_qualificacao: qualificacao.id,
          id_instrutor
        })),
        skipDuplicates: true
      });
    }

    return this.getById(qualificacao.id) as Promise<Qualificacao>;
  }

  /**
   * Atualizar qualificação
   */
  async update(id: number, data: UpdateQualificacaoData, userId: number): Promise<Qualificacao> {
    // Verificar se existe
    const existing = await prisma.qualificacao.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new ApiError({
        message: 'Qualificação não encontrada',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    // Remover campos que não devem ser atualizados
    const { organizacoes, instrutores, ...qualificacaoData } = data as any;

    // Preparar dados para atualização (remover campos que não devem ser atualizados)
    const updateData: any = {
      ...(qualificacaoData.titulo && { titulo: qualificacaoData.titulo.trim() }),
      ...(qualificacaoData.objetivo_geral !== undefined && { objetivo_geral: qualificacaoData.objetivo_geral }),
      ...(qualificacaoData.objetivos_especificos !== undefined && { objetivos_especificos: qualificacaoData.objetivos_especificos }),
      ...(qualificacaoData.conteudo_programatico !== undefined && { conteudo_programatico: qualificacaoData.conteudo_programatico }),
      ...(qualificacaoData.metodologia !== undefined && { metodologia: qualificacaoData.metodologia }),
      ...(qualificacaoData.recursos_didaticos !== undefined && { recursos_didaticos: qualificacaoData.recursos_didaticos }),
      ...(qualificacaoData.estrategia_avaliacao !== undefined && { estrategia_avaliacao: qualificacaoData.estrategia_avaliacao }),
      ...(qualificacaoData.referencias !== undefined && { referencias: qualificacaoData.referencias }),
      ...(qualificacaoData.ativo !== undefined && { ativo: qualificacaoData.ativo }),
      updated_at: new Date()
    };

    // Atualizar dados da qualificação
    const updated = await prisma.qualificacao.update({
      where: { id },
      data: updateData
    });

    // Atualizar relacionamentos many-to-many se fornecidos
    if (organizacoes !== undefined) {
      // Remover todos os relacionamentos existentes
      await prisma.qualificacao_organizacao.deleteMany({
        where: { id_qualificacao: id }
      });

      // Criar novos relacionamentos
      if (organizacoes.length > 0) {
        await prisma.qualificacao_organizacao.createMany({
          data: organizacoes.map((id_organizacao: number) => ({
            id_qualificacao: id,
            id_organizacao
          })),
          skipDuplicates: true
        });
      }
    }

    if (instrutores !== undefined) {
      // Remover todos os relacionamentos existentes
      await prisma.qualificacao_instrutor.deleteMany({
        where: { id_qualificacao: id }
      });

      // Criar novos relacionamentos
      if (instrutores.length > 0) {
        await prisma.qualificacao_instrutor.createMany({
          data: instrutores.map((id_instrutor: number) => ({
            id_qualificacao: id,
            id_instrutor
          })),
          skipDuplicates: true
        });
      }
    }

    return this.getById(id) as Promise<Qualificacao>;
  }

  /**
   * Adicionar técnico à equipe de uma qualificação
   */
  async addTecnico(idQualificacao: number, idTecnico: number, userId: number): Promise<void> {
    // Verificar se qualificação existe
    const qualificacao = await prisma.qualificacao.findUnique({
      where: { id: idQualificacao }
    });

    if (!qualificacao) {
      throw new Error('Qualificação não encontrada');
    }

    // Verificar se já existe
    const existing = await prisma.qualificacao_tecnico.findUnique({
      where: {
        id_qualificacao_id_tecnico: {
          id_qualificacao: idQualificacao,
          id_tecnico: idTecnico
        }
      }
    });

    if (existing) {
      throw new Error('Técnico já está na equipe desta qualificação');
    }

    // Adicionar técnico
    await prisma.qualificacao_tecnico.create({
      data: {
        id_qualificacao: idQualificacao,
        id_tecnico: idTecnico,
        created_by: userId
      }
    });
  }

  /**
   * Remover técnico da equipe de uma qualificação
   */
  async removeTecnico(idQualificacao: number, idTecnico: number): Promise<void> {
    await prisma.qualificacao_tecnico.delete({
      where: {
        id_qualificacao_id_tecnico: {
          id_qualificacao: idQualificacao,
          id_tecnico: idTecnico
        }
      }
    });
  }

  /**
   * Listar técnicos da equipe de uma qualificação
   */
  async listTecnicos(idQualificacao: number): Promise<Array<{ id_tecnico: number; tecnico: { id: number; name: string; email: string } }>> {
    const tecnicos = await prisma.qualificacao_tecnico.findMany({
      where: { id_qualificacao: idQualificacao },
      include: {
        tecnico: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return tecnicos.map(t => ({
      id_tecnico: t.id_tecnico,
      tecnico: t.tecnico
    }));
  }

  /**
   * Excluir qualificação
   */
  async delete(id: number): Promise<void> {
    const existing = await prisma.qualificacao.findUnique({
      where: { id },
      include: {
        capacitacao: {
          take: 1
        }
      }
    });

    if (!existing) {
      throw new ApiError({
        message: 'Qualificação não encontrada',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    // Verificar se há capacitações vinculadas
    if (existing.capacitacao && existing.capacitacao.length > 0) {
      throw new ApiError({
        message: 'Não é possível excluir qualificação com capacitações vinculadas',
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.RESOURCE_CONFLICT
      });
    }

    await prisma.qualificacao.delete({
      where: { id }
    });
  }

  /**
   * Listar técnicos disponíveis para adicionar em equipes
   */
  async listTecnicosDisponiveis(): Promise<Array<{ id: number; name: string; email: string }>> {
    const tecnicos = await prisma.users.findMany({
      where: {
        active: true,
        user_roles: {
          some: {
            roles: {
              name: 'tecnico',
              modules: {
                name: 'organizacoes'
              }
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return tecnicos;
  }
}

export default new QualificacaoService();

