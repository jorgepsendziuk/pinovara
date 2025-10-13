import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';
import { ArquivoODK, ArquivoSyncResult, ArquivoSyncDetail } from '../types/arquivoSync';

const prisma = new PrismaClient();
const UPLOAD_DIR = '/var/pinovara/shared/uploads/arquivos';

export const arquivoSyncService = {
  /**
   * Sincroniza arquivos do ODK para uma organização
   */
  async syncArquivosFromODK(organizacaoId: number, userEmail: string): Promise<ArquivoSyncResult> {
    const detalhes: ArquivoSyncDetail[] = [];
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

      // 2. Buscar arquivos do ODK via dblink
      console.log(`🔍 Buscando arquivos no ODK para organização ${organizacaoId}, URI: ${organizacao.uri}`);
      const arquivosODK = await this.getArquivosODK(organizacao.uri);
      console.log(`📊 Arquivos encontrados no ODK: ${arquivosODK.length}`);

      if (arquivosODK.length === 0) {
        return {
          success: true,
          total_odk: 0,
          ja_existentes: 0,
          baixadas: 0,
          erros: 0,
          detalhes: [],
          mensagem: 'Nenhum arquivo encontrado no ODK para esta organização'
        };
      }

      // 3. Garantir que o diretório existe
      await this.garantirDiretorioExiste();

      // 4. Processar cada arquivo
      for (const arquivo of arquivosODK) {
        try {
          console.log(`📄 Processando arquivo: ${arquivo.nome_arquivo}`);
          
          // Verificar se o arquivo já existe no disco
          const arquivoExiste = await this.verificarArquivoExiste(arquivo.nome_arquivo);
          
          if (arquivoExiste) {
            console.log(`✓ Arquivo já existe: ${arquivo.nome_arquivo}`);
            ja_existentes++;
            detalhes.push({
              uri: arquivo.uri,
              status: 'existente',
              nome_arquivo: arquivo.nome_arquivo,
              mensagem: 'Arquivo já existe no servidor'
            });
          } else {
            // Salvar arquivo
            await this.salvarBlobComoArquivo(arquivo.arquivo_blob, arquivo.nome_arquivo);
            console.log(`💾 Arquivo salvo: ${arquivo.nome_arquivo}`);
            baixadas++;
            detalhes.push({
              uri: arquivo.uri,
              status: 'baixada',
              nome_arquivo: arquivo.nome_arquivo,
              mensagem: `Arquivo baixado (${arquivo.tamanho_bytes} bytes)`
            });
          }
        } catch (error: any) {
          console.error(`❌ Erro ao processar arquivo ${arquivo.nome_arquivo}:`, error);
          erros++;
          detalhes.push({
            uri: arquivo.uri,
            status: 'erro',
            nome_arquivo: arquivo.nome_arquivo,
            mensagem: error.message
          });
        }
      }

      const resultado: ArquivoSyncResult = {
        success: true,
        total_odk: arquivosODK.length,
        ja_existentes,
        baixadas,
        erros,
        detalhes,
        mensagem: `Sincronização concluída: ${baixadas} baixados, ${ja_existentes} já existentes, ${erros} erros`
      };

      console.log(`✅ Sincronização concluída para ${organizacao.nome}:`, resultado);
      return resultado;

    } catch (error: any) {
      console.error('❌ Erro na sincronização de arquivos:', error);
      return {
        success: false,
        total_odk: 0,
        ja_existentes: 0,
        baixadas: 0,
        erros: 1,
        detalhes: [],
        mensagem: `Erro ao sincronizar arquivos: ${error.message}`
      };
    }
  },

  /**
   * Busca arquivos do ODK via dblink (tenta ORGANIZACAO_ primeiro, depois PINOVARA_)
   */
  async getArquivosODK(organizacaoUri: string | null): Promise<ArquivoODK[]> {
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
      console.log('🔍 Tentando buscar arquivos das tabelas ORGANIZACAO_...');
      let arquivos = await this.buscarArquivosTabela(connectionString, escapedUri, 'ORGANIZACAO');
      
      // Se não encontrou, tentar tabelas PINOVARA_ (versão antiga)
      if (arquivos.length === 0) {
        console.log('⚠️ Nenhum arquivo encontrado em ORGANIZACAO_, tentando PINOVARA_...');
        arquivos = await this.buscarArquivosTabela(connectionString, escapedUri, 'PINOVARA');
      }

      console.log(`📊 Total de arquivos encontrados: ${arquivos.length}`);
      return arquivos;

    } catch (error: any) {
      console.error('❌ Erro ao buscar arquivos do ODK:', error);
      throw new Error(`Erro ao conectar com banco ODK: ${error.message}`);
    }
  },

  /**
   * Busca arquivos de uma tabela específica (ORGANIZACAO ou PINOVARA)
   */
  async buscarArquivosTabela(connectionString: string, escapedUri: string, prefixo: 'ORGANIZACAO' | 'PINOVARA'): Promise<ArquivoODK[]> {
    const sqlQuery = `
      SELECT 
        a."_URI",
        a."_PARENT_AURI",
        bn."_CREATION_DATE",
        blb."VALUE",
        octet_length(blb."VALUE") as tamanho,
        bn."UNROOTED_FILE_PATH"
      FROM odk_prod."${prefixo}_FILE" a
      INNER JOIN odk_prod."${prefixo}_ARQUIVO_BN" bn ON bn."_PARENT_AURI" = a."_URI"
      INNER JOIN odk_prod."${prefixo}_ARQUIVO_REF" ref ON ref."_DOM_AURI" = bn."_URI"
      INNER JOIN odk_prod."${prefixo}_ARQUIVO_BLB" blb ON blb."_URI" = ref."_SUB_AURI"
      WHERE a."_PARENT_AURI" = ''${escapedUri}''
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
        arquivo_blob bytea,
        tamanho_bytes bigint,
        nome_arquivo varchar
      )
    `;

    try {
      const result = await prisma.$queryRawUnsafe(query) as any[];
      console.log(`   Tabela ${prefixo}_: ${result.length} arquivos encontrados`);

      return (result as any[]).map((row) => {
        // Usar nome do arquivo vindo do UNROOTED_FILE_PATH
        const nomeArquivo = row.nome_arquivo || `${new Date(row.creation_date).getTime()}.pdf`;
        
        return {
          uri: row.uri,
          parent_auri: row.parent_auri,
          grupo: null,
          arquivo_obs: null,
          creation_date: new Date(row.creation_date),
          arquivo_blob: row.arquivo_blob,
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
   * Salva blob como arquivo no disco
   */
  async salvarBlobComoArquivo(blob: Buffer, nomeOriginal: string): Promise<void> {
    const filePath = path.join(UPLOAD_DIR, nomeOriginal);
    
    // Garantir que o diretório existe
    await this.garantirDiretorioExiste();
    
    // Escrever arquivo
    await fs.writeFile(filePath, blob);
    console.log(`💾 Arquivo salvo: ${filePath}`);
  },

  /**
   * Verifica se arquivo já existe no disco
   */
  async verificarArquivoExiste(nomeArquivo: string): Promise<boolean> {
    try {
      const filePath = path.join(UPLOAD_DIR, nomeArquivo);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Garante que o diretório de upload existe
   */
  async garantirDiretorioExiste(): Promise<void> {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
      console.error('Erro ao criar diretório:', error);
      throw new Error('Não foi possível criar diretório de arquivos');
    }
  },

  /**
   * Lista arquivos disponíveis no ODK (sem baixar)
   */
  async listarArquivosDisponiveis(organizacaoId: number): Promise<ArquivoODK[]> {
    try {
      const organizacao = await prisma.organizacao.findUnique({
        where: { id: organizacaoId },
        select: { uri: true }
      });

      if (!organizacao) {
        return [];
      }

      return await this.getArquivosODK(organizacao.uri);
    } catch (error: any) {
      console.error('Erro ao listar arquivos disponíveis:', error);
      return [];
    }
  }
};
