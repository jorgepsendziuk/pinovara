"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditAccessDenied = exports.auditLoginAttempt = exports.auditMiddleware = void 0;
const auditService_1 = __importDefault(require("../services/auditService"));
const audit_1 = require("../types/audit");
const auditMiddleware = (action, entity) => {
    return async (req, res, next) => {
        let oldData = null;
        if (action === audit_1.AuditAction.UPDATE && req.params.id) {
            try {
                if (entity === 'organizacao') {
                    const organizacaoService = (await Promise.resolve().then(() => __importStar(require('../services/organizacaoService')))).default;
                    oldData = await organizacaoService.getById(parseInt(req.params.id));
                }
                else if (entity === 'users') {
                    const adminService = (await Promise.resolve().then(() => __importStar(require('../services/adminService')))).default;
                    oldData = await adminService.getUserById(parseInt(req.params.id));
                }
            }
            catch (error) {
                console.warn('⚠️ [AuditMiddleware] Could not capture old data:', error);
            }
        }
        const originalJson = res.json;
        res.json = function (data) {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const userId = req.user?.id;
                let entityId;
                if (req.params.id) {
                    entityId = req.params.id;
                }
                else if (data?.data?.id) {
                    entityId = data.data.id.toString();
                }
                else if (data?.id) {
                    entityId = data.id.toString();
                }
                let newData = null;
                if (action === audit_1.AuditAction.CREATE || action === audit_1.AuditAction.UPDATE) {
                    newData = data?.data || data;
                }
                auditService_1.default.createLog({
                    action,
                    entity,
                    entityId,
                    oldData,
                    newData,
                    userId,
                    req
                }).catch(error => {
                    console.error('❌ [AuditMiddleware] Error creating audit log:', error);
                });
            }
            return originalJson.call(this, data);
        };
        next();
    };
};
exports.auditMiddleware = auditMiddleware;
const auditLoginAttempt = (req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
        if (res.statusCode === 401 || (data && !data.success)) {
            auditService_1.default.createLog({
                action: audit_1.AuditAction.LOGIN_FAILED,
                entity: 'auth',
                userId: undefined,
                req
            }).catch(error => {
                console.error('❌ [AuditMiddleware] Error creating login failed log:', error);
            });
        }
        return originalJson.call(this, data);
    };
    next();
};
exports.auditLoginAttempt = auditLoginAttempt;
const auditAccessDenied = (req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
        if (res.statusCode === 403) {
            const userId = req.user?.id;
            auditService_1.default.createLog({
                action: audit_1.AuditAction.ACCESS_DENIED,
                entity: req.route?.path || 'unknown',
                userId,
                req
            }).catch(error => {
                console.error('❌ [AuditMiddleware] Error creating access denied log:', error);
            });
        }
        return originalJson.call(this, data);
    };
    next();
};
exports.auditAccessDenied = auditAccessDenied;
//# sourceMappingURL=audit.js.map