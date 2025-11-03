"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
/**
 * Classe personalizada para erros da API
 * Centralizada para uso em todo o sistema
 */
class ApiError extends Error {
    constructor(options) {
        super(options.message);
        this.statusCode = options.statusCode;
        this.code = options.code;
        this.details = options.details;
        this.name = 'ApiError';
        // Capturar stack trace
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }
}
exports.ApiError = ApiError;
