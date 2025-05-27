import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRoleEnum } from '@Constant/enums';
import { PERMISSION_METHOD } from '@Constant/permission-method';

interface Permission {
  endpoint: string;
  method: string;
}

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retrieves unique permission slugs for the given roles.
   *
   * @param {UserRoleEnum[]} roles - Array of user roles to get permissions for
   * @returns {Promise<string[]>} Array of unique permission slugs
   */
  public async getRolePermissionSlugs(roles: UserRoleEnum[]): Promise<string[]> {
    const roleData = await this.prisma.role.findMany({
      where: { name: { in: roles } },
      select: {
        permissions: {
          select: {
            permission: { select: { slug: true } },
          },
        },
      },
    });

    const slugs = roleData
      .flatMap((role) => role.permissions.map((p) => p.permission.slug))
      .filter((slug): slug is string => Boolean(slug));

    return [...new Set(slugs)];
  }

  /**
   * Retrieves the matched roles for a user based on the provided roles.
   *
   * @param {string} userId - The ID of the user whose roles are to be checked.
   * @param {UserRoleEnum[]} roles - The array of roles to match against the user's roles.
   * @returns {Promise<UserRoleEnum[]>} - A promise that resolves to an array of matched user roles.
   */
  public async getMatchedRoles(userId: string, roles: UserRoleEnum[]): Promise<UserRoleEnum[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        roles: {
          select: {
            role: { select: { name: true } },
          },
        },
      },
    });

    if (!user) return [];

    return user.roles.map(({ role }) => role.name as UserRoleEnum).filter((r) => roles.includes(r));
  }

  /**
   * Normalizes an endpoint string by removing the leading '/api/' or 'api/' prefix
   * and any leading slash. This helps standardize endpoint paths for permission checks.
   *
   * @param {string} endpoint - The endpoint path to normalize.
   * @returns {string} The normalized endpoint path.
   */
  private normalizeEndpoint(endpoint: string): string {
    return endpoint.replace(/^\/?api\//, '').replace(/^\//, '');
  }

  /**
   * Parses a permission string into a structured Permission object.
   *
   * @param {string} permission - The permission string in format 'endpoint:method'
   * @returns {Permission} Object containing normalized endpoint and method
   */
  private parsePermission(permission: string): Permission {
    const [endpoint, method] = permission.split(':');
    return {
      endpoint: this.normalizeEndpoint(endpoint),
      method: method?.toLowerCase() ?? '',
    };
  }

  /**
   * Checks if a permission is a 'manage' permission that grants full access.
   *
   * @param {Permission} permission - The permission to check
   * @returns {boolean} True if the permission is a 'manage' permission
   */
  private isManagePermission(permission: Permission): boolean {
    return permission.method === PERMISSION_METHOD.MANAGE;
  }

  /**
   * Checks if a request endpoint matches a permission endpoint.
   *
   * @param {string} requestEndpoint - The endpoint from the request
   * @param {string} permissionEndpoint - The endpoint from the permission
   * @returns {boolean} True if the endpoints match
   */
  private matchesEndpoint(requestEndpoint: string, permissionEndpoint: string): boolean {
    return this.normalizeEndpoint(requestEndpoint) === permissionEndpoint;
  }

  /**
   * Checks if a request method matches a permission method.
   *
   * @param {string} requestMethod - The HTTP method from the request
   * @param {Permission} permission - The permission to check against
   * @returns {boolean} True if the method matches or if permission is 'manage'
   */
  private matchesMethod(requestMethod: string, permission: Permission): boolean {
    return this.isManagePermission(permission) || permission.method === requestMethod.toLowerCase();
  }

  /**
   * Checks if a user has permission to access a specific endpoint with a specific method.
   *
   * @param {string} endpoint - The endpoint path to check
   * @param {string} method - The HTTP method to check
   * @param {string[]} permissions - Array of permission strings the user has
   * @returns {boolean} True if user has permission, false otherwise
   */
  public hasPermission(endpoint: string, method: string, permissions: string[]): boolean {
    return permissions.some((permission) => {
      const parsedPermission = this.parsePermission(permission);
      return this.matchesEndpoint(endpoint, parsedPermission.endpoint) && this.matchesMethod(method, parsedPermission);
    });
  }
}
