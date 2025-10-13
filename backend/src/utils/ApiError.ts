/**
 * Classe personalizada para erros da API
 * Centralizada para uso em todo o sistema
 */
export class ApiError extends Error {
  public statusCode: number;
  public code?: string;
  public details?: any[];

  constructor(options: {
    message: string;
    statusCode: number;
    code?: string;
    details?: any[];
  }) {
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
