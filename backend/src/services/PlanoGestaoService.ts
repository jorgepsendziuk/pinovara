import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AcaoModeloData {
  id: number;
  tipo: string;
  titulo: string;
  grupo: string | null;
  acao_modelo: string; // Valor original do modelo (preservado separadamente)
  hint_como_sera_feito: string | null;
  hint_responsavel: string | null;
  hint_recursos: string | null;
  ordem: number;
  ativo: boolean;
}

export interface AcaoEditavelData {
  id?: number;
  id_acao_modelo: number;
  responsavel: string | null;
  data_inicio: Date | null;
  data_termino: Date | null;
  como_sera_feito: string | null;
  recursos: string | null;
}

export interface AcaoCompleta extends AcaoModeloData {
  // Campos editáveis
  id_acao_editavel?: number;
  acao: string | null;
  responsavel: string | null;
  data_inicio: Date | null;
  data_termino: Date | null;
  como_sera_feito: string | null;
  recursos: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface GrupoAcoes {
  nome: string | null;
  acoes: AcaoCompleta[];
}

export interface PlanoGestaoCompleto {
  tipo: string;
  titulo: string;
  grupos: GrupoAcoes[];
}

export interface Evidencia {
  id: number;
  id_organizacao: number;
  tipo: 'foto' | 'lista_presenca';
  nome_arquivo: string;
  caminho_arquivo: string;
  descricao: string | null;
  uploaded_by: number;
  uploaded_by_name?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PlanoGestaoResponse {
  plano_gestao_rascunho: string | null;
  plano_gestao_rascunho_updated_by: number | null;
  plano_gestao_rascunho_updated_at: Date | null;
  plano_gestao_rascunho_updated_by_name?: string | null;
  plano_gestao_relatorio_sintetico: string | null;
  plano_gestao_relatorio_sintetico_updated_by: number | null;
  plano_gestao_relatorio_sintetico_updated_at: Date | null;
  plano_gestao_relatorio_sintetico_updated_by_name?: string | null;
  evidencias: Evidencia[];
  planos: PlanoGestaoCompleto[];
}

class PlanoGestaoService {
  /**
   * Busca o plano de gestão completo para uma organização
   * Mescla dados do template com dados editados (se existirem)
   */
  async getPlanoGestao(idOrganizacao: number): Promise<PlanoGestaoResponse> {
    // Buscar rascunho e relatório sintético da organização com informações do usuário
    const organizacao = await prisma.organizacao.findUnique({
      where: { id: idOrganizacao },
      select: { 
        plano_gestao_rascunho: true,
        plano_gestao_rascunho_updated_by: true,
        plano_gestao_rascunho_updated_at: true,
        users_organizacao_plano_gestao_rascunho_updated_byTousers: {
          select: {
            id: true,
            name: true
          }
        },
        plano_gestao_relatorio_sintetico: true,
        plano_gestao_relatorio_sintetico_updated_by: true,
        plano_gestao_relatorio_sintetico_updated_at: true,
        users_organizacao_plano_gestao_relatorio_sintetico_updated_byTousers: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!organizacao) {
      throw new Error('Organização não encontrada');
    }

    // Buscar todas as ações modelo ativas
    const acoesModelo = await prisma.plano_gestao_acao_modelo.findMany({
      where: { ativo: true },
      orderBy: { ordem: 'asc' }
    });

    console.log('📊 Total de ações modelo encontradas:', acoesModelo.length);

    // Buscar todas as ações editadas para esta organização
    const acoesEditadas = await prisma.plano_gestao_acao.findMany({
      where: { id_organizacao: idOrganizacao }
    });

    // Criar um mapa de ações editadas por id_acao_modelo para acesso rápido
    const acoesEditadasMap = new Map<number, typeof acoesEditadas[0]>();
    acoesEditadas.forEach(acao => {
      acoesEditadasMap.set(acao.id_acao_modelo, acao);
    });

    // Mesclar dados modelo com dados editados
    const acoesCompletas: AcaoCompleta[] = acoesModelo.map(modelo => {
      const editada = acoesEditadasMap.get(modelo.id);
      
      return {
        // Dados do modelo (sempre presentes)
        id: modelo.id,
        tipo: modelo.tipo,
        titulo: modelo.titulo,
        grupo: modelo.grupo,
        acao_modelo: modelo.acao, // Valor original do modelo (preservado para usar como hint)
        hint_como_sera_feito: modelo.hint_como_sera_feito,
        hint_responsavel: modelo.hint_responsavel,
        hint_recursos: modelo.hint_recursos,
        ordem: modelo.ordem,
        ativo: modelo.ativo,
        
        // Dados editáveis (do modelo ou da edição)
        id_acao_editavel: editada?.id,
        acao: editada?.acao || null, // Valor editado (null se não foi editado, usar acao_modelo como hint)
        responsavel: editada?.responsavel || null,
        data_inicio: editada?.data_inicio || null,
        data_termino: editada?.data_termino || null,
        como_sera_feito: editada?.como_sera_feito || null,
        recursos: editada?.recursos || null,
        created_at: editada?.created_at || null,
        updated_at: editada?.updated_at || null
      };
    });

    // Agrupar ações por tipo e grupo
    const planosMap = new Map<string, Map<string | null, AcaoCompleta[]>>();
    
    acoesCompletas.forEach(acao => {
      if (!planosMap.has(acao.tipo)) {
        planosMap.set(acao.tipo, new Map());
      }
      
      const grupos = planosMap.get(acao.tipo)!;
      if (!grupos.has(acao.grupo)) {
        grupos.set(acao.grupo, []);
      }
      
      grupos.get(acao.grupo)!.push(acao);
    });

    // Converter para estrutura final
    const planos: PlanoGestaoCompleto[] = [];
    
    planosMap.forEach((grupos, tipo) => {
      const primeiraAcao = Array.from(grupos.values())[0][0];
      
      const gruposArray: GrupoAcoes[] = [];
      grupos.forEach((acoes, nomeGrupo) => {
        gruposArray.push({
          nome: nomeGrupo,
          acoes: acoes
        });
      });
      
      planos.push({
        tipo: tipo,
        titulo: primeiraAcao.titulo,
        grupos: gruposArray
      });
    });

    console.log('📦 Total de planos montados:', planos.length);
    console.log('📋 Planos:', planos.map(p => `${p.tipo} (${p.grupos.length} grupos)`));

    // Buscar evidências (fotos e listas de presença)
    const evidenciasRaw = await prisma.plano_gestao_evidencia.findMany({
      where: { id_organizacao: idOrganizacao },
      include: {
        users: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const evidencias: Evidencia[] = evidenciasRaw.map(ev => ({
      id: ev.id,
      id_organizacao: ev.id_organizacao,
      tipo: ev.tipo as 'foto' | 'lista_presenca',
      nome_arquivo: ev.nome_arquivo,
      caminho_arquivo: ev.caminho_arquivo,
      descricao: ev.descricao,
      uploaded_by: ev.uploaded_by,
      uploaded_by_name: ev.users?.name || null,
      created_at: ev.created_at,
      updated_at: ev.updated_at
    }));

    return {
      plano_gestao_rascunho: organizacao.plano_gestao_rascunho,
      plano_gestao_rascunho_updated_by: organizacao.plano_gestao_rascunho_updated_by,
      plano_gestao_rascunho_updated_at: organizacao.plano_gestao_rascunho_updated_at,
      plano_gestao_rascunho_updated_by_name: organizacao.users_organizacao_plano_gestao_rascunho_updated_byTousers?.name || null,
      plano_gestao_relatorio_sintetico: organizacao.plano_gestao_relatorio_sintetico,
      plano_gestao_relatorio_sintetico_updated_by: organizacao.plano_gestao_relatorio_sintetico_updated_by,
      plano_gestao_relatorio_sintetico_updated_at: organizacao.plano_gestao_relatorio_sintetico_updated_at,
      plano_gestao_relatorio_sintetico_updated_by_name: organizacao.users_organizacao_plano_gestao_relatorio_sintetico_updated_byTousers?.name || null,
      evidencias: evidencias,
      planos: planos
    };
  }

  /**
   * Atualiza o rascunho/notas colaborativas do plano de gestão
   */
  async updateRascunho(idOrganizacao: number, rascunho: string | null, userId: number): Promise<void> {
    const organizacao = await prisma.organizacao.findUnique({
      where: { id: idOrganizacao }
    });

    if (!organizacao) {
      throw new Error('Organização não encontrada');
    }

    await prisma.organizacao.update({
      where: { id: idOrganizacao },
      data: {
        plano_gestao_rascunho: rascunho,
        plano_gestao_rascunho_updated_by: userId,
        plano_gestao_rascunho_updated_at: new Date()
      }
    });
  }

  /**
   * Cria ou atualiza uma ação específica (lazy creation)
   */
  async upsertAcao(
    idOrganizacao: number,
    idAcaoModelo: number,
    dados: {
      acao?: string | null;
      responsavel?: string | null;
      data_inicio?: Date | null;
      data_termino?: Date | null;
      como_sera_feito?: string | null;
      recursos?: string | null;
    }
  ): Promise<void> {
    // Verificar se organização existe
    const organizacao = await prisma.organizacao.findUnique({
      where: { id: idOrganizacao }
    });

    if (!organizacao) {
      throw new Error('Organização não encontrada');
    }

    // Verificar se ação modelo existe
    const acaoModelo = await prisma.plano_gestao_acao_modelo.findUnique({
      where: { id: idAcaoModelo }
    });

    if (!acaoModelo) {
      throw new Error('Ação modelo não encontrada');
    }

    // Upsert da ação (cria se não existe, atualiza se existe)
    await prisma.plano_gestao_acao.upsert({
      where: {
        id_organizacao_id_acao_modelo: {
          id_organizacao: idOrganizacao,
          id_acao_modelo: idAcaoModelo
        }
      },
      create: {
        id_organizacao: idOrganizacao,
        id_acao_modelo: idAcaoModelo,
        acao: dados.acao || null,
        responsavel: dados.responsavel || null,
        data_inicio: dados.data_inicio || null,
        data_termino: dados.data_termino || null,
        como_sera_feito: dados.como_sera_feito || null,
        recursos: dados.recursos || null,
        updated_at: new Date()
      },
      update: {
        acao: dados.acao !== undefined ? dados.acao : undefined,
        responsavel: dados.responsavel !== undefined ? dados.responsavel : undefined,
        data_inicio: dados.data_inicio !== undefined ? dados.data_inicio : undefined,
        data_termino: dados.data_termino !== undefined ? dados.data_termino : undefined,
        como_sera_feito: dados.como_sera_feito !== undefined ? dados.como_sera_feito : undefined,
        recursos: dados.recursos !== undefined ? dados.recursos : undefined,
        updated_at: new Date()
      }
    });
  }

  /**
   * Deleta uma ação editável (volta ao estado inicial do template)
   */
  async deleteAcao(idOrganizacao: number, idAcaoModelo: number): Promise<void> {
    await prisma.plano_gestao_acao.deleteMany({
      where: {
        id_organizacao: idOrganizacao,
        id_acao_modelo: idAcaoModelo
      }
    });
  }

  /**
   * Atualiza o relatório sintético do plano de gestão
   */
  async updateRelatorioSintetico(idOrganizacao: number, relatorio: string | null, userId: number): Promise<void> {
    const organizacao = await prisma.organizacao.findUnique({
      where: { id: idOrganizacao }
    });

    if (!organizacao) {
      throw new Error('Organização não encontrada');
    }

    await prisma.organizacao.update({
      where: { id: idOrganizacao },
      data: {
        plano_gestao_relatorio_sintetico: relatorio,
        plano_gestao_relatorio_sintetico_updated_by: userId,
        plano_gestao_relatorio_sintetico_updated_at: new Date()
      }
    });
  }

  /**
   * Cria um registro de evidência (arquivo) do plano de gestão
   */
  async uploadEvidencia(
    idOrganizacao: number,
    tipo: 'foto' | 'lista_presenca',
    nomeArquivo: string,
    caminhoArquivo: string,
    descricao: string | null,
    userId: number
  ): Promise<Evidencia> {
    // Verificar se organização existe
    const organizacao = await prisma.organizacao.findUnique({
      where: { id: idOrganizacao }
    });

    if (!organizacao) {
      throw new Error('Organização não encontrada');
    }

    const evidencia = await prisma.plano_gestao_evidencia.create({
      data: {
        id_organizacao: idOrganizacao,
        tipo: tipo,
        nome_arquivo: nomeArquivo,
        caminho_arquivo: caminhoArquivo,
        descricao: descricao,
        uploaded_by: userId
      },
      include: {
        users: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return {
      id: evidencia.id,
      id_organizacao: evidencia.id_organizacao,
      tipo: evidencia.tipo as 'foto' | 'lista_presenca',
      nome_arquivo: evidencia.nome_arquivo,
      caminho_arquivo: evidencia.caminho_arquivo,
      descricao: evidencia.descricao,
      uploaded_by: evidencia.uploaded_by,
      uploaded_by_name: evidencia.users?.name || null,
      created_at: evidencia.created_at,
      updated_at: evidencia.updated_at
    };
  }

  /**
   * Lista todas as evidências de uma organização
   */
  async listEvidencias(idOrganizacao: number): Promise<Evidencia[]> {
    const evidenciasRaw = await prisma.plano_gestao_evidencia.findMany({
      where: { id_organizacao: idOrganizacao },
      include: {
        users: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    return evidenciasRaw.map(ev => ({
      id: ev.id,
      id_organizacao: ev.id_organizacao,
      tipo: ev.tipo as 'foto' | 'lista_presenca',
      nome_arquivo: ev.nome_arquivo,
      caminho_arquivo: ev.caminho_arquivo,
      descricao: ev.descricao,
      uploaded_by: ev.uploaded_by,
      uploaded_by_name: ev.users?.name || null,
      created_at: ev.created_at,
      updated_at: ev.updated_at
    }));
  }

  /**
   * Deleta uma evidência e seu arquivo
   */
  async deleteEvidencia(idEvidencia: number): Promise<{ caminhoArquivo: string }> {
    const evidencia = await prisma.plano_gestao_evidencia.findUnique({
      where: { id: idEvidencia }
    });

    if (!evidencia) {
      throw new Error('Evidência não encontrada');
    }

    const caminhoArquivo = evidencia.caminho_arquivo;

    await prisma.plano_gestao_evidencia.delete({
      where: { id: idEvidencia }
    });

    return { caminhoArquivo };
  }
}

export default new PlanoGestaoService();

