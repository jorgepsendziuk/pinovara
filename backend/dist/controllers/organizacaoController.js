"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizacaoController = void 0;
const organizacaoService_1 = __importDefault(require("../services/organizacaoService"));
const ApiError_1 = require("../utils/ApiError");
const api_1 = require("../types/api");
const odkHelper_1 = require("../utils/odkHelper");
const auditService_1 = __importDefault(require("../services/auditService"));
const audit_1 = require("../types/audit");
const roleAuth_1 = require("../middleware/roleAuth");
class OrganizacaoController {
    async list(req, res) {
        try {
            const userPermissions = req.userPermissions;
            const filters = {
                nome: req.query.nome,
                cnpj: req.query.cnpj,
                estado: req.query.estado ? parseInt(req.query.estado) : undefined,
                municipio: req.query.municipio ? parseInt(req.query.municipio) : undefined,
                page: req.query.page ? parseInt(req.query.page) : 1,
                limit: req.query.limit ? parseInt(req.query.limit) :
                    req.query.pageSize ? parseInt(req.query.pageSize) : 10,
                userId: userPermissions?.userId,
                incluirRemovidas: req.query.incluirRemovidas === 'true'
            };
            const result = await organizacaoService_1.default.list(filters);
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                data: result,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async getById(req, res) {
        try {
            const id = parseInt(req.params.id);
            const userPermissions = req.userPermissions;
            if (isNaN(id)) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'ID inválido',
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const organizacao = await organizacaoService_1.default.getById(id);
            if (!organizacao) {
                res.status(api_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    error: {
                        message: 'Organização não encontrada',
                        statusCode: api_1.HttpStatus.NOT_FOUND
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (!this.verificarAcessoTecnico(userPermissions, organizacao, req)) {
                res.status(api_1.HttpStatus.FORBIDDEN).json({
                    success: false,
                    error: {
                        message: 'Acesso negado. Técnicos só podem acessar organizações criadas por eles ou onde foram autorizados.',
                        statusCode: api_1.HttpStatus.FORBIDDEN
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                data: organizacao,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async create(req, res) {
        try {
            const userPermissions = req.userPermissions;
            if (!userPermissions?.canEdit) {
                res.status(api_1.HttpStatus.FORBIDDEN).json({
                    success: false,
                    error: {
                        message: 'Sem permissão para criar organizações',
                        statusCode: api_1.HttpStatus.FORBIDDEN
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const data = {
                ...req.body,
                ...(userPermissions?.userId && {
                    id_tecnico: userPermissions.userId
                })
            };
            const organizacao = await organizacaoService_1.default.create(data);
            await auditService_1.default.createLog({
                action: audit_1.AuditAction.CREATE,
                entity: 'organizacao',
                entityId: organizacao.id?.toString(),
                newData: organizacao,
                userId: req.user?.id,
                req
            });
            res.status(api_1.HttpStatus.CREATED).json({
                success: true,
                message: 'Organização criada com sucesso',
                data: organizacao,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async update(req, res) {
        try {
            const id = parseInt(req.params.id);
            const data = req.body;
            const userPermissions = req.userPermissions;
            if (isNaN(id)) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'ID inválido',
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (!userPermissions?.canEdit) {
                res.status(api_1.HttpStatus.FORBIDDEN).json({
                    success: false,
                    error: {
                        message: 'Sem permissão para editar organizações',
                        statusCode: api_1.HttpStatus.FORBIDDEN
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (userPermissions?.isTechnician && !userPermissions?.canAccessAll) {
                let organizacaoExistente;
                try {
                    organizacaoExistente = await organizacaoService_1.default.getById(id);
                }
                catch (error) {
                    if (error instanceof ApiError_1.ApiError && error.statusCode === api_1.HttpStatus.NOT_FOUND) {
                        res.status(api_1.HttpStatus.NOT_FOUND).json({
                            success: false,
                            error: {
                                message: 'Organização não encontrada',
                                statusCode: api_1.HttpStatus.NOT_FOUND
                            },
                            timestamp: new Date().toISOString()
                        });
                        return;
                    }
                    throw error;
                }
                if (!this.verificarAcessoTecnico(userPermissions, organizacaoExistente, req)) {
                    res.status(api_1.HttpStatus.FORBIDDEN).json({
                        success: false,
                        error: {
                            message: 'Acesso negado. Técnicos só podem editar organizações criadas por eles ou onde foram autorizados.',
                            statusCode: api_1.HttpStatus.FORBIDDEN
                        },
                        timestamp: new Date().toISOString()
                    });
                    return;
                }
            }
            const organizacaoAntes = await organizacaoService_1.default.getById(id);
            const organizacao = await organizacaoService_1.default.update(id, data);
            await auditService_1.default.createLog({
                action: audit_1.AuditAction.UPDATE,
                entity: 'organizacao',
                entityId: id.toString(),
                oldData: organizacaoAntes,
                newData: organizacao,
                userId: req.user?.id,
                req
            });
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                message: 'Organização atualizada com sucesso',
                data: organizacao,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async updateValidacao(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { validacao_status, validacao_obs, validacao_usuario } = req.body;
            const userPermissions = req.userPermissions;
            if (isNaN(id)) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'ID inválido',
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (!userPermissions?.isCoordinator && !userPermissions?.isAdmin) {
                res.status(api_1.HttpStatus.FORBIDDEN).json({
                    success: false,
                    error: {
                        message: 'Apenas coordenadores e administradores podem validar organizações',
                        statusCode: api_1.HttpStatus.FORBIDDEN
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const dadosValidacao = {
                validacao_status: validacao_status || null,
                validacao_obs: validacao_obs || null,
                validacao_usuario: validacao_usuario || req.user?.id || null,
                validacao_data: new Date()
            };
            const organizacao = await organizacaoService_1.default.updateValidacao(id, dadosValidacao);
            await auditService_1.default.createLog({
                action: audit_1.AuditAction.UPDATE,
                entity: 'organizacao',
                entityId: id.toString(),
                userId: req.user.id,
                newData: dadosValidacao,
                req
            });
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                message: 'Validação atualizada com sucesso',
                data: organizacao,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async updatePlanoGestaoValidacao(req, res) {
        try {
            console.log('🔍 [updatePlanoGestaoValidacao] Request recebido');
            console.log('🔍 [updatePlanoGestaoValidacao] Body:', JSON.stringify(req.body, null, 2));
            console.log('🔍 [updatePlanoGestaoValidacao] Params:', req.params);
            const id = parseInt(req.params.id);
            const { plano_gestao_validacao_status, plano_gestao_validacao_obs, plano_gestao_validacao_usuario } = req.body;
            const userPermissions = req.userPermissions;
            if (isNaN(id)) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'ID inválido',
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (!userPermissions?.isCoordinator && !userPermissions?.isAdmin) {
                res.status(api_1.HttpStatus.FORBIDDEN).json({
                    success: false,
                    error: {
                        message: 'Apenas coordenadores e administradores podem validar planos de gestão',
                        statusCode: api_1.HttpStatus.FORBIDDEN
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const dadosValidacao = {
                plano_gestao_validacao_status: plano_gestao_validacao_status || null,
                plano_gestao_validacao_obs: plano_gestao_validacao_obs || null,
                plano_gestao_validacao_usuario: plano_gestao_validacao_usuario || req.user?.id || null,
                plano_gestao_validacao_data: new Date()
            };
            const organizacao = await organizacaoService_1.default.updatePlanoGestaoValidacao(id, dadosValidacao);
            await auditService_1.default.createLog({
                action: audit_1.AuditAction.UPDATE,
                entity: 'organizacao',
                entityId: id.toString(),
                userId: req.user.id,
                newData: dadosValidacao,
                req
            });
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                message: 'Validação do plano de gestão atualizada com sucesso',
                data: organizacao,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('❌ [updatePlanoGestaoValidacao] Erro capturado no controller:', error);
            console.error('❌ [updatePlanoGestaoValidacao] Erro message:', error?.message);
            console.error('❌ [updatePlanoGestaoValidacao] Erro code:', error?.code);
            console.error('❌ [updatePlanoGestaoValidacao] Erro stack:', error?.stack);
            this.handleError(error, res);
        }
    }
    async getHistoricoValidacao(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'ID inválido',
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const historico = await organizacaoService_1.default.getHistoricoValidacao(id);
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                data: historico,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async delete(req, res) {
        try {
            const id = parseInt(req.params.id);
            const userPermissions = req.userPermissions;
            if (isNaN(id)) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'ID inválido',
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (!userPermissions?.canEdit) {
                res.status(api_1.HttpStatus.FORBIDDEN).json({
                    success: false,
                    error: {
                        message: 'Sem permissão para excluir organizações',
                        statusCode: api_1.HttpStatus.FORBIDDEN
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const organizacaoAntes = await organizacaoService_1.default.getById(id);
            await organizacaoService_1.default.delete(id);
            await auditService_1.default.createLog({
                action: audit_1.AuditAction.DELETE,
                entity: 'organizacao',
                entityId: id.toString(),
                oldData: organizacaoAntes,
                userId: req.user?.id,
                req
            });
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                message: 'Organização removida com sucesso',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async getDashboard(req, res) {
        try {
            const userPermissions = req.userPermissions;
            const stats = await organizacaoService_1.default.getDashboardStats(userPermissions?.userId);
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                data: stats,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async getEstados(req, res) {
        try {
            const estados = await organizacaoService_1.default.getEstados();
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                data: estados,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Organizacao Controller Error:', error);
            this.handleError(error, res);
        }
    }
    async getMunicipios(req, res) {
        try {
            const estadoId = req.params.estadoId ? parseInt(req.params.estadoId) : undefined;
            const municipios = await organizacaoService_1.default.getMunicipios(estadoId);
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                data: municipios,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            console.error('Organizacao Controller Error:', error);
            this.handleError(error, res);
        }
    }
    async listEquipeTecnica(req, res) {
        try {
            const id = parseInt(req.params.id);
            const userPermissions = req.userPermissions;
            if (isNaN(id)) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'ID inválido',
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const organizacao = await organizacaoService_1.default.getById(id);
            if (!organizacao) {
                res.status(api_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    error: {
                        message: 'Organização não encontrada',
                        statusCode: api_1.HttpStatus.NOT_FOUND
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (!this.verificarAcessoTecnico(userPermissions, organizacao, req)) {
                res.status(api_1.HttpStatus.FORBIDDEN).json({
                    success: false,
                    error: {
                        message: 'Sem permissão para visualizar a equipe técnica desta organização.',
                        statusCode: api_1.HttpStatus.FORBIDDEN
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                data: organizacao.equipe_tecnica || [],
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async listTecnicosDisponiveis(req, res) {
        try {
            const id = parseInt(req.params.id);
            const search = req.query.search;
            const userPermissions = req.userPermissions;
            if (isNaN(id)) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'ID inválido',
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const organizacao = await organizacaoService_1.default.getById(id);
            if (!organizacao) {
                res.status(api_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    error: {
                        message: 'Organização não encontrada',
                        statusCode: api_1.HttpStatus.NOT_FOUND
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (!this.podeGerenciarEquipe(userPermissions, organizacao)) {
                res.status(api_1.HttpStatus.FORBIDDEN).json({
                    success: false,
                    error: {
                        message: 'Sem permissão para gerenciar a equipe técnica desta organização.',
                        statusCode: api_1.HttpStatus.FORBIDDEN
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const tecnicos = await organizacaoService_1.default.listarTecnicosDisponiveis(id, search);
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                data: tecnicos,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async addTecnicoEquipe(req, res) {
        try {
            const id = parseInt(req.params.id);
            const { id_tecnico, tecnicoId } = req.body || {};
            const tecnicoIdNumero = parseInt(id_tecnico !== undefined ? id_tecnico : tecnicoId);
            const userPermissions = req.userPermissions;
            if (isNaN(id)) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'ID da organização é obrigatório',
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (isNaN(tecnicoIdNumero)) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'ID do técnico é obrigatório',
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const organizacao = await organizacaoService_1.default.getById(id);
            if (!organizacao) {
                res.status(api_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    error: {
                        message: 'Organização não encontrada',
                        statusCode: api_1.HttpStatus.NOT_FOUND
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (!this.podeGerenciarEquipe(userPermissions, organizacao)) {
                res.status(api_1.HttpStatus.FORBIDDEN).json({
                    success: false,
                    error: {
                        message: 'Sem permissão para adicionar técnicos nesta organização.',
                        statusCode: api_1.HttpStatus.FORBIDDEN
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const membro = await organizacaoService_1.default.adicionarTecnicoEquipe(id, tecnicoIdNumero, req.user?.id ?? null);
            res.status(api_1.HttpStatus.CREATED).json({
                success: true,
                message: 'Técnico adicionado com sucesso',
                data: membro,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async removeTecnicoEquipe(req, res) {
        try {
            const id = parseInt(req.params.id);
            const tecnicoId = parseInt(req.params.idTecnico);
            const userPermissions = req.userPermissions;
            if (isNaN(id) || isNaN(tecnicoId)) {
                res.status(api_1.HttpStatus.BAD_REQUEST).json({
                    success: false,
                    error: {
                        message: 'IDs inválidos',
                        statusCode: api_1.HttpStatus.BAD_REQUEST
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const organizacao = await organizacaoService_1.default.getById(id);
            if (!organizacao) {
                res.status(api_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    error: {
                        message: 'Organização não encontrada',
                        statusCode: api_1.HttpStatus.NOT_FOUND
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            if (!this.podeGerenciarEquipe(userPermissions, organizacao)) {
                res.status(api_1.HttpStatus.FORBIDDEN).json({
                    success: false,
                    error: {
                        message: 'Sem permissão para remover técnicos desta organização.',
                        statusCode: api_1.HttpStatus.FORBIDDEN
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            await organizacaoService_1.default.removerTecnicoEquipe(id, tecnicoId);
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                message: 'Técnico removido com sucesso',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    verificarAcessoTecnico(userPermissions, organizacao, req) {
        if (!userPermissions?.isTechnician || userPermissions?.canAccessAll) {
            return true;
        }
        const equipe = Array.isArray(organizacao.equipe_tecnica)
            ? organizacao.equipe_tecnica.map((m) => ({ id_tecnico: m.id_tecnico }))
            : Array.isArray(organizacao.organizacao_tecnico)
                ? organizacao.organizacao_tecnico.map((m) => ({ id_tecnico: m.id_tecnico }))
                : [];
        if ((0, roleAuth_1.hasAccessToOrganizacao)(userPermissions, {
            id_tecnico: organizacao.id_tecnico,
            equipe_tecnica: equipe
        })) {
            return true;
        }
        if (organizacao.creator_uri_user) {
            const creatorEmail = (0, odkHelper_1.extractEmailFromCreatorUri)(organizacao.creator_uri_user);
            if (creatorEmail && creatorEmail === req.user?.email?.toLowerCase()) {
                return true;
            }
        }
        return false;
    }
    podeGerenciarEquipe(userPermissions, organizacao) {
        if (!userPermissions)
            return false;
        if (!userPermissions.canEdit)
            return false;
        if (userPermissions.isAdmin)
            return true;
        return organizacao.id_tecnico === userPermissions.userId;
    }
    handleError(error, res) {
        console.error('Organizacao Controller Error:', error);
        console.error('Error stack:', error.stack);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error instanceof ApiError_1.ApiError) {
            res.status(error.statusCode).json({
                success: false,
                error: {
                    message: error.message,
                    statusCode: error.statusCode,
                    code: error.code,
                    details: error.details
                },
                timestamp: new Date().toISOString()
            });
            return;
        }
        const isDevelopment = process.env.NODE_ENV !== 'production';
        res.status(api_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: {
                message: isDevelopment ? (error.message || 'Erro interno do servidor') : 'Erro interno do servidor',
                statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR,
                ...(isDevelopment && {
                    details: {
                        name: error.name,
                        message: error.message,
                        stack: error.stack
                    }
                })
            },
            timestamp: new Date().toISOString()
        });
    }
}
exports.organizacaoController = new OrganizacaoController();
//# sourceMappingURL=organizacaoController.js.map