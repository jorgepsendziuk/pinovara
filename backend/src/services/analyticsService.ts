/**
 * Serviço de Analytics
 * Coleta e agrega métricas de uso do sistema
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AnalyticsMetrics {
  usuarios: {
    total: number;
    ativos: number;
    novosUltimos7Dias: number;
    porRole: Array<{ role: string; count: number }>;
  };
  organizacoes: {
    total: number;
    novasUltimos7Dias: number;
    novasUltimos30Dias: number;
    porEstado: Array<{ estado: string; count: number }>;
    crescimentoDiario: Array<{ data: string; total: number }>;
  };
  tecnicos: {
    total: number;
    organizacoesPorTecnico: Array<{
      tecnico: string;
      email: string;
      totalOrganizacoes: number;
    }>;
  };
  qualidadeDados: {
    organizacoesComGPS: number;
    organizacoesSemGPS: number;
    percentualComGPS: number;
    organizacoesVinculadas: number;
    organizacoesNaoVinculadas: number;
    percentualVinculadas: number;
  };
  atividades: {
    totalAuditLogs: number;
    atividadesPorDia: Array<{ data: string; count: number }>;
    acoesMaisComuns: Array<{ acao: string; count: number }>;
  };
}

class AnalyticsService {
  /**
   * Buscar todas as métricas do sistema
   */
  async getSystemMetrics(): Promise<AnalyticsMetrics> {
    const [
      usuarios,
      organizacoes,
      tecnicos,
      qualidadeDados,
      atividades
    ] = await Promise.all([
      this.getUsuariosMetrics(),
      this.getOrganizacoesMetrics(),
      this.getTecnicosMetrics(),
      this.getQualidadeDadosMetrics(),
      this.getAtividadesMetrics()
    ]);

    return {
      usuarios,
      organizacoes,
      tecnicos,
      qualidadeDados,
      atividades
    };
  }

  /**
   * Métricas de usuários
   */
  private async getUsuariosMetrics() {
    const totalUsuarios = await prisma.users.count();
    const usuariosAtivos = await prisma.users.count({
      where: { active: true }
    });

    // Usuários criados nos últimos 7 dias
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    
    const novosUsuarios = await prisma.users.count({
      where: {
        createdAt: {
          gte: seteDiasAtras
        }
      }
    });

    // Usuários por role
    const usuariosPorRole = await prisma.user_roles.groupBy({
      by: ['roleId'],
      _count: {
        userId: true
      }
    });

    const rolesMap = await prisma.roles.findMany({
      select: { id: true, name: true }
    });

    const porRole = usuariosPorRole.map(ur => {
      const role = rolesMap.find(r => r.id === ur.roleId);
      return {
        role: role?.name || 'Desconhecido',
        count: ur._count.userId
      };
    });

    return {
      total: totalUsuarios,
      ativos: usuariosAtivos,
      novosUltimos7Dias: novosUsuarios,
      porRole
    };
  }

  /**
   * Métricas de organizações
   */
  private async getOrganizacoesMetrics() {
    const totalOrganizacoes = await prisma.organizacao.count({
      where: { removido: false }
    });

    // Organizações criadas nos últimos 7 dias
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const novasUltimos7Dias = await prisma.organizacao.count({
      where: {
        removido: false,
        creation_date: {
          gte: seteDiasAtras
        }
      }
    });

    // Organizações criadas nos últimos 30 dias
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

    const novasUltimos30Dias = await prisma.organizacao.count({
      where: {
        removido: false,
        creation_date: {
          gte: trintaDiasAtras
        }
      }
    });

    // Organizações por estado
    const porEstado = await prisma.$queryRaw<Array<{ estado: string; count: bigint }>>`
      SELECT 
        COALESCE(e.descricao, 'Não informado') as estado,
        COUNT(*)::bigint as count
      FROM pinovara.organizacao o
      LEFT JOIN pinovara_aux.estado e ON o.estado = e.id
      WHERE o.removido = false
      GROUP BY e.descricao
      ORDER BY count DESC
      LIMIT 10
    `;

    // Crescimento diário (últimos 30 dias)
    const crescimentoDiario = await prisma.$queryRaw<Array<{ data: string; total: bigint }>>`
      SELECT 
        TO_CHAR(DATE(creation_date), 'DD/MM') as data,
        COUNT(*)::bigint as total
      FROM pinovara.organizacao
      WHERE removido = false
        AND creation_date >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(creation_date)
      ORDER BY DATE(creation_date) ASC
    `;

    return {
      total: totalOrganizacoes,
      novasUltimos7Dias,
      novasUltimos30Dias,
      porEstado: porEstado.map(p => ({
        estado: p.estado,
        count: Number(p.count)
      })),
      crescimentoDiario: crescimentoDiario.map(c => ({
        data: c.data,
        total: Number(c.total)
      }))
    };
  }

  /**
   * Métricas de técnicos
   */
  private async getTecnicosMetrics() {
    // Contar técnicos únicos
    const tecnicos = await prisma.$queryRaw<Array<{ id: number; name: string; email: string; total: bigint }>>`
      SELECT 
        u.id,
        u.name,
        u.email,
        COUNT(o.id)::bigint as total
      FROM pinovara.users u
      INNER JOIN pinovara.organizacao o ON o.id_tecnico = u.id
      WHERE o.removido = false
      GROUP BY u.id, u.name, u.email
      ORDER BY total DESC
      LIMIT 10
    `;

    return {
      total: tecnicos.length,
      organizacoesPorTecnico: tecnicos.map(t => ({
        tecnico: t.name,
        email: t.email,
        totalOrganizacoes: Number(t.total)
      }))
    };
  }

  /**
   * Métricas de qualidade de dados
   */
  private async getQualidadeDadosMetrics() {
    const totalOrganizacoes = await prisma.organizacao.count({
      where: { removido: false }
    });

    // Organizações com GPS
    const comGPS = await prisma.organizacao.count({
      where: {
        removido: false,
        gps_lat: { not: null },
        gps_lng: { not: null }
      }
    });

    const semGPS = totalOrganizacoes - comGPS;
    const percentualComGPS = totalOrganizacoes > 0 
      ? Math.round((comGPS / totalOrganizacoes) * 100) 
      : 0;

    // Organizações vinculadas a técnicos
    const vinculadas = await prisma.organizacao.count({
      where: {
        removido: false,
        id_tecnico: { not: null }
      }
    });

    const naoVinculadas = totalOrganizacoes - vinculadas;
    const percentualVinculadas = totalOrganizacoes > 0
      ? Math.round((vinculadas / totalOrganizacoes) * 100)
      : 0;

    return {
      organizacoesComGPS: comGPS,
      organizacoesSemGPS: semGPS,
      percentualComGPS,
      organizacoesVinculadas: vinculadas,
      organizacoesNaoVinculadas: naoVinculadas,
      percentualVinculadas
    };
  }

  /**
   * Métricas de atividades
   */
  private async getAtividadesMetrics() {
    const totalAuditLogs = await prisma.audit_logs.count();

    // Atividades por dia (últimos 7 dias)
    const atividadesPorDia = await prisma.$queryRaw<Array<{ data: string; count: bigint }>>`
      SELECT 
        TO_CHAR(DATE("createdAt"), 'DD/MM') as data,
        COUNT(*)::bigint as count
      FROM pinovara.audit_logs
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") ASC
    `;

    // Ações mais comuns
    const acoesMaisComuns = await prisma.audit_logs.groupBy({
      by: ['action'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    return {
      totalAuditLogs,
      atividadesPorDia: atividadesPorDia.map(a => ({
        data: a.data,
        count: Number(a.count)
      })),
      acoesMaisComuns: acoesMaisComuns.map(a => ({
        acao: a.action,
        count: a._count.id
      }))
    };
  }
}

export default new AnalyticsService();

