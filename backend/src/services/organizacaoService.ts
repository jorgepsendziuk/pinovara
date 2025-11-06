import { PrismaClient } from '@prisma/client';
import { 
  Organizacao, 
  OrganizacaoCompleta, 
  OrganizacaoFilters, 
  OrganizacaoListResponse 
} from '../types/organizacao';
import { ErrorCode, HttpStatus, PaginatedResponse } from '../types/api';
import { extractEmailFromCreatorUri } from '../utils/odkHelper';
import { ApiError } from '../utils/ApiError';

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
      const isCoordinator = await this.isUserCoordinator(userId);
      
      if (!isAdmin && !isCoordinator) {
        // Usuário não é admin nem coordenador, aplicar filtro híbrido
        // (coordenador vê TODAS organizações, assim como admin)
        aplicarFiltroHibrido = true;
        
        // Buscar email do usuário logado
        const user = await prisma.users.findUnique({
          where: { id: userId },
          select: { email: true }
        });
        
        userEmail = user?.email?.toLowerCase() || null;
      }
    }

    // Buscar organizações com nomes de estado, município e técnico
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
        o._creator_uri_user,
        o.validacao_status,
        u.name as tecnico_nome,
        u.email as tecnico_email
      FROM pinovara.organizacao o
      LEFT JOIN pinovara_aux.estado e ON o.estado = e.id
      LEFT JOIN pinovara_aux.municipio_ibge m ON o.municipio = m.id
      LEFT JOIN pinovara.users u ON o.id_tecnico = u.id
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
    const totalInicial = organizacoes.length;

    // Aplicar filtro híbrido se necessário (técnico não-admin)
    if (aplicarFiltroHibrido && userId) {
      console.log(`🔍 Filtro híbrido ativo para userId ${userId} (${userEmail})`);
      console.log(`   Organizações antes do filtro: ${totalInicial}`);
      
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
      
      console.log(`   Organizações após filtro: ${organizacoes.length}`);
    } else {
      console.log(`📊 Sem filtro híbrido (admin ou sem userId). Total: ${totalInicial}`);
    }

    // Calcular paginação APÓS filtro híbrido
    const total = organizacoes.length;
    const skip = (page - 1) * limit;
    const totalPaginas = Math.ceil(total / limit);
    
    console.log(`📄 Paginação: total=${total}, page=${page}, limit=${limit}, skip=${skip}`);
    
    // Aplicar paginação manual
    const organizacoesPaginadas = organizacoes.slice(skip, skip + limit);
    
    console.log(`   Retornando: ${organizacoesPaginadas.length} organizações`);

    // Log para debug
    if (organizacoesPaginadas.length > 0) {
      console.log('📊 Amostra de organização:', {
        id: organizacoesPaginadas[0].id,
        nome: organizacoesPaginadas[0].nome,
        tecnico_nome: organizacoesPaginadas[0].tecnico_nome,
        tecnico_email: organizacoesPaginadas[0].tecnico_email,
        id_tecnico: organizacoesPaginadas[0].id_tecnico
      });
    }

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
  async getById(organizacaoId: number): Promise<any> {
    try {
      console.log('🔍 Buscando organização ID:', organizacaoId);
      
      // Buscar organização sem include primeiro para verificar se existe
      let organizacao = await prisma.organizacao.findUnique({
        where: { id: organizacaoId }
      });

      console.log('📦 Organização encontrada (sem include):', organizacao ? 'SIM' : 'NÃO');
      if (organizacao) {
        console.log('📦 Organização removida?', organizacao.removido);
        console.log('📦 Organização ID:', organizacao.id);
        console.log('📦 Organização nome:', organizacao.nome);
      }
      
      if (!organizacao) {
        console.error('❌ Organização não encontrada para ID:', organizacaoId);
        throw new ApiError({
          message: 'Organização não encontrada',
          statusCode: HttpStatus.NOT_FOUND,
          code: ErrorCode.RESOURCE_NOT_FOUND
        });
      }
      
      // Verificar se está removida (mas ainda permitir edição se necessário)
      // Não vamos bloquear aqui, apenas logar
      if (organizacao.removido) {
        console.warn('⚠️ Organização está marcada como removida, mas permitindo acesso');
      }

      // Se existe, buscar com include do relacionamento users
      // Usar try-catch para capturar erros do relacionamento
      try {
        organizacao = await prisma.organizacao.findUnique({
          where: { id: organizacaoId },
          include: {
            // Incluir dados do usuário validador (pode ser null se não houver validador)
            users: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });

        console.log('📦 Organização encontrada (com include):', organizacao ? 'SIM' : 'NÃO');
      } catch (includeError: any) {
        console.error('❌ Erro ao buscar com include:', includeError);
        console.warn('⚠️ Tentando buscar sem include do relacionamento users');
        // Se houver erro no include, usar a organização já encontrada sem include
        // e buscar o relacionamento separadamente se necessário
        organizacao = await prisma.organizacao.findUnique({
          where: { id: organizacaoId }
        });
        
        if (organizacao && organizacao.validacao_usuario) {
          try {
            const user = await prisma.users.findUnique({
              where: { id: organizacao.validacao_usuario },
              select: { id: true, name: true, email: true }
            });
            (organizacao as any).users = user;
          } catch (userError) {
            console.warn('⚠️ Erro ao buscar usuário validador:', userError);
            (organizacao as any).users = null;
          }
        } else {
          (organizacao as any).users = null;
        }
      }

      if (!organizacao) {
        console.error('❌ Organização não encontrada para ID:', organizacaoId);
        throw new ApiError({
          message: 'Organização não encontrada',
          statusCode: HttpStatus.NOT_FOUND,
          code: ErrorCode.RESOURCE_NOT_FOUND
        });
      }

      // Buscar nomes do estado e município
      let estadoNome = null;
      let municipioNome = null;
      let tecnicoNome = null;
      let tecnicoEmail = null;

      if (organizacao.estado) {
        const estado = await prisma.$queryRaw<any[]>`
          SELECT descricao FROM pinovara_aux.estado WHERE id = ${organizacao.estado} LIMIT 1
        `;
        estadoNome = estado.length > 0 ? estado[0].descricao : null;
      }

      if (organizacao.municipio) {
        const municipio = await prisma.$queryRaw<any[]>`
          SELECT descricao FROM pinovara_aux.municipio_ibge WHERE id = ${organizacao.municipio} LIMIT 1
        `;
        municipioNome = municipio.length > 0 ? municipio[0].descricao : null;
      }

      if (organizacao.id_tecnico) {
        const tecnico = await prisma.users.findUnique({
          where: { id: organizacao.id_tecnico },
          select: {
            name: true,
            email: true
          }
        });
        if (tecnico) {
          tecnicoNome = tecnico.name;
          tecnicoEmail = tecnico.email;
        }
      }

      // Retornar organização com dados adicionais
      return {
        ...organizacao,
        estado_nome: estadoNome,
        municipio_nome: municipioNome,
        tecnico_nome: tecnicoNome,
        tecnico_email: tecnicoEmail
      };
    } catch (error) {
      console.error('Erro ao buscar organização:', error);
      throw error;
    }
  }

  /**
   * VERSÃO ANTIGA - BACKUP DO getById com select
   * (Caso precise voltar para select específico)
   */
  private async _getByIdOLD_BACKUP(organizacaoId: number): Promise<Organizacao | null> {
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
          
          // Campos de complementos
          obs: true,
          descricao: true,
          eixos_trabalhados: true,
          enfase: true,
          enfase_outros: true,
          metodologia: true,
          orientacoes: true,
          participantes_menos_10: true,
          assinatura_rep_legal: true,
          
          // Campos de validação
          validacao_status: true,
          validacao_usuario: true,
          validacao_data: true,
          validacao_obs: true,
          
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
   * Preenche automaticamente id_tecnico com o usuário logado ou do _creator_uri_user
   */
  async create(data: Partial<Organizacao>): Promise<Organizacao> {
    const { nome, cnpj, telefone, email, estado, municipio, creator_uri_user, id_tecnico: idTecnicoRecebido } = data;

    // Validações básicas
    if (!nome || nome.trim().length === 0) {
      throw new ApiError({
        message: 'Nome da organização é obrigatório',
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.MISSING_REQUIRED_FIELD
      });
    }

    // Determinar id_tecnico:
    // 1. Se veio do controller (usuário logado criando), usar esse
    // 2. Senão, tentar vincular com técnico se houver _creator_uri_user (ODK)
    let id_tecnico: number | null = idTecnicoRecebido || null;
    
    if (!id_tecnico && creator_uri_user) {
      const emailExtraido = extractEmailFromCreatorUri(creator_uri_user);
      if (emailExtraido) {
        id_tecnico = await this.findUserByEmail(emailExtraido);
        if (id_tecnico) {
          console.log(`✅ Organização vinculada ao técnico ID ${id_tecnico} através do email ${emailExtraido}`);
        }
      }
    }

    if (id_tecnico) {
      console.log(`✅ Criando organização com técnico ID: ${id_tecnico}`);
    }

    // Preparar dados completos para criação
    const dadosCriacao: any = {
      nome: nome.trim(),
      cnpj: cnpj ? cnpj.replace(/\D/g, '') : null, // Remover formatação do CNPJ
      telefone: telefone ? telefone.replace(/\D/g, '') : null, // Remover formatação do telefone
      email: email || null,
      estado: estado || null,
      municipio: municipio || null,
      removido: false,
      creator_uri_user: creator_uri_user || null,
      id_tecnico: id_tecnico
    };

    // Adicionar data_fundacao se fornecida
    if (data.data_fundacao) {
      try {
        dadosCriacao.data_fundacao = typeof data.data_fundacao === 'string' 
          ? new Date(data.data_fundacao) 
          : data.data_fundacao;
        
        // Validar se a data é válida
        if (isNaN(dadosCriacao.data_fundacao.getTime())) {
          console.error('❌ Data de fundação inválida:', data.data_fundacao);
          throw new ApiError({
            message: 'Data de fundação inválida. Use o formato AAAA-MM-DD',
            statusCode: HttpStatus.BAD_REQUEST,
            code: ErrorCode.VALIDATION_ERROR,
            details: { campo: 'data_fundacao', valor: data.data_fundacao }
          });
        }
      } catch (error: any) {
        if (error instanceof ApiError) throw error;
        console.error('❌ Erro ao processar data_fundacao:', error);
        throw new ApiError({
          message: 'Erro ao processar data de fundação',
          statusCode: HttpStatus.BAD_REQUEST,
          code: ErrorCode.VALIDATION_ERROR,
          details: { campo: 'data_fundacao', erro: error.message }
        });
      }
    }

    // Adicionar data_visita se fornecida
    if (data.data_visita) {
      try {
        dadosCriacao.data_visita = typeof data.data_visita === 'string' 
          ? new Date(data.data_visita) 
          : data.data_visita;
        
        // Validar se a data é válida
        if (isNaN(dadosCriacao.data_visita.getTime())) {
          console.error('❌ Data de visita inválida:', data.data_visita);
          throw new ApiError({
            message: 'Data de visita inválida. Use o formato AAAA-MM-DD',
            statusCode: HttpStatus.BAD_REQUEST,
            code: ErrorCode.VALIDATION_ERROR,
            details: { campo: 'data_visita', valor: data.data_visita }
          });
        }
      } catch (error: any) {
        if (error instanceof ApiError) throw error;
        console.error('❌ Erro ao processar data_visita:', error);
        throw new ApiError({
          message: 'Erro ao processar data de visita',
          statusCode: HttpStatus.BAD_REQUEST,
          code: ErrorCode.VALIDATION_ERROR,
          details: { campo: 'data_visita', erro: error.message }
        });
      }
    }

    try {
      const organizacao = await prisma.organizacao.create({
        data: dadosCriacao
      });

      return organizacao;
    } catch (error: any) {
      console.error('Erro ao criar organização no Prisma:', error);
      
      // Tratar erros específicos do Prisma
      if (error.code === 'P2002') {
        // Unique constraint violation
        const target = error.meta?.target || ['campo desconhecido'];
        throw new ApiError({
          message: `Erro: Já existe uma organização com este(s) dado(s): ${Array.isArray(target) ? target.join(', ') : target}`,
          statusCode: HttpStatus.BAD_REQUEST,
          code: 'P2002',
          details: { campos: target }
        });
      } else if (error.code === 'P2003') {
        // Foreign key constraint violation
        const field = error.meta?.field_name || 'campo de referência';
        throw new ApiError({
          message: `Erro: Referência inválida no campo "${field}". Verifique se o valor selecionado existe.`,
          statusCode: HttpStatus.BAD_REQUEST,
          code: 'P2003',
          details: { campo: field }
        });
      } else if (error.code) {
        // Outro erro do Prisma
        throw new ApiError({
          message: `Erro ao criar organização: ${error.message}`,
          statusCode: HttpStatus.BAD_REQUEST,
          code: error.code,
          details: error.meta
        });
      }
      
      // Erro genérico
      throw new ApiError({
        message: 'Erro ao criar organização',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR,
        details: error.message
      });
    }
  }

  /**
   * Atualizar organização
   */
  async update(id: number, data: Partial<Organizacao>): Promise<Organizacao> {
    console.log('🔄 Iniciando update da organização ID:', id);
    
    // Verificar se organização existe
    const existingOrg = await prisma.organizacao.findUnique({
      where: { id }
    });

    console.log('📋 Organização existente encontrada:', existingOrg ? 'SIM' : 'NÃO');
    if (existingOrg) {
      console.log('📋 Organização removida?', existingOrg.removido);
    }

    if (!existingOrg || existingOrg.removido) {
      console.error('❌ Organização não encontrada ou removida para ID:', id);
      throw new ApiError({
        message: 'Organização não encontrada',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    // Remover campos de relacionamento e campos computados que o Prisma não aceita
    const dadosLimpos = { ...data };
    
    // Lista de campos que devem ser removidos (relacionamentos, campos computados, etc.)
    const camposParaRemover = [
      // Campo ID não deve ser atualizado
      'id',
      
      // Relacionamentos diretos (nomes dos relacionamentos no Prisma)
      'users', // Relacionamento com usuário validador
      'enfase_organizacao_enfaseToenfase',
      'estado_organizacao_estadoToestado',
      'municipio_ibge',
      'sim_nao_organizacao_participantes_menos_10Tosim_nao',
      
      // Todos os relacionamentos de resposta (padrão: resposta_organizacao_*_Toresposta)
      // Serão removidos pelo padrão abaixo
      
      // Campos computados/adicionais que não fazem parte do schema
      'estado_nome',
      'municipio_nome',
      'tecnico_nome',
      'tecnico_email',
      
      // Arrays de relacionamentos (tabelas relacionadas)
      'organizacao_producao',
      'organizacao_foto',
      'organizacao_documento',
      'organizacao_indicador',
      'organizacao_participante',
      'organizacao_abrangencia_pj',
      'organizacao_abrangencia_socio',
      'plano_gestao_evidencia',
      'plano_gestao_acao',
      
      // Campos do plano de gestão (devem ser atualizados apenas pelos endpoints específicos)
      'plano_gestao_rascunho',
      'plano_gestao_rascunho_updated_by',
      'plano_gestao_rascunho_updated_at',
      'plano_gestao_rascunho_updated_by_name',
      'plano_gestao_relatorio_sintetico',
      'plano_gestao_relatorio_sintetico_updated_by',
      'plano_gestao_relatorio_sintetico_updated_at',
      'plano_gestao_relatorio_sintetico_updated_by_name',
      
      // Relacionamentos de usuários do plano de gestão
      'users_organizacao_plano_gestao_rascunho_updated_byTousers',
      'users_organizacao_plano_gestao_relatorio_sintetico_updated_byTousers',
      
      // Campos de metadados do ODK que não devem ser atualizados diretamente
      'meta_instance_id',
      'creator_uri_user',
      '_uri',
      '_creation_date',
      '_last_update_date',
      '_last_update_uri_user',
      '_parent_auri',
      '_ordinal_number',
      '_top_level_auri',
      
      // Campos de validação (devem ser atualizados apenas pelo endpoint específico)
      // Nota: validacao_status, validacao_usuario, validacao_data, validacao_obs
      // podem ser atualizados, mas apenas por coordenadores via endpoint específico
      // Por segurança, vamos permitir que sejam atualizados aqui também
      // (o controller já verifica permissões)
    ];
    
    // Remover campos específicos da lista
    camposParaRemover.forEach(campo => {
      delete (dadosLimpos as any)[campo];
    });
    
    // Remover todos os campos de relacionamento que seguem padrões conhecidos
    // Padrão 1: resposta_organizacao_*_Toresposta
    // Padrão 2: *_organizacao_*_To*
    // Padrão 3: organizacao_* (arrays de relacionamento)
    Object.keys(dadosLimpos).forEach(key => {
      // Remover relacionamentos de resposta
      if (key.startsWith('resposta_organizacao_') && key.endsWith('Toresposta')) {
        delete (dadosLimpos as any)[key];
        return;
      }
      
      // Remover relacionamentos que seguem padrão *_To*
      if (key.includes('_To') && (key.includes('organizacao_') || key.includes('_organizacao_'))) {
        delete (dadosLimpos as any)[key];
        return;
      }
      
      // Remover arrays de relacionamento que começam com organizacao_
      if (key.startsWith('organizacao_') && Array.isArray((dadosLimpos as any)[key])) {
        delete (dadosLimpos as any)[key];
        return;
      }
      
      // Remover campos que são objetos (provavelmente relacionamentos)
      if (typeof (dadosLimpos as any)[key] === 'object' && (dadosLimpos as any)[key] !== null && !Array.isArray((dadosLimpos as any)[key]) && !((dadosLimpos as any)[key] instanceof Date)) {
        // Verificar se parece ser um relacionamento (tem campos como id, name, etc.)
        const obj = (dadosLimpos as any)[key];
        if (obj.id !== undefined || obj.name !== undefined || obj.email !== undefined) {
          delete (dadosLimpos as any)[key];
          return;
        }
      }
    });
    
    // Remover campos undefined (Prisma não aceita undefined, apenas null)
    Object.keys(dadosLimpos).forEach(key => {
      if ((dadosLimpos as any)[key] === undefined) {
        delete (dadosLimpos as any)[key];
      }
    });

    // Validar e limitar campos de texto longos (VarChar com limite)
    // descricao - VarChar(8192)
    if (dadosLimpos.descricao && typeof dadosLimpos.descricao === 'string') {
      if (dadosLimpos.descricao.length > 8192) {
        console.warn(`⚠️ Descrição muito longa (${dadosLimpos.descricao.length} chars), truncando para 8192`);
        dadosLimpos.descricao = dadosLimpos.descricao.substring(0, 8192);
      }
    }
    
    // obs - VarChar(8192)
    if ((dadosLimpos as any).obs && typeof (dadosLimpos as any).obs === 'string') {
      if ((dadosLimpos as any).obs.length > 8192) {
        console.warn(`⚠️ Observação muito longa (${(dadosLimpos as any).obs.length} chars), truncando para 8192`);
        (dadosLimpos as any).obs = (dadosLimpos as any).obs.substring(0, 8192);
      }
    }

    // Limpar formatação de campos numéricos (remover caracteres especiais, manter apenas números)
    const dadosAny = dadosLimpos as any;
    
    // CEPs - VarChar(8) no banco
    if (dadosAny.organizacao_end_cep) {
      dadosAny.organizacao_end_cep = dadosAny.organizacao_end_cep.replace(/\D/g, '');
    }
    if (dadosAny.representante_end_cep) {
      dadosAny.representante_end_cep = dadosAny.representante_end_cep.replace(/\D/g, '');
    }
    
    // CPF - VarChar(11) no banco
    if (dadosAny.representante_cpf) {
      dadosAny.representante_cpf = dadosAny.representante_cpf.replace(/\D/g, '');
    }
    
    // CNPJ - remover formatação
    if (dadosLimpos.cnpj) {
      dadosLimpos.cnpj = dadosLimpos.cnpj.replace(/\D/g, '');
    }
    
    // Telefones - remover formatação
    if (dadosLimpos.telefone) {
      dadosLimpos.telefone = dadosLimpos.telefone.replace(/\D/g, '');
    }
    if (dadosAny.representante_telefone) {
      dadosAny.representante_telefone = dadosAny.representante_telefone.replace(/\D/g, '');
    }

    // Converter strings de data para objetos Date com validação
    const camposData = ['data_fundacao', 'data_visita', 'inicio', 'fim', 'validacao_data'];
    
    for (const campo of camposData) {
      const valorCampo = (dadosLimpos as any)[campo];
      if (valorCampo) {
        try {
          // Converter string para Date
          if (typeof valorCampo === 'string') {
            const dataString = valorCampo as string;
            
            // Se a string estiver vazia, remover o campo
            if (dataString.trim() === '') {
              delete (dadosLimpos as any)[campo];
              continue;
            }
            
            (dadosLimpos as any)[campo] = new Date(dataString);
          }
          
          // Validar se a data é válida
          const dataObj = (dadosLimpos as any)[campo] as Date;
          if (isNaN(dataObj.getTime())) {
            console.error(`❌ ${campo} inválida:`, valorCampo);
            throw new ApiError({
              message: `${campo.replace('_', ' ')} inválida. Use o formato AAAA-MM-DD`,
              statusCode: HttpStatus.BAD_REQUEST,
              code: ErrorCode.VALIDATION_ERROR,
              details: [{ campo, valor: valorCampo }]
            });
          }
        } catch (error: any) {
          if (error instanceof ApiError) throw error;
          console.error(`❌ Erro ao processar ${campo}:`, error);
          throw new ApiError({
            message: `Erro ao processar ${campo.replace('_', ' ')}`,
            statusCode: HttpStatus.BAD_REQUEST,
            code: ErrorCode.VALIDATION_ERROR,
            details: [{ campo, erro: error.message }]
          });
        }
      }
    }

    // Log dos dados que serão enviados ao Prisma
    console.log('📝 Dados limpos para update:', JSON.stringify(dadosLimpos, null, 2));

    try {
      const organizacao = await prisma.organizacao.update({
        where: { id },
        data: dadosLimpos
      });

      console.log('✅ Organização atualizada com sucesso:', id);
      return organizacao;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar organização no Prisma:', error);
      console.error('❌ Tipo do erro:', error.constructor.name);
      console.error('❌ Código do erro:', error.code);
      console.error('❌ Meta:', error.meta);
      console.error('❌ Dados que causaram o erro:', JSON.stringify(dadosLimpos, null, 2));
      
      // Tratar erros específicos do Prisma
      if (error.code === 'P2002') {
        // Unique constraint violation
        const target = error.meta?.target || ['campo desconhecido'];
        throw new ApiError({
          message: `Erro: Já existe uma organização com este(s) dado(s): ${Array.isArray(target) ? target.join(', ') : target}`,
          statusCode: HttpStatus.BAD_REQUEST,
          code: 'P2002',
          details: { campos: target }
        });
      } else if (error.code === 'P2003') {
        // Foreign key constraint violation
        const field = error.meta?.field_name || 'campo de referência';
        throw new ApiError({
          message: `Erro: Referência inválida no campo "${field}". Verifique se o valor selecionado existe.`,
          statusCode: HttpStatus.BAD_REQUEST,
          code: 'P2003',
          details: { campo: field }
        });
      } else if (error.code === 'P2025') {
        // Record not found
        throw new ApiError({
          message: 'Organização não encontrada',
          statusCode: HttpStatus.NOT_FOUND,
          code: 'P2025'
        });
      } else if (error.code) {
        // Outro erro do Prisma
        throw new ApiError({
          message: `Erro ao atualizar organização: ${error.message}`,
          statusCode: HttpStatus.BAD_REQUEST,
          code: error.code,
          details: error.meta
        });
      }
      
      // Erro genérico
      throw new ApiError({
        message: 'Erro ao atualizar organização',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR,
        details: error.message
      });
    }
  }

  /**
   * Atualizar apenas campos de validação (para coordenadores)
   */
  async updateValidacao(id: number, dadosValidacao: {
    validacao_status: number | null;
    validacao_obs: string | null;
    validacao_usuario: number | null;
    validacao_data: Date;
  }): Promise<Organizacao> {
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

    // Atualizar apenas campos de validação
    const organizacao = await prisma.organizacao.update({
      where: { id },
      data: {
        validacao_status: dadosValidacao.validacao_status,
        validacao_obs: dadosValidacao.validacao_obs,
        validacao_usuario: dadosValidacao.validacao_usuario,
        validacao_data: dadosValidacao.validacao_data
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
      const isCoordinator = await this.isUserCoordinator(userId);
      
      if (!isAdmin && !isCoordinator) {
        // Usuário não é admin nem coordenador, aplicar filtro híbrido
        // (coordenador vê TODAS organizações, assim como admin)
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
        validacao_status: true,
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

    // Buscar todos os técnicos de uma vez
    const tecnicoIds = todasOrganizacoes
      .map(org => org.id_tecnico)
      .filter((id): id is number => id !== null && id !== undefined);
    
    const tecnicos = await prisma.users.findMany({
      where: {
        id: { in: tecnicoIds }
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    // Criar mapa de técnicos para lookup rápido
    const tecnicoMap = new Map(tecnicos.map(t => [t.id, t]));

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

    // Organizações recentes - TODAS, independente da origem (ODK ou Web)
    const organizacoesRecentes = organizacoesFiltradas
      .sort((a, b) => {
        // Ordenar por ID (mais recente primeiro) se não tiver data_visita
        if (!a.data_visita && !b.data_visita) {
          return b.id - a.id;
        }
        if (!a.data_visita) return 1;
        if (!b.data_visita) return -1;
        return new Date(b.data_visita).getTime() - new Date(a.data_visita).getTime();
      })
      .slice(0, 50); // Mostrar até 50 organizações recentes

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
        
        // Buscar técnico no mapa
        const tecnico = org.id_tecnico ? tecnicoMap.get(org.id_tecnico) : null;
        
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
          temGps: !!(org.gps_lat && org.gps_lng),
          tecnico_nome: tecnico?.name || null,
          tecnico_email: tecnico?.email || null,
          validacao_status: org.validacao_status
        };
      }),
      organizacoesComGps: organizacoesComGps.map(org => {
        const estadoNome = org.estado_organizacao_estadoToestado?.descricao;
        let municipioNome = org.municipio_ibge?.descricao;
        const estadoSigla = this.getEstadoSigla(estadoNome);
        
        // Remover nome do estado do município se estiver presente
        if (municipioNome && municipioNome.includes(' - ')) {
          const partes = municipioNome.split(' - ');
          municipioNome = partes[partes.length - 1];
        }
        
        return {
          id: org.id,
          nome: org.nome || 'Nome não informado',
          lat: org.gps_lat,
          lng: org.gps_lng,
          estado: org.estado,
          estado_nome: estadoSigla || estadoNome || 'Não informado',
          municipio_nome: municipioNome || null,
          validacao_status: org.validacao_status
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
            descricao,
            id_estado
          FROM pinovara_aux.municipio_ibge
          WHERE id_estado = ${estadoId}
          ORDER BY descricao
        `;
      } else {
        // Buscar todos os municípios
        municipios = await prisma.$queryRaw`
          SELECT
            id,
            descricao,
            id_estado
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
          descricao
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
  private async getUserRoles(userId: number): Promise<Array<{ name: string; module?: { name: string } }>> {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          user_roles: {
            include: {
              roles: {
                include: {
                  modules: true
                }
              }
            }
          }
        }
      });

      return user?.user_roles.map(ur => ({ 
        name: ur.roles.name,
        module: { name: ur.roles.modules.name }
      })) || [];
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

  /**
   * Verificar se usuário é coordenador ou supervisor
   * Ambos podem ver todas as organizações mas não podem editar
   */
  private async isUserCoordinator(userId: number): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.some(role => 
      (role.name === 'coordenador' || role.name === 'supervisao') && 
      role.module?.name === 'organizacoes'
    );
  }
}

export default new OrganizacaoService();