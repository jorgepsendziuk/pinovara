"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fotoSyncService_1 = require("./fotoSyncService");
const arquivoSyncService_1 = require("./arquivoSyncService");
const prisma = new client_1.PrismaClient();
const odkSyncService = {
    /**
     * Sincroniza fotos e arquivos de todas as organizações
     */
    async syncAll() {
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
        const resultados = [];
        let totalFotos = 0;
        let totalArquivos = 0;
        let sucessos = 0;
        let erros = 0;
        let organizacoesComUuid = 0;
        console.log(`📊 Total de organizações: ${organizacoes.length}`);
        for (const org of organizacoes) {
            const resultado = {
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
                const resultadoFotos = await fotoSyncService_1.fotoSyncService.syncFotosFromODK(org.id, 'sistema');
                resultado.fotos_sincronizadas = resultadoFotos.baixadas || 0;
                totalFotos += resultadoFotos.baixadas || 0;
                if (resultadoFotos.baixadas && resultadoFotos.baixadas > 0) {
                    console.log(`   ✅ ${resultadoFotos.baixadas} fotos`);
                }
            }
            catch (error) {
                console.error(`   ❌ Erro ao sincronizar fotos: ${error.message}`);
                resultado.erro_fotos = error.message;
                erros++;
            }
            // Sincronizar ARQUIVOS
            try {
                console.log(`📄 #${org.id} - Sincronizando arquivos...`);
                const resultadoArquivos = await arquivoSyncService_1.arquivoSyncService.syncArquivosFromODK(org.id, 'sistema');
                resultado.arquivos_sincronizados = resultadoArquivos.baixadas || 0;
                totalArquivos += resultadoArquivos.baixadas || 0;
                if (resultadoArquivos.baixadas && resultadoArquivos.baixadas > 0) {
                    console.log(`   ✅ ${resultadoArquivos.baixadas} arquivos`);
                }
            }
            catch (error) {
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
        const resultado = {
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
    async getStats() {
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
exports.default = odkSyncService;
