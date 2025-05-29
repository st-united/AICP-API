import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PermissionsService } from '../../permissions/permissions.service';
import { RequestCustom } from '@app/common/interfaces';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly permissionsService: PermissionsService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestCustom>();
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const permissionSlugs = await this.permissionsService.getUserPermissionSlugs(user.userId);

    return this.permissionsService.hasPermission(req.path, req.method, permissionSlugs);
  }
}
