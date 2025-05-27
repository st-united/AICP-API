import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleEnum } from '@Constant/enums';
import { RequestCustom } from '@app/common/interfaces';
import { PermissionsService } from '@app/modules/permissions/permissions.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly permissionsService: PermissionsService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const req = context.switchToHttp().getRequest<RequestCustom>();
    const user = req.user;

    const isHasRole = await this.permissionsService.hasAnyRole(user.userId, requiredRoles);
    const permissionSlugs = await this.permissionsService.getRolePermissionSlugs(requiredRoles);
    console.log(permissionSlugs);
    console.log(req.path, req.method);
    const isHasPermission = this.permissionsService.hasPermission(req.path, req.method, permissionSlugs);
    return isHasRole && isHasPermission;
  }
}
