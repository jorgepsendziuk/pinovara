import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalOrganizacoes = await prisma.organizacao.count();

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
        nome: org.nome,
        dataVisita: org.dataVisita,
        estado: org.estado ? 'Bahia' : 'Outros' // Simular estado baseado no número
      }))
    };

    res.json(stats);
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getOrganizacoes = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const organizacoes = await prisma.organizacao.findMany({
      skip: offset,
      take: limit,
      orderBy: { dataVisita: 'desc' },
      select: {
        id: true,
        nome: true,
        cnpj: true,
        estado: true,
        municipio: true,
        dataVisita: true
      }
    });

    const total = await prisma.organizacao.count();
    const totalPaginas = Math.ceil(total / limit);

    // Simular dados adicionais para compatibilidade com o frontend
    const organizacoesComStatus = organizacoes.map(org => ({
      ...org,
      estado: org.estado ? 'Bahia' : 'Outros', // Simular estado
      municipio: org.municipio ? 'Salvador' : 'Outros', // Simular município
      idTecnico: 1, // Simular técnico
      status: 'pendente' // Simular status
    }));

    res.json({
      organizacoes: organizacoesComStatus,
      totalPaginas,
      paginaAtual: page,
      total
    });
  } catch (error) {
    console.error('Erro ao buscar organizações:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const getOrganizacaoById = async (req: Request, res: Response) => {
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
  } catch (error) {
    console.error('Erro ao buscar organização:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const createOrganizacao = async (req: Request, res: Response) => {
  try {
    const {
      nome,
      cnpj,
      dataFundacao,
      telefone,
      email,
      endereco,
      bairro,
      cep,
      estado,
      municipio,
      gpsLat,
      gpsLng,
      gpsAlt,
      gpsAcc,
      totalSocios,
      totalSociosCaf,
      distintosCaf,
      sociosPaa,
      naosociosPaa,
      sociosPnae,
      naosociosPnae,
      ativosTotal,
      ativosCaf
    } = req.body;

    const organizacao = await prisma.organizacao.create({
      data: {
        nome,
        cnpj,
        dataFundacao: dataFundacao ? new Date(dataFundacao) : null,
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
        caracteristicasNAtivosCaf: ativosCaf ? parseInt(ativosCaf) : null
      }
    });

    res.status(201).json(organizacao);
  } catch (error) {
    console.error('Erro ao criar organização:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const updateOrganizacao = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organizacaoId = parseInt(id);
    const updateData = req.body;

    const organizacao = await prisma.organizacao.update({
      where: { id: organizacaoId },
      data: updateData
    });

    res.json(organizacao);
  } catch (error) {
    console.error('Erro ao atualizar organização:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

export const deleteOrganizacao = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const organizacaoId = parseInt(id);

    await prisma.organizacao.delete({
      where: { id: organizacaoId }
    });

    res.json({ message: 'Organização excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir organização:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};
