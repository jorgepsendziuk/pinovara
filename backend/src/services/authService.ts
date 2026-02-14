import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { LoginData, RegisterData, LoginResponse, JWTPayload, UserWithRoles } from '../types/auth';
import { ErrorCode, HttpStatus } from '../types/api';

const prisma = new PrismaClient();

class AuthService {
  /**
   * Fazer login do usuário
   */
  async login(data: LoginData): Promise<LoginResponse> {
    const { email, password } = data;

    // Validações básicas
    if (!email || !password) {
      throw new ApiError({
        message: 'Email e senha são obrigatórios',
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.MISSING_REQUIRED_FIELD
      });
    }

    // Buscar usuário com relacionamentos de roles
    const user = await prisma.users.findUnique({
      where: { email: email.toLowerCase() },
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
    }) as any;

    if (!user) {
      throw new ApiError({
        message: 'Credenciais inválidas',
        statusCode: HttpStatus.UNAUTHORIZED,
        code: ErrorCode.INVALID_CREDENTIALS
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new ApiError({
        message: 'Credenciais inválidas',
        statusCode: HttpStatus.UNAUTHORIZED,
        code: ErrorCode.INVALID_CREDENTIALS
      });
    }

    // Verificar se usuário está ativo
    if (!user.active) {
      throw new ApiError({
        message: 'Usuário inativo',
        statusCode: HttpStatus.UNAUTHORIZED,
        code: ErrorCode.INSUFFICIENT_PERMISSIONS
      });
    }

    // Gerar token
    const token = this.generateToken({ userId: user.id, email: user.email });
    const expiresIn = 7 * 24 * 60 * 60; // 7 dias

    // Debug: Log roles loading for olivanrabelo@gmail.com
    if (user.email === 'olivanrabelo@gmail.com') {
      console.log('🔍 [DEBUG] Loading roles for olivanrabelo@gmail.com:');
      console.log('- user.user_roles exists:', !!user.user_roles);
      console.log('- user.user_roles length:', user.user_roles?.length || 0);
      console.log('- user.user_roles data:', JSON.stringify(user.user_roles, null, 2));
    }

    // Formatar resposta
    const userWithRoles: UserWithRoles = {
      id: user.id,
      email: user.email,
      name: user.name,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.user_roles ? user.user_roles.map((ur: any) => ({
        id: ur.roles.id,
        name: ur.roles.name,
        description: ur.roles.description,
        active: ur.roles.active,
        createdAt: ur.roles.createdAt,
        updatedAt: ur.roles.updatedAt,
        moduleId: ur.roles.moduleId,
        module: {
          id: ur.roles.modules.id,
          name: ur.roles.modules.name,
          description: ur.roles.modules.description,
          active: ur.roles.modules.active,
          createdAt: ur.roles.modules.createdAt,
          updatedAt: ur.roles.modules.updatedAt
        }
      })) : []
    };

    // Debug: Log final roles count
    if (user.email === 'olivanrabelo@gmail.com') {
      console.log('🎭 [DEBUG] Final roles count for olivanrabelo@gmail.com:', userWithRoles.roles.length);
    }

    return {
      user: userWithRoles,
      token,
      expiresIn
    };
  }

  /**
   * Registrar novo usuário
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    const { email, password, name } = data;

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

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const user = await prisma.users.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        active: true,
        updatedAt: new Date()
      },
      // Sem includes por enquanto
    });

    // Gerar token
    const token = this.generateToken({ userId: user.id, email: user.email });
    const expiresIn = this.getExpiresInSeconds();

    // Formatar resposta
    const userWithRoles: UserWithRoles = {
      id: user.id,
      email: user.email,
      name: user.name,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: [] // Usuário recém-criado não tem roles ainda
    };

    return {
      user: userWithRoles,
      token,
      expiresIn
    };
  }

  /**
   * Obter dados do usuário por ID
   */
  async getUserById(userId: number): Promise<UserWithRoles> {
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
    }) as any;

    if (!user) {
      throw new ApiError({
        message: 'Usuário não encontrado',
        statusCode: HttpStatus.NOT_FOUND,
        code: ErrorCode.RESOURCE_NOT_FOUND
      });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      active: user.active,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles: user.user_roles.map((ur: any) => ({
        id: ur.roles.id,
        name: ur.roles.name,
        description: ur.roles.description,
        active: ur.roles.active,
        createdAt: ur.roles.createdAt,
        updatedAt: ur.roles.updatedAt,
        moduleId: ur.roles.moduleId,
        module: {
          id: ur.roles.modules.id,
          name: ur.roles.modules.name,
          description: ur.roles.modules.description,
          active: ur.roles.modules.active,
          createdAt: ur.roles.modules.createdAt,
          updatedAt: ur.roles.modules.updatedAt
        }
      }))
    };
  }

  /**
   * Verificar se token é válido
   */
  async verifyToken(token: string): Promise<UserWithRoles> {
    if (!process.env.JWT_SECRET) {
      throw new ApiError({
        message: 'Configuração de JWT inválida',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.INTERNAL_ERROR
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
      return await this.getUserById(decoded.userId);
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ApiError({
          message: 'Token inválido',
          statusCode: HttpStatus.UNAUTHORIZED,
          code: ErrorCode.TOKEN_INVALID
        });
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new ApiError({
          message: 'Token expirado',
          statusCode: HttpStatus.UNAUTHORIZED,
          code: ErrorCode.TOKEN_EXPIRED
        });
      }
      throw error;
    }
  }

  /**
   * Renovar token (refresh)
   */

  /**
   * Atualizar perfil do usuário
   */
  async updateProfile(userId: number, data: { name: string; email: string }): Promise<UserWithRoles> {
    const { name, email } = data;

    // Validações básicas
    if (!name || !email) {
      throw new ApiError({
        message: 'Nome e email são obrigatórios',
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.MISSING_REQUIRED_FIELD
      });
    }

    if (name.trim().length < 2) {
      throw new ApiError({
        message: 'Nome deve ter pelo menos 2 caracteres',
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.VALIDATION_ERROR
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError({
        message: 'Email inválido',
        statusCode: HttpStatus.BAD_REQUEST,
        code: ErrorCode.VALIDATION_ERROR
      });
    }

    // Verificar se o email já está em uso por outro usuário
    const existingUser = await prisma.users.findFirst({
      where: {
        email: email.toLowerCase(),
        id: { not: userId }
      }
    });

    if (existingUser) {
      throw new ApiError({
        message: 'Este email já está em uso por outro usuário',
        statusCode: HttpStatus.CONFLICT,
        code: ErrorCode.RESOURCE_ALREADY_EXISTS
      });
    }

    // Atualizar usuário
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
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
    }) as any;

    // Retornar dados formatados
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      active: updatedUser.active,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      roles: updatedUser.user_roles ? updatedUser.user_roles.map((ur: any) => ({
        id: ur.roles.id,
        name: ur.roles.name,
        description: ur.roles.description,
        active: ur.roles.active,
        createdAt: ur.roles.createdAt,
        updatedAt: ur.roles.updatedAt,
        moduleId: ur.roles.moduleId,
        module: {
          id: ur.roles.modules.id,
          name: ur.roles.modules.name,
          description: ur.roles.modules.description,
          active: ur.roles.modules.active,
          createdAt: ur.roles.modules.createdAt,
          updatedAt: ur.roles.modules.updatedAt
        }
      })) : []
    };
  }

  /**
   * Obter tempo de expiração em segundos
   */
  private getExpiresInSeconds(): number {
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    
    // Converter formato de tempo para segundos
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      // Se formato inválido, usar 7 dias como padrão
      return 7 * 24 * 60 * 60;
    }
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 7 * 24 * 60 * 60;
    }
  }

  /**
   * Retorna o acesso disponível para usuário sem papéis (inscrições em capacitações e organizações associadas ao email)
   */
  async getMeuAcessoSemPapel(email: string): Promise<{ capacitacoesInscrito: number; organizacoesAssociadas: number }> {
    const emailNorm = email?.trim().toLowerCase();
    if (!emailNorm) {
      return { capacitacoesInscrito: 0, organizacoesAssociadas: 0 };
    }

    const [inscricoesCount, orgsCount] = await Promise.all([
      // Capacitações em que o email está inscrito (distintas)
      prisma.capacitacao_inscricao
        .findMany({
          where: { email: { equals: emailNorm, mode: 'insensitive' } },
          select: { id_capacitacao: true },
          distinct: ['id_capacitacao']
        })
        .then((r) => r.length),
      // Organizações onde email ou representante_email = user.email
      prisma.organizacao.count({
        where: {
          OR: [
            { email: { equals: emailNorm, mode: 'insensitive' } },
            { representante_email: { equals: emailNorm, mode: 'insensitive' } }
          ],
          removido: { not: true }
        }
      })
    ]);

    return { capacitacoesInscrito: inscricoesCount, organizacoesAssociadas: orgsCount };
  }

  /**
   * Gerar token JWT
   */
  private generateToken(payload: JWTPayload): string {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não configurado');
    }

    // Simplificado para evitar problemas de tipagem
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return token;
  }
}

// Classe personalizada para erros da API
class ApiError extends Error {
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
  }
}

export const authService = new AuthService();
export { ApiError };