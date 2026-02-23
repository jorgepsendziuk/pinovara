import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { ErrorCode, HttpStatus } from '../types/api';
import { ApiError } from '../utils/ApiError';

const prisma = new PrismaClient();

interface CreateUserData {
  email: string;
  password: string;
  name: string;
  active?: boolean;
}

interface UpdateUserData {
  email?: string;
  name?: string;
  active?: boolean;
  password?: string;
}

interface UserWithRoles {
  id: number;
  email: string;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  roles: Array<{
    id: number;
    name: string;
    description: string;
    active: boolean;
    moduleId: number;
    module: {
      id: number;
      name: string;
      description: string;
      active: boolean;
    };
  }>;
}

interface PrismaUser {
  id: number;
  email: string;
  name: string;
  password: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  user_roles?: PrismaUserRole[];
}

interface PrismaUserRole {
  userId: number;
  roleId: number;
  roles: PrismaRole;
}

interface PrismaRole {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  moduleId: number;
  modules: PrismaModule;
}

interface PrismaModule {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class AdminService {
  /**
   * Listar todos os usuários com suas roles
   */
  async getAllUsers(): Promise<UserWithRoles[]> {
    try {
      const users = await prisma.users.findMany({
        include: {
          user_roles: {
            include: {
              roles: {
                include: {
                  modules: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return users.map((user: PrismaUser) => this.formatUserWithRoles(user));
    } catch (error) {
      console.error('❌ [AdminService] Error listing users:', error);
      throw new ApiError({
        message: 'Erro ao listar usuários',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR
      });
    }
  }

  /**
   * Buscar usuário por ID com roles
   */
  async getUserById(userId: number): Promise<UserWithRoles | null> {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          user_roles: {
            include: {
              roles: {
                include: {
                  modules: true
                }
              }
            }
          }
        }
      });

      return user ? this.formatUserWithRoles(user as any) : null;
    } catch (error) {
      console.error('❌ [AdminService] Error fetching user:', error);
      throw new ApiError({
        message: 'Erro ao buscar usuário',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR
      });
    }
  }

  /**
   * Criar novo usuário
   */
  async createUser(data: CreateUserData): Promise<UserWithRoles> {
    const { email, password, name, active = true } = data;

    // Validações
    if (!email || !password || !name) {
      throw new ApiError({
        message: 'Email, senha e nome são obrigatórios',
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.MISSING_REQUIRED_FIELD
      });
    }

    if (password.length < 6) {
      throw new ApiError({
        message: 'Senha deve ter pelo menos 6 caracteres',
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.VALIDATION_ERROR
      });
    }

    // Verificar se email já existe
    const existingUser = await prisma.users.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      throw new ApiError({
        message: 'Email já cadastrado',
        statusCode: HttpStatus.CONFLICT,
        code: ErrorCode.RESOURCE_ALREADY_EXISTS
      });
    }

    try {
      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 12);

      // Criar usuário
      const user = await prisma.users.create({
        data: {
          email: email.toLowerCase(),
          password: hashedPassword,
          name: name.trim(),
          active,
          updatedAt: new Date()
        },
        include: {
          user_roles: {
            include: {
              roles: {
                include: {
                  modules: true
                }
              }
            }
          }
        }
      });

      console.log('✅ [AdminService] User created:', user.id, user.email);
      return this.formatUserWithRoles(user as any);
    } catch (error) {
      console.error('❌ [AdminService] Error creating user:', error);
      throw new ApiError({
        message: 'Erro ao criar usuário',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR
      });
    }
  }

  /**
   * Atualizar usuário
   */
  async updateUser(userId: number, data: UpdateUserData): Promise<UserWithRoles> {
    const updateData: any = { ...data };

    // Se uma nova senha foi fornecida, fazer hash
    if (data.password) {
      if (data.password.length < 6) {
        throw new ApiError({
          message: 'Senha deve ter pelo menos 6 caracteres',
          statusCode: HttpStatus.BAD_REQUEST,
          code: ErrorCode.VALIDATION_ERROR
        });
      }
      updateData.password = await bcrypt.hash(data.password, 12);

      const currentUser = await prisma.users.findUnique({
        where: { id: userId }
      });
      
      if (currentUser) {
        // Sincronizar usuário com ODK
        const p_fullname = updateData.name || currentUser.name;
        const p_username = currentUser.email;
        const p_password = data.password;
        
        try {
          const result = await prisma.$queryRawUnsafe(`
            SELECT public.fn_sync_user_to_odk($1, $2, $3)
          `, p_fullname, p_username, p_password);
          
          console.log('✅ [AdminService] Usuário sincronizado com ODK:', currentUser.email);
        } catch (error: any) {
          console.error('⚠️ [AdminService] Erro ao sincronizar com ODK:', error?.message);
          // A atualização da senha continua mesmo se a sincronização falhar
        }
      }
    }

    // Se email foi fornecido, verificar se não existe outro usuário com mesmo email
    if (data.email) {
      const existingUser = await prisma.users.findFirst({
        where: {
          email: data.email.toLowerCase(),
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        throw new ApiError({
          message: 'Email já está sendo usado por outro usuário',
          statusCode: HttpStatus.CONFLICT,
          code: ErrorCode.RESOURCE_ALREADY_EXISTS
        });
      }

      updateData.email = data.email.toLowerCase();
    }

    if (data.name) {
      updateData.name = data.name.trim();
    }

    updateData.updatedAt = new Date();

    try {
      const user = await prisma.users.update({
        where: { id: userId },
        data: updateData,
        include: {
          user_roles: {
            include: {
              roles: {
                include: {
                  modules: true
                }
              }
            }
          }
        }
      });

      console.log('✅ [AdminService] User updated:', userId);
      return this.formatUserWithRoles(user as any);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new ApiError({
          message: 'Usuário não encontrado',
          statusCode: HttpStatus.NOT_FOUND,
          code: ErrorCode.RESOURCE_NOT_FOUND
        });
      }

      console.error('❌ [AdminService] Error updating user:', error);
      throw new ApiError({
        message: 'Erro ao atualizar usuário',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR
      });
    }
  }

  /**
   * Deletar usuário
   */
  async deleteUser(userId: number): Promise<void> {
    try {
      // Verificar se usuário existe
      const user = await prisma.users.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new ApiError({
          message: 'Usuário não encontrado',
          statusCode: HttpStatus.NOT_FOUND,
          code: ErrorCode.RESOURCE_NOT_FOUND
        });
      }

      // Deletar usuário (user_roles serão deletadas automaticamente devido ao onDelete: Cascade)
      await prisma.users.delete({
        where: { id: userId }
      });

      console.log('✅ [AdminService] User deleted:', userId);
    } catch (error: any) {
      if (error instanceof ApiError) throw error;

      console.error('❌ [AdminService] Error deleting user:', error);
      throw new ApiError({
        message: 'Erro ao deletar usuário',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR
      });
    }
  }

  /**
   * Atualizar status do usuário (ativo/inativo)
   */
  async updateUserStatus(userId: number, active: boolean): Promise<UserWithRoles> {
    return this.updateUser(userId, { active });
  }

  /**
   * Atribuir role a um usuário
   */
  async assignRoleToUser(userId: number, roleId: number): Promise<void> {
    try {
      // Verificar se usuário existe
      const user = await prisma.users.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new ApiError({
          message: 'Usuário não encontrado',
          statusCode: HttpStatus.NOT_FOUND,
          code: ErrorCode.RESOURCE_NOT_FOUND
        });
      }

      // Verificar se role existe
      const role = await prisma.roles.findUnique({
        where: { id: roleId }
      });

      if (!role) {
        throw new ApiError({
          message: 'Papel não encontrado',
          statusCode: HttpStatus.NOT_FOUND,
          code: ErrorCode.RESOURCE_NOT_FOUND
        });
      }

      // Verificar se user_role já existe
      const existingUserRole = await prisma.user_roles.findFirst({
        where: {
          userId,
          roleId
        }
      });

      if (existingUserRole) {
        throw new ApiError({
          message: 'Usuário já possui este papel',
          statusCode: HttpStatus.CONFLICT,
          code: ErrorCode.RESOURCE_ALREADY_EXISTS
        });
      }

      // Criar user_role
      await prisma.user_roles.create({
        data: {
          userId,
          roleId,
          updatedAt: new Date()
        }
      });

      console.log('✅ [AdminService] Role assigned:', userId, roleId);
    } catch (error: any) {
      if (error instanceof ApiError) throw error;

      console.error('❌ [AdminService] Error assigning role:', error);
      throw new ApiError({
        message: 'Erro ao atribuir papel',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR
      });
    }
  }

  /**
   * Remover role de um usuário
   */
  async removeRoleFromUser(userId: number, roleId: number): Promise<void> {
    try {
      // Verificar se user_role existe
      const userRole = await prisma.user_roles.findFirst({
        where: {
          userId,
          roleId
        }
      });

      if (!userRole) {
        throw new ApiError({
          message: 'Usuário não possui este papel',
          statusCode: HttpStatus.NOT_FOUND,
          code: ErrorCode.RESOURCE_NOT_FOUND
        });
      }

      // Remover user_role
      await prisma.user_roles.delete({
        where: { id: userRole.id }
      });

      console.log('✅ [AdminService] Role removed:', userId, roleId);
    } catch (error: any) {
      if (error instanceof ApiError) throw error;

      console.error('❌ [AdminService] Error removing role:', error);
      throw new ApiError({
        message: 'Erro ao remover papel',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR
      });
    }
  }

  /**
   * Listar todos os módulos
   */
  async getAllModules() {
    try {
      const modules = await prisma.modules.findMany({
        include: {
          _count: { select: { roles: true } }
        },
        orderBy: { name: 'asc' }
      });

      return modules.map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description || '',
        active: m.active,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        _count: m._count
      }));
    } catch (error) {
      console.error('❌ [AdminService] Error listing modules:', error);
      throw new ApiError({
        message: 'Erro ao listar módulos',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR
      });
    }
  }

  /**
   * Criar novo módulo
   */
  async createModule(data: { name: string; description?: string }) {
    try {
      const module = await prisma.modules.create({
        data: {
          name: data.name,
          description: data.description || null,
          updatedAt: new Date()
        }
      });
      return module;
    } catch (error) {
      console.error('❌ [AdminService] Error creating module:', error);
      throw new ApiError({
        message: 'Erro ao criar módulo',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR
      });
    }
  }

  /**
   * Atualizar módulo
   */
  async updateModule(moduleId: number, data: { name?: string; description?: string }) {
    try {
      const module = await prisma.modules.update({
        where: { id: moduleId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          updatedAt: new Date()
        }
      });
      return module;
    } catch (error) {
      console.error('❌ [AdminService] Error updating module:', error);
      throw new ApiError({
        message: 'Erro ao atualizar módulo',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR
      });
    }
  }

  /**
   * Excluir módulo (cascade remove roles)
   */
  async deleteModule(moduleId: number) {
    try {
      await prisma.modules.delete({
        where: { id: moduleId }
      });
    } catch (error) {
      console.error('❌ [AdminService] Error deleting module:', error);
      throw new ApiError({
        message: 'Erro ao excluir módulo',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR
      });
    }
  }

  /**
   * Listar todas as roles disponíveis
   */
  async getAllRoles() {
    try {
      const roles = await prisma.roles.findMany({
        include: {
          modules: true
        },
        orderBy: [
          { modules: { name: 'asc' } },
          { name: 'asc' }
        ]
      });

      return roles.map((role: PrismaRole) => ({
        id: role.id,
        name: role.name,
        description: role.description || '',
        active: role.active,
        moduleId: role.moduleId,
        module: {
          id: role.modules.id,
          name: role.modules.name,
          description: role.modules.description || '',
          active: role.modules.active
        }
      }));
    } catch (error) {
      console.error('❌ [AdminService] Error listing roles:', error);
      throw new ApiError({
        message: 'Erro ao listar papéis',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR
      });
    }
  }

  /**
   * Formatar usuário com roles para resposta
   */
  private formatUserWithRoles(user: PrismaUser): UserWithRoles {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.user_roles ? user.user_roles.map((ur: PrismaUserRole) => ({
        id: ur.roles.id,
        name: ur.roles.name,
        description: ur.roles.description || '',
        active: ur.roles.active,
        moduleId: ur.roles.moduleId,
        module: {
          id: ur.roles.modules.id,
          name: ur.roles.modules.name,
          description: ur.roles.modules.description || '',
          active: ur.roles.modules.active
        }
      })) : []
    };
  }

  /**
   * Gerar token de personificação para um usuário
   */
  async generateImpersonationToken(userId: number, adminUser: any) {
    try {
      // Buscar o usuário a ser personificado
      const user = await prisma.users.findUnique({
        where: { id: userId },
        include: {
          user_roles: {
            include: {
              roles: {
                include: {
                  modules: true
                }
              }
            }
          }
        }
      });

      if (!user) {
        throw new ApiError({
          message: 'Usuário não encontrado',
          statusCode: HttpStatus.NOT_FOUND,
          code: ErrorCode.RESOURCE_NOT_FOUND
        });
      }

      if (!user.active) {
        throw new ApiError({
          message: 'Não é possível personificar um usuário inativo',
          statusCode: HttpStatus.BAD_REQUEST,
          code: ErrorCode.VALIDATION_ERROR
        });
      }

      // Gerar token JWT para personificação
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new ApiError({
          message: 'Configuração JWT não encontrada',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          code: ErrorCode.INTERNAL_ERROR
        });
      }

      const tokenPayload = {
        userId: user.id,
        email: user.email,
        impersonatedBy: adminUser.id,
        isImpersonation: true
      };

      // Token expira em 8 horas para personificação
      const token = jwt.sign(tokenPayload, jwtSecret, {
        expiresIn: '8h',
        audience: 'pinovara-frontend',
        issuer: 'pinovara-api'
      });

      // Formatar dados do usuário personificado
      const userData = this.formatUserWithRoles(user);

      return {
        token,
        user: userData,
        expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 horas
      };

    } catch (error) {
      console.error('Erro ao gerar token de personificação:', error);

      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError({
        message: 'Erro ao gerar token de personificação',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.INTERNAL_ERROR
      });
    }
  }
}

export default new AdminService();
