"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assinaturaSyncService = void 0;
const client_1 = require("@prisma/client");
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const prisma = new client_1.PrismaClient();
const UPLOAD_DIR = '/var/pinovara/shared/uploads/assinaturas';
exports.assinaturaSyncService = {
    /**
     * Sincroniza assinaturas do ODK para uma organização
     */
    async syncAssinaturasFromODK(organizacaoId, userEmail) {
        const detalhes = [];
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
            // 2. Buscar assinaturas do ODK via dblink
            console.log(`🔍 Buscando assinaturas no ODK para organização ${organizacaoId}, URI: ${organizacao.uri}`);
            if (!organizacao.uri) {
                console.log('⚠️ Organização não tem URI (formulário pode ter sido criado manualmente)');
            }
            const assinaturasODK = await this.getAssinaturasODK(organizacao.uri);
            console.log(`📊 Assinaturas encontradas no ODK: ${assinaturasODK.length}`);
            if (assinaturasODK.length === 0) {
                return {
                    success: true,
                    total_odk: 0,
                    ja_existentes: 0,
                    baixadas: 0,
                    erros: 0,
                    detalhes: [],
                    mensagem: 'Nenhuma assinatura encontrada no ODK para esta organização'
                };
            }
            // 3. Processar cada assinatura
            for (const assinaturaODK of assinaturasODK) {
                try {
                    // Verificar se arquivo existe no disco
                    const caminhoCompleto = path_1.default.join(UPLOAD_DIR, assinaturaODK.nome_arquivo);
                    const arquivoExiste = await promises_1.default.access(caminhoCompleto)
                        .then(() => true)
                        .catch(() => false);
                    if (arquivoExiste) {
                        ja_existentes++;
                        detalhes.push({
                            uri: assinaturaODK.uri,
                            status: 'existente',
                            mensagem: 'Arquivo já existe na pasta',
                            nome_arquivo: assinaturaODK.nome_arquivo,
                            tipo: assinaturaODK.tipo
                        });
                        continue;
                    }
                    // Salvar BLOB como arquivo
                    await this.salvarBlobComoArquivo(assinaturaODK.assinatura_blob, assinaturaODK.nome_arquivo);
                    baixadas++;
                    detalhes.push({
                        uri: assinaturaODK.uri,
                        status: 'baixada',
                        mensagem: 'Assinatura baixada com sucesso',
                        nome_arquivo: assinaturaODK.nome_arquivo,
                        tipo: assinaturaODK.tipo
                    });
                }
                catch (error) {
                    erros++;
                    detalhes.push({
                        uri: assinaturaODK.uri,
                        status: 'erro',
                        mensagem: error.message,
                        nome_arquivo: assinaturaODK.nome_arquivo,
                        tipo: assinaturaODK.tipo
                    });
                }
            }
            return {
                success: erros === 0,
                total_odk: assinaturasODK.length,
                ja_existentes,
                baixadas,
                erros,
                detalhes,
                mensagem: `Sincronização concluída: ${baixadas} assinaturas baixadas, ${ja_existentes} já existiam, ${erros} erros`
            };
        }
        catch (error) {
            console.error('Erro na sincronização:', error);
            throw new Error(`Erro ao sincronizar assinaturas do ODK: ${error.message}`);
        }
    },
    /**
     * Busca assinaturas do ODK via dblink
     */
    async getAssinaturasODK(organizacaoUri) {
        if (!organizacaoUri) {
            return [];
        }
        try {
            // Buscar connection string do banco
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
            // Buscar assinaturas do responsável legal
            console.log('🔍 Buscando assinaturas do responsável legal...');
            const assinaturasResponsavel = await this.buscarAssinaturasResponsavel(connectionString, escapedUri);
            // Buscar assinaturas dos participantes
            console.log('🔍 Buscando assinaturas dos participantes...');
            const assinaturasParticipantes = await this.buscarAssinaturasParticipantes(connectionString, escapedUri);
            const todasAssinaturas = [...assinaturasResponsavel, ...assinaturasParticipantes];
            console.log(`📊 Total de assinaturas encontradas: ${todasAssinaturas.length}`);
            return todasAssinaturas;
        }
        catch (error) {
            console.error('Erro ao buscar assinaturas do ODK:', error);
            throw new Error(`Erro ao conectar com banco ODK: ${error.message}`);
        }
    },
    /**
     * Busca assinaturas do responsável legal
     */
    async buscarAssinaturasResponsavel(connectionString, escapedUri) {
        const sqlQuery = `
      SELECT 
        blb."_URI",
        blb."_CREATION_DATE",
        blb."VALUE",
        octet_length(blb."VALUE") as tamanho,
        bn."UNROOTED_FILE_PATH"
      FROM odk_prod."ORGANIZACAO_ASSINATURA_RESP_LEGAL_BLB" blb
      INNER JOIN odk_prod."ORGANIZACAO_ASSINATURA_RESP_LEGAL_BN" bn ON bn."_URI" = blb."_URI"
      INNER JOIN odk_prod."ORGANIZACAO_ASSINATURA_RESP_LEGAL_REF" ref ON ref."_SUB_AURI" = blb."_URI"
      WHERE ref."_DOM_AURI" = ''${escapedUri}''
        AND blb."VALUE" IS NOT NULL
        AND octet_length(blb."VALUE") > 0
    `.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        const query = `
      SELECT * FROM public.dblink(
        '${connectionString}'::text,
        '${sqlQuery}'::text
      ) AS t(
        uri varchar,
        creation_date timestamp,
        assinatura_blob bytea,
        tamanho_bytes bigint,
        nome_arquivo varchar
      )
    `;
        try {
            const result = await prisma.$queryRawUnsafe(query);
            console.log(`   Responsável Legal: ${result.length} assinaturas encontradas`);
            return result.map((row) => {
                const nomeArquivo = row.nome_arquivo || `responsavel_legal_${new Date(row.creation_date).getTime()}.png`;
                return {
                    uri: row.uri,
                    parent_auri: '',
                    creation_date: new Date(row.creation_date),
                    assinatura_blob: row.assinatura_blob,
                    tamanho_bytes: parseInt(row.tamanho_bytes),
                    nome_arquivo: nomeArquivo,
                    tipo: 'responsavel'
                };
            });
        }
        catch (error) {
            console.error(`   Responsável Legal: ${error.message}`);
            return [];
        }
    },
    /**
     * Busca assinaturas dos participantes
     */
    async buscarAssinaturasParticipantes(connectionString, escapedUri) {
        const sqlQuery = `
      SELECT 
        blb."_URI",
        blb."_CREATION_DATE",
        blb."VALUE",
        octet_length(blb."VALUE") as tamanho,
        bn."UNROOTED_FILE_PATH",
        p."PARTICIPANTE_NOME"
      FROM odk_prod."ORGANIZACAO_PARTICIPANTE_ASSINATURA_BLB" blb
      INNER JOIN odk_prod."ORGANIZACAO_PARTICIPANTE_ASSINATURA_BN" bn ON bn."_URI" = blb."_URI"
      INNER JOIN odk_prod."ORGANIZACAO_PARTICIPANTE_ASSINATURA_REF" ref ON ref."_SUB_AURI" = blb."_URI"
      INNER JOIN odk_prod."ORGANIZACAO_PARTICIPANTES" p ON p."_URI" = ref."_DOM_AURI"
      WHERE p."_PARENT_AURI" = ''${escapedUri}''
        AND blb."VALUE" IS NOT NULL
        AND octet_length(blb."VALUE") > 0
    `.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
        const query = `
      SELECT * FROM public.dblink(
        '${connectionString}'::text,
        '${sqlQuery}'::text
      ) AS t(
        uri varchar,
        creation_date timestamp,
        assinatura_blob bytea,
        tamanho_bytes bigint,
        nome_arquivo varchar,
        participante_nome varchar
      )
    `;
        try {
            const result = await prisma.$queryRawUnsafe(query);
            console.log(`   Participantes: ${result.length} assinaturas encontradas`);
            return result.map((row) => {
                const participanteNome = row.participante_nome || 'Participante';
                const nomeArquivo = row.nome_arquivo || `participante_${participanteNome.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date(row.creation_date).getTime()}.png`;
                return {
                    uri: row.uri,
                    parent_auri: '',
                    creation_date: new Date(row.creation_date),
                    assinatura_blob: row.assinatura_blob,
                    tamanho_bytes: parseInt(row.tamanho_bytes),
                    nome_arquivo: nomeArquivo,
                    tipo: 'participante',
                    participante_nome: participanteNome
                };
            });
        }
        catch (error) {
            console.error(`   Participantes: ${error.message}`);
            return [];
        }
    },
    /**
     * Salva BLOB como arquivo no disco
     */
    async salvarBlobComoArquivo(blob, nomeOriginal) {
        try {
            // Garantir que diretório existe
            await promises_1.default.mkdir(UPLOAD_DIR, { recursive: true });
            const nomeArquivo = nomeOriginal;
            const caminhoCompleto = path_1.default.join(UPLOAD_DIR, nomeArquivo);
            // Salvar arquivo
            await promises_1.default.writeFile(caminhoCompleto, blob);
            return nomeArquivo;
        }
        catch (error) {
            console.error('Erro ao salvar arquivo:', error);
            throw new Error(`Erro ao salvar assinatura: ${error.message}`);
        }
    },
    /**
     * Lista assinaturas disponíveis no ODK (sem baixar)
     */
    async listarAssinaturasDisponiveis(organizacaoId) {
        try {
            const organizacao = await prisma.organizacao.findUnique({
                where: { id: organizacaoId },
                select: { uri: true }
            });
            if (!organizacao?.uri) {
                return {
                    total: 0,
                    assinaturas: [],
                    mensagem: 'Organização sem URI do ODK'
                };
            }
            const assinaturasODK = await this.getAssinaturasODK(organizacao.uri);
            // Verificar quais arquivos já existem no disco
            const assinaturasComStatus = await Promise.all(assinaturasODK.map(async (assinatura) => {
                const caminhoCompleto = path_1.default.join(UPLOAD_DIR, assinatura.nome_arquivo);
                const arquivoExiste = await promises_1.default.access(caminhoCompleto)
                    .then(() => true)
                    .catch(() => false);
                return {
                    uri: assinatura.uri,
                    tipo: assinatura.tipo,
                    participante_nome: assinatura.participante_nome,
                    nome_arquivo: assinatura.nome_arquivo,
                    creation_date: assinatura.creation_date,
                    tamanho_mb: (assinatura.tamanho_bytes / 1024 / 1024).toFixed(2),
                    ja_sincronizada: arquivoExiste
                };
            }));
            const naoCincronizadas = assinaturasComStatus.filter(a => !a.ja_sincronizada);
            return {
                total: assinaturasODK.length,
                ja_sincronizadas: assinaturasODK.length - naoCincronizadas.length,
                disponiveis: naoCincronizadas.length,
                assinaturas: assinaturasComStatus
            };
        }
        catch (error) {
            console.error('Erro ao listar assinaturas ODK:', error);
            throw new Error(`Erro ao listar assinaturas disponíveis: ${error.message}`);
        }
    }
};
