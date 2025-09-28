import { PrismaClient } from '@prisma/client';
import { 
  Organizacao, 
  OrganizacaoCompleta, 
  OrganizacaoFilters, 
  OrganizacaoListResponse 
} from '../types/organizacao';
import { ErrorCode, HttpStatus, PaginatedResponse } from '../types/api';

class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  constructor({ message, statusCode, code, details }: { message: string; statusCode: number; code?: string; details?: any }) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

const prisma = new PrismaClient();

class OrganizacaoService {
  /**
   * Listar organizações com filtros e paginação
   */
  async list(filters: OrganizacaoFilters = {}): Promise<OrganizacaoListResponse> {
    const { page = 1, limit = 10, nome, cnpj, estado, municipio, id_tecnico } = filters;

    // Construir condições de filtro
    const whereConditions: any = {
      // Não mostrar organizações removidas por padrão
      removido: { not: true }
    };

    // Aplicar filtros específicos
    if (nome) {
      whereConditions.nome = {
        contains: nome,
        mode: 'insensitive'
      };
    }

    if (cnpj) {
      whereConditions.cnpj = {
        contains: cnpj,
        mode: 'insensitive'
      };
    }

    if (estado) {
      whereConditions.estado = estado;
    }

    if (municipio) {
      whereConditions.municipio = municipio;
    }

    // Filtro por técnico (importante para a role de técnico)
    if (id_tecnico !== undefined) {
      whereConditions.id_tecnico = id_tecnico;
    }

    // Buscar dados reais do banco
    const total = await prisma.organizacao.count({ where: whereConditions });
    const skip = (page - 1) * limit;
    const totalPaginas = Math.ceil(total / limit);

    const organizacoes = await prisma.organizacao.findMany({
      where: whereConditions,
      select: {
        id: true,
        nome: true,
        cnpj: true,
        telefone: true,
        email: true,
        estado: true,
        municipio: true,
        data_visita: true,
        data_fundacao: true,
        gps_lat: true,
        gps_lng: true,
        removido: true
      },
      orderBy: {
        id: 'asc'
      },
      take: limit,
      skip
    });

    return {
      organizacoes,
      total,
      totalPaginas,
      pagina: page,
      limit
    };
  }

  /**
   * Buscar organização por ID - TODOS OS CAMPOS PARA EDIÇÃO
   */
  async getById(organizacaoId: number): Promise<Organizacao | null> {
    try {
      const organizacao = await prisma.organizacao.findUnique({
        where: { id: organizacaoId },
        select: {
          // Campos básicos
          id: true,
          inicio: true,
          fim: true,
          deviceid: true,
          data_visita: true,
          estado: true,
          municipio: true,
          gps_lat: true,
          gps_lng: true,
          gps_alt: true,
          gps_acc: true,
          nome: true,
          cnpj: true,
          telefone: true,
          email: true,
          data_fundacao: true,
          removido: true,
          
          // Endereço da organização
          organizacao_end_logradouro: true,
          organizacao_end_bairro: true,
          organizacao_end_complemento: true,
          organizacao_end_numero: true,
          organizacao_end_cep: true,
          
          // Dados do representante
          representante_nome: true,
          representante_cpf: true,
          representante_rg: true,
          representante_telefone: true,
          representante_email: true,
          representante_end_logradouro: true,
          representante_end_bairro: true,
          representante_end_complemento: true,
          representante_end_numero: true,
          representante_end_cep: true,
          representante_funcao: true,
          
          // Características
          caracteristicas_n_total_socios: true,
          caracteristicas_n_total_socios_caf: true,
          caracteristicas_n_distintos_caf: true,
          caracteristicas_n_socios_paa: true,
          caracteristicas_n_naosocios_paa: true,
          caracteristicas_n_socios_pnae: true,
          caracteristicas_n_naosocios_pnae: true,
          caracteristicas_n_ativos_total: true,
          caracteristicas_n_ativos_caf: true,
          caracteristicas_n_naosocio_op_total: true,
          caracteristicas_n_naosocio_op_caf: true,
          caracteristicas_ta_a_mulher: true,
          caracteristicas_ta_a_homem: true,
          caracteristicas_ta_e_mulher: true,
          caracteristicas_ta_e_homem: true,
          caracteristicas_ta_o_mulher: true,
          caracteristicas_ta_o_homem: true,
          caracteristicas_ta_i_mulher: true,
          caracteristicas_ta_i_homem: true,
          caracteristicas_ta_p_mulher: true,
          caracteristicas_ta_p_homem: true,
          caracteristicas_ta_af_mulher: true,
          caracteristicas_ta_af_homem: true,
          caracteristicas_ta_q_mulher: true,
          caracteristicas_ta_q_homem: true,
          caracteristicas_ta_caf_convencional: true,
          caracteristicas_ta_caf_agroecologico: true,
          caracteristicas_ta_caf_transicao: true,
          caracteristicas_ta_caf_organico: true,
          
          // GOVERNANÇA ORGANIZACIONAL (GO)
          go_organizacao_7_resposta: true, go_organizacao_7_comentario: true, go_organizacao_7_proposta: true,
          go_organizacao_8_resposta: true, go_organizacao_8_comentario: true, go_organizacao_8_proposta: true,
          go_organizacao_9_resposta: true, go_organizacao_9_comentario: true, go_organizacao_9_proposta: true,
          go_organizacao_10_resposta: true, go_organizacao_10_comentario: true, go_organizacao_10_proposta: true,
          go_organizacao_11_resposta: true, go_organizacao_11_comentario: true, go_organizacao_11_proposta: true,
          go_organizacao_12_resposta: true, go_organizacao_12_comentario: true, go_organizacao_12_proposta: true,
          go_organizacao_13_resposta: true, go_organizacao_13_comentario: true, go_organizacao_13_proposta: true,
          
          go_direcao_14_resposta: true, go_direcao_14_comentario: true, go_direcao_14_proposta: true,
          go_direcao_15_resposta: true, go_direcao_15_comentario: true, go_direcao_15_proposta: true,
          go_direcao_16_resposta: true, go_direcao_16_comentario: true, go_direcao_16_proposta: true,
          go_direcao_17_resposta: true, go_direcao_17_comentario: true, go_direcao_17_proposta: true,
          go_direcao_18_resposta: true, go_direcao_18_comentario: true, go_direcao_18_proposta: true,
          go_direcao_19_resposta: true, go_direcao_19_comentario: true, go_direcao_19_proposta: true,
          go_direcao_20_resposta: true, go_direcao_20_comentario: true, go_direcao_20_proposta: true,
          go_direcao_21_resposta: true, go_direcao_21_comentario: true, go_direcao_21_proposta: true,
          
          go_controle_20_resposta: true, go_controle_20_comentario: true, go_controle_20_proposta: true,
          go_controle_21_resposta: true, go_controle_21_comentario: true, go_controle_21_proposta: true,
          go_controle_22_resposta: true, go_controle_22_comentario: true, go_controle_22_proposta: true,
          go_controle_23_resposta: true, go_controle_23_comentario: true, go_controle_23_proposta: true,
          go_controle_24_resposta: true, go_controle_24_comentario: true, go_controle_24_proposta: true,
          go_controle_25_resposta: true, go_controle_25_comentario: true, go_controle_25_proposta: true,
          
          go_estrutura_1_resposta: true, go_estrutura_1_comentario: true, go_estrutura_1_proposta: true,
          go_estrutura_2_resposta: true, go_estrutura_2_comentario: true, go_estrutura_2_proposta: true,
          go_estrutura_3_resposta: true, go_estrutura_3_comentario: true, go_estrutura_3_proposta: true,
          go_estrutura_4_resposta: true, go_estrutura_4_comentario: true, go_estrutura_4_proposta: true,
          
          go_estrategia_5_resposta: true, go_estrategia_5_comentario: true, go_estrategia_5_proposta: true,
          go_estrategia_6_resposta: true, go_estrategia_6_comentario: true, go_estrategia_6_proposta: true,
          
          go_educacao_26_resposta: true, go_educacao_26_comentario: true, go_educacao_26_proposta: true,
          go_educacao_27_resposta: true, go_educacao_27_comentario: true, go_educacao_27_proposta: true,
          go_educacao_28_resposta: true, go_educacao_28_comentario: true, go_educacao_28_proposta: true,
          
          // TODO: Adicionar GP, GF, GC, GPP, GS, GI incrementalmente
          // Por enquanto, focando nos campos que já estavam funcionando
        }
      });

      if (!organizacao) {
        throw new Error('Organização não encontrada');
      }

      return organizacao;
    } catch (error) {
      console.error('Erro ao buscar organização:', error);
      throw error;
    }
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

    const organizacao = await prisma.organizacao.create({
      data: {
        nome: nome.trim(),
        cnpj: cnpj || null,
        telefone: telefone || null,
        email: email || null,
        estado: estado || null,
        municipio: municipio || null,
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

    const organizacao = await prisma.organizacao.update({
      where: { id },
      data: {
        ...data,
        id: undefined // Remover ID dos dados de atualização
      }
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
   * Estatísticas do dashboard
   */
  async getDashboardStats() {
    const total = await prisma.organizacao.count({
      where: { removido: false }
    });

    // Organizações com GPS
    const comGps = await prisma.organizacao.count({
      where: {
        removido: false,
        gps_lat: { not: null },
        gps_lng: { not: null }
      }
    });

    // Organizações sem GPS
    const semGps = total - comGps;

    // Estatísticas por estado
    const porEstado = await prisma.organizacao.groupBy({
      by: ['estado'],
      where: { removido: false },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    });

    // Organizações recentes (últimas 10)
    const organizacoesRecentes = await prisma.organizacao.findMany({
      where: { removido: false },
      select: {
        id: true,
        nome: true,
        data_visita: true,
        estado: true,
        gps_lat: true,
        gps_lng: true
      },
      orderBy: { data_visita: 'desc' },
      take: 10
    });

    // Estatísticas por estado com nomes
    const porEstadoFormatado = await Promise.all(
      porEstado.map(async (item) => ({
        estado: await this.getEstadoNome(item.estado) || `Estado ${item.estado}`,
        total: item._count.id
      }))
    );

    // Organizações com GPS para o mapa
    const organizacoesComGps = await prisma.organizacao.findMany({
      where: {
        removido: false,
        gps_lat: { not: null },
        gps_lng: { not: null }
      },
      select: {
        id: true,
        nome: true,
        gps_lat: true,
        gps_lng: true,
        estado: true
      },
      take: 100 // Limitar para performance
    });

    return {
      total,
      comGps,
      semGps,
      comQuestionario: Math.floor(total * 0.3), // Mantém cálculo aproximado por enquanto
      semQuestionario: Math.floor(total * 0.7),
      porEstado: porEstadoFormatado,
      organizacoesRecentes: organizacoesRecentes.map(org => ({
        id: org.id,
        nome: org.nome || 'Nome não informado',
        dataVisita: org.data_visita,
        estado: this.getEstadoNome(org.estado) || 'Não informado',
        temGps: !!(org.gps_lat && org.gps_lng)
      })),
      organizacoesComGps: organizacoesComGps.map(org => ({
        id: org.id,
        nome: org.nome || 'Nome não informado',
        lat: org.gps_lat,
        lng: org.gps_lng,
        estado: this.getEstadoNome(org.estado) || 'Não informado'
      }))
    };
  }

  /**
   * Buscar municípios (filtrados por estado opcionalmente)
   */
  async getMunicipios(estadoId?: number) {
    try {
      let municipios;

      if (estadoId) {
        // Buscar municípios de um estado específico
        municipios = await prisma.$queryRaw`
          SELECT
            id,
            descricao as nome,
            id_estado as estadoId,
            codigo_ibge
          FROM pinovara_aux.municipio_ibge
          WHERE id_estado = ${estadoId}
          ORDER BY descricao
        `;
      } else {
        // Buscar todos os municípios
        municipios = await prisma.$queryRaw`
          SELECT
            id,
            descricao as nome,
            id_estado as estadoId,
            codigo_ibge
          FROM pinovara_aux.municipio_ibge
          ORDER BY descricao
        `;
      }

      return municipios;
    } catch (error) {
      console.error('Erro ao buscar municípios:', error);
      throw new ApiError({
        message: 'Erro ao buscar municípios',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR
      });
    }
  }

  /**
   * Buscar estados
   */
  async getEstados() {
    try {
      const estados = await prisma.$queryRaw`
        SELECT
          id,
          descricao as nome,
          sigla as uf,
          codigo_ibge
        FROM pinovara_aux.estado
        ORDER BY descricao
      `;

      return estados;
    } catch (error) {
      console.error('Erro ao buscar estados:', error);
      throw new ApiError({
        message: 'Erro ao buscar estados',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR
      });
    }
  }

  /**
   * Helper para obter nome do estado
   */
  getEstadoNome(codigo?: number | null): string {
    if (!codigo) return 'Não informado';
    
    const estados: { [key: number]: string } = {
      1: 'Acre', 2: 'Alagoas', 3: 'Amapá', 4: 'Amazonas',
      5: 'Bahia', 6: 'Ceará', 7: 'Distrito Federal', 8: 'Espírito Santo',
      // ... adicionar outros estados conforme necessário
    };

    return estados[codigo] || `Estado ${codigo}`;
  }
}

export default new OrganizacaoService();