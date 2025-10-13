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