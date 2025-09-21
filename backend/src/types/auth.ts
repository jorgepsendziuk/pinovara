/**
 * Tipos relacionados à autenticação
 */

export interface User {
  id: number;
  email: string;
  name: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  moduleId: number;
  module: Module;
}

export interface Module {
  id: number;
  name: string;
  description?: string;
  active: boolean;
}

export interface UserWithRoles extends User {
  roles: Array<{
    id: number;
    name: string;
    module: {
      id: number;
      name: string;
    };
  }>;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginResponse {
  user: UserWithRoles;
  token: string;
  expiresIn: number;
}

export interface JWTPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}