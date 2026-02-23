import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const permissionService = {
  /**
   * Verifica se o usuário tem dados de role_permissions (possui roles com permissões atribuídas).
   */
  async hasRolePermissionsData(userId: number): Promise<boolean> {
    const roleIds = await prisma.user_roles.findMany({
      where: { userId },
      select: { roleId: true }
    }).then(rows => rows.map(r => r.roleId));
    if (roleIds.length === 0) return false;
    const count = await prisma.role_permissions.count({
      where: { roleId: { in: roleIds } }
    });
    return count > 0;
  },

  /**
   * Retorna os códigos de permissão efetivos do usuário (via user_roles -> role_permissions -> permissions).
   */
  async getEffectivePermissions(userId: number): Promise<string[]> {
    const userRoles = await prisma.user_roles.findMany({
      where: { userId },
      select: { roleId: true }
    });
    const roleIds = userRoles.map(r => r.roleId);
    if (roleIds.length === 0) return [];
    const rps = await prisma.role_permissions.findMany({
      where: { roleId: { in: roleIds }, enabled: true },
      include: { permissions: { select: { code: true } } }
    });
    const codes = rps.map(rp => rp.permissions.code);
    return [...new Set(codes)];
  },

  /**
   * Lista todas as permissões e todos os role_permissions (para admin).
   */
  async getPermissionsFull(): Promise<{
    permissions: Array<{ id: number; code: string; name: string; module_name: string | null; category: string | null; active: boolean }>;
    rolePermissions: Array<{ roleId: number; permissionId: number; enabled: boolean }>;
  }> {
    const [permissions, rolePermissions] = await Promise.all([
      prisma.permissions.findMany({
        orderBy: [{ module_name: 'asc' }, { code: 'asc' }],
        select: { id: true, code: true, name: true, module_name: true, category: true, active: true }
      }),
      prisma.role_permissions.findMany({
        select: { roleId: true, permissionId: true, enabled: true }
      })
    ]);
    return { permissions, rolePermissions };
  },

  /**
   * Lista todas as permissões do catálogo.
   */
  async getAllPermissions() {
    return prisma.permissions.findMany({
      orderBy: [{ module_name: 'asc' }, { code: 'asc' }]
    });
  },

  /**
   * Lista permissões atribuídas a um role (com enabled).
   */
  async getPermissionsByRole(roleId: number) {
    return prisma.role_permissions.findMany({
      where: { roleId },
      include: { permissions: true }
    });
  },

  /**
   * Atualiza permissões de um role. updates: Array<{ permissionId: number; enabled: boolean }>
   */
  async updateRolePermissions(roleId: number, updates: Array<{ permissionId: number; enabled: boolean }>): Promise<void> {
    const now = new Date();
    for (const u of updates) {
      await prisma.role_permissions.upsert({
        where: {
          roleId_permissionId: { roleId, permissionId: u.permissionId }
        },
        create: {
          roleId,
          permissionId: u.permissionId,
          enabled: u.enabled,
          updatedAt: now
        },
        update: {
          enabled: u.enabled,
          updatedAt: now
        }
      });
    }
  }
};
