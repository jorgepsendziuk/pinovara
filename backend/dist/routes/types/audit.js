"use strict";
/**
 * Tipos relacionados ao sistema de auditoria
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditAction = void 0;
var AuditAction;
(function (AuditAction) {
    AuditAction["LOGIN"] = "LOGIN";
    AuditAction["LOGOUT"] = "LOGOUT";
    AuditAction["CREATE"] = "CREATE";
    AuditAction["UPDATE"] = "UPDATE";
    AuditAction["DELETE"] = "DELETE";
    AuditAction["VIEW"] = "VIEW";
    AuditAction["EXPORT"] = "EXPORT";
    AuditAction["UPLOAD"] = "UPLOAD";
    AuditAction["ACCESS_DENIED"] = "ACCESS_DENIED";
    AuditAction["LOGIN_FAILED"] = "LOGIN_FAILED";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
