import { PrismaClient } from '@prisma/client';
import { 
  Organizacao, 
  OrganizacaoCompleta, 
  OrganizacaoFilters, 
  OrganizacaoListResponse 
} from '../types/organizacao';
import { ErrorCode, HttpStatus, PaginatedResponse } from '../types/api';
import { extractEmailFromCreatorUri } from '../utils/odkHelper';

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
   * Agora com filtro híbrido: se userId for fornecido e não for admin,
   * filtra por id_tecnico = userId OU email no _creator_uri_user
   */
  async list(filters: OrganizacaoFilters = {}): Promise<OrganizacaoListResponse> {
    const { page = 1, limit = 10, nome, cnpj, estado, municipio, id_tecnico, userId } = filters;

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

    // Verificar se deve aplicar filtro híbrido por userId
    let aplicarFiltroHibrido = false;
    let userEmail: string | null = null;
    
    if (userId) {
      const isAdmin = await this.isUserAdmin(userId);
      
      if (!isAdmin) {
        // Usuário não é admin, aplicar filtro híbrido
        aplicarFiltroHibrido = true;
        
        // Buscar email do usuário logado
        const user = await prisma.users.findUnique({
          where: { id: userId },
          select: { email: true }
        });
        
        userEmail = user?.email?.toLowerCase() || null;
      }
    }

    // Buscar organizações com nomes de estado e município
    let sqlQuery = `
      SELECT 
        o.id,
        o.nome,
        o.cnpj,
        o.telefone,
        o.email,
        o.estado,
        e.descricao as estado_nome,
        o.municipio,
        m.descricao as municipio_nome,
        o.data_visita,
        o.data_fundacao,
        o.gps_lat,
        o.gps_lng,
        o.removido,
        o.meta_instance_id,
        o.id_tecnico,
        o._creator_uri_user
      FROM pinovara.organizacao o
      LEFT JOIN pinovara_aux.estado e ON o.estado = e.id
      LEFT JOIN pinovara_aux.municipio_ibge m ON o.municipio = m.id
      WHERE o.removido = false
    `;

    // Aplicar filtros de busca
    const conditions: string[] = [];
    
    if (nome) {
      conditions.push(`o.nome ILIKE '%${nome}%'`);
    }
    
    if (cnpj) {
      conditions.push(`o.cnpj ILIKE '%${cnpj}%'`);
    }
    
    if (estado) {
      conditions.push(`o.estado = ${estado}`);
    }
    
    if (municipio) {
      conditions.push(`o.municipio = ${municipio}`);
    }
    
    if (id_tecnico !== undefined) {
      conditions.push(`o.id_tecnico = ${id_tecnico}`);
    }
    
    if (conditions.length > 0) {
      sqlQuery += ` AND (${conditions.join(' OR ')})`;
    }

    sqlQuery += ` ORDER BY o.id ASC`;

    let organizacoes = await prisma.$queryRawUnsafe(sqlQuery) as any[];

    // Aplicar filtro híbrido se necessário (técnico não-admin)
    if (aplicarFiltroHibrido && userId) {
      organizacoes = organizacoes.filter(org => {
        // Opção 1: id_tecnico já está preenchido e bate com userId
        if (org.id_tecnico === userId) return true;
        
        // Opção 2: email no _creator_uri_user bate com userEmail
        if (org._creator_uri_user && userEmail) {
          const creatorEmail = extractEmailFromCreatorUri(org._creator_uri_user);
          if (creatorEmail === userEmail) return true;
        }
        
        return false;
      });
    }

    // Calcular paginação APÓS filtro híbrido
    const total = organizacoes.length;
    const skip = (page - 1) * limit;
    const totalPaginas = Math.ceil(total / limit);
    
    // Aplicar paginação manual
    const organizacoesPaginadas = organizacoes.slice(skip, skip + limit);

    return {
      organizacoes: organizacoesPaginadas,
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
          
          // Campos ODK Metadata
          meta_instance_id: true,
          meta_instance_name: true,
          uri: true,
          creator_uri_user: true,
          creation_date: true,
          last_update_uri_user: true,
          last_update_date: true,
          model_version: true,
          ui_version: true,
          is_complete: true,
          submission_date: true,
          marked_as_complete_date: true,
          complementado: true,
          
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
   * Agora preenche automaticamente id_tecnico se houver _creator_uri_user
   */
  async create(data: Partial<Organizacao>): Promise<Organizacao> {
    const { nome, cnpj, telefone, email, estado, municipio, creator_uri_user } = data;

    // Validações básicas
    if (!nome || nome.trim().length === 0) {
      throw new ApiError({
        message: 'Nome da organização é obrigatório',
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.MISSING_REQUIRED_FIELD
      });
    }

    // Tentar vincular com técnico se houver _creator_uri_user
    let id_tecnico: number | null = null;
    if (creator_uri_user) {
      const emailExtraido = extractEmailFromCreatorUri(creator_uri_user);
      if (emailExtraido) {
        id_tecnico = await this.findUserByEmail(emailExtraido);
        if (id_tecnico) {
          console.log(`✅ Organização vinculada ao técnico ID ${id_tecnico} através do email ${emailExtraido}`);
        }
      }
    }

    const organizacao = await prisma.organizacao.create({
      data: {
        nome: nome.trim(),
        cnpj: cnpj || null,
        telefone: telefone || null,
        email: email || null,
        estado: estado || null,
        municipio: municipio || null,
        removido: false,
        creator_uri_user: creator_uri_user || null,
        id_tecnico: id_tecnico
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
   * Agora com filtro híbrido para técnicos
   */
  async getDashboardStats(userId?: number) {
    // Verificar se deve aplicar filtro híbrido
    let aplicarFiltroHibrido = false;
    let userEmail: string | null = null;
    
    if (userId) {
      const isAdmin = await this.isUserAdmin(userId);
      
      if (!isAdmin) {
        // Usuário não é admin, aplicar filtro híbrido
        aplicarFiltroHibrido = true;
        
        // Buscar email do usuário logado
        const user = await prisma.users.findUnique({
          where: { id: userId },
          select: { email: true }
        });
        
        userEmail = user?.email?.toLowerCase() || null;
      }
    }

    // Buscar todas organizações com includes para estado e município
    const todasOrganizacoes = await prisma.organizacao.findMany({
      where: { removido: false },
      select: {
        id: true,
        nome: true,
        data_visita: true,
        estado: true,
        municipio: true,
        gps_lat: true,
        gps_lng: true,
        id_tecnico: true,
        creator_uri_user: true,
        estado_organizacao_estadoToestado: {
          select: {
            descricao: true
          }
        },
        municipio_ibge: {
          select: {
            descricao: true
          }
        }
      },
      orderBy: {
        data_visita: 'desc'
      }
    });

    // Aplicar filtro híbrido se necessário
    let organizacoesFiltradas = todasOrganizacoes;
    
    if (aplicarFiltroHibrido && userId) {
      organizacoesFiltradas = todasOrganizacoes.filter(org => {
        // Opção 1: id_tecnico já está preenchido e bate com userId
        if (org.id_tecnico === userId) return true;
        
        // Opção 2: email no _creator_uri_user bate com userEmail
        if (org.creator_uri_user && userEmail) {
          const creatorEmail = extractEmailFromCreatorUri(org.creator_uri_user);
          if (creatorEmail === userEmail) return true;
        }
        
        return false;
      });
    }

    // Calcular estatísticas com base nas organizações filtradas
    const total = organizacoesFiltradas.length;

    // Organizações com GPS
    const comGps = organizacoesFiltradas.filter(org => 
      org.gps_lat !== null && org.gps_lng !== null
    ).length;

    // Organizações sem GPS
    const semGps = total - comGps;

    // Estatísticas por estado
    const estadoCount: { [key: number]: number } = {};
    organizacoesFiltradas.forEach(org => {
      if (org.estado) {
        estadoCount[org.estado] = (estadoCount[org.estado] || 0) + 1;
      }
    });

    const porEstado = Object.entries(estadoCount)
      .map(([estado, count]) => ({
        estado: parseInt(estado),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Estatísticas por estado com nomes
    const porEstadoFormatado = porEstado.map(item => ({
      estado: this.getEstadoNome(item.estado) || `Estado ${item.estado}`,
      total: item.count
    }));

    // Organizações recentes (últimas 10)
    const organizacoesRecentes = organizacoesFiltradas
      .sort((a, b) => {
        if (!a.data_visita) return 1;
        if (!b.data_visita) return -1;
        return new Date(b.data_visita).getTime() - new Date(a.data_visita).getTime();
      })
      .slice(0, 10);

    // Organizações com GPS para o mapa (limitar a 100)
    const organizacoesComGps = organizacoesFiltradas
      .filter(org => org.gps_lat !== null && org.gps_lng !== null)
      .slice(0, 100);

    return {
      total,
      comGps,
      semGps,
      comQuestionario: Math.floor(total * 0.3), // Mantém cálculo aproximado por enquanto
      semQuestionario: Math.floor(total * 0.7),
      porEstado: porEstadoFormatado,
      organizacoesRecentes: organizacoesRecentes.map(org => {
        const estadoNome = org.estado_organizacao_estadoToestado?.descricao;
        let municipioNome = org.municipio_ibge?.descricao;
        const estadoSigla = this.getEstadoSigla(estadoNome);
        
        // Remover nome do estado do município se estiver presente (ex: "São Paulo - Avaré" -> "Avaré")
        if (municipioNome && municipioNome.includes(' - ')) {
          const partes = municipioNome.split(' - ');
          municipioNome = partes[partes.length - 1]; // Pega a última parte (o município)
        }
        
        return {
          id: org.id,
          nome: org.nome || 'Nome não informado',
          dataVisita: org.data_visita,
          data_visita: org.data_visita,
          estado: org.estado,
          municipio: org.municipio,
          estado_nome: estadoNome,
          municipio_nome: municipioNome,
          localizacao: estadoSigla && municipioNome ? `${estadoSigla} - ${municipioNome}` : (estadoSigla || municipioNome || 'Não informado'),
          temGps: !!(org.gps_lat && org.gps_lng)
        };
      }),
      organizacoesComGps: organizacoesComGps.map(org => {
        const estadoNome = org.estado_organizacao_estadoToestado?.descricao;
        const estadoSigla = this.getEstadoSigla(estadoNome);
        
        return {
          id: org.id,
          nome: org.nome || 'Nome não informado',
          lat: org.gps_lat,
          lng: org.gps_lng,
          estado: org.estado,
          estado_nome: estadoSigla || estadoNome || 'Não informado'
        };
      })
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
            id_estado as "estadoId"
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
            id_estado as "estadoId"
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
          descricao as nome
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
   * Helper para obter sigla do estado a partir do nome completo
   */
  private getEstadoSigla(nomeEstado: string | null | undefined): string {
    if (!nomeEstado) return '';
    
    const siglasEstados: { [key: string]: string } = {
      'Acre': 'AC',
      'Alagoas': 'AL',
      'Amapá': 'AP',
      'Amazonas': 'AM',
      'Bahia': 'BA',
      'Ceará': 'CE',
      'Distrito Federal': 'DF',
      'Espírito Santo': 'ES',
      'Goiás': 'GO',
      'Maranhão': 'MA',
      'Mato Grosso': 'MT',
      'Mato Grosso do Sul': 'MS',
      'Minas Gerais': 'MG',
      'Pará': 'PA',
      'Paraíba': 'PB',
      'Paraná': 'PR',
      'Pernambuco': 'PE',
      'Piauí': 'PI',
      'Rio de Janeiro': 'RJ',
      'Rio Grande do Norte': 'RN',
      'Rio Grande do Sul': 'RS',
      'Rondônia': 'RO',
      'Roraima': 'RR',
      'Santa Catarina': 'SC',
      'São Paulo': 'SP',
      'Sergipe': 'SE',
      'Tocantins': 'TO'
    };

    return siglasEstados[nomeEstado] || nomeEstado;
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

  /**
   * Buscar usuário por email
   * @private
   */
  private async findUserByEmail(email: string): Promise<number | null> {
    try {
      const user = await prisma.users.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true }
      });
      return user?.id || null;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      return null;
    }
  }

  /**
   * Buscar roles do usuário
   * @private
   */
  private async getUserRoles(userId: number): Promise<Array<{ name: string }>> {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          user_roles: {
            include: {
              roles: true
            }
          }
        }
      });

      return user?.user_roles.map(ur => ({ name: ur.roles.name })) || [];
    } catch (error) {
      console.error('Erro ao buscar roles do usuário:', error);
      return [];
    }
  }

  /**
   * Verificar se o usuário é admin
   * @private
   */
  private async isUserAdmin(userId: number): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.some(role => role.name === 'admin');
  }
}

export default new OrganizacaoService();