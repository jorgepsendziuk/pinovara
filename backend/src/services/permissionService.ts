import { PrismaClient } from '@prisma/client';
import { ErrorCode, HttpStatus } from '../types/api';
import { ApiError } from '../utils/ApiError';

const prisma = new PrismaClient();

export interface Permission {
  id: number;
  code: string;
  name: string;
  description: string | null;
  module_name: string | null;
  category: string | null;
  active: boolean;
}

export interface RolePermission {
  roleId: number;
  permissionId: number;
  enabled: boolean;
}

class PermissionService {
  /**
   * Listar todas as permissões do catálogo
   */
  async getAllPermissions(): Promise<Permission[]> {
    try {
      const rows = await prisma.permissions.findMany({
        where: { active: true },
        orderBy: [{ module_name: 'asc' }, { category: 'asc' }, { code: 'asc' }]
      });
      return rows as Permission[];
    } catch (error) {
      console.error('❌ [PermissionService] getAllPermissions:', error);
      throw new ApiError({
        message: 'Erro ao listar permissões',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR
      });
    }
  }

  /**
   * Obter permissões de um role (com status enabled)
   */
  async getPermissionsByRole(roleId: number): Promise<RolePermission[]> {
    try {
      const rows = await prisma.role_permissions.findMany({
        where: { roleId },
        select: { roleId: true, permissionId: true, enabled: true }
      });
      return rows;
    } catch (error) {
      console.error('❌ [PermissionService] getPermissionsByRole:', error);
      throw new ApiError({
        message: 'Erro ao obter permissões do role',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR
      });
    }
  }

  /**
   * Obter permissões efetivas de um usuário (códigos das permissões habilitadas)
   * Agrega de todos os roles do usuário
   */
  async getEffectivePermissions(userId: number): Promise<string[]> {
    try {
      const userRoles = await prisma.user_roles.findMany({
        where: { userId },
        select: { roleId: true }
      });
      const roleIds = userRoles.map(ur => ur.roleId);
      if (roleIds.length === 0) return [];

      const rolePerms = await prisma.role_permissions.findMany({
        where: { roleId: { in: roleIds }, enabled: true },
        include: { permissions: true }
      });
      const codes = [...new Set(rolePerms.map(rp => rp.permissions.code))];
      return codes;
    } catch (error) {
      console.error('❌ [PermissionService] getEffectivePermissions:', error);
      return [];
    }
  }

  /**
   * Verificar se usuário tem permissão por código
   */
  async hasPermission(userId: number, code: string): Promise<boolean> {
    const codes = await this.getEffectivePermissions(userId);
    return codes.includes(code);
  }

  /**
   * Verificar se há dados de role_permissions para os roles do usuário.
   * Se não houver, os middlewares devem usar fallback (lógica hardcoded).
   */
  async hasRolePermissionsData(userId: number): Promise<boolean> {
    try {
      const userRoles = await prisma.user_roles.findMany({
        where: { userId },
        select: { roleId: true }
      });
      const roleIds = userRoles.map(ur => ur.roleId);
      if (roleIds.length === 0) return false;
      const count = await prisma.role_permissions.count({
        where: { roleId: { in: roleIds } }
      });
      return count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Atualizar permissões de um role (upsert em lote)
   */
  async updateRolePermissions(
    roleId: number,
    updates: Array<{ permissionId: number; enabled: boolean }>
  ): Promise<void> {
    try {
      for (const u of updates) {
        await prisma.role_permissions.upsert({
          where: {
            roleId_permissionId: { roleId, permissionId: u.permissionId }
          },
          create: {
            roleId,
            permissionId: u.permissionId,
            enabled: u.enabled,
            updatedAt: new Date()
          },
          update: { enabled: u.enabled, updatedAt: new Date() }
        });
      }
    } catch (error) {
      console.error('❌ [PermissionService] updateRolePermissions:', error);
      throw new ApiError({
        message: 'Erro ao atualizar permissões do role',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR
      });
    }
  }

  /**
   * Obter roles com suas permissões (para UI de gestão)
   */
  async getRolesWithPermissions(): Promise<
    Array<{
      id: number;
      name: string;
      moduleId: number;
      module: { id: number; name: string };
      permissions: Array<{ permissionId: number; code: string; name: string; enabled: boolean }>;
    }>
  > {
    try {
      const roles = await prisma.roles.findMany({
        where: { active: true },
        include: {
          modules: true,
          role_permissions: {
            include: { permissions: true }
          }
        }
      });
      return roles.map(r => ({
        id: r.id,
        name: r.name,
        moduleId: r.moduleId,
        module: { id: r.modules.id, name: r.modules.name },
        permissions: r.role_permissions.map(rp => ({
          permissionId: rp.permissionId,
          code: rp.permissions.code,
          name: rp.permissions.name,
          enabled: rp.enabled
        }))
      }));
    } catch (error) {
      console.error('❌ [PermissionService] getRolesWithPermissions:', error);
      throw new ApiError({
        message: 'Erro ao listar roles com permissões',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: ErrorCode.DATABASE_ERROR
      });
    }
  }
}

export const permissionService = new PermissionService();
