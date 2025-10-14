import { Request, Response, NextFunction } from 'express';
import auditService from '../services/auditService';
import { AuditAction } from '../types/audit';

/**
 * Middleware para registrar ações de auditoria automaticamente
 */
export const auditMiddleware = (action: AuditAction, entity: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Capturar dados antes da operação (para UPDATE)
    let oldData: any = null;
    
    if (action === AuditAction.UPDATE && req.params.id) {
      try {
        // Tentar capturar dados anteriores baseado na entidade
        if (entity === 'organizacao') {
          const organizacaoService = (await import('../services/organizacaoService')).default;
          oldData = await organizacaoService.getById(parseInt(req.params.id));
        } else if (entity === 'users') {
          const adminService = (await import('../services/adminService')).default;
          oldData = await adminService.getUserById(parseInt(req.params.id));
        }
      } catch (error) {
        console.warn('⚠️ [AuditMiddleware] Could not capture old data:', error);
      }
    }

    // Interceptar a resposta para capturar dados após a operação
    const originalJson = res.json;
    res.json = function(data: any) {
      // Registrar log de auditoria se a operação foi bem-sucedida
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = (req as any).user?.id;
        
        // Determinar entityId baseado na resposta ou parâmetros
        let entityId: string | undefined;
        if (req.params.id) {
          entityId = req.params.id;
        } else if (data?.data?.id) {
          entityId = data.data.id.toString();
        } else if (data?.id) {
          entityId = data.id.toString();
        }

        // Capturar dados novos para CREATE/UPDATE
        let newData: any = null;
        if (action === AuditAction.CREATE || action === AuditAction.UPDATE) {
          newData = data?.data || data;
        }

        // Registrar log de auditoria
        auditService.createLog({
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

      // Chamar o método original
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Middleware específico para capturar tentativas de login falhadas
 */
export const auditLoginAttempt = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    // Se a resposta indica falha de autenticação
    if (res.statusCode === 401 || (data && !data.success)) {
      auditService.createLog({
        action: AuditAction.LOGIN_FAILED,
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

/**
 * Middleware para capturar tentativas de acesso negado
 */
export const auditAccessDenied = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;
  
  res.json = function(data: any) {
    // Se a resposta indica acesso negado
    if (res.statusCode === 403) {
      const userId = (req as any).user?.id;
      
      auditService.createLog({
        action: AuditAction.ACCESS_DENIED,
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
