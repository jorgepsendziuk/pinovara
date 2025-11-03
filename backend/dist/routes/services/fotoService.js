"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fotoService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.fotoService = {
    // Criar nova foto
    async create(data) {
        const now = new Date();
        // Buscar o maior ordinal_number para esta organização
        const maxOrdinal = await prisma.organizacao_foto.findFirst({
            where: { id_organizacao: data.id_organizacao },
            orderBy: { ordinal_number: 'desc' },
            select: { ordinal_number: true }
        });
        const nextOrdinal = (maxOrdinal?.ordinal_number || 0) + 1;
        // Gerar URI único
        const uri = `foto_${data.id_organizacao}_${nextOrdinal}_${Date.now()}`;
        return await prisma.organizacao_foto.create({
            data: {
                uri,
                creator_uri_user: data.creator_uri_user,
                creation_date: now,
                last_update_date: now,
                ordinal_number: nextOrdinal,
                foto: data.foto,
                obs: data.obs,
                id_organizacao: data.id_organizacao
            }
        });
    },
    // Listar fotos de uma organização
    async listByOrganizacao(organizacaoId) {
        return await prisma.organizacao_foto.findMany({
            where: { id_organizacao: organizacaoId },
            orderBy: { ordinal_number: 'asc' }
        });
    },
    // Buscar por ID
    async findById(id) {
        return await prisma.organizacao_foto.findUnique({
            where: { id }
        });
    },
    // Atualizar foto
    async update(id, data) {
        return await prisma.organizacao_foto.update({
            where: { id },
            data: {
                ...data,
                last_update_date: new Date()
            }
        });
    },
    // Deletar foto
    async delete(id) {
        return await prisma.organizacao_foto.delete({
            where: { id }
        });
    }
};
