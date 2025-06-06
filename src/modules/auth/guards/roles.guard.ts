import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
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

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const req = context.switchToHttp().getRequest<RequestCustom>();
    const user = req.user;

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const matchedRoles = await this.permissionsService.getMatchedRoles(user.userId, requiredRoles);

    return matchedRoles.length > 0;
  }
}
