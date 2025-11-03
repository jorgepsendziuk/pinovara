/**
 * Middleware para verificar se usuário pode fazer upload no repositório
 * Apenas admin, coordenador e supervisor podem enviar arquivos
 * Todos podem visualizar
 */
const requireUploadPermission = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Usuário não autenticado',
        code: 'AUTHENTICATION_REQUIRED',
        statusCode: 401
      },
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Verificar se é admin (acesso total)
  const isAdmin = req.user.roles?.some(role => 
    role.name === 'admin' && role.module.name === 'sistema'
  );

  // Verificar se é coordenador
  const isCoordinator = req.user.roles?.some(role => 
    role.name === 'coordenador' && role.module.name === 'organizacoes'
  );

  // Verificar se é supervisor
  const isSupervisor = req.user.roles?.some(role => 
    role.name === 'supervisao' && role.module.name === 'organizacoes'
  );

  // Apenas admin, coordenador e supervisor podem fazer upload
  if (!isAdmin && !isCoordinator && !isSupervisor) {
    res.status(403).json({
      success: false,
      error: {
        message: 'Acesso negado. Apenas administradores, coordenadores e supervisores podem enviar arquivos para o repositório público.',
        code: 'INSUFFICIENT_PERMISSIONS',
        statusCode: 403
      },
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Adicionar informações sobre permissões à requisição
  req.userPermissions = {
    isAdmin,
    isCoordinator,
    isSupervisor,
    canUpload: true, // Se chegou até aqui, pode fazer upload
    userId: req.user.id
  };

  next();
};

/**
 * Middleware para verificar se usuário pode deletar arquivos do repositório
 * Apenas admin, coordenador e supervisor podem deletar
 */
const requireDeletePermission = (req, res, next) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Usuário não autenticado',
        code: 'AUTHENTICATION_REQUIRED',
        statusCode: 401
      },
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Verificar se é admin (acesso total)
  const isAdmin = req.user.roles?.some(role => 
    role.name === 'admin' && role.module.name === 'sistema'
  );

  // Verificar se é coordenador
  const isCoordinator = req.user.roles?.some(role => 
    role.name === 'coordenador' && role.module.name === 'organizacoes'
  );

  // Verificar se é supervisor
  const isSupervisor = req.user.roles?.some(role => 
    role.name === 'supervisao' && role.module.name === 'organizacoes'
  );

  // Apenas admin, coordenador e supervisor podem deletar
  if (!isAdmin && !isCoordinator && !isSupervisor) {
    res.status(403).json({
      success: false,
      error: {
        message: 'Acesso negado. Apenas administradores, coordenadores e supervisores podem remover arquivos do repositório público.',
        code: 'INSUFFICIENT_PERMISSIONS',
        statusCode: 403
      },
      timestamp: new Date().toISOString()
    });
    return;
  }

  // Adicionar informações sobre permissões à requisição
  req.userPermissions = {
    isAdmin,
    isCoordinator,
    isSupervisor,
    canDelete: true, // Se chegou até aqui, pode deletar
    userId: req.user.id
  };

  next();
};

/**
 * Middleware opcional para verificar se usuário está autenticado
 * Usado para rotas que todos podem acessar mas queremos saber quem está acessando
 */
const optionalAuth = (req, res, next) => {
  // Se não estiver autenticado, continua normalmente
  // Se estiver autenticado, adiciona informações do usuário
  if (req.user) {
    const isAdmin = req.user.roles?.some(role => 
      role.name === 'admin' && role.module.name === 'sistema'
    );

    const isCoordinator = req.user.roles?.some(role => 
      role.name === 'coordenador' && role.module.name === 'organizacoes'
    );

    const isSupervisor = req.user.roles?.some(role => 
      role.name === 'supervisao' && role.module.name === 'organizacoes'
    );

    req.userPermissions = {
      isAdmin,
      isCoordinator,
      isSupervisor,
      canUpload: isAdmin || isCoordinator || isSupervisor,
      canDelete: isAdmin || isCoordinator || isSupervisor,
      userId: req.user.id
    };
  }

  next();
};

module.exports = {
  requireUploadPermission,
  requireDeletePermission,
  optionalAuth
};




