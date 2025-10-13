"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const authService_1 = require("../services/authService");
const api_1 = require("../types/api");
class AuthController {
    async login(req, res) {
        try {
            const loginData = req.body;
            const result = await authService_1.authService.login(loginData);
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                message: 'Login realizado com sucesso',
                data: result,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async register(req, res) {
        try {
            const registerData = req.body;
            const result = await authService_1.authService.register(registerData);
            res.status(api_1.HttpStatus.CREATED).json({
                success: true,
                message: 'Usuário registrado com sucesso',
                data: result,
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async me(req, res) {
        try {
            if (!req.user) {
                res.status(api_1.HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    error: {
                        message: 'Usuário não autenticado',
                        statusCode: api_1.HttpStatus.UNAUTHORIZED
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const user = await authService_1.authService.getUserById(req.user.id);
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                data: { user },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async verify(req, res) {
        try {
            const authHeader = req.headers.authorization;
            const token = authHeader?.split(' ')[1];
            if (!token) {
                res.status(api_1.HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    error: {
                        message: 'Token não fornecido',
                        statusCode: api_1.HttpStatus.UNAUTHORIZED
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const user = await authService_1.authService.verifyToken(token);
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                data: {
                    authenticated: true,
                    user
                },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            if (error instanceof authService_1.ApiError) {
                res.status(api_1.HttpStatus.OK).json({
                    success: true,
                    data: {
                        authenticated: false
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            this.handleError(error, res);
        }
    }
    async logout(req, res) {
        try {
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                message: 'Logout realizado com sucesso',
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    async updateProfile(req, res) {
        try {
            if (!req.user) {
                res.status(api_1.HttpStatus.UNAUTHORIZED).json({
                    success: false,
                    error: {
                        message: 'Usuário não autenticado',
                        statusCode: api_1.HttpStatus.UNAUTHORIZED
                    },
                    timestamp: new Date().toISOString()
                });
                return;
            }
            const { name, email } = req.body;
            const updatedUser = await authService_1.authService.updateProfile(req.user.id, { name, email });
            res.status(api_1.HttpStatus.OK).json({
                success: true,
                message: 'Perfil atualizado com sucesso',
                data: { user: updatedUser },
                timestamp: new Date().toISOString()
            });
        }
        catch (error) {
            this.handleError(error, res);
        }
    }
    handleError(error, res) {
        console.error('Auth Controller Error:', error);
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
exports.authController = new AuthController();
//# sourceMappingURL=authController.js.map