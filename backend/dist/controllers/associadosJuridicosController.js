"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.associadosJuridicosController = void 0;
const client_1 = require("@prisma/client");
const api_1 = require("../types/api");
const auditService_1 = __importDefault(require("../services/auditService"));
const audit_1 = require("../types/audit");
const prisma = new client_1.PrismaClient();
exports.associadosJuridicosController = {
    async list(req, res) {
        try {
            const organizacaoId = parseInt(req.params.id);
            const items = await prisma.organizacao_abrangencia_pj.findMany({
                where: { id_organizacao: organizacaoId },
            });
            const formattedItems = items.map(item => ({
                id: item.id,
                nomeOrganizacao: item.razao_social || '',
                cnpj: item.cnpj_pj || '',
                tipoRelacao: 'filiada',
                dataFiliacao: item.creation_date?.toISOString().split('T')[0] || '',
                situacao: 'ativa',
            }));
            res.json({ success: true, data: formattedItems });
        }
        catch (error) {
            console.error('Erro ao listar associados jurídicos:', error);
            res.status(api_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: error.message },
            });
        }
    },
    async create(req, res) {
        try {
            const organizacaoId = parseInt(req.params.id);
            const { nomeOrganizacao, cnpj } = req.body;
            const item = await prisma.organizacao_abrangencia_pj.create({
                data: {
                    id_organizacao: organizacaoId,
                    razao_social: nomeOrganizacao,
                    cnpj_pj: cnpj,
                    uri: `uuid:associado-${Date.now()}`,
                    creator_uri_user: 'sistema',
                    creation_date: new Date(),
                    last_update_date: new Date(),
                    ordinal_number: 1,
                },
            });
            await auditService_1.default.createLog({
                action: audit_1.AuditAction.CREATE,
                entity: 'associado_juridico',
                entityId: item.id?.toString(),
                newData: item,
                userId: req.user?.id,
                req
            });
            res.status(api_1.HttpStatus.CREATED).json({ success: true, data: item });
        }
        catch (error) {
            console.error('Erro ao criar associado jurídico:', error);
            res.status(api_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: error.message },
            });
        }
    },
    async update(req, res) {
        try {
            const itemId = parseInt(req.params.itemId);
            const { nomeOrganizacao, cnpj } = req.body;
            const itemAntes = await prisma.organizacao_abrangencia_pj.findUnique({
                where: { id: itemId }
            });
            const item = await prisma.organizacao_abrangencia_pj.update({
                where: { id: itemId },
                data: {
                    razao_social: nomeOrganizacao,
                    cnpj_pj: cnpj,
                    last_update_date: new Date(),
                },
            });
            await auditService_1.default.createLog({
                action: audit_1.AuditAction.UPDATE,
                entity: 'associado_juridico',
                entityId: itemId.toString(),
                oldData: itemAntes,
                newData: item,
                userId: req.user?.id,
                req
            });
            res.json({ success: true, data: item });
        }
        catch (error) {
            console.error('Erro ao atualizar associado jurídico:', error);
            res.status(api_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: error.message },
            });
        }
    },
    async delete(req, res) {
        try {
            const itemId = parseInt(req.params.itemId);
            const itemAntes = await prisma.organizacao_abrangencia_pj.findUnique({
                where: { id: itemId }
            });
            await prisma.organizacao_abrangencia_pj.delete({
                where: { id: itemId },
            });
            await auditService_1.default.createLog({
                action: audit_1.AuditAction.DELETE,
                entity: 'associado_juridico',
                entityId: itemId.toString(),
                oldData: itemAntes,
                userId: req.user?.id,
                req
            });
            res.json({ success: true, message: 'Organização excluída com sucesso' });
        }
        catch (error) {
            console.error('Erro ao excluir associado jurídico:', error);
            res.status(api_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                error: { message: error.message },
            });
        }
    },
};
//# sourceMappingURL=associadosJuridicosController.js.map