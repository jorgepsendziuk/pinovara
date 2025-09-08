import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// ========== SCHEMAS DE VALIDAÇÃO ==========

export const registerSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').trim(),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(1, 'Senha é obrigatória'),
});

// ========== INTERFACES ==========

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  active: boolean;
  roles: AuthRole[];
}

export interface AuthRole {
  id: number;
  name: string;
  module: {
    id: number;
    name: string;
  };
}

export interface AuthPayload extends AuthUser {
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  expiresIn: number;
}

export interface RegisterResponse extends LoginResponse {}

// ========== CONFIGURAÇÃO ==========

const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'fallback-secret-change-in-production',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

const SALT_ROUNDS = 12;

// ========== UTILITÁRIOS ==========

/**
 * Hash de senha usando bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Verificação de senha
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Geração de token JWT
 */
export const generateToken = (payload: Omit<AuthPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, JWT_CONFIG.SECRET, {
    expiresIn: JWT_CONFIG.EXPIRES_IN,
  } as SignOptions);
};

/**
 * Verificação de token JWT
 */
export const verifyToken = (token: string): AuthPayload => {
  try {
    return jwt.verify(token, JWT_CONFIG.SECRET) as AuthPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expirado');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token inválido');
    }
    throw new Error('Erro na verificação do token');
  }
};

/**
 * Formatar dados do usuário para resposta
 */
const formatUser = (user: any): AuthUser => ({
  id: user.id,
  email: user.email,
  name: user.name,
  active: user.active,
  roles: user.userRoles?.map((userRole: any) => ({
    id: userRole.role.id,
    name: userRole.role.name,
    module: {
      id: userRole.role.module.id,
      name: userRole.role.module.name,
    },
  })) || [],
});

// ========== SERVIÇOS PRINCIPAIS ==========

/**
 * Serviço de registro de usuário
 */
export const registerUser = async (data: z.infer<typeof registerSchema>): Promise<RegisterResponse> => {
  const validatedData = registerSchema.parse(data);

  // Verificar se usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedData.email },
  });

  if (existingUser) {
    throw new Error('Usuário já existe com este email');
  }

  // Hash da senha
  const hashedPassword = await hashPassword(validatedData.password);

  // Criar usuário
  const user = await prisma.user.create({
    data: {
      email: validatedData.email,
      password: hashedPassword,
      name: validatedData.name,
    },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              module: true,
            },
          },
        },
      },
    },
  });

  const formattedUser = formatUser(user);
  const token = generateToken(formattedUser);

  return {
    user: formattedUser,
    token,
      expiresIn: (jwt.decode(token) as any)?.exp || 0,
  };
};

/**
 * Serviço de login
 */
export const loginUser = async (data: z.infer<typeof loginSchema>): Promise<LoginResponse> => {
  const validatedData = loginSchema.parse(data);

  // Buscar usuário
  const user = await prisma.user.findUnique({
    where: { email: validatedData.email },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              module: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('Credenciais inválidas');
  }

  if (!user.active) {
    throw new Error('Conta desativada. Entre em contato com o administrador.');
  }

  // Verificar senha
  const isPasswordValid = await verifyPassword(validatedData.password, user.password);
  if (!isPasswordValid) {
    throw new Error('Credenciais inválidas');
  }

  const formattedUser = formatUser(user);
  const token = generateToken(formattedUser);

  return {
    user: formattedUser,
    token,
      expiresIn: (jwt.decode(token) as any)?.exp || 0,
  };
};

/**
 * Buscar usuário por ID
 */
export const getUserById = async (userId: number): Promise<AuthUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              module: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  return formatUser(user);
};

/**
 * Verificar se usuário tem uma permissão específica
 */
export const hasPermission = (user: AuthUser, moduleName: string, roleName?: string): boolean => {
  return user.roles.some(role => {
    const moduleMatch = role.module.name === moduleName;
    const roleMatch = !roleName || role.name === roleName;
    return moduleMatch && roleMatch;
  });
};

/**
 * Verificar se usuário tem qualquer uma das permissões especificadas
 */
export const hasAnyPermission = (user: AuthUser, permissions: { module: string; role?: string }[]): boolean => {
  return permissions.some(permission => hasPermission(user, permission.module, permission.role));
};

// ========== VALIDAÇÃO ==========

export const validateRegisterData = (data: unknown) => registerSchema.parse(data);
export const validateLoginData = (data: unknown) => loginSchema.parse(data);

// ========== EXPORTAÇÕES ==========

export const AuthService = {
  register: registerUser,
  login: loginUser,
  getUserById,
  hasPermission,
  hasAnyPermission,
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
};