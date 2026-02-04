import { PrismaClient } from '@prisma/client';
import { mapFamiliaFromDB } from '../utils/familiaFieldMapper';

const prisma = new PrismaClient();

interface GlebaFilters {
  estado?: number;
  municipio?: number;
  search?: string;
  page?: number;
  limit?: number;
}

interface FamiliaFilters {
  gleba?: number;
  estado?: number;
  municipio?: number;
  validacao?: number;
  tecnico?: number;
  aceitou_visita?: number;
  quilombo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const supervisaoOcupacionalService = {
  /**
   * Obter estatísticas do dashboard
   */
  async getDashboard() {
    const [totalGlebas, totalFamilias, familiasPorEstado, familiasPorValidacao] = await Promise.all([
      prisma.gleba.count(),
      prisma.familias_individual.count({
        where: { removido: false }
      }),
      prisma.familias_individual.groupBy({
        by: ['estado'],
        where: { removido: false },
        _count: true
      }),
      prisma.familias_individual.groupBy({
        by: ['validacao'],
        where: { removido: false },
        _count: true
      })
    ]);

    return {
      totalGlebas,
      totalFamilias,
      familiasPorEstado,
      familiasPorValidacao
    };
  },

  /**
   * Listar glebas com filtros
   */
  async listGlebas(filters: GlebaFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (filters.estado) {
      where.id_estado = filters.estado;
    }
    if (filters.municipio) {
      where.id_municipio = filters.municipio;
    }
    if (filters.search) {
      where.OR = [
        { descricao: { contains: filters.search, mode: 'insensitive' } },
        { municipio: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const [glebas, total] = await Promise.all([
      prisma.gleba.findMany({
        where,
        include: {
          estado_rel: true,
          municipio_rel: true,
          _count: {
            select: { familias: true }
          }
        },
        skip,
        take: limit,
        orderBy: { descricao: 'asc' }
      }),
      prisma.gleba.count({ where })
    ]);

    return {
      data: glebas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Obter gleba por ID
   */
  async getGlebaById(id: number) {
    return prisma.gleba.findUnique({
      where: { id },
      include: {
        estado_rel: true,
        municipio_rel: true,
        familias: {
          where: { removido: false },
          take: 10,
          orderBy: { id: 'desc' }
        },
        _count: {
          select: { familias: true }
        }
      }
    });
  },

  /**
   * Criar gleba
   */
  async createGleba(data: any) {
    return prisma.gleba.create({
      data: {
        id: data.id,
        descricao: data.descricao,
        municipio: data.municipio,
        id_municipio: data.id_municipio,
        estado: data.estado,
        id_estado: data.id_estado,
        pasta: data.pasta
      }
    });
  },

  /**
   * Atualizar gleba
   */
  async updateGleba(id: number, data: any) {
    return prisma.gleba.update({
      where: { id },
      data: {
        descricao: data.descricao,
        municipio: data.municipio,
        id_municipio: data.id_municipio,
        estado: data.estado,
        id_estado: data.id_estado,
        pasta: data.pasta
      }
    });
  },

  /**
   * Deletar gleba
   */
  async deleteGleba(id: number) {
    // Verificar se há famílias associadas
    const count = await prisma.familias_individual.count({
      where: { cod_gleba: id, removido: false }
    });

    if (count > 0) {
      throw new Error('Não é possível deletar gleba com famílias associadas');
    }

    return prisma.gleba.delete({
      where: { id }
    });
  },

  /**
   * Listar famílias com filtros
   */
  async listFamilias(filters: FamiliaFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      removido: false
    };
    
    if (filters.gleba) {
      where.cod_gleba = filters.gleba;
    }
    if (filters.estado) {
      where.estado = filters.estado;
    }
    if (filters.municipio) {
      where.municipio = filters.municipio;
    }
    if (filters.validacao !== undefined) {
      where.validacao = filters.validacao;
    }
    if (filters.tecnico !== undefined) {
      where.tecnico = filters.tecnico;
    }
    if (filters.aceitou_visita !== undefined) {
      where.aceitou_visita = filters.aceitou_visita;
    }
    if (filters.quilombo) {
      where.quilombo = { contains: filters.quilombo, mode: 'insensitive' };
    }
    if (filters.search) {
      // Buscar por ID, nome do ocupante, CPF ou número do lote
      const searchNum = parseInt(filters.search);
      const isNumericSearch = !isNaN(searchNum);
      const searchCpf = filters.search.replace(/\D/g, '');
      
      const searchConditions: any[] = [];
      if (isNumericSearch) {
        searchConditions.push({ id: searchNum });
      }
      if (filters.search.length > 0) {
        searchConditions.push({ iuf_ocup_nome: { contains: filters.search, mode: 'insensitive' } });
        searchConditions.push({ num_imovel: { contains: filters.search, mode: 'insensitive' } });
      }
      if (searchCpf.length >= 3) {
        searchConditions.push({ iuf_ocup_cpf: { contains: searchCpf, mode: 'insensitive' } });
      }
      
      if (searchConditions.length > 0) {
        where.AND = where.AND || [];
        where.AND.push({ OR: searchConditions });
      }
    }

    const [familias, total] = await Promise.all([
      prisma.familias_individual.findMany({
        where,
        include: {
          gleba_rel: {
            include: {
              estado_rel: true,
              municipio_rel: true
            }
          },
          estado_rel: true,
          municipio_rel: true,
          validacao_rel: true,
          tecnico_rel: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { creation_date: 'desc' as any }
      }),
      prisma.familias_individual.count({ where })
    ]);

    // Mapear campos do banco para o formato esperado pelo frontend
    const familiasMapped = familias.map(f => {
      const fAny = f as any;
      const mapped = mapFamiliaFromDB(f);
      if (f.id === 36) {
        console.log('[DEBUG] Service - Mapeando família 36:', {
          original: {
            iuf_ocup_nome: fAny.iuf_ocup_nome,
            iuf_ocup_cpf: fAny.iuf_ocup_cpf,
            num_imovel: fAny.num_imovel,
            aceitou_visita: fAny.aceitou_visita
          },
          mapped: {
            iuf_nome_ocupante: mapped.iuf_nome_ocupante,
            g00_0_q1_2: mapped.g00_0_q1_2,
            i_q1_10: mapped.i_q1_10,
            i_q1_17: mapped.i_q1_17
          }
        });
      }
      return mapped;
    });

    return {
      data: familiasMapped,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  /**
   * Obter família por ID
   */
  async getFamiliaById(id: number) {
    console.log('[DEBUG] Service - Buscando família ID:', id);
    const familia = await prisma.familias_individual.findUnique({
      where: { id },
      include: {
        gleba_rel: {
          include: {
            estado_rel: true,
            municipio_rel: true
          }
        },
        estado_rel: true,
        municipio_rel: true,
        validacao_rel: true,
        tecnico_rel: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        estagiario_rel: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    if (familia) {
      const familiaAny = familia as any;
      console.log('[DEBUG] Service - Família encontrada:', {
        id: familia.id,
        iuf_ocup_nome: familiaAny.iuf_ocup_nome,
        iuf_ocup_cpf: familiaAny.iuf_ocup_cpf,
        num_imovel: familiaAny.num_imovel,
        aceitou_visita: familiaAny.aceitou_visita,
        tem_nome: familiaAny.tem_nome
      });
    } else {
      console.log('[DEBUG] Service - Família não encontrada para ID:', id);
    }
    
    return familia;
  },

  /**
   * Validar família
   */
  async validateFamilia(id: number, data: { validacao: number; obs_validacao?: string; tecnico?: number }) {
    return prisma.familias_individual.update({
      where: { id },
      data: {
        validacao: data.validacao,
        obs_validacao: data.obs_validacao,
        tecnico: data.tecnico,
        data_hora_validado: new Date()
      }
    });
  },

  /**
   * Atualizar família completa
   */
  async updateFamilia(id: number, data: any) {
    // Remover campos que não devem ser atualizados diretamente
    const { id: _, uri, creation_date, ...updateData } = data;
    
    // Adicionar timestamp de atualização
    updateData.last_update_date = new Date();
    
    return prisma.familias_individual.update({
      where: { id },
      data: updateData
    });
  },

  /**
   * Listar dados disponíveis no ODK
   */
  async listODKAvailable() {
    // TODO: Implementar busca no banco ODK via dblink
    return {
      total: 0,
      familias: []
    };
  },

  /**
   * Sincronizar famílias do ODK
   */
  async syncFromODK(instanceIds: string[], userEmail: string) {
    // TODO: Implementar sincronização
    return {
      success: true,
      synced: 0,
      errors: []
    };
  },

  /**
   * Obter estados (do schema familias_aux)
   */
  async getEstados() {
    return prisma.estado_familias.findMany({
      orderBy: { descricao: 'asc' }
    });
  },

  /**
   * Obter municípios (do schema familias_aux)
   */
  async getMunicipios(estadoId?: number) {
    const where: any = {};
    if (estadoId) {
      where.id_estado = estadoId;
    }

    return prisma.municipio_ibge_familias.findMany({
      where,
      include: {
        estado: true
      },
      orderBy: { descricao: 'asc' }
    });
  },

  /**
   * Obter lista de técnicos que têm famílias atribuídas
   */
  async getTecnicos() {
    // Primeiro buscar IDs únicos de técnicos que têm famílias
    const familiasComTecnicos = await prisma.familias_individual.findMany({
      where: {
        removido: false,
        tecnico: { not: null }
      },
      select: {
        tecnico: true
      },
      distinct: ['tecnico']
    });

    const tecnicoIds = familiasComTecnicos
      .map(f => f.tecnico)
      .filter((id): id is number => id !== null);

    if (tecnicoIds.length === 0) {
      return [];
    }

    const tecnicos = await prisma.users.findMany({
      where: {
        id: { in: tecnicoIds },
        active: true
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
};
