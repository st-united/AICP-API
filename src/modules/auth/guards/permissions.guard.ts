import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PermissionsService } from '@app/modules/permissions/permissions.service';
import { RequestCustom } from '@app/common/interfaces';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly permissionsService: PermissionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestCustom>();
    const user = req.user;

    const userRoles = user._matchedRoles;
    if (!userRoles || !Array.isArray(userRoles)) return false;

    const permissionSlugs = await this.permissionsService.getRolePermissionSlugs(userRoles);
    return this.permissionsService.hasPermission(req.path, req.method, permissionSlugs);
  }
}
