import { PrismaClient } from '@prisma/client';
import { 
  Organizacao, 
  OrganizacaoCompleta, 
  OrganizacaoFilters, 
  OrganizacaoListResponse 
} from '../types/organizacao';
import { ApiError, ErrorCode, HttpStatus, PaginatedResponse } from '../types/api';

const prisma = new PrismaClient();

class OrganizacaoService {
  /**
   * Listar organizações com filtros e paginação
   */
  async list(filters: OrganizacaoFilters = {}): Promise<OrganizacaoListResponse> {
    const {
      nome,
      cnpj,
      estado,
      municipio,
      page = 1,
      limit = 10
    } = filters;

    // Construir filtros where
    const where: any = {
      removido: false
    };

    if (nome) {
      where.nome = {
        contains: nome,
        mode: 'insensitive'
      };
    }

    if (cnpj) {
      where.cnpj = {
        contains: cnpj
      };
    }

    if (estado !== undefined) {
      where.estado = estado;
    }

    if (municipio !== undefined) {
      where.municipio = municipio;
    }

    // Contar total
    const total = await prisma.organizacao.count({ where });

    // Calcular paginação
    const skip = (page - 1) * limit;
    const totalPaginas = Math.ceil(total / limit);

    // Buscar organizações
    const organizacoes = await prisma.organizacao.findMany({
      where,
      select: {
        id: true,
        nome: true,
        cnpj: true,
        telefone: true,
        email: true,
        estado: true,
        municipio: true,
        gpsLat: true,
        gpsLng: true,
        dataFundacao: true,
        dataVisita: true,
        removido: true
      },
      orderBy: {
        dataVisita: 'desc'
      },
      skip,
      take: limit
    });

    return {
      organizacoes,
      total,
      pagina: page,
      totalPaginas,
      limit
    };
  }

  /**
   * Buscar organização por ID
   */
  async getById(id: number): Promise<OrganizacaoCompleta> {
    const organizacao = await prisma.organizacao.findUnique({
      where: { id },
      include: {
        abrangenciaPj: {
          select: {
            id: true,
            razaoSocial: true,
            sigla: true,
            cnpjPj: true,
            numSociosCaf: true,
            numSociosTotal: true,
            estado: true,
            municipio: true
          }
        },
        abrangenciaSocio: {
          select: {
            id: true,
            numSocios: true,
            estado: true,
            municipio: true
          }
        },
        arquivos: {
          select: {
            id: true,
            arquivo: true,
            obs: true
          }
        },
        fotos: {
          select: {
            id: true,
            grupo: true,
            foto: true,
            obs: true
          }
        },
        producoes: {
          select: {
            id: true,
            cultura: true,
            anual: true,
            mensal: true
          }
        }
      }
    });

    if (!organizacao || organizacao.removido) {
      throw new ApiError({
        message: 'Organização não encontrada',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    return organizacao as OrganizacaoCompleta;
  }

  /**
   * Criar nova organização
   */
  async create(data: Partial<Organizacao>): Promise<Organizacao> {
    const { nome, cnpj, telefone, email, estado, municipio } = data;

    // Validações básicas
    if (!nome || nome.trim().length === 0) {
      throw new ApiError({
        message: 'Nome da organização é obrigatório',
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.MISSING_REQUIRED_FIELD
      });
    }

    // Verificar se CNPJ já existe (se fornecido)
    if (cnpj) {
      const existingOrg = await prisma.organizacao.findFirst({
        where: {
          cnpj,
          removido: false
        }
      });

      if (existingOrg) {
        throw new ApiError({
          message: 'CNPJ já cadastrado',
          statusCode: HttpStatus.CONFLICT,
          code: ErrorCode.RESOURCE_ALREADY_EXISTS
        });
      }
    }

    const organizacao = await prisma.organizacao.create({
      data: {
        nome: nome.trim(),
        cnpj: cnpj?.trim() || null,
        telefone: telefone?.trim() || null,
        email: email?.toLowerCase().trim() || null,
        estado: estado || null,
        municipio: municipio || null,
        dataVisita: new Date(),
        removido: false
      }
    });

    return organizacao;
  }

  /**
   * Atualizar organização
   */
  async update(id: number, data: Partial<Organizacao>): Promise<Organizacao> {
    // Verificar se organização existe
    const existingOrg = await prisma.organizacao.findUnique({
      where: { id }
    });

    if (!existingOrg || existingOrg.removido) {
      throw new ApiError({
        message: 'Organização não encontrada',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    // Se alterando CNPJ, verificar duplicidade
    if (data.cnpj && data.cnpj !== existingOrg.cnpj) {
      const cnpjExists = await prisma.organizacao.findFirst({
        where: {
          cnpj: data.cnpj,
          removido: false,
          id: { not: id }
        }
      });

      if (cnpjExists) {
        throw new ApiError({
          message: 'CNPJ já cadastrado em outra organização',
          statusCode: HttpStatus.CONFLICT,
          code: ErrorCode.RESOURCE_CONFLICT
        });
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};

    if (data.nome !== undefined) updateData.nome = data.nome.trim();
    if (data.cnpj !== undefined) updateData.cnpj = data.cnpj?.trim() || null;
    if (data.telefone !== undefined) updateData.telefone = data.telefone?.trim() || null;
    if (data.email !== undefined) updateData.email = data.email?.toLowerCase().trim() || null;
    if (data.estado !== undefined) updateData.estado = data.estado;
    if (data.municipio !== undefined) updateData.municipio = data.municipio;
    if (data.gpsLat !== undefined) updateData.gpsLat = data.gpsLat;
    if (data.gpsLng !== undefined) updateData.gpsLng = data.gpsLng;
    if (data.dataFundacao !== undefined) updateData.dataFundacao = data.dataFundacao;

    const organizacao = await prisma.organizacao.update({
      where: { id },
      data: updateData
    });

    return organizacao;
  }

  /**
   * Remover organização (soft delete)
   */
  async delete(id: number): Promise<void> {
    const existingOrg = await prisma.organizacao.findUnique({
      where: { id }
    });

    if (!existingOrg || existingOrg.removido) {
      throw new ApiError({
        message: 'Organização não encontrada',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    await prisma.organizacao.update({
      where: { id },
      data: {
        removido: true
      }
    });
  }

  /**
   * Obter estatísticas do dashboard
   */
  async getDashboardStats() {
    const [
      total,
      totalPorEstado,
      organizacoesRecentes
    ] = await Promise.all([
      // Total de organizações ativas
      prisma.organizacao.count({
        where: { removido: false }
      }),
      
      // Distribuição por estado (simulado - seria melhor ter uma tabela de estados)
      prisma.organizacao.groupBy({
        by: ['estado'],
        where: { removido: false },
        _count: { estado: true }
      }),

      // Organizações mais recentes
      prisma.organizacao.findMany({
        where: { removido: false },
        select: {
          id: true,
          nome: true,
          cnpj: true,
          dataVisita: true
        },
        orderBy: { dataVisita: 'desc' },
        take: 5
      })
    ]);

    // Simulação de dados para o dashboard (adaptar conforme necessário)
    const stats = {
      total,
      comQuestionario: Math.floor(total * 0.3),
      semQuestionario: Math.floor(total * 0.7),
      porEstado: totalPorEstado.map(item => ({
        estado: this.getEstadoNome(item.estado),
        total: item._count.estado
      })),
      organizacoesRecentes
    };

    return stats;
  }

  /**
   * Converter código do estado para nome (simplificado)
   */
  private getEstadoNome(codigo: number | null): string {
    const estados: { [key: number]: string } = {
      1: 'Minas Gerais',
      2: 'Bahia',
      3: 'São Paulo',
      // Adicionar mais conforme necessário
    };

    return estados[codigo || 0] || 'Não informado';
  }
}

export const organizacaoService = new OrganizacaoService();