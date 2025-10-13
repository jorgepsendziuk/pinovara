/**
 * Classe personalizada para erros da API
 * Centralizada para uso em todo o sistema
 */
export declare class ApiError extends Error {
    statusCode: number;
    code?: string;
    details?: any[];
    constructor(options: {
        message: string;
        statusCode: number;
        code?: string;
        details?: any[];
    });
}
//# sourceMappingURL=ApiError.d.ts.map