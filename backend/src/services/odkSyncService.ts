import { PrismaClient } from '@prisma/client';
import { fotoSyncService } from './fotoSyncService';
import { arquivoSyncService } from './arquivoSyncService';

const prisma = new PrismaClient();

interface SyncResult {
  id_organizacao: number;
  nome: string;
  uri: string | null;
  fotos_sincronizadas: number;
  arquivos_sincronizados: number;
  erro_fotos?: string;
  erro_arquivos?: string;
}

interface SyncAllResult {
  total_organizacoes: number;
  organizacoes_com_uuid: number;
  organizacoes_sem_uuid: number;
  total_fotos: number;
  total_arquivos: number;
  sucessos: number;
  erros: number;
  resultados: SyncResult[];
}

const odkSyncService = {
  /**
   * Sincroniza fotos e arquivos de todas as organizações
   */
  async syncAll(): Promise<SyncAllResult> {
    console.log('🔄 Iniciando sincronização em massa...');

    // Buscar todas as organizações
    const organizacoes = await prisma.organizacao.findMany({
      select: {
        id: true,
        nome: true,
        uri: true,
      },
      orderBy: {
        id: 'asc',
      },
    });

    const resultados: SyncResult[] = [];
    let totalFotos = 0;
    let totalArquivos = 0;
    let sucessos = 0;
    let erros = 0;
    let organizacoesComUuid = 0;

    console.log(`📊 Total de organizações: ${organizacoes.length}`);

    for (const org of organizacoes) {
      const resultado: SyncResult = {
        id_organizacao: org.id,
        nome: org.nome || `Organização ${org.id}`,
        uri: org.uri,
        fotos_sincronizadas: 0,
        arquivos_sincronizados: 0,
      };

      // Pular se não tiver URI (UUID)
      if (!org.uri) {
        console.log(`⏭️  #${org.id} - Sem URI, pulando...`);
        resultado.erro_fotos = 'Sem URI';
        resultado.erro_arquivos = 'Sem URI';
        resultados.push(resultado);
        continue;
      }

      organizacoesComUuid++;

      // Sincronizar FOTOS
      try {
        console.log(`📸 #${org.id} - Sincronizando fotos...`);
        const resultadoFotos = await fotoSyncService.syncFotosFromODK(org.id, 'sistema');
        resultado.fotos_sincronizadas = resultadoFotos.baixadas || 0;
        totalFotos += resultadoFotos.baixadas || 0;
        
        if (resultadoFotos.baixadas && resultadoFotos.baixadas > 0) {
          console.log(`   ✅ ${resultadoFotos.baixadas} fotos`);
        }
      } catch (error: any) {
        console.error(`   ❌ Erro ao sincronizar fotos: ${error.message}`);
        resultado.erro_fotos = error.message;
        erros++;
      }

      // Sincronizar ARQUIVOS
      try {
        console.log(`📄 #${org.id} - Sincronizando arquivos...`);
        const resultadoArquivos = await arquivoSyncService.syncArquivosFromODK(org.id, 'sistema');
        resultado.arquivos_sincronizados = resultadoArquivos.baixadas || 0;
        totalArquivos += resultadoArquivos.baixadas || 0;
        
        if (resultadoArquivos.baixadas && resultadoArquivos.baixadas > 0) {
          console.log(`   ✅ ${resultadoArquivos.baixadas} arquivos`);
        }
      } catch (error: any) {
        console.error(`   ❌ Erro ao sincronizar arquivos: ${error.message}`);
        resultado.erro_arquivos = error.message;
        erros++;
      }

      // Contabilizar sucesso se pelo menos um tipo foi sincronizado
      if (resultado.fotos_sincronizadas > 0 || resultado.arquivos_sincronizados > 0) {
        sucessos++;
      }

      resultados.push(resultado);
    }

    const resultado: SyncAllResult = {
      total_organizacoes: organizacoes.length,
      organizacoes_com_uuid: organizacoesComUuid,
      organizacoes_sem_uuid: organizacoes.length - organizacoesComUuid,
      total_fotos: totalFotos,
      total_arquivos: totalArquivos,
      sucessos,
      erros,
      resultados,
    };

    console.log('\n📊 Resumo da Sincronização:');
    console.log(`   Total de organizações: ${resultado.total_organizacoes}`);
    console.log(`   Com UUID: ${resultado.organizacoes_com_uuid}`);
    console.log(`   Sem UUID: ${resultado.organizacoes_sem_uuid}`);
    console.log(`   Total de fotos: ${resultado.total_fotos}`);
    console.log(`   Total de arquivos: ${resultado.total_arquivos}`);
    console.log(`   Sucessos: ${resultado.sucessos}`);
    console.log(`   Erros: ${resultado.erros}`);

    return resultado;
  },

  /**
   * Verifica estatísticas de fotos/arquivos sem sincronizar
   */
  async getStats(): Promise<{
    total_organizacoes: number;
    com_uuid: number;
    sem_uuid: number;
    com_fotos_local: number;
    com_arquivos_local: number;
    sem_fotos_local: number;
    sem_arquivos_local: number;
  }> {
    const totalOrganizacoes = await prisma.organizacao.count();
    
    const comUuid = await prisma.organizacao.count({
      where: {
        uri: {
          not: null,
        },
      },
    });

    const comFotosLocal = await prisma.organizacao.count({
      where: {
        organizacao_foto: {
          some: {},
        },
      },
    });

    const comArquivosLocal = await prisma.organizacao.count({
      where: {
        organizacao_arquivo: {
          some: {},
        },
      },
    });

    return {
      total_organizacoes: totalOrganizacoes,
      com_uuid: comUuid,
      sem_uuid: totalOrganizacoes - comUuid,
      com_fotos_local: comFotosLocal,
      com_arquivos_local: comArquivosLocal,
      sem_fotos_local: totalOrganizacoes - comFotosLocal,
      sem_arquivos_local: totalOrganizacoes - comArquivosLocal,
    };
  },
};

export default odkSyncService;

