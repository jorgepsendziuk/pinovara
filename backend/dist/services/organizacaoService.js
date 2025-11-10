"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const api_1 = require("../types/api");
const odkHelper_1 = require("../utils/odkHelper");
const ApiError_1 = require("../utils/ApiError");
const prisma = new client_1.PrismaClient();
class OrganizacaoService {
    async list(filters = {}) {
        const { page = 1, limit = 10, nome, cnpj, estado, municipio, id_tecnico, userId } = filters;
        const whereConditions = {
            removido: { not: true }
        };
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
        if (id_tecnico !== undefined) {
            whereConditions.id_tecnico = id_tecnico;
        }
        let aplicarFiltroHibrido = false;
        let userEmail = null;
        if (userId) {
            const isAdmin = await this.isUserAdmin(userId);
            const isCoordinator = await this.isUserCoordinator(userId);
            if (!isAdmin && !isCoordinator) {
                aplicarFiltroHibrido = true;
                const user = await prisma.users.findUnique({
                    where: { id: userId },
                    select: { email: true }
                });
                userEmail = user?.email?.toLowerCase() || null;
            }
        }
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
        const conditions = [];
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
        let organizacoes = await prisma.$queryRawUnsafe(sqlQuery);
        const totalInicial = organizacoes.length;
        if (aplicarFiltroHibrido && userId) {
            console.log(`🔍 Filtro híbrido ativo para userId ${userId} (${userEmail})`);
            console.log(`   Organizações antes do filtro: ${totalInicial}`);
            organizacoes = organizacoes.filter(org => {
                if (org.id_tecnico === userId)
                    return true;
                if (org._creator_uri_user && userEmail) {
                    const creatorEmail = (0, odkHelper_1.extractEmailFromCreatorUri)(org._creator_uri_user);
                    if (creatorEmail === userEmail)
                        return true;
                }
                return false;
            });
            console.log(`   Organizações após filtro: ${organizacoes.length}`);
        }
        else {
            console.log(`📊 Sem filtro híbrido (admin ou sem userId). Total: ${totalInicial}`);
        }
        const total = organizacoes.length;
        const skip = (page - 1) * limit;
        const totalPaginas = Math.ceil(total / limit);
        console.log(`📄 Paginação: total=${total}, page=${page}, limit=${limit}, skip=${skip}`);
        const organizacoesPaginadas = organizacoes.slice(skip, skip + limit);
        console.log(`   Retornando: ${organizacoesPaginadas.length} organizações`);
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
    async getById(organizacaoId) {
        try {
            console.log('🔍 Buscando organização ID:', organizacaoId);
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
                throw new ApiError_1.ApiError({
                    message: 'Organização não encontrada',
                    statusCode: api_1.HttpStatus.NOT_FOUND,
                    code: api_1.ErrorCode.RESOURCE_NOT_FOUND
                });
            }
            if (organizacao.removido) {
                console.warn('⚠️ Organização está marcada como removida, mas permitindo acesso');
            }
            try {
                organizacao = await prisma.organizacao.findUnique({
                    where: { id: organizacaoId },
                    include: {
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
            }
            catch (includeError) {
                console.error('❌ Erro ao buscar com include:', includeError);
                console.warn('⚠️ Tentando buscar sem include do relacionamento users');
                organizacao = await prisma.organizacao.findUnique({
                    where: { id: organizacaoId }
                });
                if (organizacao && organizacao.validacao_usuario) {
                    try {
                        const user = await prisma.users.findUnique({
                            where: { id: organizacao.validacao_usuario },
                            select: { id: true, name: true, email: true }
                        });
                        organizacao.users = user;
                    }
                    catch (userError) {
                        console.warn('⚠️ Erro ao buscar usuário validador:', userError);
                        organizacao.users = null;
                    }
                }
                else {
                    organizacao.users = null;
                }
            }
            if (!organizacao) {
                console.error('❌ Organização não encontrada para ID:', organizacaoId);
                throw new ApiError_1.ApiError({
                    message: 'Organização não encontrada',
                    statusCode: api_1.HttpStatus.NOT_FOUND,
                    code: api_1.ErrorCode.RESOURCE_NOT_FOUND
                });
            }
            let estadoNome = null;
            let municipioNome = null;
            let tecnicoNome = null;
            let tecnicoEmail = null;
            if (organizacao.estado) {
                const estado = await prisma.$queryRaw `
          SELECT descricao FROM pinovara_aux.estado WHERE id = ${organizacao.estado} LIMIT 1
        `;
                estadoNome = estado.length > 0 ? estado[0].descricao : null;
            }
            if (organizacao.municipio) {
                const municipio = await prisma.$queryRaw `
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
            return {
                ...organizacao,
                estado_nome: estadoNome,
                municipio_nome: municipioNome,
                tecnico_nome: tecnicoNome,
                tecnico_email: tecnicoEmail
            };
        }
        catch (error) {
            console.error('Erro ao buscar organização:', error);
            throw error;
        }
    }
    async _getByIdOLD_BACKUP(organizacaoId) {
        try {
            const organizacao = await prisma.organizacao.findUnique({
                where: { id: organizacaoId },
                select: {
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
                    organizacao_end_logradouro: true,
                    organizacao_end_bairro: true,
                    organizacao_end_complemento: true,
                    organizacao_end_numero: true,
                    organizacao_end_cep: true,
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
                    obs: true,
                    descricao: true,
                    eixos_trabalhados: true,
                    enfase: true,
                    enfase_outros: true,
                    metodologia: true,
                    orientacoes: true,
                    participantes_menos_10: true,
                    assinatura_rep_legal: true,
                    validacao_status: true,
                    validacao_usuario: true,
                    validacao_data: true,
                    validacao_obs: true,
                }
            });
            if (!organizacao) {
                throw new Error('Organização não encontrada');
            }
            return organizacao;
        }
        catch (error) {
            console.error('Erro ao buscar organização:', error);
            throw error;
        }
    }
    async create(data) {
        const { nome, cnpj, telefone, email, estado, municipio, creator_uri_user, id_tecnico: idTecnicoRecebido } = data;
        if (!nome || nome.trim().length === 0) {
            throw new ApiError_1.ApiError({
                message: 'Nome da organização é obrigatório',
                statusCode: api_1.HttpStatus.BAD_REQUEST,
                code: api_1.ErrorCode.MISSING_REQUIRED_FIELD
            });
        }
        let id_tecnico = idTecnicoRecebido || null;
        if (!id_tecnico && creator_uri_user) {
            const emailExtraido = (0, odkHelper_1.extractEmailFromCreatorUri)(creator_uri_user);
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
        const dadosCriacao = {
            nome: nome.trim(),
            cnpj: cnpj ? cnpj.replace(/\D/g, '') : null,
            telefone: telefone ? telefone.replace(/\D/g, '') : null,
            email: email || null,
            estado: estado || null,
            municipio: municipio || null,
            removido: false,
            creator_uri_user: creator_uri_user || null,
            id_tecnico: id_tecnico
        };
        if (data.data_fundacao) {
            try {
                dadosCriacao.data_fundacao = typeof data.data_fundacao === 'string'
                    ? new Date(data.data_fundacao)
                    : data.data_fundacao;
                if (isNaN(dadosCriacao.data_fundacao.getTime())) {
                    console.error('❌ Data de fundação inválida:', data.data_fundacao);
                    throw new ApiError_1.ApiError({
                        message: 'Data de fundação inválida. Use o formato AAAA-MM-DD',
                        statusCode: api_1.HttpStatus.BAD_REQUEST,
                        code: api_1.ErrorCode.VALIDATION_ERROR,
                        details: [{ campo: 'data_fundacao', valor: data.data_fundacao }]
                    });
                }
            }
            catch (error) {
                if (error instanceof ApiError_1.ApiError)
                    throw error;
                console.error('❌ Erro ao processar data_fundacao:', error);
                throw new ApiError_1.ApiError({
                    message: 'Erro ao processar data de fundação',
                    statusCode: api_1.HttpStatus.BAD_REQUEST,
                    code: api_1.ErrorCode.VALIDATION_ERROR,
                    details: [{ campo: 'data_fundacao', erro: error.message }]
                });
            }
        }
        if (data.data_visita) {
            try {
                dadosCriacao.data_visita = typeof data.data_visita === 'string'
                    ? new Date(data.data_visita)
                    : data.data_visita;
                if (isNaN(dadosCriacao.data_visita.getTime())) {
                    console.error('❌ Data de visita inválida:', data.data_visita);
                    throw new ApiError_1.ApiError({
                        message: 'Data de visita inválida. Use o formato AAAA-MM-DD',
                        statusCode: api_1.HttpStatus.BAD_REQUEST,
                        code: api_1.ErrorCode.VALIDATION_ERROR,
                        details: [{ campo: 'data_visita', valor: data.data_visita }]
                    });
                }
            }
            catch (error) {
                if (error instanceof ApiError_1.ApiError)
                    throw error;
                console.error('❌ Erro ao processar data_visita:', error);
                throw new ApiError_1.ApiError({
                    message: 'Erro ao processar data de visita',
                    statusCode: api_1.HttpStatus.BAD_REQUEST,
                    code: api_1.ErrorCode.VALIDATION_ERROR,
                    details: [{ campo: 'data_visita', erro: error.message }]
                });
            }
        }
        try {
            const organizacao = await prisma.organizacao.create({
                data: dadosCriacao
            });
            return organizacao;
        }
        catch (error) {
            console.error('Erro ao criar organização no Prisma:', error);
            if (error.code === 'P2002') {
                const target = error.meta?.target || ['campo desconhecido'];
                throw new ApiError_1.ApiError({
                    message: `Erro: Já existe uma organização com este(s) dado(s): ${Array.isArray(target) ? target.join(', ') : target}`,
                    statusCode: api_1.HttpStatus.BAD_REQUEST,
                    code: 'P2002',
                    details: [{ campos: target }]
                });
            }
            else if (error.code === 'P2003') {
                const field = error.meta?.field_name || 'campo de referência';
                throw new ApiError_1.ApiError({
                    message: `Erro: Referência inválida no campo "${field}". Verifique se o valor selecionado existe.`,
                    statusCode: api_1.HttpStatus.BAD_REQUEST,
                    code: 'P2003',
                    details: [{ campo: field }]
                });
            }
            else if (error.code) {
                throw new ApiError_1.ApiError({
                    message: `Erro ao criar organização: ${error.message}`,
                    statusCode: api_1.HttpStatus.BAD_REQUEST,
                    code: error.code,
                    details: error.meta
                });
            }
            throw new ApiError_1.ApiError({
                message: 'Erro ao criar organização',
                statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR,
                code: api_1.ErrorCode.DATABASE_ERROR,
                details: error.message
            });
        }
    }
    async update(id, data) {
        console.log('🔄 Iniciando update da organização ID:', id);
        const existingOrg = await prisma.organizacao.findUnique({
            where: { id }
        });
        console.log('📋 Organização existente encontrada:', existingOrg ? 'SIM' : 'NÃO');
        if (existingOrg) {
            console.log('📋 Organização removida?', existingOrg.removido);
        }
        if (!existingOrg || existingOrg.removido) {
            console.error('❌ Organização não encontrada ou removida para ID:', id);
            throw new ApiError_1.ApiError({
                message: 'Organização não encontrada',
                statusCode: api_1.HttpStatus.NOT_FOUND,
                code: api_1.ErrorCode.RESOURCE_NOT_FOUND
            });
        }
        const dadosLimpos = { ...data };
        console.log('📥 Dados recebidos do frontend:', Object.keys(data).length, 'campos');
        const camposRecebidos = Object.keys(data);
        const camposParaRemover = [
            'id',
            'users',
            'enfase_organizacao_enfaseToenfase',
            'estado_organizacao_estadoToestado',
            'municipio_ibge',
            'sim_nao_organizacao_participantes_menos_10Tosim_nao',
            'estado_nome',
            'municipio_nome',
            'tecnico_nome',
            'tecnico_email',
            'organizacao_producao',
            'organizacao_foto',
            'organizacao_documento',
            'organizacao_indicador',
            'organizacao_participante',
            'organizacao_abrangencia_pj',
            'organizacao_abrangencia_socio',
            'plano_gestao_evidencia',
            'plano_gestao_acao',
            'plano_gestao_rascunho',
            'plano_gestao_rascunho_updated_by',
            'plano_gestao_rascunho_updated_at',
            'plano_gestao_rascunho_updated_by_name',
            'plano_gestao_relatorio_sintetico',
            'plano_gestao_relatorio_sintetico_updated_by',
            'plano_gestao_relatorio_sintetico_updated_at',
            'plano_gestao_relatorio_sintetico_updated_by_name',
            'users_organizacao_plano_gestao_rascunho_updated_byTousers',
            'users_organizacao_plano_gestao_relatorio_sintetico_updated_byTousers',
            'meta_instance_id',
            'creator_uri_user',
            '_uri',
            '_creation_date',
            '_last_update_date',
            '_last_update_uri_user',
            '_parent_auri',
            '_ordinal_number',
            '_top_level_auri',
        ];
        const camposRemovidosExplicitos = [];
        camposParaRemover.forEach(campo => {
            if (dadosLimpos[campo] !== undefined) {
                camposRemovidosExplicitos.push(campo);
                delete dadosLimpos[campo];
            }
        });
        const camposRemovidosPorPadrao = [];
        Object.keys(dadosLimpos).forEach(key => {
            let removido = false;
            let motivo = '';
            if (key.startsWith('resposta_organizacao_') && key.endsWith('Toresposta')) {
                removido = true;
                motivo = 'Relacionamento de resposta (padrão resposta_organizacao_*_Toresposta)';
            }
            if (!removido && key.includes('_To') && (key.includes('organizacao_') || key.includes('_organizacao_'))) {
                removido = true;
                motivo = 'Relacionamento (padrão *_To*)';
            }
            if (!removido && key.startsWith('organizacao_') && Array.isArray(dadosLimpos[key])) {
                removido = true;
                motivo = 'Array de relacionamento (organizacao_*)';
            }
            if (!removido && typeof dadosLimpos[key] === 'object' && dadosLimpos[key] !== null && !Array.isArray(dadosLimpos[key]) && !(dadosLimpos[key] instanceof Date)) {
                const obj = dadosLimpos[key];
                if (obj.id !== undefined || obj.name !== undefined || obj.email !== undefined) {
                    removido = true;
                    motivo = 'Objeto relacionamento (tem id/name/email)';
                }
            }
            if (removido) {
                camposRemovidosPorPadrao.push(`${key} (${motivo})`);
                delete dadosLimpos[key];
            }
        });
        const camposUndefined = [];
        Object.keys(dadosLimpos).forEach(key => {
            if (dadosLimpos[key] === undefined) {
                camposUndefined.push(key);
                delete dadosLimpos[key];
            }
        });
        console.log('🧹 Limpeza de campos realizada:');
        console.log('   📊 Total de campos recebidos:', camposRecebidos.length);
        console.log('   🗑️  Campos removidos explicitamente:', camposRemovidosExplicitos.length);
        if (camposRemovidosExplicitos.length > 0) {
            console.log('      -', camposRemovidosExplicitos.join(', '));
        }
        console.log('   🗑️  Campos removidos por padrão:', camposRemovidosPorPadrao.length);
        if (camposRemovidosPorPadrao.length > 0) {
            camposRemovidosPorPadrao.slice(0, 10).forEach(campo => console.log('      -', campo));
            if (camposRemovidosPorPadrao.length > 10) {
                console.log(`      ... e mais ${camposRemovidosPorPadrao.length - 10} campos`);
            }
        }
        console.log('   🗑️  Campos undefined removidos:', camposUndefined.length);
        if (camposUndefined.length > 0) {
            console.log('      -', camposUndefined.join(', '));
        }
        console.log('   ✅ Campos que serão salvos:', Object.keys(dadosLimpos).length);
        console.log('      -', Object.keys(dadosLimpos).slice(0, 20).join(', '));
        if (Object.keys(dadosLimpos).length > 20) {
            console.log(`      ... e mais ${Object.keys(dadosLimpos).length - 20} campos`);
        }
        const dadosAny = dadosLimpos;
        if (dadosAny.descricao && typeof dadosAny.descricao === 'string') {
            if (dadosAny.descricao.length > 8192) {
                console.warn(`⚠️ Descrição muito longa (${dadosAny.descricao.length} chars), truncando para 8192`);
                dadosAny.descricao = dadosAny.descricao.substring(0, 8192);
            }
        }
        if (dadosAny.obs && typeof dadosAny.obs === 'string') {
            if (dadosAny.obs.length > 8192) {
                console.warn(`⚠️ Observação muito longa (${dadosAny.obs.length} chars), truncando para 8192`);
                dadosAny.obs = dadosAny.obs.substring(0, 8192);
            }
        }
        if (dadosAny.organizacao_end_cep) {
            dadosAny.organizacao_end_cep = dadosAny.organizacao_end_cep.replace(/\D/g, '');
        }
        if (dadosAny.representante_end_cep) {
            dadosAny.representante_end_cep = dadosAny.representante_end_cep.replace(/\D/g, '');
        }
        if (dadosAny.representante_cpf) {
            dadosAny.representante_cpf = dadosAny.representante_cpf.replace(/\D/g, '');
        }
        if (dadosLimpos.cnpj) {
            dadosLimpos.cnpj = dadosLimpos.cnpj.replace(/\D/g, '');
        }
        if (dadosLimpos.telefone) {
            dadosLimpos.telefone = dadosLimpos.telefone.replace(/\D/g, '');
        }
        if (dadosAny.representante_telefone) {
            dadosAny.representante_telefone = dadosAny.representante_telefone.replace(/\D/g, '');
        }
        const camposData = ['data_fundacao', 'data_visita', 'inicio', 'fim', 'validacao_data'];
        for (const campo of camposData) {
            const valorCampo = dadosLimpos[campo];
            if (valorCampo) {
                try {
                    if (typeof valorCampo === 'string') {
                        const dataString = valorCampo;
                        if (dataString.trim() === '') {
                            delete dadosLimpos[campo];
                            continue;
                        }
                        dadosLimpos[campo] = new Date(dataString);
                    }
                    const dataObj = dadosLimpos[campo];
                    if (isNaN(dataObj.getTime())) {
                        console.error(`❌ ${campo} inválida:`, valorCampo);
                        throw new ApiError_1.ApiError({
                            message: `${campo.replace('_', ' ')} inválida. Use o formato AAAA-MM-DD`,
                            statusCode: api_1.HttpStatus.BAD_REQUEST,
                            code: api_1.ErrorCode.VALIDATION_ERROR,
                            details: [{ campo, valor: valorCampo }]
                        });
                    }
                }
                catch (error) {
                    if (error instanceof ApiError_1.ApiError)
                        throw error;
                    console.error(`❌ Erro ao processar ${campo}:`, error);
                    throw new ApiError_1.ApiError({
                        message: `Erro ao processar ${campo.replace('_', ' ')}`,
                        statusCode: api_1.HttpStatus.BAD_REQUEST,
                        code: api_1.ErrorCode.VALIDATION_ERROR,
                        details: [{ campo, erro: error.message }]
                    });
                }
            }
        }
        console.log('📝 Dados limpos para update:', JSON.stringify(dadosLimpos, null, 2));
        try {
            const organizacao = await prisma.organizacao.update({
                where: { id },
                data: dadosLimpos
            });
            console.log('✅ Organização atualizada com sucesso:', id);
            return organizacao;
        }
        catch (error) {
            console.error('❌ Erro ao atualizar organização no Prisma:', error);
            console.error('❌ Tipo do erro:', error.constructor.name);
            console.error('❌ Código do erro:', error.code);
            console.error('❌ Meta:', error.meta);
            console.error('❌ Dados que causaram o erro:', JSON.stringify(dadosLimpos, null, 2));
            if (error.code === 'P2002') {
                const target = error.meta?.target || ['campo desconhecido'];
                throw new ApiError_1.ApiError({
                    message: `Erro: Já existe uma organização com este(s) dado(s): ${Array.isArray(target) ? target.join(', ') : target}`,
                    statusCode: api_1.HttpStatus.BAD_REQUEST,
                    code: 'P2002',
                    details: [{ campos: target }]
                });
            }
            else if (error.code === 'P2003') {
                const field = error.meta?.field_name || 'campo de referência';
                throw new ApiError_1.ApiError({
                    message: `Erro: Referência inválida no campo "${field}". Verifique se o valor selecionado existe.`,
                    statusCode: api_1.HttpStatus.BAD_REQUEST,
                    code: 'P2003',
                    details: [{ campo: field }]
                });
            }
            else if (error.code === 'P2025') {
                throw new ApiError_1.ApiError({
                    message: 'Organização não encontrada',
                    statusCode: api_1.HttpStatus.NOT_FOUND,
                    code: 'P2025'
                });
            }
            else if (error.code) {
                throw new ApiError_1.ApiError({
                    message: `Erro ao atualizar organização: ${error.message}`,
                    statusCode: api_1.HttpStatus.BAD_REQUEST,
                    code: error.code,
                    details: error.meta
                });
            }
            throw new ApiError_1.ApiError({
                message: 'Erro ao atualizar organização',
                statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR,
                code: api_1.ErrorCode.DATABASE_ERROR,
                details: error.message
            });
        }
    }
    async updateValidacao(id, dadosValidacao) {
        const existingOrg = await prisma.organizacao.findUnique({
            where: { id }
        });
        if (!existingOrg || existingOrg.removido) {
            throw new ApiError_1.ApiError({
                message: 'Organização não encontrada',
                statusCode: api_1.HttpStatus.NOT_FOUND,
                code: api_1.ErrorCode.RESOURCE_NOT_FOUND
            });
        }
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
    async delete(id) {
        const existingOrg = await prisma.organizacao.findUnique({
            where: { id }
        });
        if (!existingOrg || existingOrg.removido) {
            throw new ApiError_1.ApiError({
                message: 'Organização não encontrada',
                statusCode: api_1.HttpStatus.NOT_FOUND,
                code: api_1.ErrorCode.RESOURCE_NOT_FOUND
            });
        }
        await prisma.organizacao.update({
            where: { id },
            data: {
                removido: true
            }
        });
    }
    async getDashboardStats(userId) {
        let aplicarFiltroHibrido = false;
        let userEmail = null;
        if (userId) {
            const isAdmin = await this.isUserAdmin(userId);
            const isCoordinator = await this.isUserCoordinator(userId);
            if (!isAdmin && !isCoordinator) {
                aplicarFiltroHibrido = true;
                const user = await prisma.users.findUnique({
                    where: { id: userId },
                    select: { email: true }
                });
                userEmail = user?.email?.toLowerCase() || null;
            }
        }
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
        const tecnicoIds = todasOrganizacoes
            .map(org => org.id_tecnico)
            .filter((id) => id !== null && id !== undefined);
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
        const tecnicoMap = new Map(tecnicos.map(t => [t.id, t]));
        let organizacoesFiltradas = todasOrganizacoes;
        if (aplicarFiltroHibrido && userId) {
            organizacoesFiltradas = todasOrganizacoes.filter(org => {
                if (org.id_tecnico === userId)
                    return true;
                if (org.creator_uri_user && userEmail) {
                    const creatorEmail = (0, odkHelper_1.extractEmailFromCreatorUri)(org.creator_uri_user);
                    if (creatorEmail === userEmail)
                        return true;
                }
                return false;
            });
        }
        const total = organizacoesFiltradas.length;
        const comGps = organizacoesFiltradas.filter(org => org.gps_lat !== null && org.gps_lng !== null).length;
        const semGps = total - comGps;
        const estadoCount = {};
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
        const porEstadoFormatado = porEstado.map(item => ({
            estado: this.getEstadoNome(item.estado) || `Estado ${item.estado}`,
            total: item.count
        }));
        const organizacoesRecentes = organizacoesFiltradas
            .sort((a, b) => {
            if (!a.data_visita && !b.data_visita) {
                return b.id - a.id;
            }
            if (!a.data_visita)
                return 1;
            if (!b.data_visita)
                return -1;
            return new Date(b.data_visita).getTime() - new Date(a.data_visita).getTime();
        })
            .slice(0, 50);
        const organizacoesComGps = organizacoesFiltradas
            .filter(org => org.gps_lat !== null && org.gps_lng !== null)
            .slice(0, 100);
        return {
            total,
            comGps,
            semGps,
            comQuestionario: Math.floor(total * 0.3),
            semQuestionario: Math.floor(total * 0.7),
            porEstado: porEstadoFormatado,
            organizacoesRecentes: organizacoesRecentes.map(org => {
                const estadoNome = org.estado_organizacao_estadoToestado?.descricao;
                let municipioNome = org.municipio_ibge?.descricao;
                const estadoSigla = this.getEstadoSigla(estadoNome);
                if (municipioNome && municipioNome.includes(' - ')) {
                    const partes = municipioNome.split(' - ');
                    municipioNome = partes[partes.length - 1];
                }
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
    async getMunicipios(estadoId) {
        try {
            let municipios;
            if (estadoId) {
                municipios = await prisma.$queryRaw `
          SELECT
            id,
            descricao,
            id_estado
          FROM pinovara_aux.municipio_ibge
          WHERE id_estado = ${estadoId}
          ORDER BY descricao
        `;
            }
            else {
                municipios = await prisma.$queryRaw `
          SELECT
            id,
            descricao,
            id_estado
          FROM pinovara_aux.municipio_ibge
          ORDER BY descricao
        `;
            }
            return municipios;
        }
        catch (error) {
            console.error('Erro ao buscar municípios:', error);
            throw new ApiError_1.ApiError({
                message: 'Erro ao buscar municípios',
                statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR,
                code: api_1.ErrorCode.DATABASE_ERROR
            });
        }
    }
    async getEstados() {
        try {
            const estados = await prisma.$queryRaw `
        SELECT
          id,
          descricao
        FROM pinovara_aux.estado
        ORDER BY descricao
      `;
            return estados;
        }
        catch (error) {
            console.error('Erro ao buscar estados:', error);
            throw new ApiError_1.ApiError({
                message: 'Erro ao buscar estados',
                statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR,
                code: api_1.ErrorCode.DATABASE_ERROR
            });
        }
    }
    getEstadoSigla(nomeEstado) {
        if (!nomeEstado)
            return '';
        const siglasEstados = {
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
    getEstadoNome(codigo) {
        if (!codigo)
            return 'Não informado';
        const estados = {
            1: 'Acre', 2: 'Alagoas', 3: 'Amapá', 4: 'Amazonas',
            5: 'Bahia', 6: 'Ceará', 7: 'Distrito Federal', 8: 'Espírito Santo',
        };
        return estados[codigo] || `Estado ${codigo}`;
    }
    async findUserByEmail(email) {
        try {
            const user = await prisma.users.findUnique({
                where: { email: email.toLowerCase() },
                select: { id: true }
            });
            return user?.id || null;
        }
        catch (error) {
            console.error('Erro ao buscar usuário por email:', error);
            return null;
        }
    }
    async getUserRoles(userId) {
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
        }
        catch (error) {
            console.error('Erro ao buscar roles do usuário:', error);
            return [];
        }
    }
    async isUserAdmin(userId) {
        const roles = await this.getUserRoles(userId);
        return roles.some(role => role.name === 'admin');
    }
    async isUserCoordinator(userId) {
        const roles = await this.getUserRoles(userId);
        return roles.some(role => (role.name === 'coordenador' || role.name === 'supervisao') &&
            role.module?.name === 'organizacoes');
    }
}
exports.default = new OrganizacaoService();
//# sourceMappingURL=organizacaoService.js.map