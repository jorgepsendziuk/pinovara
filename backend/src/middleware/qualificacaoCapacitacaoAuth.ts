import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { ErrorCode, HttpStatus } from '../types/api';

/**
 * Middleware para verificar permissões nas qualificações e capacitações baseado na role
 */
export const checkQualificacaoCapacitacaoPermission = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      error: {
        message: 'Usuário não autenticado',
        code: ErrorCode.AUTHENTICATION_REQUIRED,
        statusCode: HttpStatus.UNAUTHORIZED
      },
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Verificar se é admin (acesso total)
  const isAdmin = req.user.roles?.some(role => 
    role.name === 'admin' && role.module.name === 'sistema'
  );

  // Verificar se é coordenador (visualização de tudo, validação, mas não edição)
  const isCoordinator = req.user.roles?.some(role => 
    role.name === 'coordenador' && role.module.name === 'organizacoes'
  );

  // Verificar se é supervisor (visualização de tudo, mas não edição nem validação)
  const isSupervisor = req.user.roles?.some(role => 
    role.name === 'supervisao' && role.module.name === 'organizacoes'
  );

  // Verificar se é técnico
  const isTechnician = req.user.roles?.some(role => 
    role.name === 'tecnico' && role.module.name === 'organizacoes'
  );

  // Adicionar informações sobre permissões à requisição
  (req as any).userPermissions = {
    isAdmin,
    isCoordinator,
    isSupervisor,
    isTechnician,
    canAccessAll: isAdmin || isCoordinator || isSupervisor, // Admin, Coordenador e Supervisor veem tudo
    canEdit: isAdmin, // Apenas Admin pode editar
    canValidate: isAdmin || isCoordinator, // Admin e Coordenador podem validar (Supervisor NÃO)
    userId: req.user.id
  };

  next();
};

export default {
  checkQualificacaoCapacitacaoPermission
};
