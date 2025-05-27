import { UserRoleEnum } from '@Constant/enums';

export class UserDecodedPayload {
  userId: string;
  email: string;
  _matchedRoles: UserRoleEnum[];
}
