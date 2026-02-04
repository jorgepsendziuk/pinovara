import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { HttpStatus, ErrorCode } from '../types/api';

/**
 * Middleware para verificar permissões do módulo de Supervisão Ocupacional
 */
export const checkSupervisaoOcupacionalPermission = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = (req as any).user;

    if (!user) {
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

    // Verificar se é admin do sistema (acesso total)
    const isSystemAdmin = user.roles?.some((role: any) => 
      role.module?.name === 'sistema' && role.name === 'admin'
    );

    // Verificar se é admin do módulo supervisao_ocupacional
    const isModuleAdmin = user.roles?.some((role: any) => 
      role.module?.name === 'supervisao_ocupacional' && role.name === 'admin'
    );

    // Verificar se é coordenador do módulo supervisao_ocupacional
    const isCoordinator = user.roles?.some((role: any) => 
      role.module?.name === 'supervisao_ocupacional' && role.name === 'coordenador'
    );

    // Verificar se é supervisor do módulo supervisao_ocupacional (apenas visualização)
    const isSupervisor = user.roles?.some((role: any) => 
      role.module?.name === 'supervisao_ocupacional' && role.name === 'supervisor'
    );

    // Verificar se é técnico do módulo supervisao_ocupacional
    const isTechnician = user.roles?.some((role: any) => 
      role.module?.name === 'supervisao_ocupacional' && role.name === 'tecnico'
    );

    // Verificar se é estagiário do módulo supervisao_ocupacional
    const isEstagiario = user.roles?.some((role: any) => 
      role.module?.name === 'supervisao_ocupacional' && role.name === 'estagiario'
    );

    // Verificar se o usuário tem alguma role do módulo supervisao_ocupacional ou é admin do sistema
    const hasPermission = isSystemAdmin || isModuleAdmin || isCoordinator || isSupervisor || isTechnician || isEstagiario;

    if (!hasPermission) {
      res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        error: {
          message: 'Acesso negado ao módulo de Supervisão Ocupacional',
          code: ErrorCode.INSUFFICIENT_PERMISSIONS,
          statusCode: HttpStatus.FORBIDDEN
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // Armazenar permissões detalhadas do usuário para uso nos controllers
    (req as any).userPermissions = {
      userId: user.id,
      roles: user.roles,
      isSystemAdmin,
      isModuleAdmin,
      isCoordinator,
      isSupervisor,
      isTechnician,
      isEstagiario,
      // Permissões específicas
      canViewAll: isSystemAdmin || isModuleAdmin || isCoordinator || isSupervisor || isTechnician, // Todos podem ver, mas técnico só vê suas próprias
      canEdit: isSystemAdmin || isModuleAdmin || isTechnician, // Admin e Técnico podem editar (Supervisor NÃO)
      canValidate: isSystemAdmin || isModuleAdmin || isCoordinator, // Admin e Coordenador podem validar (Supervisor NÃO)
      canViewOwnOnly: isTechnician || isEstagiario // Técnico e Estagiário só veem suas próprias famílias
    };

    next();
  } catch (error) {
    console.error('Erro no middleware de permissões:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        message: 'Erro ao verificar permissões',
        code: ErrorCode.INTERNAL_ERROR,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      },
      timestamp: new Date().toISOString()
    });
  }
};
