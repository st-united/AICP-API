export class UserPayloadDto {
  id: string;
  email: string;
  name: string;
}

export class UserAndSessionPayloadDto {
  userPayloadDto: UserPayloadDto;
  userAgent: string;
  ip: string;
}
