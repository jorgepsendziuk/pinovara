"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateIdTecnico = migrateIdTecnico;
const client_1 = require("@prisma/client");
const odkHelper_1 = require("../utils/odkHelper");
const prisma = new client_1.PrismaClient();
async function migrateIdTecnico() {
    const result = {
        totalProcessed: 0,
        totalVinculados: 0,
        totalNaoEncontrados: 0,
        totalJaVinculados: 0,
        detalhes: [],
    };
    try {
        console.log('🚀 Iniciando migração de id_tecnico...');
        const organizacoes = await prisma.organizacao.findMany({
            where: {
                OR: [
                    { id_tecnico: null },
                    { id_tecnico: { equals: null } }
                ],
                creator_uri_user: {
                    not: null
                }
            },
            select: {
                id: true,
                creator_uri_user: true,
                id_tecnico: true,
            }
        });
        console.log(`📊 Encontradas ${organizacoes.length} organizações para processar`);
        result.totalProcessed = organizacoes.length;
        for (const org of organizacoes) {
            if (org.id_tecnico) {
                result.totalJaVinculados++;
                result.detalhes.push({
                    organizacaoId: org.id,
                    creatorUri: org.creator_uri_user,
                    emailExtraido: null,
                    usuarioEncontrado: false,
                    motivo: 'Já possui id_tecnico'
                });
                continue;
            }
            const email = (0, odkHelper_1.extractEmailFromCreatorUri)(org.creator_uri_user);
            if (!email) {
                result.totalNaoEncontrados++;
                result.detalhes.push({
                    organizacaoId: org.id,
                    creatorUri: org.creator_uri_user,
                    emailExtraido: null,
                    usuarioEncontrado: false,
                    motivo: 'Não foi possível extrair email'
                });
                console.warn(`⚠️  Org ${org.id}: Não foi possível extrair email de "${org.creator_uri_user}"`);
                continue;
            }
            const usuario = await prisma.users.findUnique({
                where: { email: email.toLowerCase() },
                select: { id: true, email: true, name: true }
            });
            if (!usuario) {
                result.totalNaoEncontrados++;
                result.detalhes.push({
                    organizacaoId: org.id,
                    creatorUri: org.creator_uri_user,
                    emailExtraido: email,
                    usuarioEncontrado: false,
                    motivo: 'Usuário não encontrado no sistema'
                });
                console.warn(`⚠️  Org ${org.id}: Usuário não encontrado para email "${email}"`);
                continue;
            }
            try {
                await prisma.organizacao.update({
                    where: { id: org.id },
                    data: { id_tecnico: usuario.id }
                });
                result.totalVinculados++;
                result.detalhes.push({
                    organizacaoId: org.id,
                    creatorUri: org.creator_uri_user,
                    emailExtraido: email,
                    usuarioEncontrado: true,
                    userId: usuario.id,
                    motivo: `Vinculado com ${usuario.name} (${usuario.email})`
                });
                console.log(`✅ Org ${org.id}: Vinculada ao usuário ${usuario.name} (ID: ${usuario.id})`);
            }
            catch (error) {
                console.error(`❌ Erro ao atualizar Org ${org.id}:`, error);
                result.detalhes.push({
                    organizacaoId: org.id,
                    creatorUri: org.creator_uri_user,
                    emailExtraido: email,
                    usuarioEncontrado: true,
                    userId: usuario.id,
                    motivo: `Erro ao atualizar: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
                });
            }
        }
        console.log('\n📈 Resumo da Migração:');
        console.log(`   Total processado: ${result.totalProcessed}`);
        console.log(`   ✅ Vinculados: ${result.totalVinculados}`);
        console.log(`   ⏭️  Já vinculados: ${result.totalJaVinculados}`);
        console.log(`   ⚠️  Não encontrados: ${result.totalNaoEncontrados}`);
        return result;
    }
    catch (error) {
        console.error('❌ Erro durante migração:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
if (require.main === module) {
    migrateIdTecnico()
        .then((result) => {
        console.log('\n✨ Migração concluída com sucesso!');
        process.exit(0);
    })
        .catch((error) => {
        console.error('\n💥 Migração falhou:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=migrate-id-tecnico.js.map