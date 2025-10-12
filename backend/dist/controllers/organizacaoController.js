"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.organizacaoController = void 0;
const organizacaoService_1 = __importDefault(require("../services/organizacaoService"));
const authService_1 = require("../services/authService");
const api_1 = require("../types/api");
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
                limit: req.query.limit ? parseInt(req.query.limit) : 10,
                // Filtro por técnico se necessário
                ...(userPermissions?.isTechnician && !userPermissions?.canAccessAll && {
                    id_tecnico: userPermissions.userId
                })
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
            // Verificar se técnico tem acesso a esta organização
            if (userPermissions?.isTechnician && !userPermissions?.canAccessAll) {
                if (organizacao.id_tecnico !== userPermissions.userId) {
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
            // Se for técnico, automaticamente definir id_tecnico
            const data = {
                ...req.body,
                ...(userPermissions?.isTechnician && {
                    id_tecnico: userPermissions.userId
                })
            };
            const organizacao = await organizacaoService_1.default.create(data);
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
            // Verificar se técnico tem acesso a esta organização antes de atualizar
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
                if (organizacaoExistente.id_tecnico !== userPermissions.userId) {
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
            const organizacao = await organizacaoService_1.default.update(id, data);
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
     * DELETE /organizacoes/:id
     */
    async delete(req, res) {
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
            await organizacaoService_1.default.delete(id);
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
     */
    async getDashboard(req, res) {
        try {
            const stats = await organizacaoService_1.default.getDashboardStats();
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
//# sourceMappingURL=organizacaoController.js.map