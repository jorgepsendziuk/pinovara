"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentoService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.documentoService = {
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
    async findByOrganizacao(organizacaoId) {
        return await prisma.organizacao_arquivo.findMany({
            where: { id_organizacao: organizacaoId },
            orderBy: { creation_date: 'desc' },
        });
    },
    async findById(id) {
        return await prisma.organizacao_arquivo.findUnique({
            where: { id },
        });
    },
    async update(id, data) {
        return await prisma.organizacao_arquivo.update({
            where: { id },
            data: {
                ...data,
                last_update_date: new Date(),
            },
        });
    },
    async delete(id) {
        return await prisma.organizacao_arquivo.delete({
            where: { id },
        });
    },
    async count(organizacaoId) {
        return await prisma.organizacao_arquivo.count({
            where: {
                id_organizacao: organizacaoId,
            },
        });
    },
};
//# sourceMappingURL=documentoService.js.map