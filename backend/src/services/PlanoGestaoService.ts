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
  adicionada?: boolean;
  suprimida?: boolean;
  tipo_plano?: string | null;
  grupo_plano?: string | null;
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
  adicionada: boolean;
  suprimida: boolean;
  tipo_plano?: string | null;
  grupo_plano?: string | null;
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
      if (acao.id_acao_modelo !== null && acao.id_acao_modelo !== undefined) {
        acoesEditadasMap.set(acao.id_acao_modelo, acao);
      }
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
        updated_at: editada?.updated_at || null,
        adicionada: Boolean((editada as any)?.adicionada),
        suprimida: Boolean((editada as any)?.suprimida),
        tipo_plano: (editada as any)?.tipo_plano ?? null,
        grupo_plano: (editada as any)?.grupo_plano ?? null
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
    
    const tituloPorTipo = new Map<string, string>();

    planosMap.forEach((grupos, tipo) => {
      const primeiraAcao = Array.from(grupos.values())[0][0];
      tituloPorTipo.set(tipo, primeiraAcao.titulo);
      
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

    // Adicionar ações personalizadas (sem modelo)
    const acoesPersonalizadas = acoesEditadas.filter(acao => {
      return Boolean((acao as any)?.adicionada) || acao.id_acao_modelo === null;
    });

    acoesPersonalizadas.forEach((acao, index) => {
      const tipo = (acao as any)?.tipo_plano || 'plano-personalizado';
      const grupo = (acao as any)?.grupo_plano || 'Ações Personalizadas';
      const tituloPlano = tituloPorTipo.get(tipo) || 'Plano Personalizado';

      const acaoCompleta: AcaoCompleta = {
        id: -acao.id, // Identificador negativo para distinguir das ações de modelo
        tipo,
        titulo: tituloPlano,
        grupo,
        acao_modelo: acao.acao || '',
        hint_como_sera_feito: null,
        hint_responsavel: null,
        hint_recursos: null,
        ordem: 1000 + index,
        ativo: true,
        id_acao_editavel: acao.id,
        acao: acao.acao || null,
        responsavel: acao.responsavel || null,
        data_inicio: acao.data_inicio || null,
        data_termino: acao.data_termino || null,
        como_sera_feito: acao.como_sera_feito || null,
        recursos: acao.recursos || null,
        created_at: acao.created_at || null,
        updated_at: acao.updated_at || null,
        adicionada: true,
        suprimida: Boolean(acao.suprimida),
        tipo_plano: (acao as any)?.tipo_plano || null,
        grupo_plano: (acao as any)?.grupo_plano || null
      };

      if (!planosMap.has(tipo)) {
        planosMap.set(tipo, new Map());
        tituloPorTipo.set(tipo, tituloPlano);
      }

      const grupos = planosMap.get(tipo)!;
      if (!grupos.has(grupo)) {
        grupos.set(grupo, []);
      }
      grupos.get(grupo)!.push(acaoCompleta);
    });

    // Reconstroi planos com ações personalizadas incluídas
    planos.splice(0, planos.length);
    planosMap.forEach((grupos, tipo) => {
      const tituloPlano = tituloPorTipo.get(tipo) || 'Plano Personalizado';
      const gruposArray: GrupoAcoes[] = [];
      grupos.forEach((acoes, nomeGrupo) => {
        gruposArray.push({
          nome: nomeGrupo,
          acoes: acoes
        });
      });
      planos.push({
        tipo,
        titulo: tituloPlano,
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
      suprimida?: boolean;
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
        suprimida: dados.suprimida ?? false,
        adicionada: false,
        updated_at: new Date()
      },
      update: {
        acao: dados.acao !== undefined ? dados.acao : undefined,
        responsavel: dados.responsavel !== undefined ? dados.responsavel : undefined,
        data_inicio: dados.data_inicio !== undefined ? dados.data_inicio : undefined,
        data_termino: dados.data_termino !== undefined ? dados.data_termino : undefined,
        como_sera_feito: dados.como_sera_feito !== undefined ? dados.como_sera_feito : undefined,
        recursos: dados.recursos !== undefined ? dados.recursos : undefined,
        suprimida: dados.suprimida !== undefined ? dados.suprimida : undefined,
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
   * Cria uma ação personalizada (sem modelo) para um grupo específico
   */
  async createAcaoPersonalizada(
    idOrganizacao: number,
    dados: {
      tipo: string;
      grupo: string | null;
      acao?: string | null;
      responsavel?: string | null;
      data_inicio?: Date | null;
      data_termino?: Date | null;
      como_sera_feito?: string | null;
      recursos?: string | null;
    }
  ): Promise<number> {
    const organizacao = await prisma.organizacao.findUnique({
      where: { id: idOrganizacao }
    });

    if (!organizacao) {
      throw new Error('Organização não encontrada');
    }

    const novaAcao = await prisma.plano_gestao_acao.create({
      data: {
        id_organizacao: idOrganizacao,
        id_acao_modelo: null,
        acao: dados.acao ?? null,
        responsavel: dados.responsavel ?? null,
        data_inicio: dados.data_inicio ?? null,
        data_termino: dados.data_termino ?? null,
        como_sera_feito: dados.como_sera_feito ?? null,
        recursos: dados.recursos ?? null,
        adicionada: true,
        suprimida: false,
        tipo_plano: dados.tipo,
        grupo_plano: dados.grupo,
        updated_at: new Date()
      }
    });

    return novaAcao.id;
  }

  /**
   * Atualiza ação personalizada existente
   */
  async updateAcaoPersonalizada(
    idOrganizacao: number,
    idAcao: number,
    dados: {
      acao?: string | null;
      responsavel?: string | null;
      data_inicio?: Date | null;
      data_termino?: Date | null;
      como_sera_feito?: string | null;
      recursos?: string | null;
      suprimida?: boolean;
    }
  ): Promise<void> {
    const acao = await prisma.plano_gestao_acao.findFirst({
      where: { id: idAcao, id_organizacao: idOrganizacao }
    });

    if (!acao) {
      throw new Error('Ação personalizada não encontrada');
    }

    await prisma.plano_gestao_acao.update({
      where: { id: idAcao },
      data: {
        acao: dados.acao !== undefined ? dados.acao : undefined,
        responsavel: dados.responsavel !== undefined ? dados.responsavel : undefined,
        data_inicio: dados.data_inicio !== undefined ? dados.data_inicio : undefined,
        data_termino: dados.data_termino !== undefined ? dados.data_termino : undefined,
        como_sera_feito: dados.como_sera_feito !== undefined ? dados.como_sera_feito : undefined,
        recursos: dados.recursos !== undefined ? dados.recursos : undefined,
        suprimida: dados.suprimida !== undefined ? dados.suprimida : undefined,
        updated_at: new Date()
      }
    });
  }

  /**
   * Remove definitivamente uma ação personalizada
   */
  async deleteAcaoPersonalizada(idOrganizacao: number, idAcao: number): Promise<void> {
    await prisma.plano_gestao_acao.deleteMany({
      where: {
        id: idAcao,
        id_organizacao: idOrganizacao,
        adicionada: true
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

