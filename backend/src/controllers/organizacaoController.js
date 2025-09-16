"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganizacao = exports.updateOrganizacao = exports.createOrganizacao = exports.getOrganizacaoById = exports.getOrganizacoes = exports.getDashboard = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Dashboard de organizações
const getDashboard = async (req, res) => {
    try {
        // Buscar estatísticas básicas
        const totalOrganizacoes = await prisma.organizacao.count({
            where: { removido: false }
        });
        // Simular dados de questionários (já que os campos ainda não estão preenchidos)
        const comQuestionario = Math.floor(totalOrganizacoes * 0.3);
        const semQuestionario = totalOrganizacoes - comQuestionario;
        // Simular distribuição por estado
        const porEstado = [
            { estado: 'Bahia', total: Math.floor(totalOrganizacoes * 0.4) },
            { estado: 'Minas Gerais', total: Math.floor(totalOrganizacoes * 0.3) },
            { estado: 'Espírito Santo', total: Math.floor(totalOrganizacoes * 0.2) },
            { estado: 'Outros', total: Math.floor(totalOrganizacoes * 0.1) }
        ];
        // Simular distribuição por tipo
        const porTipo = [
            { tipo: 'Cooperativa', total: Math.floor(totalOrganizacoes * 0.5) },
            { tipo: 'Associação', total: Math.floor(totalOrganizacoes * 0.3) },
            { tipo: 'Outros', total: Math.floor(totalOrganizacoes * 0.2) }
        ];
        // Buscar organizações recentes
        const recentes = await prisma.organizacao.findMany({
            where: { removido: false },
            select: {
                id: true,
                nome: true,
                dataVisita: true,
                estado: true
            },
            orderBy: { dataVisita: 'desc' },
            take: 5
        });
        const stats = {
            total: totalOrganizacoes,
            comQuestionario,
            semQuestionario,
            porEstado,
            porTipo,
            recentes: recentes.map(org => ({
                id: org.id,
                nome: org.nome || 'Sem nome',
                dataVisita: org.dataVisita?.toISOString() || new Date().toISOString(),
                estado: org.estado ? 'BA' : 'N/A'
            }))
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Erro ao buscar dashboard:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.getDashboard = getDashboard;
// Listar organizações com filtros
const getOrganizacoes = async (req, res) => {
    try {
        const { pagina = '1', limite = '10', busca = '', estado = '', status = '', dataInicio = '', dataFim = '' } = req.query;
        const page = parseInt(pagina);
        const limit = parseInt(limite);
        const skip = (page - 1) * limit;
        // Construir filtros
        const where = {
            removido: false
        };
        if (busca) {
            where.OR = [
                { nome: { contains: busca, mode: 'insensitive' } },
                { cnpj: { contains: busca, mode: 'insensitive' } }
            ];
        }
        if (estado) {
            where.estado = parseInt(estado);
        }
        if (dataInicio && dataFim) {
            where.dataVisita = {
                gte: new Date(dataInicio),
                lte: new Date(dataFim)
            };
        }
        // Buscar organizações
        const [organizacoes, total] = await Promise.all([
            prisma.organizacao.findMany({
                where,
                select: {
                    id: true,
                    nome: true,
                    cnpj: true,
                    estado: true,
                    municipio: true,
                    dataVisita: true,
                    idTecnico: true
                },
                skip,
                take: limit,
                orderBy: { dataVisita: 'desc' }
            }),
            prisma.organizacao.count({ where })
        ]);
        // Simular dados de localização e status
        const organizacoesComDados = organizacoes.map(org => ({
            ...org,
            estado: org.estado ? 'Bahia' : 'N/A',
            municipio: org.municipio ? 'Salvador' : 'N/A',
            status: 'pendente' // Simular status baseado em dados existentes
        }));
        const totalPaginas = Math.ceil(total / limit);
        res.json({
            organizacoes: organizacoesComDados,
            totalPaginas,
            paginaAtual: page,
            total
        });
    }
    catch (error) {
        console.error('Erro ao buscar organizações:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.getOrganizacoes = getOrganizacoes;
// Buscar organização por ID
const getOrganizacaoById = async (req, res) => {
    try {
        const { id } = req.params;
        const organizacaoId = parseInt(id);
        const organizacao = await prisma.organizacao.findUnique({
            where: { id: organizacaoId }
        });
        if (!organizacao) {
            return res.status(404).json({ message: 'Organização não encontrada' });
        }
        // Simular dados de questionários
        const questionarios = {
            go: { completo: false, progresso: 25 },
            gpp: { completo: false, progresso: 10 },
            gc: { completo: false, progresso: 5 },
            gf: { completo: false, progresso: 15 },
            gp: { completo: false, progresso: 20 },
            gs: { completo: false, progresso: 8 },
            gi: { completo: false, progresso: 12 },
            is: { completo: false, progresso: 18 }
        };
        // Simular dados de arquivos
        const arquivos = [
            { id: 1, nome: 'documento1.pdf', tipo: 'pdf', url: '/files/doc1.pdf' },
            { id: 2, nome: 'foto1.jpg', tipo: 'image', url: '/files/photo1.jpg' }
        ];
        // Simular dados de produção
        const producoes = [
            { id: 1, cultura: 'Café', anual: 1000, mensal: 83.33 },
            { id: 2, cultura: 'Milho', anual: 500, mensal: 41.67 }
        ];
        // Simular dados de abrangência
        const abrangenciaPj = [
            { id: 1, razaoSocial: 'Cooperativa ABC', cnpjPj: '12.345.678/0001-90', numSociosCaf: 50, numSociosTotal: 100 }
        ];
        const abrangenciaSocio = [
            { id: 1, numSocios: 100, estado: 'Bahia', municipio: 'Salvador' }
        ];
        const organizacaoCompleta = {
            ...organizacao,
            estado: 'Bahia', // Simular estado
            municipio: 'Salvador', // Simular município
            status: 'pendente',
            caracteristicas: {
                totalSocios: organizacao.caracteristicasNTotalSocios || 0,
                totalSociosCaf: organizacao.caracteristicasNTotalSociosCaf || 0,
                distintosCaf: organizacao.caracteristicasNDistintosCaf || 0,
                sociosPaa: organizacao.caracteristicasNSociosPaa || 0,
                naosociosPaa: organizacao.caracteristicasNNaosociosPaa || 0,
                sociosPnae: organizacao.caracteristicasNSociosPnae || 0,
                naosociosPnae: organizacao.caracteristicasNNaosociosPnae || 0,
                ativosTotal: organizacao.caracteristicasNAtivosTotal || 0,
                ativosCaf: organizacao.caracteristicasNAtivosCaf || 0
            },
            questionarios,
            arquivos,
            producoes,
            abrangenciaPj,
            abrangenciaSocio
        };
        res.json(organizacaoCompleta);
    }
    catch (error) {
        console.error('Erro ao buscar organização:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.getOrganizacaoById = getOrganizacaoById;
// Criar nova organização
const createOrganizacao = async (req, res) => {
    try {
        const { nome, cnpj, dataFundacao, telefone, email, endereco, bairro, cep, estado, municipio, gpsLat, gpsLng, gpsAlt, gpsAcc, totalSocios, totalSociosCaf, distintosCaf, sociosPaa, naosociosPaa, sociosPnae, naosociosPnae, ativosTotal, ativosCaf, observacoes } = req.body;
        const organizacao = await prisma.organizacao.create({
            data: {
                nome,
                cnpj,
                dataFundacao: dataFundacao ? new Date(dataFundacao) : null,
                estado: estado ? parseInt(estado) : null,
                municipio: municipio ? parseInt(municipio) : null,
                gpsLat: gpsLat ? parseFloat(gpsLat) : null,
                gpsLng: gpsLng ? parseFloat(gpsLng) : null,
                gpsAlt: gpsAlt ? parseFloat(gpsAlt) : null,
                gpsAcc: gpsAcc ? parseFloat(gpsAcc) : null,
                dataVisita: new Date(),
                caracteristicasNTotalSocios: totalSocios ? parseInt(totalSocios) : null,
                caracteristicasNTotalSociosCaf: totalSociosCaf ? parseInt(totalSociosCaf) : null,
                caracteristicasNDistintosCaf: distintosCaf ? parseInt(distintosCaf) : null,
                caracteristicasNSociosPaa: sociosPaa ? parseInt(sociosPaa) : null,
                caracteristicasNNaosociosPaa: naosociosPaa ? parseInt(naosociosPaa) : null,
                caracteristicasNSociosPnae: sociosPnae ? parseInt(sociosPnae) : null,
                caracteristicasNNaosociosPnae: naosociosPnae ? parseInt(naosociosPnae) : null,
                caracteristicasNAtivosTotal: ativosTotal ? parseInt(ativosTotal) : null,
                caracteristicasNAtivosCaf: ativosCaf ? parseInt(ativosCaf) : null,
                idTecnico: 1 // Simular técnico responsável
            }
        });
        res.status(201).json({
            id: organizacao.id,
            message: 'Organização criada com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao criar organização:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.createOrganizacao = createOrganizacao;
// Atualizar organização
const updateOrganizacao = async (req, res) => {
    try {
        const { id } = req.params;
        const organizacaoId = parseInt(id);
        const updateData = req.body;
        const organizacao = await prisma.organizacao.update({
            where: { id: organizacaoId },
            data: updateData
        });
        res.json({
            id: organizacao.id,
            message: 'Organização atualizada com sucesso'
        });
    }
    catch (error) {
        console.error('Erro ao atualizar organização:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.updateOrganizacao = updateOrganizacao;
// Excluir organização (soft delete)
const deleteOrganizacao = async (req, res) => {
    try {
        const { id } = req.params;
        const organizacaoId = parseInt(id);
        await prisma.organizacao.update({
            where: { id: organizacaoId },
            data: { removido: true }
        });
        res.json({ message: 'Organização excluída com sucesso' });
    }
    catch (error) {
        console.error('Erro ao excluir organização:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.deleteOrganizacao = deleteOrganizacao;
//# sourceMappingURL=organizacaoController.js.map