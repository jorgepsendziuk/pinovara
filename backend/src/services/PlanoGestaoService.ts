import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AcaoModeloData {
  id: number;
  tipo: string;
  titulo: string;
  grupo: string | null;
  acao: string;
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

export interface PlanoGestaoResponse {
  plano_gestao_rascunho: string | null;
  plano_gestao_rascunho_updated_by: number | null;
  plano_gestao_rascunho_updated_at: Date | null;
  plano_gestao_rascunho_updated_by_name?: string | null;
  planos: PlanoGestaoCompleto[];
}

class PlanoGestaoService {
  /**
   * Busca o plano de gestão completo para uma organização
   * Mescla dados do template com dados editados (se existirem)
   */
  async getPlanoGestao(idOrganizacao: number): Promise<PlanoGestaoResponse> {
    // Buscar rascunho da organização com informações do usuário
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
        acao: modelo.acao,
        hint_como_sera_feito: modelo.hint_como_sera_feito,
        hint_responsavel: modelo.hint_responsavel,
        hint_recursos: modelo.hint_recursos,
        ordem: modelo.ordem,
        ativo: modelo.ativo,
        
        // Dados editáveis (do modelo ou da edição)
        id_acao_editavel: editada?.id,
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

    return {
      plano_gestao_rascunho: organizacao.plano_gestao_rascunho,
      plano_gestao_rascunho_updated_by: organizacao.plano_gestao_rascunho_updated_by,
      plano_gestao_rascunho_updated_at: organizacao.plano_gestao_rascunho_updated_at,
      plano_gestao_rascunho_updated_by_name: organizacao.users_organizacao_plano_gestao_rascunho_updated_byTousers?.name || null,
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
        responsavel: dados.responsavel || null,
        data_inicio: dados.data_inicio || null,
        data_termino: dados.data_termino || null,
        como_sera_feito: dados.como_sera_feito || null,
        recursos: dados.recursos || null,
        updated_at: new Date()
      },
      update: {
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
}

export default new PlanoGestaoService();

