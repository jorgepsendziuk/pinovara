"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fotoSyncService = void 0;
const client_1 = require("@prisma/client");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const UPLOAD_DIR = '/var/pinovara/shared/uploads/fotos';
exports.fotoSyncService = {
    async syncFotosFromODK(organizacaoId, userEmail) {
        const detalhes = [];
        let baixadas = 0;
        let erros = 0;
        let ja_existentes = 0;
        try {
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
            console.log(`🔍 Buscando fotos no ODK para organização ${organizacaoId}, URI: ${organizacao.uri}`);
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
            for (const fotoODK of fotosODK) {
                try {
                    const caminhoCompleto = path_1.default.join(UPLOAD_DIR, fotoODK.nome_arquivo);
                    const arquivoExiste = await promises_1.default.access(caminhoCompleto)
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
                    await this.salvarBlobComoArquivo(fotoODK.foto_blob, fotoODK.nome_arquivo);
                    baixadas++;
                    detalhes.push({
                        uri: fotoODK.uri,
                        status: 'baixada',
                        mensagem: 'Foto baixada com sucesso',
                        nome_arquivo: fotoODK.nome_arquivo
                    });
                }
                catch (error) {
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
        }
        catch (error) {
            console.error('Erro na sincronização:', error);
            throw new Error(`Erro ao sincronizar fotos do ODK: ${error.message}`);
        }
    },
    async getFotosODK(organizacaoUri) {
        if (!organizacaoUri) {
            return [];
        }
        try {
            const connResult = await prisma.$queryRaw `
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
            console.log('🔍 Tentando buscar fotos das tabelas ORGANIZACAO_...');
            let fotos = await this.buscarFotosTabela(connectionString, escapedUri, 'ORGANIZACAO');
            if (fotos.length === 0) {
                console.log('⚠️ Nenhuma foto encontrada em ORGANIZACAO_, tentando PINOVARA_...');
                fotos = await this.buscarFotosTabela(connectionString, escapedUri, 'PINOVARA');
            }
            console.log(`📊 Total de fotos encontradas: ${fotos.length}`);
            return fotos;
        }
        catch (error) {
            console.error('Erro ao buscar fotos do ODK:', error);
            throw new Error(`Erro ao conectar com banco ODK: ${error.message}`);
        }
    },
    async buscarFotosTabela(connectionString, escapedUri, prefixo) {
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
            const result = await prisma.$queryRawUnsafe(query);
            console.log(`   Tabela ${prefixo}_: ${result.length} fotos encontradas`);
            return result.map((row) => {
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
        }
        catch (error) {
            console.error(`   Tabela ${prefixo}_: ${error.message}`);
            return [];
        }
    },
    async salvarBlobComoArquivo(blob, nomeOriginal) {
        try {
            await promises_1.default.mkdir(UPLOAD_DIR, { recursive: true });
            const nomeArquivo = nomeOriginal;
            const caminhoCompleto = path_1.default.join(UPLOAD_DIR, nomeArquivo);
            await promises_1.default.writeFile(caminhoCompleto, blob);
            return nomeArquivo;
        }
        catch (error) {
            console.error('Erro ao salvar arquivo:', error);
            throw new Error(`Erro ao salvar foto: ${error.message}`);
        }
    },
    async listarFotosDisponiveis(organizacaoId) {
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
            const fotosComStatus = await Promise.all(fotosODK.map(async (foto) => {
                const caminhoCompleto = path_1.default.join(UPLOAD_DIR, foto.nome_arquivo);
                const arquivoExiste = await promises_1.default.access(caminhoCompleto)
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
            }));
            const naoCincronizadas = fotosComStatus.filter(f => !f.ja_sincronizada);
            return {
                total: fotosODK.length,
                ja_sincronizadas: fotosODK.length - naoCincronizadas.length,
                disponiveis: naoCincronizadas.length,
                fotos: fotosComStatus
            };
        }
        catch (error) {
            console.error('Erro ao listar fotos ODK:', error);
            throw new Error(`Erro ao listar fotos disponíveis: ${error.message}`);
        }
    }
};
//# sourceMappingURL=fotoSyncService.js.map