import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { FotoODK, SyncResult, SyncDetail } from '../types/fotoSync';

const prisma = new PrismaClient();
const UPLOAD_DIR = '/var/pinovara/shared/uploads/fotos';

export const fotoSyncService = {
  /**
   * Sincroniza fotos do ODK para uma organização
   */
  async syncFotosFromODK(organizacaoId: number, userEmail: string): Promise<SyncResult> {
    const detalhes: SyncDetail[] = [];
    let baixadas = 0;
    let erros = 0;
    let ja_existentes = 0;

    try {
      // 1. Buscar organização e obter URI
      const organizacao = await prisma.organizacao.findUnique({
        where: { id: organizacaoId },
        select: { uri: true, nome: true }
      });

      if (!organizacao) {
        return {
          success: false,
          total_odk: 0,
          ja_existentes: 0,
          baixadas: 0,
          erros: 1,
          detalhes: [],
          mensagem: 'Organização não encontrada'
        };
      }

      // 2. Buscar fotos do ODK via dblink
      console.log(`🔍 Buscando fotos no ODK para organização ${organizacaoId}, URI: ${organizacao.uri}`);
      
      // Adicionar log de debug detalhado
      if (!organizacao.uri) {
        console.log('⚠️ Organização não tem URI (formulário pode ter sido criado manualmente)');
      }
      
      const fotosODK = await this.getFotosODK(organizacao.uri);
      console.log(`📊 Fotos encontradas no ODK: ${fotosODK.length}`);

      if (fotosODK.length === 0) {
        return {
          success: true,
          total_odk: 0,
          ja_existentes: 0,
          baixadas: 0,
          erros: 0,
          detalhes: [],
          mensagem: 'Nenhuma foto encontrada no ODK para esta organização'
        };
      }

      // 3. Processar cada foto
      for (const fotoODK of fotosODK) {
        try {
          // Verificar se arquivo existe no disco (não no banco)
          const caminhoCompleto = path.join(UPLOAD_DIR, fotoODK.nome_arquivo);
          const arquivoExiste = await fs.access(caminhoCompleto)
            .then(() => true)
            .catch(() => false);

          if (arquivoExiste) {
            ja_existentes++;
            detalhes.push({
              uri: fotoODK.uri,
              status: 'existente',
              mensagem: 'Arquivo já existe na pasta',
              nome_arquivo: fotoODK.nome_arquivo
            });
            continue;
          }

          // Salvar BLOB como arquivo (usando nome original do ODK)
          await this.salvarBlobComoArquivo(
            fotoODK.foto_blob,
            fotoODK.nome_arquivo
          );

          baixadas++;
          detalhes.push({
            uri: fotoODK.uri,
            status: 'baixada',
            mensagem: 'Foto baixada com sucesso',
            nome_arquivo: fotoODK.nome_arquivo
          });

        } catch (error: any) {
          erros++;
          detalhes.push({
            uri: fotoODK.uri,
            status: 'erro',
            mensagem: error.message
          });
        }
      }

      return {
        success: erros === 0,
        total_odk: fotosODK.length,
        ja_existentes,
        baixadas,
        erros,
        detalhes,
        mensagem: `Sincronização concluída: ${baixadas} fotos baixadas, ${ja_existentes} já existiam, ${erros} erros`
      };

    } catch (error: any) {
      console.error('Erro na sincronização:', error);
      throw new Error(`Erro ao sincronizar fotos do ODK: ${error.message}`);
    }
  },

  /**
   * Busca fotos do ODK via dblink (tenta ORGANIZACAO_ primeiro, depois PINOVARA_)
   */
  async getFotosODK(organizacaoUri: string | null): Promise<FotoODK[]> {
    if (!organizacaoUri) {
      return [];
    }

    try {
      // Buscar connection string do banco
      const connResult = await prisma.$queryRaw<Array<{ conn_string: string }>>`
        SELECT 
          format('host=%s port=%s dbname=%s user=%s password=%s',
            host, port, database, username, password) as conn_string
        FROM pinovara.db_connections
        WHERE name = 'odk_prod' AND active = true
        LIMIT 1
      `;

      if (!connResult || connResult.length === 0) {
        throw new Error('Configuração de conexão ODK não encontrada');
      }

      const connectionString = connResult[0].conn_string;
      const escapedUri = organizacaoUri.replace(/'/g, "''");

      // Tentar buscar das tabelas ORGANIZACAO_ (versão nova)
      console.log('🔍 Tentando buscar fotos das tabelas ORGANIZACAO_...');
      let fotos = await this.buscarFotosTabela(connectionString, escapedUri, 'ORGANIZACAO');
      
      // Se não encontrou, tentar tabelas PINOVARA_ (versão antiga)
      if (fotos.length === 0) {
        console.log('⚠️ Nenhuma foto encontrada em ORGANIZACAO_, tentando PINOVARA_...');
        fotos = await this.buscarFotosTabela(connectionString, escapedUri, 'PINOVARA');
      }

      console.log(`📊 Total de fotos encontradas: ${fotos.length}`);
      return fotos;

    } catch (error: any) {
      console.error('Erro ao buscar fotos do ODK:', error);
      throw new Error(`Erro ao conectar com banco ODK: ${error.message}`);
    }
  },

  /**
   * Busca fotos de uma tabela específica (ORGANIZACAO ou PINOVARA)
   */
  async buscarFotosTabela(connectionString: string, escapedUri: string, prefixo: 'ORGANIZACAO' | 'PINOVARA'): Promise<FotoODK[]> {
    const sqlQuery = `
      SELECT 
        f."_URI",
        f."_PARENT_AURI",
        bn."_CREATION_DATE",
        blb."VALUE",
        octet_length(blb."VALUE") as tamanho,
        bn."UNROOTED_FILE_PATH"
      FROM odk_prod."${prefixo}_FOTOS" f
      INNER JOIN odk_prod."${prefixo}_FOTO_BN" bn ON bn."_PARENT_AURI" = f."_URI"
      INNER JOIN odk_prod."${prefixo}_FOTO_REF" ref ON ref."_DOM_AURI" = bn."_URI"
      INNER JOIN odk_prod."${prefixo}_FOTO_BLB" blb ON blb."_URI" = ref."_SUB_AURI"
      WHERE f."_PARENT_AURI" = ''${escapedUri}''
        AND blb."VALUE" IS NOT NULL
        AND octet_length(blb."VALUE") > 0
    `.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

    const query = `
      SELECT * FROM public.dblink(
        '${connectionString}'::text,
        '${sqlQuery}'::text
      ) AS t(
        uri varchar,
        parent_auri varchar,
        creation_date timestamp,
        foto_blob bytea,
        tamanho_bytes bigint,
        nome_arquivo varchar
      )
    `;

    try {
      const result = await prisma.$queryRawUnsafe(query) as any[];
      console.log(`   Tabela ${prefixo}_: ${result.length} fotos encontradas`);

      return result.map((row) => {
        // Usar nome do arquivo vindo do UNROOTED_FILE_PATH
        const nomeArquivo = row.nome_arquivo || `${new Date(row.creation_date).getTime()}.jpg`;
        
        return {
          uri: row.uri,
          parent_auri: row.parent_auri,
          grupo: null,
          foto_obs: null,
          creation_date: new Date(row.creation_date),
          foto_blob: row.foto_blob,
          tamanho_bytes: parseInt(row.tamanho_bytes),
          nome_arquivo: nomeArquivo
        };
      });
    } catch (error: any) {
      console.error(`   Tabela ${prefixo}_: ${error.message}`);
      return [];
    }
  },

  /**
   * Salva BLOB como arquivo no disco
   */
  async salvarBlobComoArquivo(
    blob: Buffer,
    nomeOriginal: string
  ): Promise<string> {
    try {
      // Garantir que diretório existe
      await fs.mkdir(UPLOAD_DIR, { recursive: true });

      // Usar nome original do ODK (já vem correto)
      const nomeArquivo = nomeOriginal;
      const caminhoCompleto = path.join(UPLOAD_DIR, nomeArquivo);

      // Salvar arquivo
      await fs.writeFile(caminhoCompleto, blob);

      return nomeArquivo;

    } catch (error: any) {
      console.error('Erro ao salvar arquivo:', error);
      throw new Error(`Erro ao salvar foto: ${error.message}`);
    }
  },

  /**
   * Lista fotos disponíveis no ODK (sem baixar)
   */
  async listarFotosDisponiveis(organizacaoId: number) {
    try {
      const organizacao = await prisma.organizacao.findUnique({
        where: { id: organizacaoId },
        select: { uri: true }
      });

      if (!organizacao?.uri) {
        return {
          total: 0,
          fotos: [],
          mensagem: 'Organização sem URI do ODK'
        };
      }

      const fotosODK = await this.getFotosODK(organizacao.uri);

      // Verificar quais arquivos já existem no disco
      const fotosComStatus = await Promise.all(
        fotosODK.map(async (foto) => {
          const caminhoCompleto = path.join(UPLOAD_DIR, foto.nome_arquivo);
          const arquivoExiste = await fs.access(caminhoCompleto)
            .then(() => true)
            .catch(() => false);

          return {
            uri: foto.uri,
            grupo: foto.grupo,
            obs: foto.foto_obs,
            nome_arquivo: foto.nome_arquivo,
            creation_date: foto.creation_date,
            tamanho_mb: (foto.tamanho_bytes / 1024 / 1024).toFixed(2),
            ja_sincronizada: arquivoExiste
          };
        })
      );

      const naoCincronizadas = fotosComStatus.filter(f => !f.ja_sincronizada);

      return {
        total: fotosODK.length,
        ja_sincronizadas: fotosODK.length - naoCincronizadas.length,
        disponiveis: naoCincronizadas.length,
        fotos: fotosComStatus
      };

    } catch (error: any) {
      console.error('Erro ao listar fotos ODK:', error);
      throw new Error(`Erro ao listar fotos disponíveis: ${error.message}`);
    }
  }
};

