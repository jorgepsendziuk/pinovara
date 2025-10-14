"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(options) {
        super(options.message);
        this.statusCode = options.statusCode;
        this.code = options.code;
        this.details = options.details;
        this.name = 'ApiError';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }
}
exports.ApiError = ApiError;
//# sourceMappingURL=ApiError.js.map