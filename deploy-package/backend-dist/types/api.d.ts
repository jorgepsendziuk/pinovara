export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: ApiError;
    timestamp?: string;
    requestId?: string;
}
export interface ApiError {
    message: string;
    statusCode: number;
    code?: string;
    details?: any[];
    stack?: string;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}
export interface SuccessResponse<T = any> extends ApiResponse<T> {
    success: true;
    data: T;
}
export interface ErrorResponse extends ApiResponse {
    success: false;
    error: ApiError;
}
export declare enum HttpStatus {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    UNPROCESSABLE_ENTITY = 422,
    INTERNAL_SERVER_ERROR = 500,
    SERVICE_UNAVAILABLE = 503
}
export declare enum ErrorCode {
    AUTHENTICATION_REQUIRED = "AUTHENTICATION_REQUIRED",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    TOKEN_EXPIRED = "TOKEN_EXPIRED",
    TOKEN_INVALID = "TOKEN_INVALID",
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    MISSING_REQUIRED_FIELD = "MISSING_REQUIRED_FIELD",
    INVALID_FORMAT = "INVALID_FORMAT",
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
    RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS",
    RESOURCE_CONFLICT = "RESOURCE_CONFLICT",
    DATABASE_ERROR = "DATABASE_ERROR",
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
    INTERNAL_ERROR = "INTERNAL_ERROR"
}
//# sourceMappingURL=api.d.ts.map