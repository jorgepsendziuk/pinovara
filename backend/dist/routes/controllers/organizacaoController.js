"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizacaoController = void 0;
const organizacaoService_1 = __importDefault(require("../services/organizacaoService"));
const authService_1 = require("../services/authService");
const api_1 = require("../types/api");
const odkHelper_1 = require("../utils/odkHelper");
const auditService_1 = __importDefault(require("../services/auditService"));
const audit_1 = require("../types/audit");
class OrganizacaoController {
    /**
     * GET /organizacoes
     */
    async list(req, res) {
        try {
            // Verificar permissões do usuário
            const userPermissions = req.userPermissions;
            const filters = {
                nome: req.query.nome,
                cnpj: req.query.cnpj,
                estado: req.query.estado ? parseInt(req.query.estado) : undefined,
                municipio: req.query.municipio ? parseInt(req.query.municipio) : undefined,
                page: req.query.page ? parseInt(req.query.page) : 1,
                // Aceitar tanto 'limit' quanto 'pageSize'
                limit: req.query.limit ? parseInt(req.query.limit) :
                    req.query.pageSize ? parseInt(req.query.pageSize) : 10,
                // Passar userId para filtro híbrido (id_tecnico OU email em _creator_uri_user)
                userId: userPermissions?.userId
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
    /**
     * GET /organizacoes/:id
     */
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
            // Verificar se técnico tem acesso a esta organização (filtro híbrido)
            if (userPermissions?.isTechnician && !userPermissions?.canAccessAll) {
                let temAcesso = false;
                // Opção 1: id_tecnico bate
                if (organizacao.id_tecnico === userPermissions.userId) {
                    temAcesso = true;
                }
                // Opção 2: email no _creator_uri_user bate
                if (!temAcesso && organizacao.creator_uri_user) {
                    const creatorEmail = (0, odkHelper_1.extractEmailFromCreatorUri)(organizacao.creator_uri_user);
                    if (creatorEmail && creatorEmail === req.user?.email?.toLowerCase()) {
                        temAcesso = true;
                    }
                }
                if (!temAcesso) {
                    res.status(api_1.HttpStatus.FORBIDDEN).json({
                        success: false,
                        error: {
                            message: 'Acesso negado. Técnicos só podem acessar organizações criadas por eles.',
                            statusCode: api_1.HttpStatus.FORBIDDEN
                        },
                        timestamp: new Date().toISOString()
                    });
                    return;
                }
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
    /**
     * POST /organizacoes
     */
    async create(req, res) {
        try {
            const userPermissions = req.userPermissions;
            // Verificar se usuário pode editar (coordenador não pode criar)
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
            // Automaticamente definir id_tecnico com o usuário que está criando
            // (seja técnico, admin ou qualquer outro)
            const data = {
                ...req.body,
                ...(userPermissions?.userId && {
                    id_tecnico: userPermissions.userId
                })
            };
            const organizacao = await organizacaoService_1.default.create(data);
            // Registrar log de auditoria
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
    /**
     * PUT /organizacoes/:id
     */
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
            // Verificar se usuário pode editar (coordenador não pode editar)
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
            // Verificar se técnico tem acesso a esta organização antes de atualizar (filtro híbrido)
            if (userPermissions?.isTechnician && !userPermissions?.canAccessAll) {
                const organizacaoExistente = await organizacaoService_1.default.getById(id);
                if (!organizacaoExistente) {
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
                let temAcesso = false;
                // Opção 1: id_tecnico bate
                if (organizacaoExistente.id_tecnico === userPermissions.userId) {
                    temAcesso = true;
                }
                // Opção 2: email no _creator_uri_user bate
                if (!temAcesso && organizacaoExistente.creator_uri_user) {
                    const creatorEmail = (0, odkHelper_1.extractEmailFromCreatorUri)(organizacaoExistente.creator_uri_user);
                    if (creatorEmail && creatorEmail === req.user?.email?.toLowerCase()) {
                        temAcesso = true;
                    }
                }
                if (!temAcesso) {
                    res.status(api_1.HttpStatus.FORBIDDEN).json({
                        success: false,
                        error: {
                            message: 'Acesso negado. Técnicos só podem editar organizações criadas por eles.',
                            statusCode: api_1.HttpStatus.FORBIDDEN
                        },
                        timestamp: new Date().toISOString()
                    });
                    return;
                }
            }
            // Capturar dados antes da atualização para auditoria
            const organizacaoAntes = await organizacaoService_1.default.getById(id);
            const organizacao = await organizacaoService_1.default.update(id, data);
            // Registrar log de auditoria
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
    /**
     * PATCH /organizacoes/:id/validacao
     * Atualizar apenas campos de validação (permitido para coordenadores)
     */
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
            // Verificar se usuário é coordenador ou admin (supervisor NÃO pode validar)
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
            // Atualizar apenas campos de validação
            const dadosValidacao = {
                validacao_status: validacao_status || null,
                validacao_obs: validacao_obs || null,
                validacao_usuario: validacao_usuario || req.user?.id || null,
                validacao_data: new Date()
            };
            const organizacao = await organizacaoService_1.default.updateValidacao(id, dadosValidacao);
            // Registrar auditoria
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
    /**
     * DELETE /organizacoes/:id
     */
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
            // Verificar se usuário pode editar (coordenador não pode deletar)
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
            // Capturar dados antes da exclusão para auditoria
            const organizacaoAntes = await organizacaoService_1.default.getById(id);
            await organizacaoService_1.default.delete(id);
            // Registrar log de auditoria
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
    /**
     * GET /organizacoes/dashboard
     * Agora com filtro híbrido para técnicos
     */
    async getDashboard(req, res) {
        try {
            const userPermissions = req.userPermissions;
            // Passar userId para aplicar filtro híbrido se necessário
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
    /**
     * GET /organizacoes/estados
     */
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
    /**
     * GET /organizacoes/municipios/:estadoId?
     */
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
    /**
     * Tratar erros de forma padronizada
     */
    handleError(error, res) {
        console.error('Organizacao Controller Error:', error);
        if (error instanceof authService_1.ApiError) {
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
        // Erro genérico
        res.status(api_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: {
                message: 'Erro interno do servidor',
                statusCode: api_1.HttpStatus.INTERNAL_SERVER_ERROR
            },
            timestamp: new Date().toISOString()
        });
    }
}
exports.organizacaoController = new OrganizacaoController();
