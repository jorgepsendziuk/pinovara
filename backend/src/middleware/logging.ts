import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Interface para logging estruturado
interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  method: string;
  url: string;
  ip: string;
  userAgent?: string;
  userId?: string;
  statusCode?: number;
  responseTime?: number;
  error?: string;
  requestId: string;
}

// Gerar ID único para requisição
const generateRequestId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Extender interface Request para incluir requestId
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      startTime?: number;
    }
  }
}

// Logger simples para arquivos
class Logger {
  private logDir: string;
  private maxLogSize: number = 10 * 1024 * 1024; // 10MB
  private maxLogFiles: number = 5;

  constructor() {
    this.logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getLogFilePath(type: 'access' | 'error' | 'app'): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${type}-${date}.log`);
  }

  private rotateLogIfNeeded(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size > this.maxLogSize) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const rotatedPath = filePath.replace('.log', `-${timestamp}.log`);
          fs.renameSync(filePath, rotatedPath);
          
          // Limpar logs antigos
          this.cleanOldLogs(path.dirname(filePath), path.basename(filePath, '.log'));
        }
      }
    } catch (error) {
      console.error('Error rotating log file:', error);
    }
  }

  private cleanOldLogs(logDir: string, baseName: string): void {
    try {
      const files = fs.readdirSync(logDir)
        .filter(file => file.startsWith(baseName) && file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(logDir, file),
          stats: fs.statSync(path.join(logDir, file))
        }))
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      // Manter apenas os arquivos mais recentes
      for (let i = this.maxLogFiles; i < files.length; i++) {
        fs.unlinkSync(files[i].path);
      }
    } catch (error) {
      console.error('Error cleaning old logs:', error);
    }
  }

  private writeLog(entry: LogEntry, type: 'access' | 'error' | 'app'): void {
    try {
      const filePath = this.getLogFilePath(type);
      this.rotateLogIfNeeded(filePath);
      
      const logLine = JSON.stringify(entry) + '\n';
      fs.appendFileSync(filePath, logLine);
    } catch (error) {
      console.error('Error writing log:', error);
    }
  }

  public logAccess(entry: LogEntry): void {
    // Log no console em desenvolvimento
    if (process.env.NODE_ENV !== 'production') {
      const color = (entry.statusCode || 0) >= 400 ? '\x1b[31m' : '\x1b[32m';
      const reset = '\x1b[0m';
      console.log(
        `${color}[${entry.timestamp}] ${entry.method} ${entry.url} - ${entry.statusCode} - ${entry.responseTime}ms${reset}`
      );
    }
    
    this.writeLog(entry, 'access');
  }

  public logError(entry: LogEntry): void {
    console.error(`[${entry.timestamp}] ERROR: ${entry.error}`);
    this.writeLog(entry, 'error');
  }

  public logApp(entry: LogEntry): void {
    console.log(`[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.error || 'Application log'}`);
    this.writeLog(entry, 'app');
  }
}

const logger = new Logger();

// Middleware de logging de acesso
export const accessLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Adicionar requestId e timestamp à requisição
  req.requestId = generateRequestId();
  req.startTime = Date.now();

  // Capturar o método original res.end para calcular tempo de resposta
  const originalEnd = res.end;
  
  res.end = function(this: Response, ...args: any[]): any {
    const responseTime = Date.now() - (req.startTime || 0);
    
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id?.toString(),
      statusCode: res.statusCode,
      responseTime,
      requestId: req.requestId!
    };

    logger.logAccess(logEntry);
    
    // Chamar o método original
    return (originalEnd as any).apply(this, args);
  };

  // Adicionar requestId aos headers da resposta (útil para debugging)
  res.setHeader('X-Request-ID', req.requestId);

  next();
};

// Middleware para logging de erros
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id?.toString(),
    statusCode: res.statusCode || 500,
    error: error.stack || error.message,
    requestId: req.requestId!
  };

  logger.logError(logEntry);
  next(error);
};

// Funcões utilitárias para logging da aplicação
export const appLogger = {
  info: (message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      method: '',
      url: '',
      ip: '',
      error: message + (data ? ` - ${JSON.stringify(data)}` : ''),
      requestId: 'app'
    };
    logger.logApp(entry);
  },

  warn: (message: string, data?: any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      method: '',
      url: '',
      ip: '',
      error: message + (data ? ` - ${JSON.stringify(data)}` : ''),
      requestId: 'app'
    };
    logger.logApp(entry);
  },

  error: (message: string, error?: Error | any) => {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      method: '',
      url: '',
      ip: '',
      error: message + (error ? ` - ${error.stack || error.message || JSON.stringify(error)}` : ''),
      requestId: 'app'
    };
    logger.logApp(entry);
  },

  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'debug',
        method: '',
        url: '',
        ip: '',
        error: message + (data ? ` - ${JSON.stringify(data)}` : ''),
        requestId: 'app'
      };
      logger.logApp(entry);
    }
  }
};

// Middleware para rate limiting por IP
export const rateLimiter = (windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) => {
  const requests: Map<string, { count: number; resetTime: number }> = new Map();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    const requestData = requests.get(ip);
    
    if (!requestData || now > requestData.resetTime) {
      // Nova janela de tempo
      requests.set(ip, {
        count: 1,
        resetTime: now + windowMs
      });
      next();
      return;
    }
    
    if (requestData.count >= maxRequests) {
      // Limite excedido
      appLogger.warn(`Rate limit exceeded for IP: ${ip}`, {
        count: requestData.count,
        maxRequests,
        url: req.url
      });
      
      res.status(429).json({
        success: false,
        error: {
          message: 'Too many requests',
          statusCode: 429,
          retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
        }
      });
      return;
    }
    
    // Incrementar contador
    requestData.count++;
    requests.set(ip, requestData);
    
    // Adicionar headers informativos
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - requestData.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(requestData.resetTime / 1000));
    
    next();
  };
};

export default {
  accessLogger,
  errorLogger,
  appLogger,
  rateLimiter
};