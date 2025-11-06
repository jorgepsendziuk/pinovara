"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PlanoGestaoService {
    async getPlanoGestao(idOrganizacao) {
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
        const acoesModelo = await prisma.plano_gestao_acao_modelo.findMany({
            where: { ativo: true },
            orderBy: { ordem: 'asc' }
        });
        console.log('📊 Total de ações modelo encontradas:', acoesModelo.length);
        const acoesEditadas = await prisma.plano_gestao_acao.findMany({
            where: { id_organizacao: idOrganizacao }
        });
        const acoesEditadasMap = new Map();
        acoesEditadas.forEach(acao => {
            acoesEditadasMap.set(acao.id_acao_modelo, acao);
        });
        const acoesCompletas = acoesModelo.map(modelo => {
            const editada = acoesEditadasMap.get(modelo.id);
            return {
                id: modelo.id,
                tipo: modelo.tipo,
                titulo: modelo.titulo,
                grupo: modelo.grupo,
                acao_modelo: modelo.acao,
                hint_como_sera_feito: modelo.hint_como_sera_feito,
                hint_responsavel: modelo.hint_responsavel,
                hint_recursos: modelo.hint_recursos,
                ordem: modelo.ordem,
                ativo: modelo.ativo,
                id_acao_editavel: editada?.id,
                acao: editada?.acao || null,
                responsavel: editada?.responsavel || null,
                data_inicio: editada?.data_inicio || null,
                data_termino: editada?.data_termino || null,
                como_sera_feito: editada?.como_sera_feito || null,
                recursos: editada?.recursos || null,
                created_at: editada?.created_at || null,
                updated_at: editada?.updated_at || null
            };
        });
        const planosMap = new Map();
        acoesCompletas.forEach(acao => {
            if (!planosMap.has(acao.tipo)) {
                planosMap.set(acao.tipo, new Map());
            }
            const grupos = planosMap.get(acao.tipo);
            if (!grupos.has(acao.grupo)) {
                grupos.set(acao.grupo, []);
            }
            grupos.get(acao.grupo).push(acao);
        });
        const planos = [];
        planosMap.forEach((grupos, tipo) => {
            const primeiraAcao = Array.from(grupos.values())[0][0];
            const gruposArray = [];
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
        const evidencias = evidenciasRaw.map(ev => ({
            id: ev.id,
            id_organizacao: ev.id_organizacao,
            tipo: ev.tipo,
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
    async updateRascunho(idOrganizacao, rascunho, userId) {
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
    async upsertAcao(idOrganizacao, idAcaoModelo, dados) {
        const organizacao = await prisma.organizacao.findUnique({
            where: { id: idOrganizacao }
        });
        if (!organizacao) {
            throw new Error('Organização não encontrada');
        }
        const acaoModelo = await prisma.plano_gestao_acao_modelo.findUnique({
            where: { id: idAcaoModelo }
        });
        if (!acaoModelo) {
            throw new Error('Ação modelo não encontrada');
        }
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
    async deleteAcao(idOrganizacao, idAcaoModelo) {
        await prisma.plano_gestao_acao.deleteMany({
            where: {
                id_organizacao: idOrganizacao,
                id_acao_modelo: idAcaoModelo
            }
        });
    }
    async updateRelatorioSintetico(idOrganizacao, relatorio, userId) {
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
    async uploadEvidencia(idOrganizacao, tipo, nomeArquivo, caminhoArquivo, descricao, userId) {
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
            tipo: evidencia.tipo,
            nome_arquivo: evidencia.nome_arquivo,
            caminho_arquivo: evidencia.caminho_arquivo,
            descricao: evidencia.descricao,
            uploaded_by: evidencia.uploaded_by,
            uploaded_by_name: evidencia.users?.name || null,
            created_at: evidencia.created_at,
            updated_at: evidencia.updated_at
        };
    }
    async listEvidencias(idOrganizacao) {
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
            tipo: ev.tipo,
            nome_arquivo: ev.nome_arquivo,
            caminho_arquivo: ev.caminho_arquivo,
            descricao: ev.descricao,
            uploaded_by: ev.uploaded_by,
            uploaded_by_name: ev.users?.name || null,
            created_at: ev.created_at,
            updated_at: ev.updated_at
        }));
    }
    async deleteEvidencia(idEvidencia) {
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
exports.default = new PlanoGestaoService();
//# sourceMappingURL=PlanoGestaoService.js.map