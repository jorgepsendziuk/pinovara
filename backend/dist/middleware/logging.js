"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = exports.appLogger = exports.errorLogger = exports.accessLogger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const generateRequestId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};
class Logger {
    constructor() {
        this.maxLogSize = 10 * 1024 * 1024;
        this.maxLogFiles = 5;
        this.logDir = process.env.LOG_DIR || path_1.default.join(process.cwd(), 'logs');
        this.ensureLogDirectory();
    }
    ensureLogDirectory() {
        if (!fs_1.default.existsSync(this.logDir)) {
            fs_1.default.mkdirSync(this.logDir, { recursive: true });
        }
    }
    getLogFilePath(type) {
        const date = new Date().toISOString().split('T')[0];
        return path_1.default.join(this.logDir, `${type}-${date}.log`);
    }
    rotateLogIfNeeded(filePath) {
        try {
            if (fs_1.default.existsSync(filePath)) {
                const stats = fs_1.default.statSync(filePath);
                if (stats.size > this.maxLogSize) {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const rotatedPath = filePath.replace('.log', `-${timestamp}.log`);
                    fs_1.default.renameSync(filePath, rotatedPath);
                    this.cleanOldLogs(path_1.default.dirname(filePath), path_1.default.basename(filePath, '.log'));
                }
            }
        }
        catch (error) {
            console.error('Error rotating log file:', error);
        }
    }
    cleanOldLogs(logDir, baseName) {
        try {
            const files = fs_1.default.readdirSync(logDir)
                .filter(file => file.startsWith(baseName) && file.endsWith('.log'))
                .map(file => ({
                name: file,
                path: path_1.default.join(logDir, file),
                stats: fs_1.default.statSync(path_1.default.join(logDir, file))
            }))
                .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
            for (let i = this.maxLogFiles; i < files.length; i++) {
                fs_1.default.unlinkSync(files[i].path);
            }
        }
        catch (error) {
            console.error('Error cleaning old logs:', error);
        }
    }
    writeLog(entry, type) {
        try {
            const filePath = this.getLogFilePath(type);
            this.rotateLogIfNeeded(filePath);
            const logLine = JSON.stringify(entry) + '\n';
            fs_1.default.appendFileSync(filePath, logLine);
        }
        catch (error) {
            console.error('Error writing log:', error);
        }
    }
    logAccess(entry) {
        if (process.env.NODE_ENV !== 'production') {
            const color = (entry.statusCode || 0) >= 400 ? '\x1b[31m' : '\x1b[32m';
            const reset = '\x1b[0m';
            console.log(`${color}[${entry.timestamp}] ${entry.method} ${entry.url} - ${entry.statusCode} - ${entry.responseTime}ms${reset}`);
        }
        this.writeLog(entry, 'access');
    }
    logError(entry) {
        console.error(`[${entry.timestamp}] ERROR: ${entry.error}`);
        this.writeLog(entry, 'error');
    }
    logApp(entry) {
        console.log(`[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.error || 'Application log'}`);
        this.writeLog(entry, 'app');
    }
}
const logger = new Logger();
const accessLogger = (req, res, next) => {
    req.requestId = generateRequestId();
    req.startTime = Date.now();
    const originalEnd = res.end;
    res.end = function (...args) {
        const responseTime = Date.now() - (req.startTime || 0);
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: 'info',
            method: req.method,
            url: req.originalUrl || req.url,
            ip: req.ip || req.connection.remoteAddress || 'unknown',
            userAgent: req.get('User-Agent'),
            userId: req.user?.id?.toString(),
            statusCode: res.statusCode,
            responseTime,
            requestId: req.requestId
        };
        logger.logAccess(logEntry);
        return originalEnd.apply(this, args);
    };
    res.setHeader('X-Request-ID', req.requestId);
    next();
};
exports.accessLogger = accessLogger;
const errorLogger = (error, req, res, next) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent'),
        userId: req.user?.id?.toString(),
        statusCode: res.statusCode || 500,
        error: error.stack || error.message,
        requestId: req.requestId
    };
    logger.logError(logEntry);
    next(error);
};
exports.errorLogger = errorLogger;
exports.appLogger = {
    info: (message, data) => {
        const entry = {
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
    warn: (message, data) => {
        const entry = {
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
    error: (message, error) => {
        const entry = {
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
    debug: (message, data) => {
        if (process.env.NODE_ENV === 'development') {
            const entry = {
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
const rateLimiter = (windowMs = 15 * 60 * 1000, maxRequests = 100) => {
    const requests = new Map();
    return (req, res, next) => {
        const ip = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();
        const requestData = requests.get(ip);
        if (!requestData || now > requestData.resetTime) {
            requests.set(ip, {
                count: 1,
                resetTime: now + windowMs
            });
            next();
            return;
        }
        if (requestData.count >= maxRequests) {
            exports.appLogger.warn(`Rate limit exceeded for IP: ${ip}`, {
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
        requestData.count++;
        requests.set(ip, requestData);
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - requestData.count));
        res.setHeader('X-RateLimit-Reset', Math.ceil(requestData.resetTime / 1000));
        next();
    };
};
exports.rateLimiter = rateLimiter;
exports.default = {
    accessLogger: exports.accessLogger,
    errorLogger: exports.errorLogger,
    appLogger: exports.appLogger,
    rateLimiter: exports.rateLimiter
};
//# sourceMappingURL=logging.js.map