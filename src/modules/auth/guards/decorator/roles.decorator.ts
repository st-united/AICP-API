import { SetMetadata, BadRequestException } from '@nestjs/common';
import { UserRoleEnum } from '@Constant/enums';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRoleEnum[]) => {
  if (!roles || roles.length === 0) {
    throw new BadRequestException('At least one role must be specified in @Roles()');
  }

  return SetMetadata(ROLES_KEY, roles);
};
