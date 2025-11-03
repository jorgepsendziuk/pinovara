"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentoService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.documentoService = {
    // Criar novo documento
    async create(data) {
        const now = new Date();
        return await prisma.organizacao_arquivo.create({
            data: {
                id_organizacao: data.id_organizacao,
                arquivo: data.arquivo,
                obs: data.obs,
                uri: data.uri,
                creator_uri_user: data.usuario_envio,
                creation_date: now,
                last_update_date: now,
                ordinal_number: data.ordinal_number,
            },
        });
    },
    // Buscar documentos de uma organização
    async findByOrganizacao(organizacaoId) {
        return await prisma.organizacao_arquivo.findMany({
            where: { id_organizacao: organizacaoId },
            orderBy: { creation_date: 'desc' },
        });
    },
    // Buscar documento por ID
    async findById(id) {
        return await prisma.organizacao_arquivo.findUnique({
            where: { id },
        });
    },
    // Atualizar documento
    async update(id, data) {
        return await prisma.organizacao_arquivo.update({
            where: { id },
            data: {
                ...data,
                last_update_date: new Date(),
            },
        });
    },
    // Deletar documento
    async delete(id) {
        return await prisma.organizacao_arquivo.delete({
            where: { id },
        });
    },
    // Contar documentos
    async count(organizacaoId) {
        return await prisma.organizacao_arquivo.count({
            where: {
                id_organizacao: organizacaoId,
            },
        });
    },
};
