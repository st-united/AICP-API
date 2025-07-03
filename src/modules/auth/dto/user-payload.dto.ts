import { ClientTypeEnum } from '@Constant/enums';

export class UserPayloadDto {
  id: string;
  email: string;
  name: string;
}

export class UserAndSessionPayloadDto {
  userPayloadDto: UserPayloadDto;
  userAgent: string;
  clientType: ClientTypeEnum;
  ip: string;
}
